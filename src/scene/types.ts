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
  description: string;
  actionText: string;
  // Hand target on screen or hardware (normalized X [-0.15, 0.15], Y [-0.25, 0.25], Z relative to screen face)
  handTarget: {
    x: number;
    y: number;
    z: number;
    tapTime?: number;
    hasIdCard?: boolean;
    hasCreditCard?: boolean;
    isTakingReceipt?: boolean;
  };
}

export interface CheckoutAnimationState {
  cartPopupProgress: number; // 0.0 to 1.0 (smooth popup animation)
  handInteracted: boolean;
  ripple: { x: number; y: number; progress: number } | null;
  isProceedTapped: boolean;
  activeItemCount: number;
  totalAmount: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: '01_welcome',
    number: '01',
    name: 'Welcome Screen',
    startTime: 0,
    endTime: 8,
    screenIndex: 0,
    description: 'Kiosk screen displays the BARKLEY welcome screen with Get Started button.',
    actionText: 'Hand enters and taps "Get Started"',
    handTarget: { x: 0, y: -0.12, z: 0.015, tapTime: 5.0 },
  },
  {
    id: '02_enter_dob',
    number: '02',
    name: 'Enter Date of Birth',
    startTime: 8,
    endTime: 16,
    screenIndex: 1,
    description: 'Screen requests date of birth; hand inputs birth year on keypad.',
    actionText: 'Hand enters DOB on on-screen keypad',
    handTarget: { x: 0.04, y: -0.06, z: 0.015, tapTime: 12.0 },
  },
  {
    id: '03_scan_id',
    number: '03',
    name: 'Scan ID Card',
    startTime: 16,
    endTime: 26,
    screenIndex: 2,
    description: 'Hand inserts state ID into the illuminated intake scanner slot below screen.',
    actionText: 'Hand inserts ID into scanner slot',
    handTarget: { x: -0.13, y: -0.42, z: 0.04, tapTime: 21.0, hasIdCard: true },
  },
  {
    id: '04_camera_verify',
    number: '04',
    name: 'Camera Verification',
    startTime: 26,
    endTime: 34,
    screenIndex: 3,
    description: 'Upper camera matches face; verification approved with green checkmark.',
    actionText: 'Biometric face match confirmed',
    handTarget: { x: 0.18, y: -0.35, z: 0.15 }, // Hand rests to side while face scans
  },
  {
    id: '05_browse_catalog',
    number: '05',
    name: 'Browse Catalog',
    startTime: 34,
    endTime: 44,
    screenIndex: 4, // The Atelier Featured Catalog
    description: 'Product menu unlocks; hand browses curated flowers, vapes, and edibles.',
    actionText: 'Hand swipes & navigates category menu',
    handTarget: { x: 0.06, y: 0.02, z: 0.015, tapTime: 39.0 },
  },
  {
    id: '06_gummies_collection',
    number: '06',
    name: 'Gummies Collection',
    startTime: 44,
    endTime: 54,
    screenIndex: 5, // Gummies Collection
    description: 'Hand explores gummies collection and selects Botanical Fruit Gummies.',
    actionText: 'Hand selects Botanical Fruit Gummies',
    handTarget: { x: -0.06, y: -0.02, z: 0.015, tapTime: 49.0 },
  },
  {
    id: '07_product_details',
    number: '07',
    name: 'Product Details',
    startTime: 54,
    endTime: 64,
    screenIndex: 6, // Product Details 360 viewer
    description: 'Customer inspects 5mg THC / 5mg CBD potency and serving information.',
    actionText: 'Hand rotates 360° product package',
    handTarget: { x: 0.0, y: 0.08, z: 0.02, tapTime: 59.0 },
  },
  {
    id: '08_dosage_advisory',
    number: '08',
    name: 'Education & Advisory',
    startTime: 64,
    endTime: 74,
    screenIndex: 7, // Know what you are purchasing / Edible onset
    description: 'Compliance advisory: effects onset timing (30m - 2h); hand taps Continue.',
    actionText: 'Hand acknowledges advisory & taps Continue',
    handTarget: { x: 0.0, y: -0.26, z: 0.015, tapTime: 70.0 },
  },
  {
    id: '09_shopping_bag',
    number: '09',
    name: 'Cart Summary & Checkout',
    startTime: 74,
    endTime: 84,
    screenIndex: 8, // Shopping Bag total $148.24
    description: 'Hand interacts with screen; Cart Summary pops up smoothly with items and pricing.',
    actionText: 'Hand triggers animated Cart Summary popup',
    handTarget: { x: 0.07, y: -0.20, z: 0.015, tapTime: 76.5 },
  },
  {
    id: '10_checkout_pay',
    number: '10',
    name: 'Contactless Payment',
    startTime: 84,
    endTime: 96,
    screenIndex: 9, // NFC contactless terminal
    description: 'Hand brings payment card to the illuminated NFC reader; payment approves.',
    actionText: 'Hand taps card on NFC contactless reader',
    handTarget: { x: 0.02, y: -0.42, z: 0.035, tapTime: 90.0, hasCreditCard: true },
  },
  {
    id: '11_order_confirmed',
    number: '11',
    name: 'Order Confirmed',
    startTime: 96,
    endTime: 106,
    screenIndex: 10, // Thank You, Pickup Reference #2847
    description: 'Order confirmed with pickup reference #2847 displayed on screen.',
    actionText: 'Order #2847 confirmed & sent to dispensary counter',
    handTarget: { x: 0.16, y: -0.32, z: 0.12 },
  },
  {
    id: '12_receipt_handoff',
    number: '12',
    name: 'Receipt & Handoff',
    startTime: 106,
    endTime: 118,
    screenIndex: 11, // Final receipt screen
    description: 'Thermal receipt dispenses from printer mouth; hand takes receipt.',
    actionText: 'Hand collects printed paper receipt',
    handTarget: { x: 0.15, y: -0.42, z: 0.035, tapTime: 112.0, isTakingReceipt: true },
  },
];

export const TOTAL_DURATION = 118.0; // ~2 minutes of smooth continuous checkout flow
export const FPS = 30;
export const TOTAL_FRAMES = TOTAL_DURATION * FPS;
