# BARKLEY — Cinematic Production Directive 001: The Customer Approaches

A high-fidelity Three.js cinematic simulation delivering the opening 20-second sequence of the BARKLEY intelligent retail kiosk product film, complete with a rigged adult male customer, accurate kiosk industrial design, deterministic time-driven animation, and a professional director suite.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions have been aligned based on your selections and will guide the production pipeline:

- **Confirmed Decision 1 (Timeline & Controls)**: Interactive Director Suite featuring a frame-accurate scrubber (00:00.00 to 00:20.00 / 0 to 600 frames at 30 fps), keyframe markers, playback speed multiplier (0.25x to 2x), and a Free-Cam / Cinematic Camera mode toggle.
- **Confirmed Decision 2 (Environment Atmosphere)**: Luxury cannabis retail atelier (Barkley flagship style) featuring warm white architectural walls, fluted oak millwork, warm-lit glass product showcases with amber tincture jars and curated botanicals, polished terrazzo floor with subtle specular reflections, and soft recessed ceiling downlights.
- **Confirmed Decision 3 (Cinematography Framing)**: Authentic 3-shot cinematic progression matching optical focal lengths: Shot 1 (00:00–00:05, 24mm equivalent wide architectural establishing shot), Shot 2 (00:05–00:12, 35mm over-the-shoulder tracking shot), and Shot 3 (00:12–00:20, 50mm medium interaction close-up capturing posture deceleration, gaze focus, right-arm reaching, screen contact, and settle).

---

## 1. Overview & Core Concept

- **What It Does**: Simulates a photorealistic, physically plausible human arrival and initial kiosk interaction sequence. An adult customer enters the luxury cannabis dispensary, walks naturally toward the monolithic 27-inch portrait BARKLEY kiosk, plants his feet 70 cm from the display, settles his gaze, reaches with his right hand using inverse kinematics, and touches the interactive "Get Started" control on the screen, triggering tactile button depression, ripple feedback, and ending in an approved idle pose ready for Scene 002 (Identity Verification).
- **Target Audience & Purpose**: Executive presentation, investor demo, and broadcast-grade product video generation for BARKLEY Intelligent POS.
- **Key Value**: Replaces disconnected interface animations and static renders with a living, dimensional human-scale experience film that can be scrubbed in real-time or exported deterministically frame-by-frame.

---

## 2. User Experience & Visual Design

### Cinematic Sequence Breakdown (00:00 – 00:20)

```
00:00 ── 24mm Wide Establishing Shot ── 00:05 ── 35mm Tracking Shot ── 00:12 ── 50mm Interaction Shot ── 00:20
[Customer enters from left]             [Forward walking cycle]         [Decelerates, plants feet]  [Touches 'Get Started']
[BARKLEY kiosk hero spotlight]          [Head turns toward kiosk]       [Gaze locks onto screen]    [Button glows & clicks]
```

1. **00:00–00:05 — Establishing Composition (Shot 1, 24mm / FOV 73.7°)**:
   - High-end architectural framing from customer's entry flank.
   - The BARKLEY kiosk stands tall as the focal centerpiece under a controlled warm spot beam.
   - Customer enters screen-left with purposeful forward momentum.
2. **00:05–00:12 — Walking Approach (Shot 2, 35mm / FOV 54.4°)**:
   - Camera cuts to a dynamic tracking shot positioned over the customer's right shoulder, gliding forward along the walking vector.
   - Character displays natural skeletal locomotion: alternating leg stride, heel-strike to toe-off with zero floor slipping, synchronized arm swing with relaxed elbows, subtle pelvic oscillation, and head turning 22 degrees to fixate on the illuminated kiosk.
3. **00:12–00:17 — Deceleration & Arrival (Shot 3, 50mm / FOV 39.6°)**:
   - Camera frames the customer's upper body, right arm, and the 27-inch portrait screen in crisp spatial continuity.
   - Walking speed smoothly dampens; final step plants firmly at 70 cm from the touchscreen surface.
   - Torso straightens, shoulders drop naturally, and eye gaze aligns with the "Welcome to BARKLEY" greeting.
4. **00:17–00:20 — First Human Interaction (50mm Interaction Focus)**:
   - Weight shifts slightly onto the forward foot.
   - Right shoulder flexes forward, elbow extends, forearm pronates, and index finger targets the virtual coordinates of the "Get Started" button on the 27" display.
   - Fingertip makes physical contact at $t = 18.2\text{s}$, triggering the button's haptic compression, highlight flash, and transition state.
   - Hand smoothly retracts to a resting position at $t = 19.5\text{s}$, leaving the customer standing composed before the kiosk as the sequence settles on frame 600.

### Kiosk Industrial Design Authority (Preserving Reference Proportions)

- **27-inch Portrait Display (9:16 Aspect Ratio)**: Micro-bezel glass surface with realistic anti-glare specular finish and dynamic procedural canvas texture rendering the BARKLEY Welcome UI.
- **Upper Bezel Sensor Bar**: Recessed identity camera lens, IR emitter array, and subtle metallic "BARKLEY" laser-etched typography.
- **Mid-Tier Hardware Bay**:
  - Horizontal ID document scanner slot with illuminated intake mouth.
  - Payment terminal NFC contactless reader face with tactile card ledge.
  - Recessed thermal receipt printer mouth with subtle brushed stainless lip.
