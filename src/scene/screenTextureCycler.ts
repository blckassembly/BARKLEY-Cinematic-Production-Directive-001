/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CheckoutAnimationState } from './types';

export interface BARKLEYScreenTextureState {
  id: string;
  name: string;
  category: string;
  startTime: number;
  endTime: number;
  pngPath: string;
  staticTexture?: THREE.Texture;
}

export const BARKLEY_UI_STATES: BARKLEYScreenTextureState[] = [
  {
    id: 'attract_welcome',
    name: '01. Welcome to Barley',
    category: 'Welcome & Attract Mode',
    startTime: 0,
    endTime: 20,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    id: 'verification_dob',
    name: '02. Verify Your Age (DOB)',
    category: 'Automated 21+ Age Gate',
    startTime: 20,
    endTime: 45,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    id: 'verification_id_camera',
    name: '03. Look at Camera (Face ID)',
    category: 'Biometric Verification',
    startTime: 45,
    endTime: 65,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    id: 'catalog_atelier',
    name: '04. The Atelier — Product Catalog',
    category: 'Curated Dispensary Menu',
    startTime: 65,
    endTime: 80,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_56_PM_d13373a2.png',
  },
  {
    id: 'catalog_edibles',
    name: '05. Edibles & Botanical Gummies',
    category: 'Category Menu Browsing',
    startTime: 80,
    endTime: 95,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_45_PM_027e70fb.png',
  },
  {
    id: 'product_details',
    name: '06. Product Details (Citrus Grove)',
    category: 'Potency & Terpene Breakdown',
    startTime: 95,
    endTime: 110,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_35_PM_10c16472.png',
  },
  {
    id: 'compliance_advisory',
    name: '07. Mandatory Compliance Advisory',
    category: 'THC/CBD Onset Disclosure',
    startTime: 110,
    endTime: 125,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_21_PM_3e5f2c30.png',
  },
  {
    id: 'cart_summary',
    name: '08. Cart Summary & Shopping Bag',
    category: 'Cart Review & Add Items',
    startTime: 125,
    endTime: 142,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_10_PM_51ed1acd.png',
  },
  {
    id: 'payment_nfc',
    name: '09. Contactless & Crypto Payment',
    category: 'One-Tap NFC & Crypto Approval',
    startTime: 142,
    endTime: 155,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_10_PM_51ed1acd.png',
  },
  {
    id: 'order_confirmed',
    name: '10. Order Confirmed (#2847)',
    category: 'Dispensary Pickup Reference',
    startTime: 155,
    endTime: 170,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    id: 'pickup_closing',
    name: '11. Pickup & Closing Handoff',
    category: 'Receipt & Atelier Handoff',
    startTime: 170,
    endTime: 180,
    pngPath: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_56_PM_43d65c5f.png',
  },
];

export class ScreenTextureCycler {
  public textureArray: BARKLEYScreenTextureState[] = [];
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public dynamicCanvasTexture: THREE.CanvasTexture;
  private loadedPngImages: Map<string, HTMLImageElement> = new Map();
  private isSoftwareGl: boolean;
  private lastTime: number = -999;
  private activeStateIndex: number = 0;

  private logCounter: number = 0;
  private lastLoggedStageIndex: number = -1;

  constructor(isSoftwareGl: boolean) {
    this.isSoftwareGl = isSoftwareGl;

    // 720 x 1280 portrait canvas (9:16 aspect ratio)
    this.canvas = document.createElement('canvas');
    this.canvas.width = 720;
    this.canvas.height = 1280;
    this.ctx = this.canvas.getContext('2d')!;

    this.dynamicCanvasTexture = new THREE.CanvasTexture(this.canvas);
    this.dynamicCanvasTexture.colorSpace = THREE.SRGBColorSpace;
    this.dynamicCanvasTexture.generateMipmaps = !isSoftwareGl;
    this.dynamicCanvasTexture.minFilter = THREE.LinearFilter;
    this.dynamicCanvasTexture.magFilter = THREE.LinearFilter;

    // Build the dynamic texture array
    const textureLoader = new THREE.TextureLoader();
    this.textureArray = BARKLEY_UI_STATES.map((state) => {
      const tex = textureLoader.load(state.pngPath);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = !isSoftwareGl;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return {
        ...state,
        staticTexture: tex,
      };
    });

    this.preloadImages();

    // Immediately render frame 0 and force upload to WebGL
    this.renderScreen(0, 0);
    this.dynamicCanvasTexture.needsUpdate = true;
    console.log('[ScreenTextureCycler] Initial frame 0 rendered to canvas; dynamicCanvasTexture.needsUpdate = true');
  }

