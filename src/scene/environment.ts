/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface EnvironmentController {
  group: THREE.Group;
  dispose: () => void;
}

export function createDispensaryEnvironment(isSoftwareGl: boolean): EnvironmentController {
  const group = new THREE.Group();
  group.name = 'RetailDispensaryEnvironment';

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ef, // Warm white architectural plaster
    roughness: 0.88,
    metalness: 0.02,
  });

  const oakWoodMat = new THREE.MeshStandardMaterial({
    color: 0xc4a47c, // Warm Scandinavian light white oak
    roughness: 0.68,
    metalness: 0.05,
  });

  const darkMetalTrimMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e21,
    metalness: 0.85,
    roughness: 0.25,
  });

  const glassVitrineMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: isSoftwareGl ? 0.35 : 0.45,
    transmission: isSoftwareGl ? 0 : 0.8,
    roughness: 0.05,
    ior: 1.5,
    thickness: 0.5,
  });

  const warmCoveGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffeedb,
  });

  const amberGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd97706, // Amber tincture bottle
    transparent: true,
    opacity: 0.75,
    roughness: 0.12,
    metalness: 0.1,
  });

  const whiteJarMat = new THREE.MeshStandardMaterial({
    color: 0xfafaf9,
    roughness: 0.35,
    metalness: 0.1,
  });

  const plantLeafMat = new THREE.MeshStandardMaterial({
    color: 0x2d4a36, // Deep botanical forest green
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // 1. Polished Travertine / Terrazzo Floor with Procedural Canvas Texture
  const floorGeo = new THREE.PlaneGeometry(24, 24);
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const fCtx = floorCanvas.getContext('2d')!;
  fCtx.fillStyle = '#eee9e0';
  fCtx.fillRect(0, 0, 512, 512);

  // Large subtle slab grid lines
  fCtx.strokeStyle = 'rgba(180, 170, 155, 0.22)';
  fCtx.lineWidth = 2;
  for (let x = 0; x <= 512; x += 128) {
    fCtx.beginPath();
    fCtx.moveTo(x, 0);
    fCtx.lineTo(x, 512);
    fCtx.stroke();
  }
  for (let y = 0; y <= 512; y += 128) {
    fCtx.beginPath();
    fCtx.moveTo(0, y);
    fCtx.lineTo(512, y);
    fCtx.stroke();
  }
  // Subtle stone flecks
  fCtx.fillStyle = 'rgba(150, 140, 125, 0.08)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    fCtx.fillRect(rx, ry, Math.random() * 4 + 1, Math.random() * 4 + 1);
  }

  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(6, 6);
  floorTex.colorSpace = THREE.SRGBColorSpace;

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    color: 0xf0ece4,
    roughness: 0.22, // Subtle luxury specular sheen
    metalness: 0.08,
  });

  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = 0;
  floorMesh.receiveShadow = !isSoftwareGl;
  group.add(floorMesh);

  // 2. Back Architectural Wall
  const backWallGeo = new THREE.BoxGeometry(16, 5, 0.2);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 2.5, -4.5);
  backWall.receiveShadow = !isSoftwareGl;
  group.add(backWall);

  // Left Architectural Wall
  const leftWallGeo = new THREE.BoxGeometry(0.2, 5, 14);
  const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
  leftWall.position.set(-6.5, 2.5, 1.5);
  leftWall.receiveShadow = !isSoftwareGl;
  group.add(leftWall);

  // 3. Fluted Oak Display Millwork (Wall Credenza in Background)
  const displayCredenza = new THREE.Group();
  displayCredenza.position.set(0, 0, -4.2);
  group.add(displayCredenza);

  // Lower Oak Cabinet Base
  const cabinetBaseGeo = new THREE.BoxGeometry(8, 0.9, 0.6);
  const cabinetBase = new THREE.Mesh(cabinetBaseGeo, oakWoodMat);
  cabinetBase.position.y = 0.45;
  cabinetBase.castShadow = !isSoftwareGl;
  cabinetBase.receiveShadow = !isSoftwareGl;
  displayCredenza.add(cabinetBase);

  // Fluted oak slats along cabinet front
  const slatGeo = new THREE.BoxGeometry(0.04, 0.86, 0.02);
  for (let x = -3.8; x <= 3.8; x += 0.08) {
    const slat = new THREE.Mesh(slatGeo, oakWoodMat);
    slat.position.set(x, 0.45, 0.31);
    slat.castShadow = !isSoftwareGl;
    displayCredenza.add(slat);
  }

  // Upper Floating Shelves with LED Cove Underside
  for (let s = 0; s < 3; s++) {
    const shelfY = 1.35 + s * 0.65;
    const shelfGeo = new THREE.BoxGeometry(7.6, 0.05, 0.45);
    const shelf = new THREE.Mesh(shelfGeo, oakWoodMat);
    shelf.position.set(0, shelfY, 0.15);
    shelf.castShadow = !isSoftwareGl;
    shelf.receiveShadow = !isSoftwareGl;
    displayCredenza.add(shelf);

    // Warm cove glow strip beneath shelf
    const coveGeo = new THREE.PlaneGeometry(7.4, 0.04);
    const coveMesh = new THREE.Mesh(coveGeo, warmCoveGlowMat);
    coveMesh.rotation.x = Math.PI / 2;
    coveMesh.position.set(0, shelfY - 0.026, 0.15);
    displayCredenza.add(coveMesh);

    // Curated products on display shelf (amber bottles, ceramic jars, packaging)
    for (let p = -3.2; p <= 3.2; p += 0.72) {
      if (Math.abs(p) < 0.8 && s === 1) continue; // Leave central space behind kiosk clean
      const isJar = (Math.round(p * 10) + s) % 2 === 0;

      if (isJar) {
        // Ceramic Gummy / Flower Jar
        const jarGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.11, 16);
        const jar = new THREE.Mesh(jarGeo, whiteJarMat);
        jar.position.set(p, shelfY + 0.08, 0.15);
        jar.castShadow = !isSoftwareGl;
        displayCredenza.add(jar);

        const lidGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.025, 16);
        const lid = new THREE.Mesh(lidGeo, oakWoodMat);
        lid.position.set(p, shelfY + 0.145, 0.15);
        displayCredenza.add(lid);
      } else {
        // Amber Tincture Dropper Bottle
        const bottleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.13, 16);
        const bottle = new THREE.Mesh(bottleGeo, amberGlassMat);
        bottle.position.set(p, shelfY + 0.09, 0.15);
        bottle.castShadow = !isSoftwareGl;
        displayCredenza.add(bottle);

        const dropperGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.05, 12);
        const dropper = new THREE.Mesh(dropperGeo, darkMetalTrimMat);
        dropper.position.set(p, shelfY + 0.175, 0.15);
        displayCredenza.add(dropper);
      }
    }
  }

  // 4. Luxury Glass Display Vitrine Counter (Flank Right)
  const vitrineGroup = new THREE.Group();
  vitrineGroup.position.set(3.4, 0, -0.6);
  group.add(vitrineGroup);

  const vBaseGeo = new THREE.BoxGeometry(1.6, 0.75, 0.9);
  const vBase = new THREE.Mesh(vBaseGeo, darkMetalTrimMat);
  vBase.position.y = 0.375;
  vBase.castShadow = !isSoftwareGl;
  vitrineGroup.add(vBase);

  const vGlassGeo = new THREE.BoxGeometry(1.56, 0.35, 0.86);
  const vGlass = new THREE.Mesh(vGlassGeo, glassVitrineMat);
  vGlass.position.y = 0.925;
  vitrineGroup.add(vGlass);

  // 5. Architectural Indoor Planter with Monstera / Ficus Leaves (Flank Left)
  const planterGroup = new THREE.Group();
  planterGroup.position.set(-3.6, 0, -1.8);
  group.add(planterGroup);

  const potGeo = new THREE.CylinderGeometry(0.35, 0.28, 0.65, 24);
  const potMesh = new THREE.Mesh(potGeo, wallMat);
  potMesh.position.y = 0.325;
  potMesh.castShadow = !isSoftwareGl;
  planterGroup.add(potMesh);

  // Stylized architectural leaves
  for (let l = 0; l < 8; l++) {
    const angle = (l / 8) * Math.PI * 2;
    const leafGeo = new THREE.PlaneGeometry(0.28, 0.44);
    const leaf = new THREE.Mesh(leafGeo, plantLeafMat);
    leaf.position.set(Math.cos(angle) * 0.18, 0.65 + (l % 3) * 0.12, Math.sin(angle) * 0.18);
    leaf.rotation.set(0.6, angle, -0.4);
    leaf.castShadow = !isSoftwareGl;
    planterGroup.add(leaf);
  }

  // 6. Ceiling & Recessed Downlight Glow Fixtures
  const ceilingGeo = new THREE.BoxGeometry(16, 0.1, 14);
  const ceilingMesh = new THREE.Mesh(ceilingGeo, wallMat);
  ceilingMesh.position.set(0, 4.95, 1.5);
  group.add(ceilingMesh);

  // Linear architectural recessed light trough in ceiling
  const lightTroughGeo = new THREE.BoxGeometry(0.18, 0.04, 8);
  const lightTrough = new THREE.Mesh(lightTroughGeo, warmCoveGlowMat);
  lightTrough.position.set(0, 4.88, 0);
  group.add(lightTrough);

  return {
    group,
    dispose: () => {
      floorGeo.dispose();
      floorMat.dispose();
      floorTex.dispose();
      wallMat.dispose();
      oakWoodMat.dispose();
      darkMetalTrimMat.dispose();
      glassVitrineMat.dispose();
      warmCoveGlowMat.dispose();
      amberGlassMat.dispose();
      whiteJarMat.dispose();
      plantLeafMat.dispose();
      backWallGeo.dispose();
      leftWallGeo.dispose();
      cabinetBaseGeo.dispose();
      slatGeo.dispose();
      vBaseGeo.dispose();
      vGlassGeo.dispose();
      potGeo.dispose();
      ceilingGeo.dispose();
      lightTroughGeo.dispose();
    },
  };
}
