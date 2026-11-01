/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraMode, WORKFLOW_STEPS, CheckoutAnimationState } from './types';
import { createBarkleyKiosk, KioskController } from './kiosk';
import { createDispensaryEnvironment } from './environment';
import { createCameraDirector, CameraDirector } from './cameraDirector';
import { audioSynth } from './audioSynth';
import { ScreenTextureCycler, BARKLEYScreenTextureState } from './screenTextureCycler';
import { createArticulatedHand, HandController } from './hand';

export interface SceneManager {
  render: (time: number, cameraMode: CameraMode) => {
    lensMm: number;
    shotName: string;
    description: string;
    stepNumber: string;
    cartPopupProgress: number;
    activeUiStateName?: string;
  };
  resize: (width: number, height: number) => void;
  captureSnapshot: () => string;
  handlePointerDown: (clientX: number, clientY: number) => boolean;
  triggerCheckoutSequence: () => void;
  kiosk: KioskController;
  hand: HandController;
  toggleHand: () => boolean;
  setHandVisible: (visible: boolean) => void;
  mapScreenMeshToDynamicTextures: (time: number, checkoutAnimation?: CheckoutAnimationState) => void;
  cycleScreenTextures: (time: number) => {
    activeState: BARKLEYScreenTextureState;
    index: number;
    progressInStage: number;
  };
  textureCycler: ScreenTextureCycler;
  dispose: () => void;
}

