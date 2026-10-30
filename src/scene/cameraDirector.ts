/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraMode, WORKFLOW_STEPS, WorkflowStep } from './types';

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
  // Starts directly looking at the standard 27" portrait display
  const camera = new THREE.PerspectiveCamera(46.0, aspect, 0.1, 100);
  camera.position.set(0.42, 1.38, 0.98);
  camera.lookAt(0.35, 1.36, -0.32);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0.35, 1.36, -0.32);
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
        shotName: 'Free 360° Orbit',
        description: 'Drag to orbit around the kiosk, scroll to zoom, right-click to pan.',
        stepNumber: 'FREE',
      };
    }

    controls.enabled = false;

    if (mode === 'screen_focus') {
      camera.fov = 44.0;
      camera.updateProjectionMatrix();
      camera.position.set(0.38, 1.38, 0.92);
      camera.lookAt(0.35, 1.36, -0.32);
      return {
        lensMm: 50,
        shotName: 'Direct Screen View',
        description: 'Direct eye-level perspective of the 27-inch portrait touchscreen.',
        stepNumber: 'SCREEN',
      };
    }

    if (mode === 'hardware_focus') {
      camera.fov = 40.0;
      camera.updateProjectionMatrix();
      camera.position.set(0.35, 1.15, 0.65);
      camera.lookAt(0.35, 0.98, -0.28);
      return {
        lensMm: 60,
        shotName: 'Hardware Bay View',
        description: 'Macro focus on the ID scanner, NFC payment reader, and receipt printer.',
        stepNumber: 'HW',
      };
    }

    // Default Cinematic mode: Starts looking at standard screen, dynamically tracking steps
    let activeStep = WORKFLOW_STEPS[0];
    for (let i = WORKFLOW_STEPS.length - 1; i >= 0; i--) {
      if (time >= WORKFLOW_STEPS[i].startTime) {
        activeStep = WORKFLOW_STEPS[i];
        break;
      }
    }

    // Tailored camera framing for each step
    if (activeStep.id === '03_scan_id') {
      // Tilt down toward ID scanner intake mouth
      _camTarget.set(0.32, 1.22, 0.82);
      _lookTarget.set(0.31, 1.02, -0.25);
      camera.fov = 44.0;
    } else if (activeStep.id === '04_camera_verify') {
      // Tilt up toward upper camera sensor
      _camTarget.set(0.42, 1.55, 0.95);
      _lookTarget.set(0.35, 1.62, -0.3);
      camera.fov = 42.0;
    } else if (activeStep.id === '09_shopping_bag') {
      // Cinematic intimate framing on the 27" display as the Cart Summary pops up
      _camTarget.set(0.38, 1.34, 0.90);
      _lookTarget.set(0.35, 1.33, -0.32);
      camera.fov = 43.5;
    } else if (activeStep.id === '10_checkout_pay') {
      // Angle towards NFC payment reader
      _camTarget.set(0.44, 1.22, 0.82);
      _lookTarget.set(0.36, 1.02, -0.25);
      camera.fov = 44.0;
    } else if (activeStep.id === '12_receipt_handoff') {
      // Framing receipt slot and full kiosk
      _camTarget.set(0.48, 1.32, 1.1);
      _lookTarget.set(0.35, 1.25, -0.32);
      camera.fov = 48.0;
    } else {
      // Standard Screen View (starts here and stays centered on the 27" display)
      // Gentle subtle breathing motion
      const subtleBreath = Math.sin(time * 0.4) * 0.015;
      _camTarget.set(0.42 + subtleBreath, 1.38, 0.98);
      _lookTarget.set(0.35, 1.36, -0.32);
      camera.fov = 45.0;
    }

    camera.updateProjectionMatrix();
    camera.position.lerp(_camTarget, 0.08);
    controls.target.lerp(_lookTarget, 0.08);
    camera.lookAt(controls.target);

    return {
      lensMm: 45,
      shotName: `${activeStep.number}. ${activeStep.name}`,
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
