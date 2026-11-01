/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface HandController {
  group: THREE.Group;
  update: (time: number, isTapping: boolean) => void;
  setVisible: (visible: boolean) => void;
  isVisible: () => boolean;
  dispose: () => void;
}

export function createArticulatedHand(): HandController {
  const group = new THREE.Group();
  group.name = 'BarkleyCustomerHand';

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdeb894,
    roughness: 0.55,
    metalness: 0.05,
  });

  // Palm
  const palmGeo = new THREE.BoxGeometry(0.08, 0.03, 0.12);
  const palm = new THREE.Mesh(palmGeo, skinMat);
  palm.castShadow = true;
  group.add(palm);

  // 4 Articulated Fingers
  const fingerGeo = new THREE.CapsuleGeometry(0.011, 0.065, 4, 8);
  const fingers: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(fingerGeo, skinMat);
    f.position.set(-0.028 + i * 0.019, 0.015, 0.065);
    f.rotation.x = -0.28;
    f.castShadow = true;
    group.add(f);
    fingers.push(f);
  }

  // Thumb
  const thumbGeo = new THREE.CapsuleGeometry(0.012, 0.048, 4, 8);
  const thumb = new THREE.Mesh(thumbGeo, skinMat);
  thumb.position.set(0.048, 0.008, 0.02);
  thumb.rotation.z = 0.55;
  thumb.rotation.x = -0.15;
  thumb.castShadow = true;
  group.add(thumb);

  // Neutral resting position
  group.position.set(0.18, 1.15, 0.22);
  group.rotation.set(0.1, -0.35, 0.05);

  let targetPos = new THREE.Vector3(0.18, 1.15, 0.22);
  let targetRotY = -0.35;
  let visible = false; // Hidden by default so screen is 100% visible

  function update(time: number, isTapping: boolean) {
    if (!visible) return;

    // Timeline-driven targets (calibrated to screen at y=1.25, z=0)
    if (time < 20.0) {
      // Approach & Welcome: hand approaches screen
      const t = time / 20.0;
      targetPos.set(0.22 - t * 0.08, 1.18 + Math.sin(t * Math.PI) * 0.03, 0.22 - t * 0.12);
      targetRotY = -0.35 + t * 0.1;
    } else if (time < 45.0) {
      // DOB Keypad: taps on numbers
      const isTyping = (time >= 27.5 && time < 29.0) || (time >= 32.5 && time < 34.0) || (time >= 37.5 && time < 39.0);
      const tapZ = isTyping ? 0.03 : 0.08;
      targetPos.set(0.02, 1.22, tapZ);
      targetRotY = -0.2;
    } else if (time < 65.0) {
      // Camera / Face ID: resting slightly back
      targetPos.set(0.16, 1.12, 0.18);
      targetRotY = -0.3;
    } else if (time < 95.0) {
      // Catalog browsing: hand gestures across products
      const browseCycle = (time - 65.0) % 8.0;
      const xOffset = Math.sin(browseCycle * 0.8) * 0.06;
      targetPos.set(0.02 + xOffset, 1.25, 0.07);
      targetRotY = -0.22;
    } else if (time < 125.0) {
      // Product details & advisory acknowledgment
      const isAck = time >= 117.0 && time < 121.0;
      targetPos.set(-0.06, 1.18, isAck ? 0.03 : 0.08);
      targetRotY = -0.18;
    } else if (time < 155.0) {
      // Crypto Checkout:
      const isTap = (time >= 137.5 && time < 139.5) || (time >= 145.0 && time < 147.5);
      targetPos.set(0.02, 1.16, isTap ? 0.03 : 0.08);
      targetRotY = -0.2;
    } else if (time < 170.0) {
      // Order confirmed
      targetPos.set(0.12, 1.10, 0.12);
      targetRotY = -0.25;
    } else {
      // Closing handoff
      targetPos.set(0.24, 1.08, 0.25);
      targetRotY = -0.35;
    }

    group.position.lerp(targetPos, 0.08);
    group.rotation.y += (targetRotY - group.rotation.y) * 0.08;

    const isBrowsingOrCheckingOut =
      (time >= 25.0 && time < 42.0) ||
      (time >= 68.0 && time < 92.0) ||
      (time >= 115.0 && time < 148.0) ||
      isTapping;

    if (isBrowsingOrCheckingOut) {
      fingers.forEach((f, i) => {
        const wave = Math.sin(time * 6.5 + i * 0.7) * 0.12;
        f.rotation.x = -0.28 + wave;
      });
      thumb.rotation.x = -0.15 + Math.sin(time * 5.0) * 0.08;
    } else {
      fingers.forEach((f) => {
        f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -0.28, 0.1);
      });
      thumb.rotation.x = THREE.MathUtils.lerp(thumb.rotation.x, -0.15, 0.1);
    }
  }

  function setVisible(val: boolean) {
    visible = val;
    group.visible = val;
  }

  return {
    group,
    update,
    setVisible,
    isVisible: () => visible,
    dispose: () => {
      palmGeo.dispose();
      fingerGeo.dispose();
      thumbGeo.dispose();
      skinMat.dispose();
    },
  };
}
