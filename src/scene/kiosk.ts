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
 * Creates the clean, modern 27-inch portrait screen display mounted directly to the entrance wall.
 * As soon as customers enter the dispensary door, the POS is immediately on the wall.
 * Unobstructed, front-facing, and illuminated with self-illuminating MeshBasicMaterial.
 */
export function createBarkleyKiosk(isSoftwareGl: boolean, screenTexture?: THREE.Texture): KioskController {
  const group = new THREE.Group();
  group.name = 'BarleyPortraitDisplay';

  // Position screen display centered at eye-level on entrance wall
  group.position.set(0, 0, 0);

  // Architectural Bronze Wall-Mount Bracket (flush behind screen)
  const mountMat = new THREE.MeshStandardMaterial({
    color: 0x1f2421,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Slim flush wall bracket behind screen (z = -0.025 to 0)
  const bracketGeo = new THREE.BoxGeometry(0.24, 0.32, 0.025);
  const bracketMesh = new THREE.Mesh(bracketGeo, mountMat);
  bracketMesh.position.set(0, 1.25, -0.015);
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
  screenMesh.name = 'Barley27InchScreen';
  // Positioned directly at eye level (y = 1.25), facing straight forward (+Z) towards the entrance path
  screenMesh.position.set(0, 1.25, 0);
  screenMesh.renderOrder = 999;
  group.add(screenMesh);

  // Screen face anchor for camera and hand alignment
  const screenFaceAnchor = new THREE.Object3D();
  screenFaceAnchor.position.set(0, 1.25, 0.02);
  group.add(screenFaceAnchor);

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
      bracketGeo.dispose();
      mountMat.dispose();
    },
  };
}
