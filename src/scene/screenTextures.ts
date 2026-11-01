/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CheckoutAnimationState } from './types';

export interface ScreenImageInfo {
  title: string;
  category: string;
  path: string;
  timecode: string;
}

export const UPLOADED_SCREENS: ScreenImageInfo[] = [
  {
    title: '01. Welcome to BARKLEY',
    category: 'Welcome & Attract Mode',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
    timecode: '0:00–0:20',
  },
  {
    title: '02. Verify Your Age (DOB)',
    category: 'Automated Age Gate',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
    timecode: '0:20–0:45',
  },
  {
    title: '03. ID Scanner & Camera Match',
    category: 'Biometric Verification',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
    timecode: '0:45–1:05',
  },
  {
    title: '04. The Atelier — Product Catalog',
    category: 'Curated Dispensary Menu',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_56_PM_d13373a2.png',
    timecode: '1:05–1:35',
  },
  {
    title: '05. Product Details & Advisory',
    category: 'Potency & Onset Disclosure',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_35_PM_10c16472.png',
    timecode: '1:35–2:05',
  },
  {
    title: '06. Cart Summary & NFC Payment',
    category: 'One-Tap Simulated Approval',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_10_PM_51ed1acd.png',
    timecode: '2:05–2:35',
  },
  {
    title: '07. Order Confirmed (#2847)',
    category: 'Dispensary Pickup Reference',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
    timecode: '2:35–2:50',
  },
  {
    title: '08. Handoff & Closing',
    category: 'Receipt & Brandmark',
    path: '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_56_PM_43d65c5f.png',
    timecode: '2:50–3:00',
  },
];

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
    const paths = [
      '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_05_PM_269d2e68.png',
      '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_51_56_PM_43d65c5f.png',
      '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_10_PM_51ed1acd.png',
      '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_21_PM_3e5f2c30.png',
      '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_35_PM_10c16472.png',
      '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_45_PM_027e70fb.png',
      '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_56_PM_d13373a2.png',
    ];

    paths.forEach((p) => {
      if (!this.loadedImages.has(p)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = p;
        img.onload = () => {
          this.loadedImages.set(p, img);
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
    // Keep 30fps refresh during animated timelines or cart popup
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

  private renderScreen(
    screenIndex: number,
    time: number,
    checkoutAnimation?: CheckoutAnimationState
  ) {
    switch (screenIndex) {
      case 0:
        // 0:00–0:20: Cinematic reveal & welcome attract mode
        this.renderWelcomeScreen(time);
        break;
      case 1:
        // 0:20–0:45: Automated DOB age verification
        this.renderDobScreen(time);
        break;
      case 2:
        // 0:45–1:05: ID scanner and camera verification
        this.renderScanIdAndCameraScreen(time);
        break;
      case 3:
        // 1:05–1:35: The Atelier product catalog unlocks & navigation
        if (time < 80.0) {
          this.renderUploadedImageScreen(
            '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_56_PM_d13373a2.png',
            'THE ATELIER · CURATED COLLECTION'
          );
        } else {
          this.renderUploadedImageScreen(
            '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_45_PM_027e70fb.png',
            'EDIBLES & BOTANICAL GUMMIES'
          );
        }
        break;
      case 4:
        // 1:35–2:05: Botanical Fruit Gummies details & dosage advisory
        if (time < 110.0) {
          this.renderUploadedImageScreen(
            '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_35_PM_10c16472.png',
            'CITRUS GROVE GUMMIES · 5MG THC / 5MG CBD'
          );
        } else {
          this.renderUploadedImageScreen(
            '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_21_PM_3e5f2c30.png',
            'MANDATORY COMPLIANCE ADVISORY'
          );
          this.renderAdvisoryAcknowledgmentOverlay(time);
        }
        break;
      case 5:
        // 2:05–2:35: Add to cart & simulated one-tap NFC payment
        if (time < 142.0) {
          this.renderUploadedImageScreen(
            '/assets/aistudio/ChatGPT_Image_Oct_29__2026__05_52_10_PM_51ed1acd.png',
            'SHOPPING BAG · REVIEW ITEMS'
          );
        } else {
          this.renderNfcPaymentScreen(time);
        }
        break;
      case 6:
        // 2:35–2:50: Order confirmed & receipt
        this.renderOrderConfirmedScreen(time);
        break;
      case 7:
      default:
        // 2:50–3:00: Closing shot & pickup directive
        this.renderClosingScreen(time);
        break;
    }

    // Render smooth animated Cart Summary drawer whenever active
    if (checkoutAnimation && checkoutAnimation.cartPopupProgress > 0.001) {
      this.renderCartSummaryPopup(checkoutAnimation, time);
    }
  }

  // --- STAGE 0 (0:00–0:20): WELCOME ATTRACT SCREEN ---
  private renderWelcomeScreen(time: number) {
    const isActivating = time >= 16.0;
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    const grad = this.ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, 'rgba(235, 228, 218, 0.8)');
    grad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, 1080, 600);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#141416';
    this.ctx.font = '700 64px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '18px';
    this.ctx.fillText('B A R K L E Y', 540, 280);

    this.ctx.fillStyle = '#78716c';
    this.ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '6px';
    this.ctx.fillText('INTELLIGENT CANNABIS RETAIL', 540, 335);

    this.ctx.strokeStyle = '#d6d3d1';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(300, 385);
    this.ctx.lineTo(780, 385);
    this.ctx.stroke();

    // Subtle pulsing halo
    const halo = 0.5 + Math.sin(time * 2.0) * 0.5;
    const radial = this.ctx.createRadialGradient(540, 800, 40, 540, 800, 420);
    radial.addColorStop(0, `rgba(16, 185, 129, ${0.12 * halo})`);
    radial.addColorStop(1, 'rgba(250, 248, 245, 0)');
    this.ctx.fillStyle = radial;
    this.ctx.fillRect(0, 400, 1080, 800);

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 88px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '1px';
    this.ctx.fillText('Welcome to', 540, 740);
    this.ctx.fillText('BARKLEY', 540, 840);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 36px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '0.5px';
    this.ctx.fillText('Curated craft cannabis, verified compliance.', 540, 920);

    // Dynamic Get Started Button
    const btnY = 1140;
    const btnW = 580;
    const btnH = 136;
    const btnX = 540 - btnW / 2;
    const btnRadius = 68;

    if (isActivating) {
      this.ctx.save();
      this.ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      this.ctx.shadowBlur = 35;
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btnY, btnW, btnH, btnRadius);
      this.ctx.fill();
      this.ctx.restore();

      this.ctx.strokeStyle = '#10b981';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();

      this.ctx.fillStyle = '#10b981';
      this.ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
      this.ctx.letterSpacing = '3px';
      this.ctx.fillText('INITIALIZING SYSTEM...', 540, btnY + btnH / 2 + 14);

      this.ctx.fillStyle = '#059669';
      this.ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('✓ Advancing to 21+ Age Gate', 540, 1340);
    } else {
      this.ctx.fillStyle = '#111317';
      this.ctx.beginPath();
      this.ctx.roundRect(btnX, btnY, btnW, btnH, btnRadius);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
      this.ctx.letterSpacing = '3px';
      this.ctx.fillText('GET STARTED', 540, btnY + btnH / 2 + 14);

      this.ctx.fillStyle = '#78716c';
      this.ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Touchscreen active · 27" Portrait POS', 540, 1340);
    }

    this.renderHardwareFooter();
  }

  // --- STAGE 1 (0:20–0:45): AUTOMATED AGE VERIFICATION (DOB) ---
  private renderDobScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '700 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('B A R K L E Y', 540, 200);

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 76px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '1px';
    this.ctx.fillText('Verify Your Age', 540, 360);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Please enter your date of birth to continue.', 540, 420);

    // Timed automated entry:
    // 20–27s: empty
    // 28s: "08" (Month)
    // 33s: "14" (Day)
    // 38s: "1998" (Year)
    // 42s: Confirmed!
    const isMonthTyped = time >= 28.0;
    const isDayTyped = time >= 33.0;
    const isYearTyped = time >= 38.0;
    const isVerified = time >= 42.0;

    const dobBoxes = [
      { label: 'MM', val: isMonthTyped ? '08' : 'MM', isFilled: isMonthTyped, x: 250, w: 150 },
      { label: 'DD', val: isDayTyped ? '14' : 'DD', isFilled: isDayTyped, x: 430, w: 150 },
      { label: 'YYYY', val: isYearTyped ? '1998' : 'YYYY', isFilled: isYearTyped, x: 610, w: 220 },
    ];

    dobBoxes.forEach((b) => {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = b.isFilled ? '#10b981' : '#d6d3d1';
      this.ctx.lineWidth = b.isFilled ? 3 : 2;
      this.ctx.beginPath();
      this.ctx.roundRect(b.x, 480, b.w, 90, 14);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = b.isFilled ? '#111827' : '#9ca3af';
      this.ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(b.val, b.x + b.w / 2, 542);
    });

    // Keypad layout
    const keyStartX = 340;
    const keyStartY = 640;
    const keySize = 110;
    const keyGap = 35;

    // Highlight key that was just typed
    let activeKey = -1;
    if (time >= 28.0 && time < 29.0) activeKey = 8;
    else if (time >= 33.0 && time < 34.0) activeKey = 4;
    else if (time >= 38.0 && time < 39.0) activeKey = 9;

    for (let i = 1; i <= 9; i++) {
      const col = (i - 1) % 3;
      const row = Math.floor((i - 1) / 3);
      const kx = keyStartX + col * (keySize + keyGap);
      const ky = keyStartY + row * (keySize + keyGap);
      const isLit = activeKey === i;

      this.ctx.fillStyle = isLit ? '#10b981' : '#f3f4f6';
      this.ctx.beginPath();
      this.ctx.arc(kx + keySize / 2, ky + keySize / 2, keySize / 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = isLit ? '#ffffff' : '#111827';
      this.ctx.font = '700 42px "Plus Jakarta Sans", sans-serif';
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
    this.ctx.font = '700 42px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('0', zeroX + keySize / 2, zeroY + keySize / 2 + 14);

    // Continue CTA
    const contY = 1260;
    this.ctx.save();
    if (isVerified) {
      this.ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      this.ctx.shadowBlur = 30;
      this.ctx.fillStyle = '#059669';
    } else if (isYearTyped) {
      this.ctx.fillStyle = '#111827';
    } else {
      this.ctx.fillStyle = '#9ca3af';
    }
    this.ctx.beginPath();
    this.ctx.roundRect(300, contY, 480, 110, 55);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(isVerified ? '✓ AGE VERIFIED (21+)' : 'Continue', 540, contY + 68);

    this.renderHardwareFooter();
  }

  // --- STAGE 2 (0:45–1:05): ID SCANNER & UPPER CAMERA BIOMETRICS ---
  private renderScanIdAndCameraScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '700 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('B A R K L E Y', 540, 200);

    const isCameraPhase = time >= 55.0;
    const isApproved = time >= 59.0;

    if (!isCameraPhase) {
      // 45s to 55s: Optical ID Scanner Focus
      this.ctx.fillStyle = '#1c1917';
      this.ctx.font = '600 76px "Cinzel", Georgia, serif';
      this.ctx.fillText('Scan Your ID', 540, 360);

      this.ctx.fillStyle = '#57534e';
      this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Insert your Government ID into the slot below and hold steady.', 540, 420);

      const boxY = 540;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#e5e7eb';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.roundRect(160, boxY, 760, 600, 28);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#111827';
      this.ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Accepted Identification', 540, boxY + 90);

      this.ctx.fillStyle = '#4b5563';
      this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('• Driver\'s License', 540, boxY + 160);
      this.ctx.fillText('• State ID Card', 540, boxY + 215);
      this.ctx.fillText('• US / International Passport', 540, boxY + 270);

      // Scanning indicator bar
      const isLaserActive = time >= 48.0;
      this.ctx.fillStyle = isLaserActive ? '#ecfdf5' : '#eff6ff';
      this.ctx.strokeStyle = isLaserActive ? '#10b981' : '#3b82f6';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.roundRect(220, boxY + 360, 640, 160, 20);
      this.ctx.fill();
      this.ctx.stroke();

      // Animated green scanning beam
      if (isLaserActive) {
        const laserProgress = (time - 48.0) % 2.0;
        const beamX = 240 + laserProgress * 300;
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(beamX, boxY + 380);
        this.ctx.lineTo(beamX, boxY + 500);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = isLaserActive ? '#059669' : '#1d4ed8';
      this.ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(
        isLaserActive
          ? '● Reading ID Barcode & Hologram... Verified'
          : '↓ Insert ID face-up into illuminated scanner slot',
        540,
        boxY + 450
      );
    } else {
      // 55s to 65s: Upper Camera Biometric Match
      this.ctx.fillStyle = '#1c1917';
      this.ctx.font = '600 76px "Cinzel", Georgia, serif';
      this.ctx.fillText('Look at the Camera', 540, 360);

      this.ctx.fillStyle = '#57534e';
      this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText('Please look directly at the integrated upper camera lens.', 540, 420);

      // Viewfinder
      const viewY = 520;
      this.ctx.fillStyle = '#111827';
      this.ctx.strokeStyle = isApproved ? '#10b981' : '#3b82f6';
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.roundRect(310, viewY, 460, 540, 28);
      this.ctx.fill();
      this.ctx.stroke();

      // Facial alignment reticle
      this.ctx.strokeStyle = isApproved ? '#10b981' : 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.ellipse(540, viewY + 230, 120, 150, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      // Status text
      this.ctx.fillStyle = isApproved ? '#10b981' : '#94a3b8';
      this.ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(
        isApproved ? '✓ Biometric Match Confirmed (99.8%)' : 'Aligning Facial Biometrics...',
        540,
        viewY + 460
      );

      // Approval Card
      if (isApproved) {
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
        this.ctx.shadowBlur = 30;
        this.ctx.fillStyle = '#ecfdf5';
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(200, 1160, 680, 160, 24);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();

        this.ctx.fillStyle = '#047857';
        this.ctx.font = '700 46px "Cinzel", Georgia, serif';
        this.ctx.fillText('VERIFICATION APPROVED', 540, 1235);

        this.ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
        this.ctx.fillText('Welcome to BARKLEY · Unlocking Store Menu', 540, 1285);
      }
    }

    this.renderHardwareFooter();
  }

  // --- STAGE 4 (1:35–2:05) COMPLIANCE ADVISORY OVERLAY ---
  private renderAdvisoryAcknowledgmentOverlay(time: number) {
    const isAcknowledged = time >= 118.0;
    // Interactive acknowledgment banner at bottom
    const boxY = 1420;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 25;
    this.ctx.beginPath();
    this.ctx.roundRect(100, boxY, 880, 220, 24);
    this.ctx.fill();
    this.ctx.restore();

    // Checkbox
    const cbX = 140;
    const cbY = boxY + 40;
    this.ctx.fillStyle = isAcknowledged ? '#10b981' : '#ffffff';
    this.ctx.strokeStyle = isAcknowledged ? '#10b981' : '#94a3b8';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(cbX, cbY, 44, 44, 8);
    this.ctx.fill();
    this.ctx.stroke();

    if (isAcknowledged) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('✓', cbX + 22, cbY + 34);
    }

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Mandatory Cannabinoid & Onset Acknowledgment', 210, boxY + 70);

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('I understand edible effects may take 30m–2h to appear.', 210, boxY + 110);

    // Continue CTA
    const btnW = 800;
    const btnH = 64;
    this.ctx.fillStyle = isAcknowledged ? '#059669' : '#334155';
    this.ctx.beginPath();
    this.ctx.roundRect(140, boxY + 135, btnW, btnH, 32);
    this.ctx.fill();

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(
      isAcknowledged ? '✓ ACKNOWLEDGED · ADDING TO BAG' : 'Tap to Acknowledge & Add to Bag',
      540,
      boxY + 175
    );
  }

  // --- STAGE 5 (2:05–2:35): CONTACTLESS PAYMENT ---
  private renderNfcPaymentScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '700 52px "Cinzel", Georgia, serif';
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
    this.ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
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

    this.ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = '#111827';
    this.ctx.fillText('Total (USD)', 210, cardY + 380);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('$148.24', 870, cardY + 380);

    // Simulated one-tap payment approval
    const isPaid = time >= 147.0;
    this.ctx.textAlign = 'center';
    this.ctx.save();
    if (isPaid) {
      this.ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
      this.ctx.shadowBlur = 30;
      this.ctx.fillStyle = '#ecfdf5';
      this.ctx.strokeStyle = '#10b981';
    } else {
      this.ctx.fillStyle = '#111827';
      this.ctx.strokeStyle = '#111827';
    }
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(180, 1020, 720, 220, 28);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.fillStyle = isPaid ? '#047857' : '#ffffff';
    this.ctx.font = '700 42px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText(
      isPaid ? '✓ PAYMENT APPROVED' : 'Tap Card or Phone on NFC Reader',
      540,
      1115
    );

    this.ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillStyle = isPaid ? '#065f46' : '#9ca3af';
    this.ctx.fillText(
      isPaid ? 'One-Tap EMV Complete · Order #2847 Confirmed' : 'Apple Pay · Google Pay · Contactless EMV',
      540,
      1175
    );

    this.renderHardwareFooter();
  }

  // --- STAGE 6 (2:35–2:50): ORDER CONFIRMED (#2847) ---
  private renderOrderConfirmedScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#111317';
    this.ctx.font = '700 52px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '14px';
    this.ctx.fillText('B A R K L E Y', 540, 240);

    // Big Green Check Circle
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
    this.ctx.shadowBlur = 30;
    this.ctx.fillStyle = '#ecfdf5';
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.arc(540, 480, 80, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.fillStyle = '#10b981';
    this.ctx.font = '700 84px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('✓', 540, 510);

    this.ctx.fillStyle = '#1c1917';
    this.ctx.font = '600 78px "Cinzel", Georgia, serif';
    this.ctx.fillText('Thank You', 540, 660);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 34px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Your order has been placed and sent to the counter.', 540, 730);

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
    this.ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '2px';
    this.ctx.fillText('PICKUP REFERENCE', 540, boxY + 70);

    this.ctx.fillStyle = '#111827';
    this.ctx.font = '700 76px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '4px';
    this.ctx.fillText('#2847', 540, boxY + 165);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('Please proceed to the dispensary counter for pickup.', 540, 1160);

    // Thermal receipt printer status
    this.ctx.fillStyle = '#059669';
    this.ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    this.ctx.fillText('↓ Printing physical itemized receipt below...', 540, 1220);

    this.renderHardwareFooter();
  }

  // --- STAGE 7 (2:50–3:00): CLOSING BRANDMARK ---
  private renderClosingScreen(time: number) {
    this.ctx.fillStyle = '#faf8f5';
    this.ctx.fillRect(0, 0, 1080, 1920);

    const grad = this.ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, 'rgba(235, 228, 218, 0.7)');
    grad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, 1080, 800);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#141416';
    this.ctx.font = '700 80px "Cinzel", Georgia, serif';
    this.ctx.letterSpacing = '22px';
    this.ctx.fillText('B A R K L E Y', 540, 860);

    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(320, 910);
    this.ctx.lineTo(760, 910);
    this.ctx.stroke();

    this.ctx.fillStyle = '#78716c';
    this.ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '6px';
    this.ctx.fillText('INTELLIGENT CANNABIS RETAIL', 540, 970);

    this.ctx.fillStyle = '#059669';
    this.ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '2px';
    this.ctx.fillText('ORDER #2847 READY FOR HANDOFF', 540, 1060);

    this.ctx.fillStyle = '#57534e';
    this.ctx.font = '400 26px "Plus Jakarta Sans", sans-serif';
    this.ctx.letterSpacing = '1px';
    this.ctx.fillText('Thank you for visiting BARKLEY Atelier', 540, 1120);

    this.renderHardwareFooter();
  }

  // --- UNRUNCATED HIGH-RES USER SCREENS ---
  private renderUploadedImageScreen(path: string, label: string) {
    const img = this.getScreenImage(path);

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(0, 0, 1080, 1920);

    if (img && img.complete && img.naturalWidth > 0) {
      const srcRatio = img.width / img.height;
      const destRatio = 1080 / 1920;

      if (Math.abs(srcRatio - destRatio) < 0.15) {
        this.ctx.drawImage(img, 0, 0, 1080, 1920);
      } else if (srcRatio > 1.0) {
        // Landscape mockup: fit width without horizontal crop
        const dw = 1080;
        const dh = 1080 / srcRatio;
        const dy = (1920 - dh) / 2;

        const bgGrad = this.ctx.createLinearGradient(0, 0, 0, 1920);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#ffffff');
        bgGrad.addColorStop(1, '#f1f5f9');
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, 1080, 1920);

        // Header bar
        this.ctx.fillStyle = '#0f172a';
        this.ctx.font = '700 36px "Cinzel", Georgia, serif';
        this.ctx.textAlign = 'center';
        this.ctx.letterSpacing = '8px';
        this.ctx.fillText('BARKLEY', 540, 120);

        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
        this.ctx.letterSpacing = '3px';
        this.ctx.fillText(label, 540, 165);

        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetY = 10;
        this.ctx.drawImage(img, 0, dy, dw, dh);
        this.ctx.restore();

        this.renderHardwareFooter();
      } else {
        // Vertical or portrait design
        const scale = Math.min(1080 / img.width, 1800 / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (1080 - dw) / 2;
        const dy = 50 + (1750 - dh) / 2;

        this.ctx.drawImage(img, dx, dy, dw, dh);
        this.renderHardwareFooter();
      }
    } else {
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#1c1917';
      this.ctx.font = '700 58px "Cinzel", Georgia, serif';
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
    this.ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('ID SCANNER', 280, footY + 45);
    this.ctx.fillText('CONTACTLESS PAY', 540, footY + 45);
    this.ctx.fillText('DIGITAL RECEIPT', 800, footY + 45);
  }

  // --- SMOOTH CART SUMMARY POPUP DRAWER ---
  private renderCartSummaryPopup(state: CheckoutAnimationState, time: number) {
    const p = Math.max(0, Math.min(1, state.cartPopupProgress));
    const easedP = 1 - Math.exp(-6.0 * p) * Math.cos(2.4 * p);

    // No dark modal screen overlay blocking the monitor screen!
    const cardW = 960;
    const cardH = 1200;
    const cardX = (1080 - cardW) / 2;
    const cardY = 1920 - (1920 - 560) * easedP;

    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 40;
    this.ctx.shadowOffsetY = -10;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.roundRect(cardX, cardY, cardW, cardH, [40, 40, 0, 0]);
    this.ctx.fill();
    this.ctx.restore();

    // Top grabber
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.beginPath();
    this.ctx.roundRect(540 - 50, cardY + 22, 100, 8, 4);
    this.ctx.fill();

    // Header
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
    this.ctx.fillText(
      'Review your curated selections before contactless checkout',
      cardX + 50,
      cardY + 144
    );

    this.ctx.strokeStyle = '#f1f5f9';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cardX + 45, cardY + 172);
    this.ctx.lineTo(cardX + cardW - 45, cardY + 172);
    this.ctx.stroke();

    // Items
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
      this.ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
      this.ctx.beginPath();
      this.ctx.roundRect(cardX + 45, rowY, cardW - 90, 126, 18);
      this.ctx.fill();

      this.ctx.fillStyle = item.tagBg;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX + 65, rowY + 24, 100, 36, 18);
      this.ctx.fill();
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = item.tagColor;
      this.ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.tag, cardX + 115, rowY + 48);

      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = '#0f172a';
      this.ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.name, cardX + 185, rowY + 50);

      this.ctx.fillStyle = '#64748b';
      this.ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(item.sub, cardX + 185, rowY + 92);

      const qtyX = cardX + cardW - 240;
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.beginPath();
      this.ctx.roundRect(qtyX, rowY + 42, 75, 42, 21);
      this.ctx.fill();
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#334155';
      this.ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      this.ctx.fillText(`× ${item.qty}`, qtyX + 37.5, rowY + 70);

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

    // Proceed Button
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
      this.ctx.fillText('✓ CHECKOUT INITIATED · ADVANCING TO NFC', 540, btnY + 60);
    } else {
      this.ctx.fillText('PROCEED TO PAYMENT  →  $148.24', 540, btnY + 60);
    }
  }

  public dispose() {
    this.texture.dispose();
  }
}
