/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraMode, WORKFLOW_STEPS, CheckoutAnimationState } from './types';
import { createBarkleyKiosk, KioskController } from './kiosk';
import { createInteractiveHand, HandController } from './hand';
import { createDispensaryEnvironment, EnvironmentController } from './environment';
import { createCameraDirector, CameraDirector } from './cameraDirector';
import { audioSynth } from './audioSynth';

export interface SceneManager {
  render: (time: number, cameraMode: CameraMode) => {
    lensMm: number;
    shotName: string;
    description: string;
    stepNumber: string;
    cartPopupProgress: number;
  };
  resize: (width: number, height: number) => void;
  captureSnapshot: () => string;
  handlePointerDown: (clientX: number, clientY: number) => boolean;
  triggerCheckoutSequence: () => void;
  kiosk: KioskController;
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

  // 3. Focused spot highlighting kiosk and screen
  const kioskSpot = new THREE.SpotLight(0xffedd5, 2.0, 6, Math.PI / 4, 0.4, 1.2);
  kioskSpot.position.set(0.6, 3.2, 1.8);
  kioskSpot.target.position.set(0.35, 1.35, -0.4);
  scene.add(kioskSpot);
  scene.add(kioskSpot.target);

  // Dispensary Corner Environment
  const dispensaryEnv = createDispensaryEnvironment(isSoftwareGl);
  scene.add(dispensaryEnv.group);

  // BARKLEY POS Kiosk in Corner
  const kiosk = createBarkleyKiosk(isSoftwareGl);
  scene.add(kiosk.group);

  // Interactive Customer Hand
  const hand = createInteractiveHand(isSoftwareGl);
  scene.add(hand.group);

  // Camera Director
  const cameraDirector = createCameraDirector(canvas, canvas.clientWidth / canvas.clientHeight);

  const _screenFacePos = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  let lastCartChimeTime = -1;

  function render(time: number, cameraMode: CameraMode) {
    // 1. Calculate Checkout Animation Sequence & Cart Summary Popup
    let cartPopupProgress = 0;
    let handInteracted = false;
    let isProceedTapped = false;
    let ripple: { x: number; y: number; progress: number } | null = null;

    // Checkout process occurs in Step 09 (74s - 84s)
    // Hand reaches and taps screen at 76.5s -> Cart Summary pops up with smooth spring easing
    if (time >= 76.5 && time < 84.0) {
      handInteracted = true;
      const elapsedSinceTouch = time - 76.5;

      // Smooth popup interpolation over 1.0s
      const rawProgress = Math.min(1.0, elapsedSinceTouch / 1.0);
      cartPopupProgress = rawProgress;

      // Play audio chime as cart summary begins opening
      if (elapsedSinceTouch < 0.25 && Math.abs(time - lastCartChimeTime) > 1.5) {
        lastCartChimeTime = time;
        audioSynth.playCartPopup();
      }

      // Initial touch ripple at hand contact position
      if (elapsedSinceTouch < 0.7) {
        ripple = {
          x: 720,
          y: 1540,
          progress: elapsedSinceTouch / 0.7,
        };
      }

      // Second tap on the newly popped up Cart Summary "PROCEED TO PAYMENT" button at 81.0s
      if (time >= 81.0) {
        isProceedTapped = true;
        const elapsedProceed = time - 81.0;
        if (elapsedProceed < 0.65) {
          ripple = {
            x: 540,
            y: 1640,
            progress: elapsedProceed / 0.65,
          };
        }
      }
    }

    const checkoutState: CheckoutAnimationState = {
      cartPopupProgress,
      handInteracted,
      ripple,
      isProceedTapped,
      activeItemCount: 3,
      totalAmount: '$148.24',
    };

    // Update Kiosk screen & hardware states with checkout state
    kiosk.update(time, checkoutState);
    kiosk.getScreenFacePosition(_screenFacePos);

    // Find active workflow step
    let activeStep = WORKFLOW_STEPS[0];
    for (let i = WORKFLOW_STEPS.length - 1; i >= 0; i--) {
      if (time >= WORKFLOW_STEPS[i].startTime) {
        activeStep = WORKFLOW_STEPS[i];
        break;
      }
    }

    // Update Hand position targeting screen and hardware
    hand.update(time, activeStep, _screenFacePos);

    // Update Camera
    const camInfo = cameraDirector.update(time, cameraMode);

    renderer.render(scene, cameraDirector.camera);

    return {
      ...camInfo,
      cartPopupProgress,
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

  // Interactive 3D Screen Raycasting (allows direct click to touch the kiosk display)
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
    dispose: () => {
      kiosk.dispose();
      hand.dispose();
      dispensaryEnv.dispose();
      cameraDirector.dispose();
      renderer.dispose();
    },
  };
}
