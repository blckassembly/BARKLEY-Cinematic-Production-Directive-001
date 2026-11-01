# BARKLEY — 3-Minute Cinematic Kiosk Presentation (Revised Architecture)

A streamlined, human-centered 3-minute cinematic product film for the BARKLEY 27-inch portrait intelligent POS kiosk. This production removes the virtual character and hand models completely, replacing them with a customer-eye POV camera that glides smoothly between architectural showroom views, eye-level touchscreen perspectives, and close-ups of the ID scanner, biometric camera, NFC payment reader, and receipt printer. The 27-inch display advances automatically across the full checkout experience using high-resolution full-frame UI captures paired with animated dynamic overlays.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural directives have been confirmed and will govern the updated build:

- **Confirmed Decision 1 (Complete Removal of Human/Hand Mesh)**: Virtual character, humanoid limbs, and hand meshes are completely removed. This eliminates complex rigging, unnatural joint postures, and z-fighting, focusing 100% of GPU resources and audience attention on the BARKLEY hardware and interface.
- **Confirmed Decision 2 (Customer-POV Camera Choreography)**: In place of a visible human, the camera occupies the customer's eye-level perspective, gliding smoothly between wide establishing angles and hardware close-ups (ID scanner, biometric camera, contactless payment bay, receipt mouth).
- **Confirmed Decision 3 (High-Res Full-Frame UI with Dynamic Overlays)**: The 27-inch portrait screen operates on an automatic 180-second scripted timeline. It renders high-resolution full-frame captures of the uploaded designs with live vector overlays (glowing active states, ripple feedback, dynamic keypad typing, smooth cart summary drawer, and order pickup badges).
- **Confirmed Decision 4 (Ambient Dispensary Soundscape)**: Ambient luxury dispensary room tone paired with procedural Web Audio capacitive chimes, ID scanner laser chirps, biometric verification tone, NFC contactless ping, and thermal receipt feed sounds.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a broadcast-ready 3-minute (180-second) cinematic presentation of the BARKLEY 27-inch portrait intelligent POS kiosk inside a luxury cannabis atelier. Viewers experience the complete customer journey from a first-person perspective as the screen wakes up, verifies age and ID, unlocks the curated flower/edibles catalog, displays dosage advisories, animates a cart summary, executes simulated contactless payment, and dispenses a receipt.
- **Target Audience & Purpose**: YouTube presentation, executive showcase, investor demonstration, and trade-show kiosk reel.
- **Key Value**: Crisp, unencumbered visual clarity. Eliminates distracting humanoid animation while preserving a deeply immersive, first-person shopping experience.

---

## 2. User Experience & Visual Design

### 3-Minute Master Timeline Breakdown (00:00 – 03:00 / 5,400 Frames at 30 FPS)

```
00:00 ──── Reveal & Attract ──── 00:20 ──── Age Gate ──── 00:45 ──── ID & Face Scan ──── 01:05
[Wide luxury corner shot]       [Camera glides to POV]    [Zoom to intake scanner]
[Luminous 27" screen glow]       [Keypad inputs DOB]       [Biometric camera beam]

01:05 ──── Catalog Unlock ──── 01:35 ──── Dosage Advisory ── 02:05 ──── Cart & Payment ── 02:35
[The Atelier product menu]      [Botanical Gummies 360]   [Smooth Cart Summary popup]
[Category navigation]           [THC/CBD onset advisory]  [NFC terminal tap & ding]

02:35 ──── Order Confirmed ──── 02:50 ──── Pickup & Handoff ── 03:00
[Pickup reference #2847]        [Zoom to receipt slot]
[Dispensing paper receipt]      [Wide architectural closing]
```

### Scripted 8-Stage Interaction Schedule

| Timestamp | Phase | Screen Experience | Camera Behavior & Focus | Hardware Cues |
| :--- | :--- | :--- | :--- | :--- |
| **00:00–00:20** | **Cinematic Reveal** | Attract Loop: BARKLEY luxury brandmark & glowing "Get Started" | 35mm wide architectural glide orbiting the corner atelier | Display backlight pulses softly; floor terrazzo reflections |
| **00:20–00:45** | **Screen Activation & DOB** | Screen wakes; age verification keypad inputs birth year (1998) | Camera glides into 50mm customer eye-level POV | Capacitive touch chimes as digits activate |
| **00:45–01:05** | **ID & Camera Verification** | "Insert ID" guidance screen $\to$ Upper camera biometric match | Moves down to ID scanner slot, then tilts up to top camera | ID mouth glows emerald; facial recognition targeting box |
| **01:05–01:35** | **Product Catalog** | The Atelier collection unlocks; categories (Gummies, Flower, Vapes) | Eye-level display POV with gentle breathing float | Category cards highlight with smooth selection ripples |
| **01:35–02:05** | **Product Details & Advisory** | Botanical Fruit Gummies ($24.00) $\to$ Edibles dosage onset advisory | Intimate 50mm focus on dosage chart & safety warning | "Continue" button pulses with tactile confirmation |
| **02:05–02:35** | **Cart Summary & Payment** | Smooth animated Cart Summary drawer pops up $\to$ Total $148.24 | Tilts down to frame NFC payment reader | NFC symbol pulses cyan $\to$ emerald; payment chime |
| **02:35–02:50** | **Order Confirmation** | "Thank You" screen with pickup reference #2847 | Macro close-up of receipt mouth | Thermal printer feeds receipt with mechanical sound |
| **02:50–03:00** | **Pickup & Closing Shot** | Counter pickup directions $\to$ BARKLEY brand closing lockup | Slow pull-back to wide architectural showroom angle | Dispensary lighting dims gently to spotlight the kiosk |

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Complete Elimination of Character & Hand Mesh**
  - *Chosen Approach*: Delete `/src/scene/hand.ts` and `/src/scene/character.ts` dependencies from the scene manager.
  - *Why*: Procedural skeletal human meshes in Three.js distract from the product hardware and interface. Removing them guarantees 60 FPS performance, eliminates unnatural poses, and lets viewers imagine themselves in the customer's shoes.
