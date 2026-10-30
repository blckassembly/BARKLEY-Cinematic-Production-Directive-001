/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface ScreenImageInfo {
  title: string;
  category: string;
  path: string;
}

export const UPLOADED_SCREENS: ScreenImageInfo[] = [
  {
    title: '01. Welcome to BARKLEY',
    category: 'Welcome & Get Started',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    title: '02. Verify Your Age (DOB)',
    category: 'Age Gate & Compliance',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    title: '03. Scan Your ID Card',
    category: 'ID Document Reader',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    title: '04. Camera Verification',
    category: 'Biometric Face Match',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    title: '05. The Atelier — Featured POS',
    category: 'Curated Collection',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_56_PM_d13373a2.png',
  },
  {
    title: '06. Explore Gummies Collection',
    category: 'Edibles Catalog',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_45_PM_027e70fb.png',
  },
  {
    title: '07. Botanical Fruit Gummies',
    category: 'Product Details & 360 View',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_35_PM_10c16472.png',
  },
  {
    title: '08. Edibles Dosage Advisory',
    category: 'Effects & Safety Guide',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_21_PM_3e5f2c30.png',
  },
  {
    title: '09. Review Your Selection ($148.24)',
    category: 'Shopping Bag Summary',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_10_PM_51ed1acd.png',
  },
  {
    title: '10. Contactless Payment (NFC)',
    category: 'Card & Apple Pay Tap',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    title: '11. Order Confirmed (#2847)',
    category: 'Pickup Authorization',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
  },
  {
    title: '12. Purchase Complete & Receipt',
    category: 'Printed & Digital Receipt',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_56_PM_43d65c5f.png',
  },
];

import { CheckoutAnimationState } from './types';

