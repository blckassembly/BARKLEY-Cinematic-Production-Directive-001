/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraMode, WORKFLOW_STEPS } from './types';

export interface CameraDirector {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  update: (time: number, mode: CameraMode) => {
    lensMm: number;
    shotName: string;
    description: string;
    stepNumber: string;
  };
  dispose: () => void;
}

export function createCameraDirector(
  canvas: HTMLCanvasElement,
  aspect: number
): CameraDirector {
  const camera = new THREE.PerspectiveCamera(44.0, aspect, 0.1, 100);
  camera.position.set(0, 1.25, 1.35);
  camera.lookAt(0, 1.25, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1.25, 0);
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.minDistance = 0.3;
  controls.maxDistance = 15;
  controls.enabled = false;

  const _camTarget = new THREE.Vector3();
  const _lookTarget = new THREE.Vector3();

  function update(time: number, mode: CameraMode) {
    if (mode === 'free') {
      controls.enabled = true;
      controls.update();
      return {
        lensMm: 45,
        shotName: 'Free 360° Showroom Orbit',
        description: 'Drag to orbit around the display, scroll to zoom, right-click to pan.',
        stepNumber: 'FREE',
      };
    }

    controls.enabled = false;

    if (mode === 'screen_focus') {
      camera.fov = 42.0;
      camera.updateProjectionMatrix();
      camera.position.set(0, 1.25, 1.28);
      camera.lookAt(0, 1.25, 0);
      return {
        lensMm: 50,
        shotName: 'Direct Screen Perspective',
        description: 'Direct eye-level perspective of the 27-inch portrait touchscreen.',
        stepNumber: 'SCREEN',
      };
    }

    if (mode === 'hardware_focus') {
      camera.fov = 38.0;
      camera.updateProjectionMatrix();
      camera.position.set(0, 1.15, 1.10);
      camera.lookAt(0, 1.15, 0);
      return {
        lensMm: 60,
        shotName: 'Lower Screen & Checkout Focus',
        description: 'Close focus on the cart summary and crypto checkout interaction.',
        stepNumber: 'HW',
      };
    }

    // Default Cinematic Customer POV mode:
    let activeStep = WORKFLOW_STEPS[0];
    for (let i = WORKFLOW_STEPS.length - 1; i >= 0; i--) {
      if (time >= WORKFLOW_STEPS[i].startTime) {
        activeStep = WORKFLOW_STEPS[i];
        break;
      }
    }

    let targetFov = 44.0;
    const subtleBreath = Math.sin(time * 0.4) * 0.008;

    if (time < 20.0) {
      // 0:00–0:20: Stage 1 — Approach & Reveal with screen front and center
      const p = Math.min(1.0, time / 20.0);
      const angle = (1.0 - p) * 0.18; // Smooth subtle approach
      const dist = 1.65 - p * 0.35; // 1.65m smoothly gliding to 1.30m
      _camTarget.set(
        Math.sin(angle) * dist,
        1.28 - p * 0.03,
        Math.cos(angle) * dist
      );
      _lookTarget.set(0, 1.25, 0);
      targetFov = 44.0;
    } else if (time < 45.0) {
      // 0:20–0:45: Stage 2 — Direct customer eye-level POV for DOB verification
      _camTarget.set(subtleBreath, 1.25, 1.30);
      _lookTarget.set(0, 1.25, 0);
      targetFov = 43.5;
    } else if (time < 65.0) {
      // 0:45–1:05: Stage 3 — Camera / Face ID alignment
      _camTarget.set(0, 1.30, 1.22);
      _lookTarget.set(0, 1.30, 0);
      targetFov = 42.0;
    } else if (time < 95.0) {
      // 1:05–1:35: Stage 4 — Product catalog browsing
      _camTarget.set(subtleBreath, 1.25, 1.28);
      _lookTarget.set(0, 1.25, 0);
      targetFov = 43.5;
    } else if (time < 125.0) {
      // 1:35–2:05: Stage 5 — Product details & advisory
      _camTarget.set(0, 1.24, 1.24);
      _lookTarget.set(0, 1.24, 0);
      targetFov = 43.0;
    } else if (time < 155.0) {
      // 2:05–2:35: Stage 6 — Cart summary and crypto checkout
      _camTarget.set(0, 1.22, 1.22);
      _lookTarget.set(0, 1.22, 0);
      targetFov = 42.5;
    } else if (time < 170.0) {
      // 2:35–2:50: Stage 7 — Order confirmation (#2847)
      _camTarget.set(0, 1.25, 1.26);
      _lookTarget.set(0, 1.25, 0);
      targetFov = 43.5;
    } else {
      // 2:50–3:00: Stage 8 — Closing wide showroom pull-back
      const p = (time - 170.0) / 10.0;
      _camTarget.set(
        p * 0.35,
        1.25 + p * 0.15,
        1.30 + p * 0.65
      );
      _lookTarget.set(0, 1.25, 0);
      targetFov = 44.0 + p * 3.0;
    }

    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.08);
    camera.updateProjectionMatrix();

    camera.position.lerp(_camTarget, 0.08);
    controls.target.lerp(_lookTarget, 0.08);
    camera.lookAt(controls.target);

    return {
      lensMm: Math.round(50 * (44 / camera.fov)),
      shotName: `${activeStep.number}. ${activeStep.name} (${activeStep.timecode})`,
      description: activeStep.description,
      stepNumber: activeStep.number,
    };
  }

  return {
    camera,
    controls,
    update,
    dispose: () => {
      controls.dispose();
    },
  };
}