- **Enclosure & Pedestal**: Sculpted dark graphite / matte black anodized aluminum enclosure with gentle rear radii and a heavy floor-weighted stability base with soft contact shadows.

### Director Suite Interface (Non-Occluding Dock)

- **Master Time Readout**: High-contrast, tabular timestamp (`00:14.28 / 00:20.00`) and frame counter (`Frame 428 / 600`).
- **Interactive Scrubber**: Full-width draggable timeline with color-coded keyframe markers for Shot 1, Shot 2, Shot 3, Deceleration, and Touch Contact.
- **Playback Controls**: Play/Pause, Replay, Frame Step Backwards ($\Delta -1$), Frame Step Forward ($\Delta +1$), and Speed Selector (0.25x, 0.5x, 1x, 2x).
- **Camera Mode Switcher**:
  - `Cinematic Cut` (Automatic director cuts across 24mm, 35mm, and 50mm).
  - `Shot 1 (Wide 24mm)`, `Shot 2 (Tracking 35mm)`, `Shot 3 (Close 50mm)`.
  - `Free Director Cam` (Smooth OrbitControls to inspect character kinematics and kiosk geometry from any angle).
- **Collapsible Cinema Drawer**: Single-click toggle (`▾ Hide Controls` / `H` shortcut) to allow full unencumbered fullscreen cinema viewing.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Procedural Rigged Character vs. External Model File**
  - *Chosen Approach*: Multi-segment articulated anatomical human model constructed with hierarchical Three.js bone kinematics (Pelvis, Spine, Chest, Neck, Head, Clavicles, Shoulders, Elbows, Wrists, Fingers, Hips, Knees, Ankles, Feet).
  - *Why*: Eliminates unhosted external `.glb` download failures (Zero-404 directive), guarantees instantaneous load without network latency, and gives 100% deterministic mathematical control over bone angles and touch coordinate alignment across all frames.
- **Decision 2: Time-Driven Deterministic Kinematics**
  - *Chosen Approach*: All character trajectories, joint rotations, camera matrices, and screen shader uniforms are computed as pure mathematical functions of elapsed timeline seconds $t \in [0, 20]$.
  - *Why*: Enables instant scrubbing to any exact millisecond, seamless frame-by-frame export, and perfectly repeatable animations without cumulative drift or state corruption.
- **Decision 3: Procedural High-Fidelity Dispensary Environment**
  - *Chosen Approach*: Built with modular architectural components (slatted oak partitions, glass cabinets with amber glass jars and botanicals, travertine flooring with normal maps, recessed warm spotlights) styled after the Barkley flagship dispensary references.
  - *Why*: Delivers an authentic luxury retail context while maintaining 60 FPS performance and avoiding heavy asset downloads.

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Motion Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Master Director Timeline                        │
│             State: { currentTime: 0..20, isPlaying, speed, cameraMode }  │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐      ┌───────────────────────────┐
       │ Three.js Render Engine │      │ Director Suite UI Overlay │
       └────────────┬───────────┘      └───────────────────────────┘
                    │
   ┌────────────────┴────────────────────────────────────────┐
   │                                                         │
   ▼                                                         ▼
┌───────────────────────────┐             ┌──────────────────────────┐
│ Character Kinematic Rig   │             │ BARKLEY 27" Kiosk & UI   │
│ - Trajectory & Gait Cycle │             │ - Monolithic Chassis     │
│ - Arm & Hand Reach IK     │             │ - ID/NFC/Printer Modules │
│ - Head Gaze Tracking      │             │ - Interactive Canvas UI  │
└───────────────────────────┘             └──────────────────────────┘
               │                                       │
               └───────────────────┬───────────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │ Cinematic Camera Director     │
                   │ - 24mm Wide (00:00–00:05)     │
                   │ - 35mm Tracking (00:05–00:12) │
                   │ - 50mm Closeup (00:12–00:20)  │
                   │ - Smooth Exponential Damping  │
                   └───────────────────────────────┘
```

### Component State & Kinematic Mapping

- **Gait Generator ($t \in [0, 14]$)**:
  - Stride frequency $\omega = 2\pi \times 0.95\text{ rad/s}$.
  - Foot position $y_{\text{foot}}(t) = \max(0, \sin(\omega t) \cdot h_{\text{step}})$, ensuring continuous grounding and zero foot sliding.
  - Forward velocity $v(t)$ begins at $1.2\text{ m/s}$ and smoothly decelerates via smoothstep between $t = 11.5$ and $t = 14.0$, settling at position $(0, 0, 0.72)$ relative to the kiosk face.
- **Touch Reach & Inverse Kinematics ($t \in [14, 20]$)**:
  - Weight transfer forward at $t = 16.5$.
  - Right shoulder rotates forward, elbow unfolds, wrist aligns, and index tip interpolates toward screen target $(0, 1.18, 0.02)$.
  - Screen contact detected at $t = 18.2$, toggling `isTouched` flag on the canvas texture to trigger button scale down, ripple ring propagation, and "Verification Ready" indicator.
- **Lighting Rig**:
  - Warm key light ($3200\text{K}$, $I = 2.4$, castShadow enabled with PCFSoftShadowMap).
  - Cool retail hemisphere fill ($4500\text{K}$ sky, $2800\text{K}$ floor).
  - Dedicated kiosk accent spot ($3000\text{K}$, focused beam highlighting brushed aluminum chamfers).
  - Soft procedural contact shadow disc beneath kiosk and character feet.