- **Decision 2: Cinematic Camera POV as the Human Proxy**
  - *Chosen Approach*: The virtual camera acts as the customer's eyes. It steps toward the kiosk, glances down at the scanner, looks up at the camera, and focuses on the screen.
  - *Why*: Retains the human-centered scale and ergonomic perspective without rendering a humanoid model.
- **Decision 3: Independent Kiosk Screen State Machine**
  - *Chosen Approach*: The 27-inch portrait screen texture runs on an independent state machine driven by master timeline seconds $t \in [0, 180]$.
  - *Why*: Decouples hardware rendering from interface state. The camera can zoom, tilt, or orbit freely, while the screen advances its checkout steps deterministically.
- **Decision 4: High-Res Mockups with Layered Vector Overlays**
  - *Chosen Approach*: Render uncropped, proportionally scaled high-resolution UI images with dynamic vector graphics (glowing buttons, expanding ripples, animated drawers, and live text).
  - *Why*: Combines the beauty of the uploaded Figma/user designs with the responsive dynamism of a real POS kiosk.

---

## 4. Technical Architecture & Component Pipeline

### Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Master Director Timeline                        │
│             State: { currentTime: 0..180, isPlaying, speed, cameraMode } │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐      ┌───────────────────────────┐
       │ Three.js Scene Engine  │      │ Director Suite UI Overlay │
       └────────────┬───────────┘      │ - 8 Stage Jump Buttons    │
                    │                  │ - 180s Master Scrubber    │
    ┌───────────────┴───────────────┐  │ - Camera Angle Switcher   │
    ▼                               ▼  └───────────────────────────┘
┌────────────────────────┐    ┌──────────────────────────┐
│ Camera Director        │    │ BARKLEY POS Kiosk 3D     │
│ - Customer Eye POV     │    │ - 27" Portrait Screen    │
│ - ID Scanner Macro     │    │ - High-Res Emissive Mesh │
│ - NFC Terminal Focus   │    │ - ID Scanner / NFC / Rec │
│ - Smooth Lerp Damping  │    └────────────┬─────────────┘
└────────────────────────┘                 │
                                           ▼
                              ┌──────────────────────────┐
                              │ Kiosk Screen Engine      │
                              │ - Full-Frame UI Mockups  │
                              │ - Animated Cart Drawer   │
                              │ - Dynamic Touch Ripples  │
                              │ - Live Typography/Badges │
                              └──────────────────────────┘
```

### Component & File Strategy

1. **`src/scene/types.ts`**:
   - Update `TOTAL_DURATION` from 118s to 180s (3 minutes, 5,400 frames).
   - Reconfigure `WORKFLOW_STEPS` into the 8 revised stages matching the user's table (00:00 to 03:00).
   - Remove hand target coordinates; add camera focus targets and screen overlay states.
2. **`src/scene/sceneManager.ts`**:
   - Remove `createInteractiveHand` and character references.
   - Wire the 180s master clock to the camera director and kiosk screen engine.
   - Synchronize audio triggers (chimes, scanner chirp, payment chime, receipt feed).
3. **`src/scene/cameraDirector.ts`**:
   - Re-architect camera choreography to provide:
     - `cinematic`: Scripted 8-stage customer POV gliding smoothly between eye-level, scanner, camera, and payment terminal.
     - `screen_focus`: Fixed eye-level 50mm lens on the 27" display.
     - `hardware_focus`: Macro view of ID scanner, NFC reader, and receipt mouth.
     - `free`: Unrestricted 360° OrbitControls.
4. **`src/scene/screenTextures.ts`**:
   - Maintain 1080×1920 portrait canvas texture with emissive glow (`emissiveIntensity: 0.95`).
   - Cleanly map high-res mockups with proportional scaling (zero cropping).
   - Render animated overlays: glowing activated buttons, keypad keystrokes, biometric scan grid, animated cart drawer slide-up, and green order checkmark.
5. **`src/scene/audioSynth.ts`**:
   - Ambient dispensary room tone + procedural sound design for capacitive touches, ID scan beep, payment ding, and paper receipt feed.
6. **`src/components/DirectorSuite.tsx`**:
   - Update timeline to 03:00.00 (180s).
   - Update stage buttons to the 8 revised scenes.
   - Provide camera controls, speed multipliers (0.5x, 1x, 1.5x, 2x), and snapshot export.