  private preloadImages() {
    const uniquePaths = Array.from(new Set(BARKLEY_UI_STATES.map((s) => s.pngPath)));
    uniquePaths.forEach((path) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = path;
      img.onload = () => {
        this.loadedPngImages.set(path, img);
        this.renderScreen(this.activeStateIndex, this.lastTime > 0 ? this.lastTime : 0);
        this.dynamicCanvasTexture.needsUpdate = true;
      };
    });
  }

  public cycle(time: number): {
    activeState: BARKLEYScreenTextureState;
    index: number;
    progressInStage: number;
  } {
    let index = 0;
    for (let i = this.textureArray.length - 1; i >= 0; i--) {
      if (time >= this.textureArray[i].startTime) {
        index = i;
        break;
      }
    }

    this.activeStateIndex = index;
    const activeState = this.textureArray[index];
    const stageDuration = Math.max(0.1, activeState.endTime - activeState.startTime);
    const progressInStage = Math.min(1.0, Math.max(0, (time - activeState.startTime) / stageDuration));

    return {
      activeState,
      index,
      progressInStage,
    };
  }

  public mapScreenMeshToDynamicTextures(
    screenMesh: THREE.Mesh,
    time: number,
    checkoutAnimation?: CheckoutAnimationState
  ) {
    if (!screenMesh) return;

    const { index } = this.cycle(time);

    // Refresh canvas buffer
    const isCartActive = checkoutAnimation && checkoutAnimation.cartPopupProgress > 0.001;
    if (Math.abs(time - this.lastTime) >= 0.03 || index !== this.activeStateIndex || isCartActive || this.lastTime < 0) {
      this.lastTime = time;
      this.renderScreen(index, time, checkoutAnimation);
      this.dynamicCanvasTexture.needsUpdate = true;
    }

    // Ensure screen material uses MeshBasicMaterial with toneMapped: false and correct alpha channel
    if (!(screenMesh.material instanceof THREE.MeshBasicMaterial)) {
      console.log('[ScreenTextureCycler] Assigning dynamicCanvasTexture to screenMesh as MeshBasicMaterial');
      screenMesh.material = new THREE.MeshBasicMaterial({
        map: this.dynamicCanvasTexture,
        color: 0xffffff,
        toneMapped: false,
        transparent: false,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: true,
      });
      screenMesh.renderOrder = 999;
    } else {
      const mat = screenMesh.material as THREE.MeshBasicMaterial;
      if (mat.map !== this.dynamicCanvasTexture) {
        console.log('[ScreenTextureCycler] Re-linking mat.map to dynamicCanvasTexture');
        mat.map = this.dynamicCanvasTexture;
      }
      mat.color.setHex(0xffffff);
      mat.toneMapped = false;
      mat.transparent = false;
      mat.opacity = 1.0;
      mat.side = THREE.DoubleSide;
      mat.depthTest = true;
      mat.depthWrite = true;
      mat.needsUpdate = true;
    }
  }

  public renderScreen(stateIndex: number, time: number, checkoutAnimation?: CheckoutAnimationState) {
    const state = this.textureArray[stateIndex];

    const isNewStage = stateIndex !== this.lastLoggedStageIndex;
    if (isNewStage) {
      this.lastLoggedStageIndex = stateIndex;
      console.log(
        `[ScreenTextureCycler] Canvas Re-render -> Stage [${stateIndex}] "${state.name}" @ ${time.toFixed(2)}s | Texture updated onto display plane`
      );
    } else if (this.logCounter < 4 || this.logCounter % 150 === 0) {
      console.log(
        `[ScreenTextureCycler] Texture canvas active update frame #${this.logCounter} @ ${time.toFixed(2)}s | UI State: "${state.id}" | Canvas: ${this.canvas.width}x${this.canvas.height}`
      );
    }
    this.logCounter++;

    switch (state.id) {
      case 'attract_welcome':
        this.renderWelcomeScreen(time);
        break;
      case 'verification_dob':
        this.renderDobScreen(time);
        break;
      case 'verification_id_camera':
        this.renderFaceIdScreen(time);
        break;
      case 'catalog_atelier':
      case 'catalog_edibles':
        this.renderBrowseScreen(time);
        break;
      case 'product_details':
        this.renderProductDetailsScreen(time);
        break;
      case 'compliance_advisory':
        this.renderAdvisoryScreen(time);
        break;
      case 'cart_summary':
      case 'payment_nfc':
        this.renderCryptoCheckoutScreen(time);
        break;
      case 'order_confirmed':
        this.renderConfirmedScreen(time);
        break;
      case 'pickup_closing':
      default:
        this.renderClosingScreen(time);
        break;
    }

    // Smooth cart summary popup drawer whenever active
    if (checkoutAnimation && checkoutAnimation.cartPopupProgress > 0.001) {
      this.renderCartSummaryPopup(checkoutAnimation, time);
    }
  }

  // Clear canvas with given background color
  private clearScreen(bg = '#ffffff') {
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, 720, 1280);
  }

  // --- STAGE 0 (0:00–0:20): WELCOME ATTRACT SCREEN ---
  private renderWelcomeScreen(time: number) {
    this.clearScreen('#ffffff');

    // Subtle warm header gradient
    const grad = this.ctx.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, '#f5f3ef');
    grad.addColorStop(1, '#ffffff');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, 720, 400);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111111';
    this.ctx.font = 'bold 72px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '12px';
    this.ctx.fillText('BARLEY', 360, 420);

    this.ctx.fillStyle = '#555555';
    this.ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '4px';
    this.ctx.fillText('INTELLIGENT CANNABIS RETAIL', 360, 480);

    // Green separator
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillRect(260, 520, 200, 4);

    this.ctx.fillStyle = '#777777';
    this.ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Curated craft collection · Verified compliance', 360, 570);

    // Get Started Button
    const isActivating = time >= 16.0;
    const btnY = 720;
    const btnW = 380;
    const btnH = 80;
    const btnX = 360 - btnW / 2;

    this.ctx.fillStyle = isActivating ? '#059669' : '#111111';
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnW, btnH, 40);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(isActivating ? 'INITIALIZING...' : 'GET STARTED', 360, btnY + 50);

    this.renderFooter();
  }

  // --- STAGE 1 (0:20–0:45): DOB VERIFICATION ---
  private renderDobScreen(time: number) {
    this.clearScreen('#ffffff');

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111111';
    this.ctx.font = 'bold 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '8px';
    this.ctx.fillText('BARLEY', 360, 160);

    this.ctx.font = 'bold 46px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '0px';
    this.ctx.fillText('Verify Your Age', 360, 260);

    this.ctx.fillStyle = '#666666';
    this.ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Please enter your date of birth to continue.', 360, 310);

    const isMonthTyped = time >= 28.0;
    const isDayTyped = time >= 33.0;
    const isYearTyped = time >= 38.0;
    const isVerified = time >= 42.0;

    // Date boxes
    const boxes = [
      { label: isMonthTyped ? '08' : 'MM', x: 160, w: 100 },
      { label: isDayTyped ? '14' : 'DD', x: 280, w: 100 },
      { label: isYearTyped ? '1998' : 'YYYY', x: 400, w: 160 },
    ];

    boxes.forEach((b) => {
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.strokeStyle = isVerified ? '#10b981' : '#cbd5e1';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.roundRect(b.x, 360, b.w, 70, 12);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#111827';
      this.ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(b.label, b.x + b.w / 2, 406);
    });

    // Keypad (1 to 9 + 0)
    const keyStartX = 210;
    const keyStartY = 480;
    const keySize = 80;
    const keyGap = 30;

    for (let i = 1; i <= 9; i++) {
      const col = (i - 1) % 3;
      const row = Math.floor((i - 1) / 3);
      const kx = keyStartX + col * (keySize + keyGap);
      const ky = keyStartY + row * (keySize + keyGap);

      this.ctx.fillStyle = '#f3f4f6';
      this.ctx.beginPath();
      this.ctx.arc(kx + keySize / 2, ky + keySize / 2, keySize / 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#111827';
      this.ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(i.toString(), kx + keySize / 2, ky + keySize / 2 + 11);
    }

    // 0 key
    const zeroX = keyStartX + 1 * (keySize + keyGap);
    const zeroY = keyStartY + 3 * (keySize + keyGap);
    this.ctx.fillStyle = '#f3f4f6';
    this.ctx.beginPath();
    this.ctx.arc(zeroX + keySize / 2, zeroY + keySize / 2, keySize / 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('0', zeroX + keySize / 2, zeroY + keySize / 2 + 11);

    // Continue CTA
    const contY = 960;
    this.ctx.fillStyle = isVerified ? '#059669' : '#111111';
    this.ctx.beginPath();
    this.ctx.roundRect(180, contY, 360, 72, 36);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(isVerified ? '✓ AGE VERIFIED (21+)' : 'Continue', 360, contY + 45);

    this.renderFooter();
  }

  // --- STAGE 2 (0:45–1:05): FACE ID & CAMERA VERIFICATION ---
  private renderFaceIdScreen(time: number) {
    const isApproved = time >= 58.0;

    if (isApproved) {
      this.clearScreen('#ffffff');

      this.ctx.fillStyle = '#10b981';
      this.ctx.beginPath();
      this.ctx.arc(360, 480, 80, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 72px "Plus Jakarta Sans", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('✓', 360, 506);

      this.ctx.fillStyle = '#111111';
      this.ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Verification Approved', 360, 620);

      this.ctx.fillStyle = '#555555';
      this.ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Welcome to Barley · Unlocking Store Menu', 360, 670);
    } else {
      this.clearScreen('#0f172a');

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Look at the Camera', 360, 320);

      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Verifying your identity…', 360, 370);

      // Green Face Alignment Reticle
      this.ctx.strokeStyle = '#10b981';
      this.ctx.lineWidth = 6;
      this.ctx.strokeRect(180, 440, 360, 420);

      // Scanning bar
      const scanBarY = 460 + ((time * 80) % 380);
      this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(190, scanBarY);
      this.ctx.lineTo(530, scanBarY);
      this.ctx.stroke();

      this.ctx.fillStyle = '#10b981';
      this.ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('● Aligning facial biometrics…', 360, 910);
    }

    this.renderFooter();
  }

  // --- STAGE 3 (1:05–1:35): BROWSE CATALOG ---
  private renderBrowseScreen(time: number) {
    this.clearScreen('#f8f7f4');

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#111111';
    this.ctx.font = 'bold 38px "Cinzel", Georgia, serif';
    this.ctx.fillText('The Atelier', 50, 90);

    this.ctx.fillStyle = '#777777';
    this.ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Curated Dispensary Collection', 50, 125);

    // Cart badge
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#10b981';
    this.ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('🛒 Bag (3)', 670, 95);

    // Products
    const products = [
      { name: 'Citrus Grove Gummies (10 pcs)', sub: '5mg THC | 5mg CBD · Edibles', price: '$28.00', y: 170, tag: 'Gummies' },
      { name: 'Sunset Reserve Flower (3.5g)', sub: '28.5% THC · Premium Sativa', price: '$48.00', y: 350, tag: 'Flower' },
      { name: 'Solstice Live Rosin Vape (1.0g)', sub: '84.2% THC · Solventless', price: '$56.00', y: 530, tag: 'Vapes' },
      { name: 'Velvet Herbal Elixir (8 oz)', sub: '10mg THC · Rapid Onset', price: '$18.00', y: 710, tag: 'Beverages' },
    ];

    products.forEach((p, idx) => {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#e5e7eb';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(40, p.y, 640, 150, 18);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = '#111827';
      this.ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(p.name, 70, p.y + 55);

      this.ctx.fillStyle = '#6b7280';
      this.ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(p.sub, 70, p.y + 95);

      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#059669';
      this.ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(p.price, 650, p.y + 75);

      // Add button
      this.ctx.fillStyle = '#111827';
      this.ctx.beginPath();
      this.ctx.roundRect(550, p.y + 90, 100, 40, 20);
      this.ctx.fill();

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('+ Add', 600, p.y + 116);
    });

    this.renderFooter();
  }

  // --- STAGE 4 (1:35–1:50): PRODUCT DETAILS ---
  private renderProductDetailsScreen(time: number) {
    this.clearScreen('#ffffff');

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 42px "Cinzel", Georgia, serif';
    this.ctx.fillText('Citrus Grove Gummies', 50, 110);

    this.ctx.fillStyle = '#059669';
    this.ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('$28.00', 50, 165);

    // Potency Card
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(50, 210, 620, 200, 18);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Cannabinoid Potency Breakdown', 80, 260);

    this.ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#4b5563';
    this.ctx.fillText('• THC per Serving: 5.0 mg', 80, 305);
    this.ctx.fillText('• CBD per Serving: 5.0 mg', 80, 345);
    this.ctx.fillText('• Total Package (10 pcs): 50 mg THC / 50 mg CBD', 80, 385);

    // Terpenes & Effects
    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Curated Terpene Profile', 50, 460);

    const terpenes = ['Limonene (Citrus)', 'Myrcene (Calm)', 'Caryophyllene (Balance)'];
    terpenes.forEach((t, i) => {
      this.ctx.fillStyle = '#ecfdf5';
      this.ctx.beginPath();
      this.ctx.roundRect(50 + i * 210, 485, 195, 46, 23);
      this.ctx.fill();

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#047857';
      this.ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(t, 50 + i * 210 + 97, 514);
    });

    this.renderFooter();
  }

  // --- STAGE 5 (1:50–2:05): COMPLIANCE ADVISORY ---
  private renderAdvisoryScreen(time: number) {
    this.clearScreen('#ffffff');

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#b45309';
    this.ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Mandatory Advisory', 360, 120);

    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Cannabinoid Onset & Safety Disclosure', 360, 170);

    // Advisory Box
    this.ctx.fillStyle = '#fffbeb';
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(50, 230, 620, 360, 20);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#92400e';
    this.ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('WARNING: DELAYED ONSET EFFECT', 80, 280);

    this.ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillText('• Edibles may take 30 to 120 minutes to take effect.', 80, 330);
    this.ctx.fillText('• Do not consume additional servings prematurely.', 80, 375);
    this.ctx.fillText('• Do not drive or operate machinery under the influence.', 80, 420);
    this.ctx.fillText('• Keep out of reach of children and pets.', 80, 465);
    this.ctx.fillText('• For adult use only (21+). Verified eligibility required.', 80, 510);

    // Checkbox acknowledgment
    const isAck = time >= 118.0;
    this.ctx.fillStyle = isAck ? '#10b981' : '#ffffff';
    this.ctx.strokeStyle = isAck ? '#10b981' : '#cbd5e1';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(80, 640, 44, 44, 10);
    this.ctx.fill();
    this.ctx.stroke();

    if (isAck) {
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('✓', 102, 672);
    }

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('I have reviewed the potency & onset warnings.', 140, 670);

    this.renderFooter();
  }

  // --- STAGE 6 (2:05–2:35): CRYPTO & CARD CHECKOUT ---
  private renderCryptoCheckoutScreen(time: number) {
    this.clearScreen('#ffffff');

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 44px "Cinzel", Georgia, serif';
    this.ctx.fillText('Checkout', 360, 110);

    this.ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#059669';
    this.ctx.fillText('Total: $148.24', 360, 160);

    // Card Option
    this.ctx.fillStyle = '#f3f4f6';
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(60, 220, 600, 110, 18);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Pay with Card / Apple Pay', 100, 270);
    this.ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#6b7280';
    this.ctx.fillText('Contactless EMV · Tap on physical reader', 100, 305);

    // Crypto Option (Highlighted)
    const isPaid = time >= 147.0;

    this.ctx.fillStyle = isPaid ? '#ecfdf5' : '#111827';
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(60, 360, 600, 140, 20);
    this.ctx.fill();
    this.ctx.stroke();

    if (isPaid) {
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#047857';
      this.ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('✓ PAYMENT APPROVED', 360, 430);
      this.ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Crypto Settlement Confirmed · Order #2847', 360, 470);
    } else {
      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Pay with Crypto', 100, 420);

      this.ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillStyle = '#10b981';
      this.ctx.fillText('BTC · ETH · USDC (Zero Gas Fee)', 100, 465);

      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#10b981';
      this.ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('⚡ FAST', 620, 420);
    }

    this.renderFooter();
  }

  // --- STAGE 7 (2:35–2:50): ORDER CONFIRMED ---
  private renderConfirmedScreen(time: number) {
    this.clearScreen('#ffffff');

    this.ctx.fillStyle = '#10b981';
    this.ctx.beginPath();
    this.ctx.arc(360, 400, 75, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 70px "Plus Jakarta Sans", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('✓', 360, 425);

    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 44px "Cinzel", Georgia, serif';
    this.ctx.fillText('Order Confirmed', 360, 540);

    this.ctx.fillStyle = '#059669';
    this.ctx.font = 'bold 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '3px';
    this.ctx.fillText('Pickup #2847', 360, 620);

    this.ctx.fillStyle = '#555555';
    this.ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '0px';
    this.ctx.fillText('Please proceed to dispensary counter for pickup.', 360, 680);

    this.ctx.fillStyle = '#047857';
    this.ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Receipt printing…', 360, 740);

    this.renderFooter();
  }

  // --- STAGE 8 (2:50–3:00): CLOSING ---
  private renderClosingScreen(time: number) {
    this.clearScreen('#ffffff');

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111111';
    this.ctx.font = 'bold 64px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('BARLEY', 360, 500);

    this.ctx.fillStyle = '#10b981';
    this.ctx.fillRect(260, 540, 200, 4);

    this.ctx.fillStyle = '#555555';
    this.ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '4px';
    this.ctx.fillText('INTELLIGENT CANNABIS RETAIL', 360, 590);

    this.ctx.fillStyle = '#047857';
    this.ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '1px';
    this.ctx.fillText('ORDER #2847 READY FOR HANDOFF', 360, 660);

    this.renderFooter();
  }

  private renderFooter() {
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(100, 1160);
    this.ctx.lineTo(620, 1160);
    this.ctx.stroke();

    this.ctx.fillStyle = '#9ca3af';
    this.ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('BARLEY POS · 27" PORTRAIT DISPLAY · VERIFIED COMPLIANCE', 360, 1205);
  }

  // --- SMOOTH CART SUMMARY POPUP DRAWER ---
  private renderCartSummaryPopup(state: CheckoutAnimationState, time: number) {
    const p = Math.max(0, Math.min(1, state.cartPopupProgress));
    const cardY = 1280 - 680 * p;

    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 30;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.roundRect(30, cardY, 660, 680, [28, 28, 0, 0]);
    this.ctx.fill();
    this.ctx.restore();

    // Top grabber
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.beginPath();
    this.ctx.roundRect(330, cardY + 16, 60, 6, 3);
    this.ctx.fill();

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#111827';
    this.ctx.font = 'bold 32px "Cinzel", Georgia, serif';
    this.ctx.fillText('Cart Summary', 60, cardY + 70);

    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#059669';
    this.ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('$148.24', 660, cardY + 70);

    // Items
    const items = [
      { name: 'Botanical Fruit Gummies', price: '$28.00' },
      { name: 'Sunset Reserve Flower (3.5g)', price: '$48.00' },
      { name: 'Solstice Live Rosin Vape (1.0g)', price: '$56.00' },
    ];

    items.forEach((item, idx) => {
      const iy = cardY + 120 + idx * 70;
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.beginPath();
      this.ctx.roundRect(60, iy, 600, 56, 12);
      this.ctx.fill();

      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = '#1f2937';
      this.ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.name, 80, iy + 35);

      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#111827';
      this.ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.price, 640, iy + 35);
    });

    // Checkout Button
    const btnY = cardY + 360;
    const isProceed = state.isProceedTapped;
    this.ctx.fillStyle = isProceed ? '#059669' : '#111827';
    this.ctx.beginPath();
    this.ctx.roundRect(60, btnY, 600, 70, 35);
    this.ctx.fill();

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(isProceed ? '✓ ADVANCING TO PAYMENT' : 'PROCEED TO PAYMENT → $148.24', 360, btnY + 44);
  }

  public dispose() {
    this.dynamicCanvasTexture.dispose();
    this.textureArray.forEach((s) => {
      s.staticTexture?.dispose();
    });
  }
}
