/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { KioskScreenEngine } from './screenTextures';
import { CheckoutAnimationState, WORKFLOW_STEPS } from './types';

export interface KioskController {
  group: THREE.Group;
  screenMesh: THREE.Mesh;
  screenEngine: KioskScreenEngine;
  update: (time: number, checkoutAnimation?: CheckoutAnimationState) => void;
  getScreenFacePosition: (target: THREE.Vector3) => THREE.Vector3;
  dispose: () => void;
}

export function createBarkleyKiosk(isSoftwareGl: boolean): KioskController {
  const group = new THREE.Group();
  group.name = 'BarkleyKioskCorner';

  // Position kiosk realistically in the dispensary corner, angled towards user
  group.position.set(0.35, 0, -0.4);
  group.rotation.y = -0.28; // ~16 deg ergonomic showroom angle

  const screenEngine = new KioskScreenEngine(isSoftwareGl);

  // Materials
  const blackAlumMat = new THREE.MeshPhysicalMaterial({
    color: 0x141619,
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.25,
    clearcoatRoughness: 0.25,
  });

  const brushedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x474d57,
    metalness: 0.92,
    roughness: 0.18,
  });

  // "Light up the POS" — Screen glows with high-brightness emissive output
  const screenGlassMat = new THREE.MeshPhysicalMaterial({
    map: screenEngine.texture,
    emissiveMap: screenEngine.texture,
    emissive: 0xffffff,
    emissiveIntensity: 0.94, // Vivid bright illuminated display
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 0.65,
  });

  const idGlowMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
  });

  const nfcGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  // Base pedestal
  const baseGeo = new THREE.CylinderGeometry(0.33, 0.38, 0.04, 36);
  const baseMesh = new THREE.Mesh(baseGeo, blackAlumMat);
  baseMesh.position.y = 0.02;
  baseMesh.castShadow = !isSoftwareGl;
  baseMesh.receiveShadow = !isSoftwareGl;
  group.add(baseMesh);

  // Lower stand column
  const columnGeo = new THREE.BoxGeometry(0.24, 0.78, 0.18);
  const columnMesh = new THREE.Mesh(columnGeo, blackAlumMat);
  columnMesh.position.set(0, 0.43, 0);
  columnMesh.castShadow = !isSoftwareGl;
  columnMesh.receiveShadow = !isSoftwareGl;
  group.add(columnMesh);

  // Main Kiosk Upper Body (slanted ~5 deg back)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.82, 0);
  headGroup.rotation.x = -0.087;
  group.add(headGroup);

  // Kiosk Enclosure Chassis
  const chassisGeo = new THREE.BoxGeometry(0.48, 1.02, 0.15);
  const chassisMesh = new THREE.Mesh(chassisGeo, blackAlumMat);
  chassisMesh.position.set(0, 0.51, 0);
  chassisMesh.castShadow = !isSoftwareGl;
  chassisMesh.receiveShadow = !isSoftwareGl;
  headGroup.add(chassisMesh);

  // Curved rear shell accent
  const rearGeo = new THREE.CylinderGeometry(0.23, 0.23, 1.0, 24, 1, false, 0, Math.PI);
  const rearMesh = new THREE.Mesh(rearGeo, blackAlumMat);
  rearMesh.rotation.y = -Math.PI / 2;
  rearMesh.position.set(0, 0.51, -0.07);
  headGroup.add(rearMesh);

  // Brushed edge trim
  const trimLeftGeo = new THREE.BoxGeometry(0.012, 1.02, 0.152);
  const trimLeft = new THREE.Mesh(trimLeftGeo, brushedSteelMat);
  trimLeft.position.set(-0.242, 0.51, 0);
  headGroup.add(trimLeft);

  const trimRight = trimLeft.clone();
  trimRight.position.x = 0.242;
  headGroup.add(trimRight);

  // 27" Portrait Screen Display (approx 0.38m x 0.675m, true 9:16)
  const screenWidth = 0.38;
  const screenHeight = 0.675;
  const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);
  const screenMesh = new THREE.Mesh(screenGeo, screenGlassMat);
  screenMesh.position.set(0, 0.61, 0.076);
  headGroup.add(screenMesh);

  // Upper bezel identity camera & sensor strip
  const cameraHousingGeo = new THREE.BoxGeometry(0.09, 0.026, 0.008);
  const cameraHousing = new THREE.Mesh(cameraHousingGeo, blackAlumMat);
  cameraHousing.position.set(0, 0.97, 0.077);
  headGroup.add(cameraHousing);

  const lensGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.01, 16);
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x050c14,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
  });
  const lensMesh = new THREE.Mesh(lensGeo, lensMat);
  lensMesh.rotation.x = Math.PI / 2;
  lensMesh.position.set(0, 0.97, 0.081);
  headGroup.add(lensMesh);

  // Mid-Tier Hardware Module Shelf (below screen)
  const hardwareShelfGeo = new THREE.BoxGeometry(0.44, 0.19, 0.04);
  const hardwareShelf = new THREE.Mesh(hardwareShelfGeo, blackAlumMat);
  hardwareShelf.position.set(0, 0.17, 0.08);
  hardwareShelf.castShadow = !isSoftwareGl;
  headGroup.add(hardwareShelf);

  // 1. ID Scanner slot (Left)
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const idSlotGeo = new THREE.BoxGeometry(0.12, 0.018, 0.02);
  const idSlotMesh = new THREE.Mesh(idSlotGeo, slotMat);
  idSlotMesh.position.set(-0.13, 0.19, 0.101);
  headGroup.add(idSlotMesh);

  const idGlowGeo = new THREE.PlaneGeometry(0.11, 0.005);
  const idGlowMesh = new THREE.Mesh(idGlowGeo, idGlowMat);
  idGlowMesh.position.set(-0.13, 0.178, 0.103);
  headGroup.add(idGlowMesh);

  // 2. NFC / Contactless Payment Reader (Center)
  const nfcFaceGeo = new THREE.BoxGeometry(0.09, 0.09, 0.015);
  const nfcMat = new THREE.MeshStandardMaterial({
    color: 0x22262d,
    metalness: 0.6,
    roughness: 0.3,
  });
  const nfcMesh = new THREE.Mesh(nfcFaceGeo, nfcMat);
  nfcMesh.position.set(0.02, 0.18, 0.101);
  headGroup.add(nfcMesh);

  const nfcSymbolGeo = new THREE.PlaneGeometry(0.04, 0.04);
  const nfcSymbol = new THREE.Mesh(nfcSymbolGeo, nfcGlowMat);
  nfcSymbol.position.set(0.02, 0.18, 0.109);
  headGroup.add(nfcSymbol);

  // 3. Receipt printer slot (Right)
  const receiptSlotGeo = new THREE.BoxGeometry(0.08, 0.012, 0.02);
  const receiptSlot = new THREE.Mesh(receiptSlotGeo, slotMat);
  receiptSlot.position.set(0.15, 0.19, 0.101);
  headGroup.add(receiptSlot);

  // Dispensed Paper Receipt
  const paperGeo = new THREE.PlaneGeometry(0.07, 0.13);
  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const receiptPaper = new THREE.Mesh(paperGeo, paperMat);
  receiptPaper.position.set(0.15, 0.14, 0.106);
  receiptPaper.rotation.x = 0.22;
  receiptPaper.visible = false;
  headGroup.add(receiptPaper);

  // Center screen face anchor for hand navigation
  const screenFaceAnchor = new THREE.Object3D();
  screenFaceAnchor.position.set(0, 0.61, 0.08);
  headGroup.add(screenFaceAnchor);

  // Soft Radial Contact Shadow under base
  const shadowGeo = new THREE.PlaneGeometry(1.1, 1.1);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.68)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.25)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.005;
  group.add(contactShadow);

  function update(time: number, checkoutAnimation?: CheckoutAnimationState) {
    let activeStep = WORKFLOW_STEPS[0];
    for (let i = WORKFLOW_STEPS.length - 1; i >= 0; i--) {
      if (time >= WORKFLOW_STEPS[i].startTime) {
        activeStep = WORKFLOW_STEPS[i];
        break;
      }
    }

    screenEngine.update(time, activeStep.screenIndex, checkoutAnimation);

    // Dynamic hardware lighting
    // ID scanner glow intensifies during step 3 (Scan ID)
    if (activeStep.id === '03_scan_id') {
      idGlowMat.color.setHex(0x10b981);
    } else {
      idGlowMat.color.setHex(0x047857);
    }

    // NFC payment reader pulses during step 10
    if (activeStep.id === '10_checkout_pay') {
      const pulse = 0.5 + Math.sin(time * 6) * 0.5;
      nfcGlowMat.color.setHex(pulse > 0.5 ? 0x10b981 : 0x38bdf8);
    } else {
      nfcGlowMat.color.setHex(0x38bdf8);
    }

    // Receipt paper dispenses during step 12
    if (time >= 106) {
      receiptPaper.visible = true;
      const paperGrowth = Math.min(1.0, (time - 106) / 3.0);
      receiptPaper.scale.set(1, paperGrowth, 1);
    } else {
      receiptPaper.visible = false;
    }
  }

  return {
    group,
    screenMesh,
    screenEngine,
    update,
    getScreenFacePosition: (target: THREE.Vector3) => screenFaceAnchor.getWorldPosition(target),
    dispose: () => {
      screenGeo.dispose();
      screenGlassMat.dispose();
      screenEngine.dispose();
      baseGeo.dispose();
      columnGeo.dispose();
      chassisGeo.dispose();
      blackAlumMat.dispose();
      brushedSteelMat.dispose();
      idGlowGeo.dispose();
      idGlowMat.dispose();
      nfcSymbolGeo.dispose();
      nfcGlowMat.dispose();
      paperGeo.dispose();
      paperMat.dispose();
      shadowGeo.dispose();
      shadowTex.dispose();
      shadowMat.dispose();
    },
  };
}
