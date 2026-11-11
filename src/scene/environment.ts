/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface EnvironmentController {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Creates a realistic 500 square foot (~6.6m x 7.2m) boutique cannabis dispensary.
 * Layout Architecture:
 * - Entrance Doorway & Storefront Wall at front (z = +2.4m, x = 0.9m).
 * - BARKLEY POS mounted directly on the entrance wall (x = 0, y = 1.25m, z = 0m) in an isolated self-service ordering nook.
 * - Dedicated Budtender Checkout & Fulfillment Counter positioned deep in the back-right corner (z = -3.4m, x = 2.2m),
 *   completely physically separated from the entrance POS.
 * - Open-plan center browse tables and side wall millwork offering 100% clear sightlines back to the entrance screen.
 */
export function createDispensaryEnvironment(isSoftwareGl: boolean): EnvironmentController {
  const group = new THREE.Group();
  group.name = 'BoutiqueDispensary500SqFt';

  // Architectural Materials
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ef, // Scandinavian warm white architectural plaster
    roughness: 0.88,
    metalness: 0.02,
  });

  const oakWoodMat = new THREE.MeshStandardMaterial({
    color: 0xc4a47c, // Warm Scandinavian light white oak
    roughness: 0.65,
    metalness: 0.04,
  });

  const darkOakMat = new THREE.MeshStandardMaterial({
    color: 0x5a4632, // Smoked architectural oak accent
    roughness: 0.7,
    metalness: 0.05,
  });

  const bronzeMetalMat = new THREE.MeshStandardMaterial({
    color: 0x242220, // Matte dark architectural bronze
    metalness: 0.85,
    roughness: 0.25,
  });

  const brassTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Polished architectural brass accent
    metalness: 0.88,
    roughness: 0.2,
  });

  const marbleCounterMat = new THREE.MeshStandardMaterial({
    color: 0xe8e5df, // Calacatta warm white marble
    roughness: 0.25,
    metalness: 0.08,
  });

  const glassVitrineMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: isSoftwareGl ? 0.35 : 0.45,
    transmission: isSoftwareGl ? 0 : 0.8,
    roughness: 0.05,
    ior: 1.5,
    thickness: 0.4,
  });

  const warmCoveGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffeedb,
  });

  const greenPickupGlowMat = new THREE.MeshBasicMaterial({
    color: 0x10b981, // Emerald green pickup indicator
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

  // 1. Polished Travertine / Terrazzo Floor (6.8m x 7.6m = ~520 sq ft)
  const floorGeo = new THREE.PlaneGeometry(6.8, 7.6);
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const fCtx = floorCanvas.getContext('2d')!;
  fCtx.fillStyle = '#eee9e0';
  fCtx.fillRect(0, 0, 512, 512);

  // Large subtle slab grid lines (1.2m terrazzo pavers)
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
  floorTex.repeat.set(4, 4);
  floorTex.colorSpace = THREE.SRGBColorSpace;

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    color: 0xf0ece4,
    roughness: 0.22,
    metalness: 0.08,
  });

  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, 0, -0.9);
  floorMesh.receiveShadow = !isSoftwareGl;
  group.add(floorMesh);

  // 2. 500 Sq Ft Store Walls (Height = 3.2m)
  // Back Architectural Wall (z = -4.5m)
  const backWallGeo = new THREE.BoxGeometry(6.8, 3.2, 0.2);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 1.6, -4.6);
  backWall.receiveShadow = !isSoftwareGl;
  group.add(backWall);

  // Left Architectural Wall (x = -3.4m)
  const leftWallGeo = new THREE.BoxGeometry(0.2, 3.2, 7.6);
  const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
  leftWall.position.set(-3.4, 1.6, -0.9);
  leftWall.receiveShadow = !isSoftwareGl;
  group.add(leftWall);

  // Right Architectural Wall (x = +3.4m)
  const rightWallGeo = new THREE.BoxGeometry(0.2, 3.2, 7.6);
  const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
  rightWall.position.set(3.4, 1.6, -0.9);
  rightWall.receiveShadow = !isSoftwareGl;
  group.add(rightWall);

  // 3. FRONT ENTRANCE WALL & STOREFRONT DOOR (z = +2.4m)
  // Front Wall Section Left of Door (covers x = -3.4 to 0.4)
  const frontWallLeftGeo = new THREE.BoxGeometry(3.8, 3.2, 0.2);
  const frontWallLeft = new THREE.Mesh(frontWallLeftGeo, wallMat);
  frontWallLeft.position.set(-1.5, 1.6, 2.5);
  frontWallLeft.receiveShadow = !isSoftwareGl;
  group.add(frontWallLeft);

  // Front Wall Section Right of Door (covers x = 1.6 to 3.4)
  const frontWallRightGeo = new THREE.BoxGeometry(1.8, 3.2, 0.2);
  const frontWallRight = new THREE.Mesh(frontWallRightGeo, wallMat);
  frontWallRight.position.set(2.5, 1.6, 2.5);
  frontWallRight.receiveShadow = !isSoftwareGl;
  group.add(frontWallRight);

  // Front Wall Header Above Door (spans x = 0.4 to 1.6, y = 2.4 to 3.2)
  const frontDoorHeaderGeo = new THREE.BoxGeometry(1.2, 0.8, 0.2);
  const frontDoorHeader = new THREE.Mesh(frontDoorHeaderGeo, wallMat);
  frontDoorHeader.position.set(1.0, 2.8, 2.5);
  group.add(frontDoorHeader);

  // Storefront Entrance Doorway (x = 1.0m, z = 2.4m)
  const doorFrameGroup = new THREE.Group();
  doorFrameGroup.position.set(1.0, 0, 2.45);
  group.add(doorFrameGroup);

  // Bronze Door Jambs
  const jambLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.12), bronzeMetalMat);
  jambLeft.position.set(-0.55, 1.2, 0);
  doorFrameGroup.add(jambLeft);

  const jambRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.12), bronzeMetalMat);
  jambRight.position.set(0.55, 1.2, 0);
  doorFrameGroup.add(jambRight);

  const jambTop = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.06, 0.12), bronzeMetalMat);
  jambTop.position.set(0, 2.37, 0);
  doorFrameGroup.add(jambTop);

  // Glass Door Leaf (semi-open at 25 degrees greeting the customer)
  const doorLeafGroup = new THREE.Group();
  doorLeafGroup.position.set(-0.52, 0, 0); // Hinge point
  doorLeafGroup.rotation.y = 0.38; // Slightly open inward
  doorFrameGroup.add(doorLeafGroup);

  const doorLeafFrame = new THREE.Mesh(new THREE.BoxGeometry(1.02, 2.34, 0.05), bronzeMetalMat);
  doorLeafFrame.position.set(0.51, 1.17, 0);
  doorLeafGroup.add(doorLeafFrame);

  const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.86, 2.18, 0.02), glassVitrineMat);
  doorGlass.position.set(0.51, 1.17, 0);
  doorLeafGroup.add(doorGlass);

  // Vertical Architectural Door Pull Handle (Brass)
  const handleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.65, 16);
  const handleOuter = new THREE.Mesh(handleGeo, brassTrimMat);
  handleOuter.position.set(0.92, 1.15, 0.04);
  doorLeafGroup.add(handleOuter);

  // Coconut Coir / Dark Charcoal Entrance Mat inside door
  const matGeo = new THREE.PlaneGeometry(1.2, 0.9);
  const matMesh = new THREE.Mesh(
    matGeo,
    new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.95 })
  );
  matMesh.rotation.x = -Math.PI / 2;
  matMesh.position.set(1.0, 0.006, 1.8);
  group.add(matMesh);

  // Welcome Sign Above Door
  const welcomeSignGeo = new THREE.BoxGeometry(0.9, 0.18, 0.03);
  const welcomeSign = new THREE.Mesh(welcomeSignGeo, darkOakMat);
  welcomeSign.position.set(1.0, 2.55, 2.38);
  group.add(welcomeSign);

  // 4. ENTRANCE FEATURE WALL & NOOK FOR BARLEY POS
  // Right as customer enters the door at x = 1.0, to their front-left is the POS station (x = 0, z = 0).
  // Fluted oak vertical wall feature panel directly behind the screen (z = -0.05m)
  const posBackerPanel = new THREE.Group();
  posBackerPanel.position.set(0, 1.25, -0.05);
  group.add(posBackerPanel);

  // Oak backer board
  const backerGeo = new THREE.BoxGeometry(0.72, 1.35, 0.03);
  const backerMesh = new THREE.Mesh(backerGeo, oakWoodMat);
  backerMesh.castShadow = !isSoftwareGl;
  backerMesh.receiveShadow = !isSoftwareGl;
  posBackerPanel.add(backerMesh);

  // Fluted acoustic oak slats
  const slatGeo = new THREE.BoxGeometry(0.028, 1.34, 0.018);
  for (let x = -0.33; x <= 0.33; x += 0.055) {
    const slat = new THREE.Mesh(slatGeo, oakWoodMat);
    slat.position.set(x, 0, 0.02);
    slat.castShadow = !isSoftwareGl;
    posBackerPanel.add(slat);
  }

  // Soft ambient LED halo glow strip around perimeter of POS wall panel
  const haloGeo = new THREE.PlaneGeometry(0.76, 1.39);
  const haloMesh = new THREE.Mesh(haloGeo, warmCoveGlowMat);
  haloMesh.position.set(0, 0, -0.02);
  posBackerPanel.add(haloMesh);

  // Minimal wall-mounted shelf beneath screen (holds ID scanner & NFC symbol)
  const shelfGroup = new THREE.Group();
  shelfGroup.position.set(0, 0.82, 0.04);
  group.add(shelfGroup);

  const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.035, 0.16), bronzeMetalMat);
  shelfMesh.castShadow = !isSoftwareGl;
  shelfGroup.add(shelfMesh);

  // Integrated ID Scanner glowing green slot
  const scannerSlot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.008, 0.06), greenPickupGlowMat);
  scannerSlot.position.set(-0.11, 0.018, 0.02);
  shelfGroup.add(scannerSlot);

  // Contactless NFC / Tap Pad indicator
  const nfcDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.006, 24),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 })
  );
  nfcDisc.position.set(0.12, 0.02, 0.02);
  shelfGroup.add(nfcDisc);

  // 5. DEDICATED BUDTENDER CHECKOUT & PICKUP COUNTER (ISOLATED AT BACK RIGHT)
  // Physically separated at x = 2.1m, z = -3.4m (over 4m away from entrance POS!)
  const checkoutStation = new THREE.Group();
  checkoutStation.position.set(2.1, 0, -3.4);
  group.add(checkoutStation);

  // Main Oak Counter Body
  const counterBaseGeo = new THREE.BoxGeometry(2.0, 0.95, 0.85);
  const counterBase = new THREE.Mesh(counterBaseGeo, darkOakMat);
  counterBase.position.y = 0.475;
  counterBase.castShadow = !isSoftwareGl;
  counterBase.receiveShadow = !isSoftwareGl;
  checkoutStation.add(counterBase);

  // Calacatta Marble Countertop
  const counterTopGeo = new THREE.BoxGeometry(2.06, 0.06, 0.91);
  const counterTop = new THREE.Mesh(counterTopGeo, marbleCounterMat);
  counterTop.position.y = 0.98;
  counterTop.castShadow = !isSoftwareGl;
  checkoutStation.add(counterTop);

  // Glass Vitrine inset in counter displaying premium live rosin & solventless extracts
  const counterGlassGeo = new THREE.BoxGeometry(0.9, 0.22, 0.5);
  const counterGlass = new THREE.Mesh(counterGlassGeo, glassVitrineMat);
  counterGlass.position.set(-0.45, 1.12, 0.05);
  checkoutStation.add(counterGlass);

  // Budtender POS Register Terminal
  const registerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 16), bronzeMetalMat);
  registerBase.position.set(0.45, 1.09, 0.05);
  checkoutStation.add(registerBase);

  const registerScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.18, 0.015),
    new THREE.MeshBasicMaterial({ color: 0x1f2937 })
  );
  registerScreen.position.set(0.45, 1.25, 0.05);
  registerScreen.rotation.x = -0.3;
  checkoutStation.add(registerScreen);

  // Prominent Illuminated Sign: "ORDER PICKUP · CASHIER"
  const pickupSignGroup = new THREE.Group();
  pickupSignGroup.position.set(0, 2.3, -0.2);
  checkoutStation.add(pickupSignGroup);

  const pickupSignBoard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.24, 0.04), darkOakMat);
  pickupSignGroup.add(pickupSignBoard);

  const pickupSignGlow = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.05), greenPickupGlowMat);
  pickupSignGlow.position.y = -0.09;
  pickupSignGroup.add(pickupSignGlow);

  // Back-bar Fulfillment Cubbies on Rear Wall behind checkout counter
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const cubby = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.26, 0.28), oakWoodMat);
      cubby.position.set(-0.55 + col * 0.38, 1.45 + row * 0.34, -0.9);
      cubby.castShadow = !isSoftwareGl;
      checkoutStation.add(cubby);

      // Packaged craft bags / boxes in cubbies
      if ((row + col) % 2 === 0) {
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.14), whiteJarMat);
        bag.position.set(-0.55 + col * 0.38, 1.45 + row * 0.34, -0.85);
        checkoutStation.add(bag);
      }
    }
  }

  // 6. CENTRAL OPEN SIGHTLINE DISPLAY ISLAND (Low-Profile for Unobstructed Sightlines)
  // Located at x = 0.2, z = -1.8 (height = 0.82m)
  const centerIsland = new THREE.Group();
  centerIsland.position.set(0.2, 0, -1.8);
  group.add(centerIsland);

  const islandBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.78, 0.8), oakWoodMat);
  islandBase.position.y = 0.39;
  islandBase.castShadow = !isSoftwareGl;
  islandBase.receiveShadow = !isSoftwareGl;
  centerIsland.add(islandBase);

  const islandTop = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.05, 0.86), marbleCounterMat);
  islandTop.position.y = 0.805;
  islandTop.castShadow = !isSoftwareGl;
  centerIsland.add(islandTop);

  // Luxury Glass Aroma Cloches on central island
  for (let c = -0.65; c <= 0.65; c += 0.43) {
    const clocheBase = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.02, 24), darkOakMat);
    clocheBase.position.set(c, 0.84, 0);
    centerIsland.add(clocheBase);

    const clocheDome = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 24), glassVitrineMat);
    clocheDome.position.set(c, 0.91, 0);
    centerIsland.add(clocheDome);

    // Flower bud inside
    const bud = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035), plantLeafMat);
    bud.position.set(c, 0.87, 0);
    centerIsland.add(bud);
  }

  // 7. LEFT WALL CRAFT MILLWORK SHELVES (x = -3.2m, z = -2.2m to 0.5m)
  const leftMillwork = new THREE.Group();
  leftMillwork.position.set(-3.25, 0, -0.9);
  group.add(leftMillwork);

  for (let s = 0; s < 3; s++) {
    const shelfY = 1.1 + s * 0.55;
    const shelfGeo = new THREE.BoxGeometry(0.3, 0.04, 3.4);
    const shelf = new THREE.Mesh(shelfGeo, oakWoodMat);
    shelf.position.set(0, shelfY, 0);
    shelf.castShadow = !isSoftwareGl;
    leftMillwork.add(shelf);

    // Warm cove glow strip beneath shelf
    const cove = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 3.3), warmCoveGlowMat);
    cove.rotation.x = Math.PI / 2;
    cove.position.set(0, shelfY - 0.022, 0);
    leftMillwork.add(cove);

    // Display Jars and Tincture Dropper Bottles
    for (let z = -1.4; z <= 1.4; z += 0.46) {
      if ((s + Math.round(z * 10)) % 2 === 0) {
        // Ceramic Gummy / Flower Jar
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16), whiteJarMat);
        jar.position.set(0, shelfY + 0.07, z);
        jar.castShadow = !isSoftwareGl;
        leftMillwork.add(jar);
      } else {
        // Amber Tincture Bottle
        const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.12, 16), amberGlassMat);
        bottle.position.set(0, shelfY + 0.08, z);
        bottle.castShadow = !isSoftwareGl;
        leftMillwork.add(bottle);
      }
    }
  }

  // 8. LUXURY BOTANICAL PLANTER (Near Entrance Corner x = -1.6m, z = 1.6m)
  const planter = new THREE.Group();
  planter.position.set(-1.6, 0, 1.6);
  group.add(planter);

  const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.55, 24), wallMat);
  potMesh.position.y = 0.275;
  potMesh.castShadow = !isSoftwareGl;
  planter.add(potMesh);

  for (let l = 0; l < 8; l++) {
    const angle = (l / 8) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.42), plantLeafMat);
    leaf.position.set(Math.cos(angle) * 0.16, 0.55 + (l % 3) * 0.1, Math.sin(angle) * 0.16);
    leaf.rotation.set(0.55, angle, -0.35);
    leaf.castShadow = !isSoftwareGl;
    planter.add(leaf);
  }

  // 9. CEILING & LIGHTING TROUGHS (y = 3.2m)
  const ceilingGeo = new THREE.BoxGeometry(6.8, 0.1, 7.6);
  const ceilingMesh = new THREE.Mesh(ceilingGeo, wallMat);
  ceilingMesh.position.set(0, 3.25, -0.9);
  group.add(ceilingMesh);

  // Linear Cove Light Troughs in Ceiling
  const lightTrough1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 5.2), warmCoveGlowMat);
  lightTrough1.position.set(-1.2, 3.19, -0.9);
  group.add(lightTrough1);

  const lightTrough2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 5.2), warmCoveGlowMat);
  lightTrough2.position.set(1.2, 3.19, -0.9);
  group.add(lightTrough2);

  return {
    group,
    dispose: () => {
      floorGeo.dispose();
      floorMat.dispose();
      floorTex.dispose();
      wallMat.dispose();
      oakWoodMat.dispose();
      darkOakMat.dispose();
      bronzeMetalMat.dispose();
      brassTrimMat.dispose();
      marbleCounterMat.dispose();
      glassVitrineMat.dispose();
      warmCoveGlowMat.dispose();
      greenPickupGlowMat.dispose();
      amberGlassMat.dispose();
      whiteJarMat.dispose();
      plantLeafMat.dispose();
      backWallGeo.dispose();
      leftWallGeo.dispose();
      rightWallGeo.dispose();
      frontWallLeftGeo.dispose();
      frontWallRightGeo.dispose();
      frontDoorHeaderGeo.dispose();
      ceilingGeo.dispose();
    },
  };
}
