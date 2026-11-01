/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CheckoutAnimationState } from './types';

export interface KioskController {
  group: THREE.Group;
  screenMesh: THREE.Mesh;
  update: (time: number, checkoutAnimation?: CheckoutAnimationState) => void;
  getScreenFacePosition: (target: THREE.Vector3) => THREE.Vector3;
  setScreenTexture: (texture: THREE.Texture) => void;
  dispose: () => void;
}

/**
 * Creates the clean, modern 27-inch portrait screen display.
 * All obstructive black bezels, chassis boxes, and occluding panels have been removed.
 * The screen is 100% unobstructed, front-facing, and illuminated with MeshBasicMaterial.
 */
export function createBarkleyKiosk(isSoftwareGl: boolean, screenTexture?: THREE.Texture): KioskController {
  const group = new THREE.Group();
  group.name = 'BarkleyPortraitDisplay';

  // Position screen display centered at eye-level
  group.position.set(0, 0, 0);

  // Slim architectural floor stand (ultra-minimal, unobtrusive base)
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.8,
    roughness: 0.25,
  });

  const baseGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.04, 32);
  const baseMesh = new THREE.Mesh(baseGeo, standMat);
  baseMesh.position.y = 0.02;
  baseMesh.receiveShadow = !isSoftwareGl;
  group.add(baseMesh);

  // Slim vertical support column behind the screen
  const poleGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.88, 24);
  const poleMesh = new THREE.Mesh(poleGeo, standMat);
  poleMesh.position.set(0, 0.46, -0.04);
  poleMesh.castShadow = !isSoftwareGl;
  group.add(poleMesh);

  // Slim mounting bracket behind screen (does NOT protrude in front)
  const bracketGeo = new THREE.BoxGeometry(0.18, 0.24, 0.03);
  const bracketMesh = new THREE.Mesh(bracketGeo, standMat);
  bracketMesh.position.set(0, 1.25, -0.03);
  group.add(bracketMesh);

  // 27-inch portrait touchscreen display (0.42m x 0.74m)
  // MeshBasicMaterial with toneMapped: false and transparent: false guarantees 100% full brightness and opaque display
  const screenGeo = new THREE.PlaneGeometry(0.42, 0.74);
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture || null,
    color: 0xffffff,
    toneMapped: false,
    transparent: false,
    opacity: 1.0,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: true,
  });

  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.name = 'Barkley27InchScreen';
  // Positioned directly at eye level (y = 1.25), facing straight forward (+Z)
  // ZERO black bezel or chassis covering the front!
  screenMesh.position.set(0, 1.25, 0);
  screenMesh.renderOrder = 999;
  group.add(screenMesh);

  // Screen face anchor for camera and hand alignment
  const screenFaceAnchor = new THREE.Object3D();
  screenFaceAnchor.position.set(0, 1.25, 0.02);
  group.add(screenFaceAnchor);

  // Contact shadow on floor
  const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 64;
  shadowCanvas.height = 64;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(32, 32, 6, 32, 32, 32);
  grad.addColorStop(0, 'rgba(0,0,0,0.5)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 64, 64);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.005;
  group.add(contactShadow);

  function update(time: number, checkoutAnimation?: CheckoutAnimationState) {
    // Screen texture mapping is managed directly by ScreenTextureCycler
  }

  function setScreenTexture(texture: THREE.Texture) {
    screenMat.map = texture;
    screenMat.needsUpdate = true;
  }

  return {
    group,
    screenMesh,
    update,
    getScreenFacePosition: (target: THREE.Vector3) => screenFaceAnchor.getWorldPosition(target),
    setScreenTexture,
    dispose: () => {
      screenGeo.dispose();
      screenMat.dispose();
      baseGeo.dispose();
      poleGeo.dispose();
      bracketGeo.dispose();
      standMat.dispose();
      shadowGeo.dispose();
      shadowTex.dispose();
      shadowMat.dispose();
    },
  };
}
