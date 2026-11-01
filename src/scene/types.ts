/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CameraMode = 'cinematic' | 'screen_focus' | 'hardware_focus' | 'free';

export interface WorkflowStep {
  id: string;
  number: string;
  name: string;
  startTime: number;
  endTime: number;
  screenIndex: number;
  timecode: string;
  description: string;
  actionText: string;
  cameraFocus: 'overview' | 'screen' | 'scanner' | 'camera' | 'nfc' | 'printer' | 'cinematic';
}

export interface CheckoutAnimationState {
  cartPopupProgress: number; // 0.0 to 1.0 (smooth popup animation)
  isProceedTapped: boolean;
  activeItemCount: number;
  totalAmount: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: '01_reveal',
    number: '01',
    name: 'Cinematic Reveal',
    startTime: 0,
    endTime: 20,
    screenIndex: 0,
    timecode: '0:00–0:20',
    description: 'Cinematic architectural reveal of the BARKLEY kiosk centerpiece and 27" display.',
    actionText: 'Atmospheric dispensary orbit · Kiosk powers up',
    cameraFocus: 'overview',
  },
  {
    id: '02_age_verification',
    number: '02',
    name: 'Age Verification',
    startTime: 20,
    endTime: 45,
    screenIndex: 1,
    timecode: '0:20–0:45',
    description: 'Screen activation and automated date of birth verification on the 27" portrait touchscreen.',
    actionText: 'Customer POV · Automated DOB compliance entry',
    cameraFocus: 'screen',
  },
  {
    id: '03_id_camera',
    number: '03',
    name: 'ID & Face Match',
    startTime: 45,
    endTime: 65,
    screenIndex: 2,
    timecode: '0:45–1:05',
    description: 'Camera zooms to optical ID scanner slot, then tilts up to upper camera for biometric verification.',
    actionText: 'Macro hardware glide · ID scan & biometric approval',
    cameraFocus: 'scanner',
  },
  {
    id: '04_catalog_unlock',
    number: '04',
    name: 'Product Catalog',
    startTime: 65,
    endTime: 95,
    screenIndex: 3,
    timecode: '1:05–1:35',
    description: 'The Atelier curated cannabis catalog unlocks with live category browsing across flowers, vapes, and edibles.',
    actionText: 'Curated menu unlocks · Interactive browsing',
    cameraFocus: 'screen',
  },
  {
    id: '05_product_details',
    number: '05',
    name: 'Details & Advisory',
    startTime: 95,
    endTime: 125,
    screenIndex: 4,
    timecode: '1:35–2:05',
    description: 'Product deep-dive into Botanical Fruit Gummies, THC/CBD potency disclosure, and mandatory onset advisory.',
    actionText: 'Potency disclosure · Mandatory safety acknowledgment',
    cameraFocus: 'screen',
  },
  {
    id: '06_cart_payment',
    number: '06',
    name: 'Cart & Payment',
    startTime: 125,
    endTime: 155,
    screenIndex: 5,
    timecode: '2:05–2:35',
    description: 'Cart Summary drawer pops up smoothly ($148.24), followed by simulated one-tap NFC payment approval.',
    actionText: 'Cart summary popup · One-tap contactless approval',
    cameraFocus: 'nfc',
  },
  {
    id: '07_order_confirmed',
    number: '07',
    name: 'Order Confirmation',
    startTime: 155,
    endTime: 170,
    screenIndex: 6,
    timecode: '2:35–2:50',
    description: 'Order #2847 confirmed on screen and physical thermal receipt dispenses from kiosk mouth.',
    actionText: 'Order #2847 generated · Thermal receipt dispenses',
    cameraFocus: 'printer',
  },
  {
    id: '08_pickup_closing',
    number: '08',
    name: 'Pickup & Closing',
    startTime: 170,
    endTime: 180,
    screenIndex: 7,
    timecode: '2:50–3:00',
    description: 'Dispensary counter pickup instructions and majestic wide showroom pull-back closing shot.',
    actionText: 'Counter handoff directive · BARKLEY closing orbit',
    cameraFocus: 'overview',
  },
];

export const TOTAL_DURATION = 180.0; // 3-minute presentation film (180 seconds)
export const FPS = 30;
export const TOTAL_FRAMES = TOTAL_DURATION * FPS; // 5,400 frames