export class KioskScreenEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  private lastRenderedIndex: number = -1;
  private lastTime: number = -1;

  constructor(isSoftwareGl: boolean) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1080;
    this.canvas.height = 1920;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.generateMipmaps = !isSoftwareGl;
    this.texture.minFilter = isSoftwareGl ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.preloadImages();
    this.renderScreen(0, 0);
  }

  private preloadImages() {
    UPLOADED_SCREENS.forEach((screen) => {
      if (!this.loadedImages.has(screen.path)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = screen.path;
        img.onload = () => {
          this.loadedImages.set(screen.path, img);
          this.texture.needsUpdate = true;
        };
      }
    });
  }

  public getScreenImage(path: string): HTMLImageElement | undefined {
    return this.loadedImages.get(path);
  }

  public update(time: number, screenIndex: number, checkoutAnimation?: CheckoutAnimationState) {
    const isCartActive = checkoutAnimation && checkoutAnimation.cartPopupProgress > 0.001;
    if (
      Math.abs(time - this.lastTime) < 0.033 &&
      screenIndex === this.lastRenderedIndex &&
      !isCartActive
    ) {
      return;
    }
    this.lastTime = time;
    this.lastRenderedIndex = screenIndex;

    this.renderScreen(screenIndex, time, checkoutAnimation);
    this.texture.needsUpdate = true;
  }

  private renderScreen(screenIndex: number, time: number, checkoutAnimation?: CheckoutAnimationState) {
    switch (screenIndex) {
      case 0:
        this.renderWelcomeScreen(time);
        break;
      case 1:
        this.renderDobScreen(time);
        break;
      case 2:
        this.renderScanIdScreen(time);
        break;
      case 3:
        this.renderCameraVerificationScreen(time);
        break;
      case 4:
        this.renderUploadedImageScreen('/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_56_PM_d13373a2.png', time);
        break;
      case 5:
        this.renderUploadedImageScreen('/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_45_PM_027e70fb.png', time);
        break;
      case 6:
        this.renderUploadedImageScreen('/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_35_PM_10c16472.png', time);
        break;
      case 7:
        this.renderUploadedImageScreen('/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_21_PM_3e5f2c30.png', time);
        break;
      case 8:
        // Render base product review screen, then smooth Cart Summary popup
        this.renderUploadedImageScreen('/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_10_PM_51ed1acd.png', time);
        break;
      case 9:
        this.renderNfcPaymentScreen(time);
        break;
      case 10:
        this.renderOrderConfirmedScreen(time);
        break;
      case 11:
      default:
        this.renderUploadedImageScreen('/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_56_PM_43d65c5f.png', time);
        break;
    }

    // Overlay the smooth Cart Summary Popup whenever active in the checkout sequence
    if (checkoutAnimation && checkoutAnimation.cartPopupProgress > 0.001) {
      this.renderCartSummaryPopup(checkoutAnimation, time);
    }
  }

  // --- SCREEN 0: WELCOME TO BARKLEY ---
  private renderWelcomeScreen(time: number) {
    const isTapped = time >= 4.8;
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    const grad = this.ctx.createLinearGradient(0, 0, 0, 520);
    grad.addColorStop(0, 'rgba(235, 228, 218, 0.7)');
    grad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, 1080, 520);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#141416';
    this.ctx.font = '600 58px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '18px';
    this.ctx.fillText('B A R K L E Y', 540, 280);

    this.ctx.fillStyle = '#78716c';
    this.ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '6px';
    this.ctx.fillText('INTELLIGENT CANNABIS RETAIL', 540, 335);

    this.ctx.strokeStyle = '#d6d3d1';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(320, 385);
    this.ctx.lineTo(760, 385);
    this.ctx.stroke();

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 86px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '1px';
    this.ctx.fillText('Welcome to', 540, 740);
    this.ctx.fillText('BARKLEY', 540, 840);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 36px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '0.5px';
    this.ctx.fillText('Cannabis thoughtfully curated for you.', 540, 920);

    // Interactive Button
    const btnY = 1140;
    const btnW = 560;
    const btnH = 136;
    const btnX = 540 - btnW / 2;
    const btnRadius = 68;

    if (isTapped) {
      this.ctx.beginPath();
      this.ctx.arc(540, btnY + btnH / 2, 160, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      this.ctx.lineWidth = 6;
      this.ctx.stroke();

      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX + 6, btnY + 4, btnW - 12, btnH - 8, btnRadius - 4);
      this.ctx.fill();

      this.ctx.strokeStyle = '#10b981';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();

      this.ctx.fillStyle = '#10b981';
      this.ctx.font = '600 40px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('GET STARTED', 540, btnY + btnH / 2 + 14);

      this.ctx.fillStyle = '#059669';
      this.ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('✓ Initializing Verification...', 540, 1340);
    } else {
      this.ctx.fillStyle = '#111317';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btnY, btnW, btnH, btnRadius);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '600 40px "Plus Jakarta Sans", sans-serif';
      this.ctx.letterSpacing = '3px';
      this.ctx.fillText('GET STARTED', 540, btnY + btnH / 2 + 14);

      this.ctx.fillStyle = '#78716c';
      this.ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Tap screen or approach to begin exploration', 540, 1340);
    }

    this.renderHardwareFooter();
  }

  // --- SCREEN 1: ENTER DATE OF BIRTH ---
  private renderDobScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '600 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('B A R K L E Y', 540, 200);

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 72px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '1px';
    this.ctx.fillText('Verify Your Age', 540, 360);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Please enter your date of birth to continue.', 540, 420);

    // DOB Input Boxes
    const dobBoxes = [
      { label: 'MM', val: time > 10 ? '08' : 'MM', x: 260, w: 140 },
      { label: 'DD', val: time > 12 ? '14' : 'DD', x: 430, w: 140 },
      { label: 'YYYY', val: time > 13.5 ? '1998' : 'YYYY', x: 600, w: 220 },
    ];

    dobBoxes.forEach((b) => {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#d6d3d1';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.roundRect(b.x, 480, b.w, 90, 14);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = b.val === b.label ? '#9ca3af' : '#111827';
      this.ctx.font = '600 38px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(b.val, b.x + b.w / 2, 540);
    });

    // Keypad (1 to 9, 0)
    const keyStartX = 340;
    const keyStartY = 640;
    const keySize = 110;
    const keyGap = 35;

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
      this.ctx.font = '600 42px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(i.toString(), kx + keySize / 2, ky + keySize / 2 + 14);
    }

    // 0 key
    const zeroX = keyStartX + 1 * (keySize + keyGap);
    const zeroY = keyStartY + 3 * (keySize + keyGap);
    this.ctx.fillStyle = '#f3f4f6';
    this.ctx.beginPath();
    this.ctx.arc(zeroX + keySize / 2, zeroY + keySize / 2, keySize / 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#111827';
    this.ctx.font = '600 42px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('0', zeroX + keySize / 2, zeroY + keySize / 2 + 14);

    // Continue CTA
    const contY = 1260;
    this.ctx.fillStyle = time > 13.5 ? '#111827' : '#9ca3af';
    this.ctx.beginPath();
    this.ctx.roundRect(320, contY, 440, 110, 55);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Continue', 540, contY + 68);

    this.renderHardwareFooter();
  }

  // --- SCREEN 2: SCAN ID CARD ---
  private renderScanIdScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '600 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('B A R K L E Y', 540, 200);

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 76px "Cinzel", Georgia, serif';
    this.ctx.fillText('Scan Your ID', 540, 360);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Insert your Government ID into the slot below and hold steady.', 540, 420);

    // Graphic of ID insertion
    const boxY = 560;
    this.ctx.fillStyle = '#f3f4f6';
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(180, boxY, 720, 580, 28);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#111827';
    this.ctx.font = '600 42px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Accepted Identification:', 540, boxY + 100);

    this.ctx.fillStyle = '#4b5563';
    this.ctx.font = '400 30px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('• Driver\'s License', 540, boxY + 165);
    this.ctx.fillText('• State ID Card', 540, boxY + 220);
    this.ctx.fillText('• US / International Passport', 540, boxY + 275);

    // Glowing ID slot guide
    const isScanning = time > 20 && time < 25;
    this.ctx.fillStyle = isScanning ? '#ecfdf5' : '#eff6ff';
    this.ctx.strokeStyle = isScanning ? '#10b981' : '#3b82f6';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(240, boxY + 360, 600, 140, 18);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = isScanning ? '#059669' : '#1d4ed8';
    this.ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(
      isScanning ? '● Reading ID Document... Verified 21+' : '↓ Insert ID face-up into illuminated scanner slot',
      540,
      boxY + 440
    );

    this.renderHardwareFooter();
  }

  // --- SCREEN 3: CAMERA VERIFICATION ---
  private renderCameraVerificationScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '600 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('B A R K L E Y', 540, 200);

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 76px "Cinzel", Georgia, serif';
    this.ctx.fillText('Look at the Camera', 540, 360);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Please look directly at the integrated upper camera.', 540, 420);

    // Video Viewfinder Box
    const viewY = 520;
    this.ctx.fillStyle = '#e5e7eb';
    this.ctx.strokeStyle = time > 30 ? '#10b981' : '#6b7280';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.roundRect(320, viewY, 440, 520, 28);
    this.ctx.fill();
    this.ctx.stroke();

    // Face Silhouette Outline
    this.ctx.strokeStyle = time > 30 ? '#059669' : '#9ca3af';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.ellipse(540, viewY + 220, 110, 140, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = time > 30 ? '#059669' : '#4b5563';
    this.ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(time > 30 ? '✓ Face Matched ID (99.8%)' : 'Aligning Facial Biometrics...', 540, viewY + 440);

    if (time > 30.5) {
      // Big Green Approved Badge
      this.ctx.fillStyle = '#ecfdf5';
      this.ctx.strokeStyle = '#10b981';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.roundRect(220, 1140, 640, 160, 24);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#047857';
      this.ctx.font = '700 44px "Cinzel", Georgia, serif';
      this.ctx.fillText('VERIFICATION APPROVED', 540, 1215);

      this.ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Welcome to BARKLEY · Unlocking Store Menu', 540, 1265);
    }

    this.renderHardwareFooter();
  }

  // --- SCREEN 9: NFC CONTACTLESS PAYMENT ---
  private renderNfcPaymentScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '600 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('B A R K L E Y', 540, 200);

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 76px "Cinzel", Georgia, serif';
    this.ctx.fillText('Payment & Checkout', 540, 360);

    // Summary Card
    const cardY = 460;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#e7e5e4';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.roundRect(160, cardY, 760, 480, 24);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#111827';
    this.ctx.font = '600 36px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Your Order Summary', 210, cardY + 80);

    this.ctx.font = '400 30px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#4b5563';
    this.ctx.fillText('• Botanical Fruit Gummies (10 pcs)', 210, cardY + 150);
    this.ctx.fillText('• Sunset Reserve Flower (3.5g)', 210, cardY + 205);
    this.ctx.fillText('• Solstice Live Resin Cart (1.0g)', 210, cardY + 260);

    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(210, cardY + 310);
    this.ctx.lineTo(870, cardY + 310);
    this.ctx.stroke();

    this.ctx.font = '600 36px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#111827';
    this.ctx.fillText('Total (USD)', 210, cardY + 375);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('$148.24', 870, cardY + 375);

    // Tap NFC Callout
    this.ctx.textAlign = 'center';
    const isPaid = time > 91;
    this.ctx.fillStyle = isPaid ? '#ecfdf5' : '#111827';
    this.ctx.strokeStyle = isPaid ? '#10b981' : '#111827';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(180, 1020, 720, 200, 28);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = isPaid ? '#047857' : '#ffffff';
    this.ctx.font = '700 42px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(isPaid ? '✓ PAYMENT APPROVED' : 'Tap Card or Phone on NFC Reader', 540, 1110);

    this.ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = isPaid ? '#065f46' : '#9ca3af';
    this.ctx.fillText(isPaid ? 'Processing transaction BK-2026-10482...' : 'Apple Pay · Google Pay · Contactless EMV', 540, 1170);

    this.renderHardwareFooter();
  }

  // --- SCREEN 10: ORDER CONFIRMED ---
  private renderOrderConfirmedScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '600 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('B A R K L E Y', 540, 240);

    // Big Green Check Circle
    this.ctx.fillStyle = '#ecfdf5';
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.arc(540, 480, 80, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#10b981';
    this.ctx.font = '700 84px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('✓', 540, 510);

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 78px "Cinzel", Georgia, serif';
    this.ctx.fillText('Thank You', 540, 660);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 34px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Your order has been recorded and sent to the counter.', 540, 730);

    // Pickup Badge Box
    const boxY = 820;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#e7e5e4';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(260, boxY, 560, 240, 24);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#78716c';
    this.ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '2px';
    this.ctx.fillText('PICKUP REFERENCE', 540, boxY + 70);

    this.ctx.fillStyle = '#111827';
    this.ctx.font = '700 76px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '4px';
    this.ctx.fillText('#2847', 540, boxY + 165);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 30px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Please proceed to the dispensary counter for pickup.', 540, 1160);
    this.ctx.fillText('Printing physical receipt below...', 540, 1220);

    this.renderHardwareFooter();
  }

  // --- RENDER ACTUAL UPLOADED HIGH-RES USER SCREENS ---
  private renderUploadedImageScreen(path: string, time: number) {
    const img = this.getScreenImage(path);

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(0, 0, 1080, 1920);

    if (img && img.complete && img.naturalWidth > 0) {
      const srcRatio = img.width / img.height;
      const destRatio = 1080 / 1920;

      // If aspect ratio is close to 9:16 portrait (e.g. within 0.15), fill display
      if (Math.abs(srcRatio - destRatio) < 0.15) {
        this.ctx.drawImage(img, 0, 0, 1080, 1920);
      } else if (srcRatio > 1.0) {
        // Landscape mockup (e.g. 1536x1024 desktop/tablet design)
        // Fit width cleanly without cutting off navigation or buttons, centered with luxury header
        const dw = 1080;
        const dh = 1080 / srcRatio;
        const dy = (1920 - dh) / 2;

        // Elegant background gradient
        const bgGrad = this.ctx.createLinearGradient(0, 0, 0, 1920);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#ffffff');
        bgGrad.addColorStop(1, '#f1f5f9');
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, 1080, 1920);

        // Header brand bar
        this.ctx.fillStyle = '#0f172a';
        this.ctx.font = '700 36px "Cinzel", Georgia, serif';
        this.ctx.textAlign = 'center';
        this.ctx.letterSpacing = '8px';
        this.ctx.fillText('BARKLEY', 540, 120);

        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
        this.ctx.letterSpacing = '3px';
        this.ctx.fillText('ATELIER TOUCHSCREEN EXPERIENCE', 540, 160);

        // Render complete uncropped image with clean drop shadow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetY = 10;
        this.ctx.drawImage(img, 0, dy, dw, dh);
        this.ctx.restore();

        this.renderHardwareFooter();
      } else {
        // Vertical or 2:3 / 3:4 portrait design (e.g. 1024x1536)
        // Fit proportionally without cutting off critical top/bottom checkout bars
        const scale = Math.min(1080 / img.width, 1800 / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (1080 - dw) / 2;
        const dy = 50 + (1750 - dh) / 2;

        this.ctx.drawImage(img, dx, dy, dw, dh);
        this.renderHardwareFooter();
      }
    } else {
      // Fallback while image completes loading
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#1c1917';
      this.ctx.font = '600 58px "Cinzel", Georgia, serif';
      this.ctx.fillText('BARKLEY ATELIER', 540, 480);
      this.ctx.fillStyle = '#78716c';
      this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Loading ultra-high-resolution interface...', 540, 560);
    }
  }

  private renderHardwareFooter() {
    const footY = 1720;
    this.ctx.strokeStyle = '#e7e5e4';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(180, footY - 40);
    this.ctx.lineTo(900, footY - 40);
    this.ctx.stroke();

    this.ctx.fillStyle = '#a8a29e';
    this.ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('ID SCANNER', 280, footY + 45);
    this.ctx.fillText('CONTACTLESS PAY', 540, footY + 45);
    this.ctx.fillText('DIGITAL RECEIPT', 800, footY + 45);
  }

  // --- SMOOTH CART SUMMARY POPUP DRAWER ---
  private renderCartSummaryPopup(state: CheckoutAnimationState, time: number) {
    const p = Math.max(0, Math.min(1, state.cartPopupProgress));
    // Spring ease curve with slight overshoot settling
    const easedP = 1 - Math.exp(-6.0 * p) * Math.cos(2.4 * p);

    // 1. Dimmed translucent backdrop overlay
    this.ctx.fillStyle = `rgba(10, 12, 16, ${0.72 * Math.min(1, p * 1.25)})`;
    this.ctx.fillRect(0, 0, 1080, 1920);

    // 2. Sliding Cart Card Sheet
    const cardW = 960;
    const cardH = 1200;
    const cardX = (1080 - cardW) / 2; // 60px
    // Slides up from offscreen bottom: at easedP=0, y=1920; at easedP=1, y=560
    const cardY = 1920 - (1920 - 560) * easedP;

    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 40;
    this.ctx.shadowOffsetY = -10;

    // Card background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.roundRect(cardX, cardY, cardW, cardH, [40, 40, 0, 0]);
    this.ctx.fill();
    this.ctx.restore();

    // Top grabber handle
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.beginPath();
    this.ctx.roundRect(540 - 50, cardY + 22, 100, 8, 4);
    this.ctx.fill();

    // Header section
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = '700 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '1px';
    this.ctx.fillText('Cart Summary', cardX + 50, cardY + 100);

    // Verified badge
    const badgeW = 230;
    const badgeH = 46;
    const badgeX = cardX + cardW - 50 - badgeW;
    const badgeY = cardY + 65;
    this.ctx.fillStyle = '#ecfdf5';
    this.ctx.beginPath();
    this.ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 23);
    this.ctx.fill();
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#047857';
    this.ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('3 ITEMS · VERIFIED 21+', badgeX + badgeW / 2, badgeY + 29);

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Review your curated selections before contactless checkout', cardX + 50, cardY + 144);

    // Divider
    this.ctx.strokeStyle = '#f1f5f9';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cardX + 45, cardY + 172);
    this.ctx.lineTo(cardX + cardW - 45, cardY + 172);
    this.ctx.stroke();

    // Line items list
    const items = [
      {
        name: 'Botanical Fruit Gummies (10 pcs)',
        sub: '5mg THC | 5mg CBD per serving · Edibles',
        price: '$24.00',
        qty: '1',
        tag: 'Gummies',
        tagBg: '#fef3c7',
        tagColor: '#b45309',
      },
      {
        name: 'Sunset Reserve Flower (3.5g)',
        sub: '28.5% THC · Premium Terpene Sativa Hybrid',
        price: '$45.00',
        qty: '1',
        tag: 'Flower',
        tagBg: '#ecfdf5',
        tagColor: '#047857',
      },
      {
        name: 'Solstice Live Resin Cart (1.0g)',
        sub: '84.2% THC · Solventless Live Rosin Vape',
        price: '$69.24',
        qty: '1',
        tag: 'Vapes',
        tagBg: '#ede9fe',
        tagColor: '#6d28d9',
      },
    ];

    let rowY = cardY + 205;
    items.forEach((item, idx) => {
      // Row container
      this.ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
      this.ctx.beginPath();
      this.ctx.roundRect(cardX + 45, rowY, cardW - 90, 126, 18);
      this.ctx.fill();

      // Category Pill
      this.ctx.fillStyle = item.tagBg;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX + 65, rowY + 24, 100, 36, 18);
      this.ctx.fill();
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = item.tagColor;
      this.ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.tag, cardX + 115, rowY + 48);

      // Title & Subtitle
      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = '#0f172a';
      this.ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.name, cardX + 185, rowY + 50);

      this.ctx.fillStyle = '#64748b';
      this.ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.sub, cardX + 185, rowY + 92);

      // Quantity Pill
      const qtyX = cardX + cardW - 240;
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.beginPath();
      this.ctx.roundRect(qtyX, rowY + 42, 75, 42, 21);
      this.ctx.fill();
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#334155';
      this.ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(`× ${item.qty}`, qtyX + 37.5, rowY + 70);

      // Price
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#0f172a';
      this.ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.price, cardX + cardW - 65, rowY + 70);

      rowY += 142;
    });

    // Totals card
    const totalBoxY = rowY + 15;
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(cardX + 45, totalBoxY, cardW - 90, 160, 20);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Subtotal (3 items)', cardX + 75, totalBoxY + 48);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('$138.24', cardX + cardW - 75, totalBoxY + 48);

    this.ctx.textAlign = 'left';
    this.ctx.fillText('Excise & Local Cannabis Tax', cardX + 75, totalBoxY + 88);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('$10.00', cardX + cardW - 75, totalBoxY + 88);

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Total', cardX + 75, totalBoxY + 132);
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#059669';
    this.ctx.font = '800 40px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('$148.24', cardX + cardW - 75, totalBoxY + 132);

    // Proceed to Payment Action Button
    const btnY = totalBoxY + 185;
    const btnW = cardW - 90;
    const btnH = 100;
    const btnX = cardX + 45;
    const isProceed = state.isProceedTapped;

    this.ctx.save();
    if (isProceed) {
      this.ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      this.ctx.shadowBlur = 28;
      this.ctx.fillStyle = '#059669';
    } else {
      this.ctx.shadowColor = 'rgba(15, 23, 42, 0.3)';
      this.ctx.shadowBlur = 20;
      this.ctx.fillStyle = '#0f172a';
    }
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnW, btnH, 50);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '2px';
    if (isProceed) {
      this.ctx.fillText('✓ CHECKOUT INITIATED · TAP CARD BELOW', 540, btnY + 60);
    } else {
      this.ctx.fillText('PROCEED TO PAYMENT  →  $148.24', 540, btnY + 60);
    }

    // Ripple effect on touch
    if (state.ripple && state.ripple.progress < 1.0) {
      const rp = state.ripple.progress;
      this.ctx.beginPath();
      this.ctx.arc(state.ripple.x, state.ripple.y, rp * 240, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(16, 185, 129, ${1 - rp})`;
      this.ctx.lineWidth = 6 * (1 - rp);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(state.ripple.x, state.ripple.y, rp * 120, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(16, 185, 129, ${0.4 * (1 - rp)})`;
      this.ctx.fill();
    }
  }

  public dispose() {
    this.texture.dispose();
  }
}