export function initThreeScene(canvas: HTMLCanvasElement): SceneManager {
  const isSoftwareGl = (() => {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return false;
    }
  })();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x131518);
  scene.fog = new THREE.FogExp2(0x181a1f, 0.038);

  // Environment reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  pmremGenerator.dispose();

  // Studio PBR Lighting Rig
  // 1. Key light focused directly on the POS kiosk corner
  const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.4);
  keyLight.position.set(0.5, 4.2, 2.5);
  keyLight.castShadow = !isSoftwareGl;
  if (keyLight.castShadow) {
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  // 2. Soft warm ambient fill
  const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x1c1917, 1.1);
  hemiLight.position.set(0, 5, 0);
  scene.add(hemiLight);

  // 3. Focused spot highlighting screen
  const kioskSpot = new THREE.SpotLight(0xffedd5, 2.0, 6, Math.PI / 4, 0.4, 1.2);
  kioskSpot.position.set(0.2, 3.0, 1.8);
  kioskSpot.target.position.set(0, 1.25, 0);
  scene.add(kioskSpot);
  scene.add(kioskSpot.target);

  // Dispensary Corner Environment
  const dispensaryEnv = createDispensaryEnvironment(isSoftwareGl);
  scene.add(dispensaryEnv.group);

  // Dynamic Screen Texture Cycler (cycles through BARKLEY UI state PNGs synchronized with time)
  const textureCycler = new ScreenTextureCycler(isSoftwareGl);

  // BARKLEY POS Kiosk in Corner (Centerpiece) — Screen directly mapped to textureCycler
  const kiosk = createBarkleyKiosk(isSoftwareGl, textureCycler.dynamicCanvasTexture);
  scene.add(kiosk.group);

  // Diagnostic screen mesh material & alpha channel audit
  const screenMat = kiosk.screenMesh.material as THREE.MeshBasicMaterial;
  console.log('[SceneManager] ScreenMesh Material Verified:', {
    materialType: screenMat.type,
    hasTextureMap: Boolean(screenMat.map),
    textureMapUuid: screenMat.map ? screenMat.map.uuid : null,
    transparent: screenMat.transparent,
    opacity: screenMat.opacity,
    toneMapped: screenMat.toneMapped,
    side: screenMat.side === THREE.DoubleSide ? 'THREE.DoubleSide' : 'THREE.FrontSide',
    depthWrite: screenMat.depthWrite,
    canvasDimensions: `${textureCycler.canvas.width}x${textureCycler.canvas.height}`,
  });

  // Articulated Customer Hand (smooth kinematics and simulated touchscreen tapping)
  // Default to hidden so camera has an unobstructed view of the POS display
  const hand = createArticulatedHand();
  hand.setVisible(false);
  kiosk.group.add(hand.group);

  function toggleHand(): boolean {
    const next = !hand.isVisible();
    hand.setVisible(next);
    return next;
  }

  function setHandVisible(visible: boolean) {
    hand.setVisible(visible);
  }

  /**
   * Maps the 27-inch portrait screen mesh to a dynamic texture array which cycles
   * through the BARKLEY UI state PNGs (attract, verification, catalog, etc.) synchronized with the timeline variable.
   */
  function mapScreenMeshToDynamicTextures(time: number, checkoutAnimation?: CheckoutAnimationState) {
    textureCycler.mapScreenMeshToDynamicTextures(kiosk.screenMesh, time, checkoutAnimation);
  }

  function cycleScreenTextures(time: number) {
    return textureCycler.cycle(time);
  }

  // Camera Director (Customer POV and Cinematic Glides)
  const cameraDirector = createCameraDirector(canvas, canvas.clientWidth / canvas.clientHeight);

  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  // Sound cue timestamps
  let lastCartChimeTime = -1;
  let lastKeypadSoundTime = -1;
  let lastScannerSoundTime = -1;
  let lastApprovalSoundTime = -1;
  let lastPaymentChimeTime = -1;

  // Render loop logging counters
  let renderLoopFrameCounter = 0;
  let lastLoggedStageIndex = -1;

  function render(time: number, cameraMode: CameraMode) {
    // 1. Calculate Checkout Animation Sequence & Cart Summary Popup
    let cartPopupProgress = 0;
    let isProceedTapped = false;

    // Cart popup occurs in Stage 6 (125s - 155s)
    // Pops up smoothly starting at 126.0s
    if (time >= 126.0 && time < 142.0) {
      const elapsedSinceTouch = time - 126.0;
      cartPopupProgress = Math.min(1.0, elapsedSinceTouch / 1.0);

      // Play audio chime as cart summary begins opening
      if (elapsedSinceTouch < 0.25 && Math.abs(time - lastCartChimeTime) > 1.5) {
        lastCartChimeTime = time;
        audioSynth.playCartPopup();
      }

      // Tap on "PROCEED TO PAYMENT" at 138.0s
      if (time >= 138.0) {
        isProceedTapped = true;
        const elapsedProceed = time - 138.0;
        if (elapsedProceed < 0.25 && Math.abs(time - lastPaymentChimeTime) > 1.5) {
          lastPaymentChimeTime = time;
          audioSynth.playCheckoutProceed();
        }
      }
    }

    // Dynamic Sound triggers across the 180s timeline:
    // DOB keystrokes at 28s, 33s, 38s
    if ((time >= 28.0 && time < 28.2) || (time >= 33.0 && time < 33.2) || (time >= 38.0 && time < 38.2)) {
      if (Math.abs(time - lastKeypadSoundTime) > 1.0) {
        lastKeypadSoundTime = time;
        audioSynth.playKeypadClick(time);
      }
    }

    // ID scanner reading at 48.0s
    if (time >= 48.0 && time < 48.3) {
      if (Math.abs(time - lastScannerSoundTime) > 2.0) {
        lastScannerSoundTime = time;
        audioSynth.playScannerBeep(time);
      }
    }

    // Biometric match approval at 59.0s
    if (time >= 59.0 && time < 59.3) {
      if (Math.abs(time - lastApprovalSoundTime) > 2.0) {
        lastApprovalSoundTime = time;
        audioSynth.playTouchChime(time);
      }
    }

    // Payment approved at 147.0s
    if (time >= 147.0 && time < 147.3) {
      if (Math.abs(time - lastPaymentChimeTime) > 2.0) {
        lastPaymentChimeTime = time;
        audioSynth.playPaymentApproved(time);
      }
    }

    const checkoutState: CheckoutAnimationState = {
      cartPopupProgress,
      isProceedTapped,
      activeItemCount: 3,
      totalAmount: '$148.24',
    };

    // Synchronize 27-inch portrait screen mesh with dynamic texture array
    mapScreenMeshToDynamicTextures(time, checkoutState);

    // Verify screen mesh material properties strictly adhere to MeshBasicMaterial with transparent: false
    const screenMesh = kiosk.screenMesh;
    let screenMat = screenMesh.material as THREE.MeshBasicMaterial;
    if (!(screenMat instanceof THREE.MeshBasicMaterial) || screenMat.transparent !== false || screenMat.map !== textureCycler.dynamicCanvasTexture) {
      if (!(screenMat instanceof THREE.MeshBasicMaterial)) {
        screenMesh.material = new THREE.MeshBasicMaterial({
          map: textureCycler.dynamicCanvasTexture,
          color: 0xffffff,
          toneMapped: false,
          transparent: false,
          opacity: 1.0,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: true,
        });
        screenMesh.renderOrder = 999;
        screenMat = screenMesh.material as THREE.MeshBasicMaterial;
      } else {
        screenMat.map = textureCycler.dynamicCanvasTexture;
        screenMat.transparent = false;
        screenMat.opacity = 1.0;
        screenMat.toneMapped = false;
        screenMat.side = THREE.DoubleSide;
        screenMat.depthTest = true;
        screenMat.depthWrite = true;
        screenMat.needsUpdate = true;
      }
    }

    // Update Kiosk hardware illumination states
    kiosk.update(time, checkoutState);

    // Update customer hand kinematics
    hand.update(time, isProceedTapped);

    // Query active UI state information
    const activeCycleInfo = cycleScreenTextures(time);

    // Update Camera
    const camInfo = cameraDirector.update(time, cameraMode);

    // Render Loop Diagnostic: Log Canvas Texture & Occlusion Verification
    renderLoopFrameCounter++;
    const isStageTransition = activeCycleInfo.index !== lastLoggedStageIndex;
    if (isStageTransition || renderLoopFrameCounter <= 3 || renderLoopFrameCounter % 120 === 0) {
      lastLoggedStageIndex = activeCycleInfo.index;

      // Check whether any 3D geometry is occluding the screen plane from the camera
      const screenWorldPos = new THREE.Vector3();
      screenMesh.getWorldPosition(screenWorldPos);
      const camPos = cameraDirector.camera.position;
      const rayDir = new THREE.Vector3().subVectors(screenWorldPos, camPos).normalize();
      const occlusionRay = new THREE.Raycaster(camPos, rayDir, 0.05, 15);
      const hits = occlusionRay.intersectObjects(scene.children, true);
      const firstHit = hits.length > 0 ? hits[0].object : null;
      const firstHitName = firstHit ? firstHit.name || firstHit.type : 'none';
      const isOccludedByOtherGeometry = Boolean(firstHit && firstHit !== screenMesh);

      console.log('[SceneManager:RenderLoop] Canvas Texture & Screen Plane Verification:', {
        frame: renderLoopFrameCounter,
        time: Number(time.toFixed(2)),
        stageIndex: activeCycleInfo.index,
        activeUiStateName: activeCycleInfo.activeState.name,
        canvasTexture: {
          uuid: textureCycler.dynamicCanvasTexture.uuid,
          version: textureCycler.dynamicCanvasTexture.version,
          needsUpdate: textureCycler.dynamicCanvasTexture.needsUpdate,
          colorSpace: textureCycler.dynamicCanvasTexture.colorSpace,
          width: textureCycler.canvas.width,
          height: textureCycler.canvas.height,
          canvasElement: textureCycler.canvas,
        },
        screenMaterial: {
          type: screenMat.type,
          transparent: screenMat.transparent,
          opacity: screenMat.opacity,
          toneMapped: screenMat.toneMapped,
          hasMap: Boolean(screenMat.map),
          mapMatchesDynamicCanvas: screenMat.map === textureCycler.dynamicCanvasTexture,
          side: screenMat.side === THREE.DoubleSide ? 'DoubleSide' : 'FrontSide',
        },
        occlusionAudit: {
          screenVisible: screenMesh.visible,
          screenRenderOrder: screenMesh.renderOrder,
          screenWorldPosition: `(${screenWorldPos.x.toFixed(2)}, ${screenWorldPos.y.toFixed(2)}, ${screenWorldPos.z.toFixed(2)})`,
          cameraPosition: `(${camPos.x.toFixed(2)}, ${camPos.y.toFixed(2)}, ${camPos.z.toFixed(2)})`,
          firstRaycastHit: firstHitName,
          isOccludedByGeometry: isOccludedByOtherGeometry,
        },
      });
    }

    renderer.render(scene, cameraDirector.camera);

    return {
      ...camInfo,
      cartPopupProgress,
      activeUiStateName: activeCycleInfo.activeState.name,
    };
  }

  function resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    cameraDirector.camera.aspect = width / height;
    cameraDirector.camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function captureSnapshot(): string {
    return canvas.toDataURL('image/png');
  }

  // Interactive 3D Screen Raycasting (touch anywhere on the kiosk display)
  function handlePointerDown(clientX: number, clientY: number): boolean {
    const rect = canvas.getBoundingClientRect();
    mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseVec, cameraDirector.camera);
    const intersects = raycaster.intersectObject(kiosk.screenMesh, false);

    if (intersects.length > 0) {
      audioSynth.playTouchChime(0);
      return true;
    }
    return false;
  }

  function triggerCheckoutSequence() {
    audioSynth.playCartPopup();
  }

  return {
    render,
    resize,
    captureSnapshot,
    handlePointerDown,
    triggerCheckoutSequence,
    kiosk,
    hand,
    toggleHand,
    setHandVisible,
    mapScreenMeshToDynamicTextures,
    cycleScreenTextures,
    textureCycler,
    dispose: () => {
      hand.dispose();
      textureCycler.dispose();
      kiosk.dispose();
      dispensaryEnv.dispose();
      cameraDirector.dispose();
      renderer.dispose();
    },
  };
}
