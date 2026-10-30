/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { audioSynth } from './audioSynth';

export interface CharacterController {
  group: THREE.Group;
  update: (
    time: number,
    buttonPos: THREE.Vector3,
    idSlotPos: THREE.Vector3,
    nfcPos: THREE.Vector3,
    receiptPos: THREE.Vector3
  ) => void;
  dispose: () => void;
}

export function createCharacter(isSoftwareGl: boolean): CharacterController {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'LuxuryRetailCustomer';

  // Materials with organic PBR fidelity
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdfa57f, // Warm Mediterranean/olive skin tone
    roughness: 0.58,
    metalness: 0.04,
  });

  const lipsMat = new THREE.MeshStandardMaterial({
    color: 0xc87b68,
    roughness: 0.45,
    metalness: 0.02,
  });

  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    roughness: 0.1,
    metalness: 0.0,
  });

  const irisMat = new THREE.MeshStandardMaterial({
    color: 0x3d271d, // Deep dark brown eyes
    roughness: 0.1,
    metalness: 0.2,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x1f1917, // Natural espresso dark hair
    roughness: 0.85,
    metalness: 0.05,
  });

  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0x1a212b, // Premium dark charcoal/midnight bomber jacket
    roughness: 0.7,
    metalness: 0.1,
  });

  const collarTeeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Crisp white designer tee collar visible at neck
    roughness: 0.8,
    metalness: 0.0,
  });

  const zipperMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Silver metal zipper teeth
    roughness: 0.25,
    metalness: 0.85,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x242831, // Tailored dark slate chinos
    roughness: 0.82,
    metalness: 0.03,
  });

  const sneakerLeatherMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Crisp white leather sneaker body
    roughness: 0.45,
    metalness: 0.05,
  });

  const sneakerSoleMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Molded EVA foam midsole
    roughness: 0.65,
    metalness: 0.0,
  });

  const idCardMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Laminated state ID card
    roughness: 0.25,
    metalness: 0.4,
  });

  const creditCardMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Black luxury credit card with gold EMV chip
    roughness: 0.3,
    metalness: 0.6,
  });

  // Skeletal Hierarchy Nodes
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.98;
  rootGroup.add(pelvis);

  // Anatomical Pelvis & Hips
  const hipsGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.2, 16);
  const hipsMesh = new THREE.Mesh(hipsGeo, pantsMat);
  hipsMesh.rotation.y = Math.PI / 2;
  hipsMesh.castShadow = !isSoftwareGl;
  pelvis.add(hipsMesh);

  // Spine & Waist
  const spine = new THREE.Group();
  spine.position.y = 0.11;
  pelvis.add(spine);

  const waistGeo = new THREE.CylinderGeometry(0.17, 0.16, 0.16, 16);
  const waistMesh = new THREE.Mesh(waistGeo, jacketMat);
  waistMesh.position.y = 0.08;
  waistMesh.castShadow = !isSoftwareGl;
  spine.add(waistMesh);

  // Ribcage / Chest
  const chest = new THREE.Group();
  chest.position.y = 0.18;
  spine.add(chest);

  const chestGeo = new THREE.CylinderGeometry(0.21, 0.18, 0.28, 18);
  const chestMesh = new THREE.Mesh(chestGeo, jacketMat);
  chestMesh.position.y = 0.14;
  chestMesh.scale.set(1.15, 1.0, 0.78); // Athletic taper
  chestMesh.castShadow = !isSoftwareGl;
  chest.add(chestMesh);

  // Bomber jacket front zipper line
  const zipperGeo = new THREE.BoxGeometry(0.012, 0.28, 0.02);
  const zipperMesh = new THREE.Mesh(zipperGeo, zipperMat);
  zipperMesh.position.set(0, 0.14, 0.165);
  chest.add(zipperMesh);

  // Inner Tee Collar Ring
  const teeCollarGeo = new THREE.TorusGeometry(0.08, 0.014, 8, 20);
  const teeCollar = new THREE.Mesh(teeCollarGeo, collarTeeMat);
  teeCollar.rotation.x = Math.PI / 2;
  teeCollar.position.set(0, 0.28, 0.02);
  chest.add(teeCollar);

  // Neck
  const neck = new THREE.Group();
  neck.position.y = 0.29;
  chest.add(neck);

  const neckGeo = new THREE.CylinderGeometry(0.068, 0.076, 0.11, 16);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.y = 0.055;
  neckMesh.castShadow = !isSoftwareGl;
  neck.add(neckMesh);

  // Head & Facial Sculpt
  const head = new THREE.Group();
  head.position.y = 0.12;
  neck.add(head);

  // Sculpted Cranium
  const craniumGeo = new THREE.SphereGeometry(0.115, 20, 18);
  craniumGeo.scale(1.0, 1.25, 1.1);
  const headMesh = new THREE.Mesh(craniumGeo, skinMat);
  headMesh.position.y = 0.11;
  headMesh.castShadow = !isSoftwareGl;
  head.add(headMesh);

  // Jawline & Chin
  const jawGeo = new THREE.BoxGeometry(0.095, 0.08, 0.11);
  const jawMesh = new THREE.Mesh(jawGeo, skinMat);
  jawMesh.position.set(0, 0.03, 0.05);
  head.add(jawMesh);

  // Nose
  const noseGeo = new THREE.ConeGeometry(0.02, 0.06, 6);
  const noseMesh = new THREE.Mesh(noseGeo, skinMat);
  noseMesh.rotation.x = -Math.PI / 2;
  noseMesh.position.set(0, 0.105, 0.135);
  head.add(noseMesh);

  // Eyes (Left & Right)
  [-0.04, 0.04].forEach((x) => {
    const eyeWhiteGeo = new THREE.SphereGeometry(0.015, 12, 12);
    const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeWhite.position.set(x, 0.125, 0.112);
    head.add(eyeWhite);

    const irisGeo = new THREE.SphereGeometry(0.008, 10, 10);
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(x, 0.125, 0.122);
    head.add(iris);
  });

  // Lips
  const lipsGeo = new THREE.BoxGeometry(0.045, 0.012, 0.016);
  const lipsMesh = new THREE.Mesh(lipsGeo, lipsMat);
  lipsMesh.position.set(0, 0.06, 0.12);
  head.add(lipsMesh);

  // Hair (Stylized layered volume)
  const hairGeo = new THREE.SphereGeometry(0.125, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  hairGeo.scale(1.02, 1.15, 1.08);
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 0.13, -0.01);
  hairMesh.castShadow = !isSoftwareGl;
  head.add(hairMesh);

  // Hair sweep tufts
  const tuftGeo = new THREE.BoxGeometry(0.12, 0.05, 0.08);
  const tuftMesh = new THREE.Mesh(tuftGeo, hairMat);
  tuftMesh.position.set(0, 0.23, 0.06);
  tuftMesh.rotation.x = -0.3;
  head.add(tuftMesh);

  // === LEFT ARM ===
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.25, 0.22, 0);
  chest.add(leftShoulder);

  // Deltoid shoulder cap
  const lDeltGeo = new THREE.SphereGeometry(0.075, 14, 12);
  const lDelt = new THREE.Mesh(lDeltGeo, jacketMat);
  leftShoulder.add(lDelt);

  const lUpperArmGeo = new THREE.CylinderGeometry(0.062, 0.054, 0.28, 14);
  const lUpperArm = new THREE.Mesh(lUpperArmGeo, jacketMat);
  lUpperArm.position.y = -0.14;
  lUpperArm.castShadow = !isSoftwareGl;
  leftShoulder.add(lUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.y = -0.28;
  leftShoulder.add(leftElbow);

  const lForearmGeo = new THREE.CylinderGeometry(0.052, 0.044, 0.26, 14);
  const lForearm = new THREE.Mesh(lForearmGeo, jacketMat);
  lForearm.position.y = -0.13;
  lForearm.castShadow = !isSoftwareGl;
  leftElbow.add(lForearm);

  const leftWrist = new THREE.Group();
  leftWrist.position.y = -0.26;
  leftElbow.add(leftWrist);

  // Left Hand with distinct palm and fingers
  const lHand = buildDetailedHand(skinMat, false);
  leftWrist.add(lHand.group);

  // === RIGHT ARM (Active Interaction Arm) ===
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.25, 0.22, 0);
  chest.add(rightShoulder);

  const rDelt = new THREE.Mesh(lDeltGeo, jacketMat);
  rightShoulder.add(rDelt);

  const rUpperArmGeo = new THREE.CylinderGeometry(0.062, 0.054, 0.28, 14);
  const rUpperArm = new THREE.Mesh(rUpperArmGeo, jacketMat);
  rUpperArm.position.y = -0.14;
  rUpperArm.castShadow = !isSoftwareGl;
  rightShoulder.add(rUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.y = -0.28;
  rightShoulder.add(rightElbow);

  const rForearmGeo = new THREE.CylinderGeometry(0.052, 0.044, 0.26, 14);
  const rForearm = new THREE.Mesh(rForearmGeo, jacketMat);
  rForearm.position.y = -0.13;
  rForearm.castShadow = !isSoftwareGl;
  rightElbow.add(rForearm);

  const rightWrist = new THREE.Group();
  rightWrist.position.y = -0.26;
  rightElbow.add(rightWrist);

  // Right Hand with articulated index finger for precision touchscreen interaction
  const rHand = buildDetailedHand(skinMat, true);
  rightWrist.add(rHand.group);

  // Held props for ID & Payment scenes
  const idCardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.002, 0.054), idCardMat);
  idCardMesh.position.set(0, -0.06, 0.04);
  idCardMesh.visible = false;
  rHand.group.add(idCardMesh);

  const creditCardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.002, 0.054), creditCardMat);
  creditCardMesh.position.set(0, -0.06, 0.04);
  creditCardMesh.visible = false;
  rHand.group.add(creditCardMesh);

  // === LEFT LEG ===
  const leftHip = new THREE.Group();
  leftHip.position.set(-0.115, -0.08, 0);
  pelvis.add(leftHip);

  const lThighGeo = new THREE.CylinderGeometry(0.085, 0.068, 0.44, 16);
  const lThigh = new THREE.Mesh(lThighGeo, pantsMat);
  lThigh.position.y = -0.22;
  lThigh.castShadow = !isSoftwareGl;
  leftHip.add(lThigh);

  const leftKnee = new THREE.Group();
  leftKnee.position.y = -0.44;
  leftHip.add(leftKnee);

  const lShinGeo = new THREE.CylinderGeometry(0.068, 0.052, 0.42, 16);
  const lShin = new THREE.Mesh(lShinGeo, pantsMat);
  lShin.position.y = -0.21;
  lShin.castShadow = !isSoftwareGl;
  leftKnee.add(lShin);

  const leftAnkle = new THREE.Group();
  leftAnkle.position.y = -0.42;
  leftKnee.add(leftAnkle);

  const lSneaker = buildDetailedSneaker(sneakerLeatherMat, sneakerSoleMat, !isSoftwareGl);
  leftAnkle.add(lSneaker);

  // === RIGHT LEG ===
  const rightHip = new THREE.Group();
  rightHip.position.set(0.115, -0.08, 0);
  pelvis.add(rightHip);

  const rThighGeo = new THREE.CylinderGeometry(0.085, 0.068, 0.44, 16);
  const rThigh = new THREE.Mesh(rThighGeo, pantsMat);
  rThigh.position.y = -0.22;
  rThigh.castShadow = !isSoftwareGl;
  rightHip.add(rThigh);

  const rightKnee = new THREE.Group();
  rightKnee.position.y = -0.44;
  rightHip.add(rightKnee);

  const rShinGeo = new THREE.CylinderGeometry(0.068, 0.052, 0.42, 16);
  const rShin = new THREE.Mesh(rShinGeo, pantsMat);
  rShin.position.y = -0.21;
  rShin.castShadow = !isSoftwareGl;
  rightKnee.add(rShin);

  const rightAnkle = new THREE.Group();
  rightAnkle.position.y = -0.42;
  rightKnee.add(rightAnkle);

  const rSneaker = buildDetailedSneaker(sneakerLeatherMat, sneakerSoleMat, !isSoftwareGl);
  rightAnkle.add(rSneaker);

  // Helper builders for high-detail hands and footwear
  function buildDetailedHand(skin: THREE.Material, isRight: boolean) {
    const hGroup = new THREE.Group();

    // Contoured palm
    const palmGeo = new THREE.BoxGeometry(0.07, 0.085, 0.028);
    const palmMesh = new THREE.Mesh(palmGeo, skin);
    palmMesh.position.y = -0.042;
    hGroup.add(palmMesh);

    // Opposed Thumb
    const thumbBase = new THREE.Group();
    thumbBase.position.set(isRight ? -0.038 : 0.038, -0.02, 0.01);
    thumbBase.rotation.set(0.3, isRight ? 0.4 : -0.4, isRight ? 0.3 : -0.3);
    hGroup.add(thumbBase);

    const thumbGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.045, 8);
    const thumbMesh = new THREE.Mesh(thumbGeo, skin);
    thumbMesh.position.y = -0.022;
    thumbBase.add(thumbMesh);

    // Articulated Index Finger
    const indexBase = new THREE.Group();
    indexBase.position.set(isRight ? -0.025 : 0.025, -0.085, 0.005);
    hGroup.add(indexBase);

    const indexMid = new THREE.Group();
    indexMid.position.y = -0.03;
    indexBase.add(indexMid);

    const indexPhalangeGeo = new THREE.CylinderGeometry(0.009, 0.008, 0.03, 8);
    const p1 = new THREE.Mesh(indexPhalangeGeo, skin);
    p1.position.y = -0.015;
    indexBase.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.007, 0.025, 8), skin);
    p2.position.y = -0.0125;
    indexMid.add(p2);

    // Middle, Ring, Pinky fingers (relaxed curved grip)
    const fingerOffsets = [0.0, 0.022, 0.042];
    fingerOffsets.forEach((fx, idx) => {
      const fBase = new THREE.Group();
      fBase.position.set(isRight ? -0.025 + fx : 0.025 - fx, -0.085, 0.0);
      fBase.rotation.x = 0.35 + idx * 0.08; // Natural gentle finger curl
      hGroup.add(fBase);

      const fGeo = new THREE.CylinderGeometry(0.0085, 0.0075, 0.05 - idx * 0.006, 8);
      const fMesh = new THREE.Mesh(fGeo, skin);
      fMesh.position.y = -0.025;
      fBase.add(fMesh);
    });

    return { group: hGroup, indexBase, indexMid };
  }

  function buildDetailedSneaker(leather: THREE.Material, sole: THREE.Material, castShadow: boolean) {
    const sGroup = new THREE.Group();

    // Curved Sneaker Upper
    const upperGeo = new THREE.BoxGeometry(0.105, 0.075, 0.22);
    const upperMesh = new THREE.Mesh(upperGeo, leather);
    upperMesh.position.set(0, -0.032, 0.035);
    upperMesh.castShadow = castShadow;
    sGroup.add(upperMesh);

    // Molded Midsole & Outsole
    const soleGeo = new THREE.BoxGeometry(0.112, 0.03, 0.235);
    const soleMesh = new THREE.Mesh(soleGeo, sole);
    soleMesh.position.set(0, -0.075, 0.035);
    sGroup.add(soleMesh);

    // Toe box curvature
    const toeGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.105, 12, 1, false, 0, Math.PI);
    const toeMesh = new THREE.Mesh(toeGeo, leather);
    toeMesh.rotation.z = Math.PI / 2;
    toeMesh.position.set(0, -0.035, 0.14);
    sGroup.add(toeMesh);

    return sGroup;
  }

  // Trajectory Waypoints
  const startX = -3.4;
  const startZ = 2.6;
  const finalX = 0.0;
  const finalZ = 0.72; // Stands 72 cm from kiosk display face

  // Master Kinematics update function
  function update(
    time: number,
    buttonPos: THREE.Vector3,
    idSlotPos: THREE.Vector3,
    nfcPos: THREE.Vector3,
    receiptPos: THREE.Vector3
  ) {
    // 1. Locomotion & Position
    // Walking approach happens between t = 0 and t = 18.5s
    let walkProgress = 0;
    if (time < 16.0) {
      walkProgress = (time / 16.0) * 0.88;
    } else if (time < 19.5) {
      const decelT = (time - 16.0) / 3.5;
      const smoothDecel = 1 - Math.pow(1 - decelT, 3);
      walkProgress = 0.88 + smoothDecel * 0.12;
    } else {
      walkProgress = 1.0;
    }

    const currentX = THREE.MathUtils.lerp(startX, finalX, Math.pow(walkProgress, 0.88));
    const currentZ = THREE.MathUtils.lerp(startZ, finalZ, walkProgress);
    rootGroup.position.set(currentX, 0, currentZ);

    // Smooth heading orientation
    const angleToKiosk = Math.atan2(0 - currentX, 0 - currentZ);
    if (walkProgress < 0.92) {
      rootGroup.rotation.y = angleToKiosk;
    } else {
      const settleT = (walkProgress - 0.92) / 0.08;
      rootGroup.rotation.y = THREE.MathUtils.lerp(angleToKiosk, Math.PI, settleT);
    }

    // 2. Walking Gait Kinematics (0s - 19.5s)
    const isWalking = time < 19.2;
    const walkSpeed = Math.max(0, 1.0 - (time > 15.0 ? (time - 15.0) / 4.5 : 0));

    if (isWalking && walkSpeed > 0.03) {
      // Natural human gait cadence: ~1.7 steps per second
      const stepFreq = 4.0;
      const gaitPhase = time * stepFreq;

      const legAmp = 0.48 * walkSpeed;
      const armAmp = 0.40 * walkSpeed;

      // Heel-to-toe roll with grounded support phase
      const lHip = Math.sin(gaitPhase) * legAmp;
      const rHip = Math.sin(gaitPhase + Math.PI) * legAmp;

      leftHip.rotation.x = lHip;
      rightHip.rotation.x = rHip;

      // Realistic knee flexion on swing leg
      leftKnee.rotation.x = Math.max(0, -Math.sin(gaitPhase) * 0.65 * walkSpeed);
      rightKnee.rotation.x = Math.max(0, -Math.sin(gaitPhase + Math.PI) * 0.65 * walkSpeed);

      // Ankle heel-strike roll (-15 deg at strike, flattening on ground)
      leftAnkle.rotation.x = -lHip * 0.45;
      rightAnkle.rotation.x = -rHip * 0.45;

      // Lateral pelvic sway & vertical bobbing
      pelvis.position.y = 0.98 + Math.abs(Math.sin(gaitPhase * 2)) * 0.024 * walkSpeed;
      pelvis.rotation.z = Math.sin(gaitPhase) * 0.028 * walkSpeed;
      pelvis.rotation.y = -Math.sin(gaitPhase) * 0.035 * walkSpeed;

      // Arms swing in natural counter-momentum
      leftShoulder.rotation.x = -rHip * 0.72;
      leftShoulder.rotation.z = 0.07;
      leftElbow.rotation.x = -0.25 - Math.abs(leftShoulder.rotation.x) * 0.3;

      rightShoulder.rotation.x = -lHip * 0.72;
      rightShoulder.rotation.z = -0.07;
      rightElbow.rotation.x = -0.25 - Math.abs(rightShoulder.rotation.x) * 0.3;

      // Spine athletic lean & counter-twist
      spine.rotation.y = Math.sin(gaitPhase) * 0.03 * walkSpeed;
      spine.rotation.x = 0.035 * walkSpeed;

      // Head smoothly turns to fixate on BARKLEY kiosk screen
      const headTurnProgress = Math.min(1.0, Math.max(0, (time - 4.0) / 5.0));
      head.rotation.y = THREE.MathUtils.lerp(0, -0.28, headTurnProgress * (1 - walkProgress * 0.85));
      head.rotation.x = -0.05;

      // Terrazzo footstep audio
      const phaseNorm = (gaitPhase % (Math.PI * 2)) / (Math.PI * 2);
      if (phaseNorm > 0.46 && phaseNorm < 0.54) {
        audioSynth.playFootstep(time, true);
      } else if (phaseNorm > 0.96 || phaseNorm < 0.04) {
        audioSynth.playFootstep(time, false);
      }
    } else {
      // 3. Stance Mode & Gestural Storyboard Actions (20s - 180s)
      // Confident, ergonomic standing posture facing screen
      leftHip.rotation.set(0.04, 0, -0.03);
      rightHip.rotation.set(-0.02, 0, 0.04);
      leftKnee.rotation.set(0.02, 0, 0);
      rightKnee.rotation.set(0.04, 0, 0);
      leftAnkle.rotation.set(-0.05, 0, 0);
      rightAnkle.rotation.set(-0.02, 0, 0);

      pelvis.position.y = 0.975;
      pelvis.rotation.set(0, 0, 0.015);

      spine.rotation.set(-0.02, 0, 0);
      chest.rotation.set(0, 0, 0);

      leftShoulder.rotation.set(0.05, 0, 0.08);
      leftElbow.rotation.set(-0.16, 0, 0);

      // Default look at screen center
      head.rotation.set(-0.16, 0.02, 0);

      // Hide props by default
      idCardMesh.visible = false;
      creditCardMesh.visible = false;

      // --- CHAPTER 2: TAP GET STARTED (20s - 40s) ---
      if (time >= 20 && time < 40) {
        let reach = 0;
        if (time >= 24 && time < 28) {
          reach = Math.sin(((time - 24) / 4) * (Math.PI / 2));
        } else if (time >= 28 && time < 31) {
          reach = 1.0;
          if (time >= 28.0 && time <= 28.15) audioSynth.playTouchChime(time);
        } else if (time >= 31 && time < 35) {
          reach = 1.0 - ((time - 31) / 4) * 0.7;
        } else if (time >= 35) {
          reach = 0.3;
        }

        rightShoulder.rotation.x = THREE.MathUtils.lerp(0.05, -0.92, reach);
        rightShoulder.rotation.y = THREE.MathUtils.lerp(0, -0.16, reach);
        rightShoulder.rotation.z = THREE.MathUtils.lerp(-0.08, -0.22, reach);
        rightElbow.rotation.x = THREE.MathUtils.lerp(-0.16, -0.55, reach);
        rHand.indexBase.rotation.x = THREE.MathUtils.lerp(0.1, -0.38, reach);
      }
      // --- CHAPTER 3: ID & FACE VERIFICATION (40s - 65s) ---
      else if (time >= 40 && time < 65) {
        idCardMesh.visible = time >= 44 && time < 60;
        // Reach down toward ID scanner slot (below screen)
        const scanReach = time >= 46 && time <= 58 ? 1.0 : 0.4;
        rightShoulder.rotation.x = THREE.MathUtils.lerp(0.05, -0.52, scanReach);
        rightShoulder.rotation.y = -0.15;
        rightElbow.rotation.x = THREE.MathUtils.lerp(-0.2, -0.75, scanReach);

        // Look up at camera on upper bezel during face verification
        if (time >= 54 && time <= 62) {
          head.rotation.set(0.05, 0, 0); // Looking directly up at camera
        }
      }
      // --- CHAPTER 4 & 5: CATALOG BROWSING & GUMMIES (65s - 120s) ---
      else if (time >= 65 && time < 120) {
        // Natural browsing posture: right hand up gesturing and tapping touchscreen
        const browseCycle = (time % 12) / 12;
        const tapMotion = Math.sin(browseCycle * Math.PI * 2) * 0.15;

        rightShoulder.rotation.x = -0.75 + tapMotion;
        rightShoulder.rotation.y = -0.12;
        rightElbow.rotation.x = -0.62 - tapMotion * 0.5;
        rHand.indexBase.rotation.x = -0.35;
      }
      // --- CHAPTER 6: PRODUCT DETAILS & ADVISORY (120s - 145s) ---
      else if (time >= 120 && time < 145) {
        // Examining details, then reaching to tap "Add to bag" at 138s
        const isAdding = time >= 136 && time <= 142;
        rightShoulder.rotation.x = isAdding ? -0.88 : -0.55;
        rightShoulder.rotation.y = -0.15;
        rightElbow.rotation.x = isAdding ? -0.58 : -0.42;
        if (time >= 138.0 && time <= 138.15) audioSynth.playTouchChime(time);
      }
      // --- CHAPTER 7: CONTACTLESS PAYMENT (145s - 165s) ---
      else if (time >= 145 && time < 165) {
        creditCardMesh.visible = time >= 150 && time < 162;
        // Tap payment card on NFC reader
        const isTappingCard = time >= 152 && time <= 158;
        rightShoulder.rotation.x = isTappingCard ? -0.62 : -0.35;
        rightShoulder.rotation.y = 0.05;
        rightElbow.rotation.x = isTappingCard ? -0.68 : -0.3;
        if (time >= 154.0 && time <= 154.15) audioSynth.playTouchChime(time);
      }
      // --- CHAPTER 8: RECEIPT & PICKUP HANDOFF (165s - 180s) ---
      else {
        // Reaches to grab printed receipt, then turns smoothly toward pickup counter
        const isGrabbingReceipt = time >= 170 && time <= 175;
        rightShoulder.rotation.x = isGrabbingReceipt ? -0.58 : 0.05;
        rightShoulder.rotation.y = 0.12;
        rightElbow.rotation.x = isGrabbingReceipt ? -0.65 : -0.2;

        if (time >= 175) {
          // Turns smoothly to the right toward the pickup counter
          const turnT = (time - 175) / 5.0;
          rootGroup.rotation.y = THREE.MathUtils.lerp(Math.PI, Math.PI * 0.65, turnT);
          head.rotation.y = THREE.MathUtils.lerp(0, 0.35, turnT);
        }
      }
    }
  }

  return {
    group: rootGroup,
    update,
    dispose: () => {
      skinMat.dispose();
      lipsMat.dispose();
      eyeWhiteMat.dispose();
      irisMat.dispose();
      hairMat.dispose();
      jacketMat.dispose();
      collarTeeMat.dispose();
      zipperMat.dispose();
      pantsMat.dispose();
      sneakerLeatherMat.dispose();
      sneakerSoleMat.dispose();
      idCardMat.dispose();
      creditCardMat.dispose();
      hipsGeo.dispose();
      waistGeo.dispose();
      chestGeo.dispose();
      zipperGeo.dispose();
      teeCollarGeo.dispose();
      neckGeo.dispose();
      craniumGeo.dispose();
      jawGeo.dispose();
      noseGeo.dispose();
      lipsGeo.dispose();
      hairGeo.dispose();
      tuftGeo.dispose();
      lUpperArmGeo.dispose();
      lForearmGeo.dispose();
      rUpperArmGeo.dispose();
      rForearmGeo.dispose();
      lThighGeo.dispose();
      lShinGeo.dispose();
      rThighGeo.dispose();
      rShinGeo.dispose();
    },
  };
}
