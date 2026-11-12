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
    name: 'Entrance & Wall POS',
    startTime: 0,
    endTime: 20,
    screenIndex: 0,
    timecode: '0:00–0:20',
    description: 'Enter the 500 sq ft boutique dispensary through the front door; the Barley POS is mounted directly on the wall.',
    actionText: 'Storefront doorway glide · Wall POS powers on',
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
    description: 'The Atelier curated cannabis catalog unlocks. Browse products freely with clear sightlines to the screen.',
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
    description: 'Cart Summary drawer pops up smoothly ($148.24), followed by PayPal Sandbox and one-tap payment approval.',
    actionText: 'PayPal Sandbox simulation · Contactless approval',
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
    description: 'Order #2847 confirmed on screen; camera glances toward the isolated budtender pickup counter in distance.',
    actionText: 'Order #2847 generated · Pickup counter sightline',
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
    description: 'Cinematic wide pull-back of the 500 sq ft dispensary showing entrance POS, browse floor, and isolated checkout.',
    actionText: 'Counter handoff directive · 500 sq ft boutique wide shot',
    cameraFocus: 'overview',
  },
];

export const TOTAL_DURATION = 180.0; // 3-minute presentation film (180 seconds)
export const FPS = 30;
export const TOTAL_FRAMES = TOTAL_DURATION * FPS; // 5,400 frames
