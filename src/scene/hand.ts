/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { audioSynth } from './audioSynth';
import { WorkflowStep } from './types';

export interface HandController {
  group: THREE.Group;
  update: (time: number, activeStep: WorkflowStep, screenFacePos: THREE.Vector3) => void;
  dispose: () => void;
}

export function createInteractiveHand(isSoftwareGl: boolean): HandController {
  const group = new THREE.Group();
  group.name = 'InteractiveCustomerHand';

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdca37f,
    roughness: 0.55,
    metalness: 0.04,
  });

  const sleeveMat = new THREE.MeshStandardMaterial({
    color: 0x181e26, // Dark navy/charcoal jacket cuff
    roughness: 0.75,
    metalness: 0.08,
  });

  const idCardMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3,
    metalness: 0.5,
  });

  const creditCardMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Black luxury card with gold chip
    roughness: 0.28,
    metalness: 0.65,
  });

  // Forearm & Sleeve
  const forearmGeo = new THREE.CylinderGeometry(0.042, 0.048, 0.34, 16);
  const forearmMesh = new THREE.Mesh(forearmGeo, sleeveMat);
  forearmMesh.position.y = -0.17;
  forearmMesh.castShadow = !isSoftwareGl;
  group.add(forearmMesh);

  // Wrist
  const wristGeo = new THREE.CylinderGeometry(0.035, 0.038, 0.07, 14);
  const wristMesh = new THREE.Mesh(wristGeo, skinMat);
  wristMesh.position.y = -0.01;
  group.add(wristMesh);

  // Palm
  const palm = new THREE.Group();
  group.add(palm);

  const palmGeo = new THREE.BoxGeometry(0.075, 0.088, 0.028);
  const palmMesh = new THREE.Mesh(palmGeo, skinMat);
  palmMesh.position.y = 0.044;
  palmMesh.castShadow = !isSoftwareGl;
  palm.add(palmMesh);

  // Thumb
  const thumbBase = new THREE.Group();
  thumbBase.position.set(-0.038, 0.025, 0.01);
  thumbBase.rotation.set(-0.2, 0.35, 0.4);
  palm.add(thumbBase);

  const thumbGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.052, 8);
  const thumbMesh = new THREE.Mesh(thumbGeo, skinMat);
  thumbMesh.position.y = 0.026;
  thumbBase.add(thumbMesh);

  // Articulated Index Finger (for precision tapping)
  const indexBase = new THREE.Group();
  indexBase.position.set(-0.024, 0.088, 0.005);
  palm.add(indexBase);

  const indexGeo = new THREE.CylinderGeometry(0.009, 0.008, 0.065, 8);
  const indexMesh = new THREE.Mesh(indexGeo, skinMat);
  indexMesh.position.y = 0.032;
  indexMesh.castShadow = !isSoftwareGl;
  indexBase.add(indexMesh);

  // Fingertip point
  const tipGeo = new THREE.SphereGeometry(0.008, 8, 8);
  const tipMesh = new THREE.Mesh(tipGeo, skinMat);
  tipMesh.position.y = 0.065;
  indexBase.add(tipMesh);

  // Middle, Ring, Pinky Fingers (gently curled)
  [0.0, 0.022, 0.042].forEach((fx, idx) => {
    const fBase = new THREE.Group();
    fBase.position.set(-0.024 + fx, 0.088, 0.0);
    fBase.rotation.x = -0.45 - idx * 0.12; // Curled back so index finger clearly points
    palm.add(fBase);

    const fGeo = new THREE.CylinderGeometry(0.0085, 0.0075, 0.055 - idx * 0.006, 8);
    const fMesh = new THREE.Mesh(fGeo, skinMat);
    fMesh.position.y = 0.025;
    fBase.add(fMesh);
  });

  // Held ID Card Prop
  const idCardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.054, 0.002), idCardMat);
  idCardMesh.position.set(-0.02, 0.08, 0.015);
  idCardMesh.rotation.set(0.1, 0.2, -0.15);
  idCardMesh.visible = false;
  palm.add(idCardMesh);

  // Held Credit Card Prop
  const creditCardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.054, 0.002), creditCardMat);
  creditCardMesh.position.set(-0.01, 0.08, 0.015);
  creditCardMesh.rotation.set(0.1, 0.15, -0.1);
  creditCardMesh.visible = false;
  palm.add(creditCardMesh);

  // Position interpolation state
  const currentPos = new THREE.Vector3(0.25, 1.05, 0.35);
  const targetPos = new THREE.Vector3(0.25, 1.05, 0.35);
  let lastTapPlayedTime = -1;

  function update(time: number, activeStep: WorkflowStep, screenFacePos: THREE.Vector3) {
    // 1. Calculate Target Position based on activeStep and tapTime
    const ht = activeStep.handTarget;

    // Special choreographed motion during Checkout Process (Step 09)
    if (activeStep.id === '09_shopping_bag') {
      if (time < 78.0) {
        // Hand moves to tap the screen cart trigger at bottom right
        targetPos.set(
          screenFacePos.x + ht.x,
          screenFacePos.y + ht.y,
          screenFacePos.z + (ht.z || 0.04)
        );
      } else {
        // Hand smoothly repositions to target the newly popped up Cart Summary button
        targetPos.set(
          screenFacePos.x + 0.0,
          screenFacePos.y - 0.16,
          screenFacePos.z + 0.02
        );
      }
    } else {
      // Base position in world space
      targetPos.set(
        screenFacePos.x + ht.x,
        screenFacePos.y + ht.y,
        screenFacePos.z + (ht.z || 0.04)
      );
    }

    // If step has a specific tap event, move finger forward to touch glass
    let tapOffset = 0;
    if (ht.tapTime !== undefined) {
      const dtTap = time - ht.tapTime;
      if (Math.abs(dtTap) < 0.8) {
        // Bell-shaped tap impulse towards screen (push forward onto screen face)
        const tNorm = 1.0 - Math.abs(dtTap) / 0.8;
        tapOffset = Math.sin(tNorm * Math.PI) * 0.035;

        // Play chime at exact moment of contact
        if (Math.abs(dtTap) < 0.1 && Math.abs(time - lastTapPlayedTime) > 1.0) {
          lastTapPlayedTime = time;
          audioSynth.playTouchChime(time);
        }
      }
    }

    // Second tap on the newly popped up Cart Summary Checkout button at 81.0s
    if (activeStep.id === '09_shopping_bag' && time >= 79.5 && time <= 82.5) {
      const dtTap2 = time - 81.0;
      if (Math.abs(dtTap2) < 0.8) {
        const tNorm = 1.0 - Math.abs(dtTap2) / 0.8;
        tapOffset = Math.sin(tNorm * Math.PI) * 0.035;

        if (Math.abs(dtTap2) < 0.1 && Math.abs(time - lastTapPlayedTime) > 0.8) {
          lastTapPlayedTime = time;
          audioSynth.playCheckoutProceed();
        }
      }
    }

    // Apply tap push-in on Z
    targetPos.z -= tapOffset;

    // Smoothly damp current hand position towards target
    currentPos.lerp(targetPos, 0.12);
    group.position.copy(currentPos);

    // Natural orientation: Hand points towards screen with comfortable ergonomic angle
    group.rotation.set(0.45, -0.25, 0.35);

    // Index finger micro-flexion during tap
    if (tapOffset > 0.01) {
      indexBase.rotation.x = -0.25;
    } else {
      indexBase.rotation.x = -0.05;
    }

    // Toggle props visibility
    idCardMesh.visible = !!ht.hasIdCard;
    creditCardMesh.visible = !!ht.hasCreditCard;
  }

  return {
    group,
    update,
    dispose: () => {
      forearmGeo.dispose();
      sleeveMat.dispose();
      wristGeo.dispose();
      skinMat.dispose();
      palmGeo.dispose();
      thumbGeo.dispose();
      indexGeo.dispose();
      tipGeo.dispose();
      idCardMesh.geometry.dispose();
      idCardMat.dispose();
      creditCardMesh.geometry.dispose();
      creditCardMat.dispose();
    },
  };
}
