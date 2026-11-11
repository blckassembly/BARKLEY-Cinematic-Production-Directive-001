# Demo validation — November 11, 2026

Passed TypeScript (`npm run lint`) and the production Vite build.

Ten API tests passed with mocked PayPal responses, including approved-order capture and 100 simultaneous checks of a previously completed capture. The tests verify missing credentials, invalid tickets, server-owned pricing, order/mode binding, pending capture rejection, amount/currency rejection, and provider failure handling.

Chromium checks passed:

- Under-21 and mismatched-ID scenarios block checkout.
- Product acknowledgment is required before payment.
- Missing credentials produce an error, never an approval.
- The immersive scene renders using software WebGL.
- Mocked SDK approvals produce separate desktop and VR orders; cancellation produces no receipt.
- 30 checkout/lobby navigation cycles reset state.
- The 390px mobile lobby has no horizontal overflow.
- 10 concurrent browser sessions reached checkout; the slowest initial run took 6.43 seconds on this machine.
- No uncaught page errors in the tested journey.

These are local functional and small concurrency checks, not production capacity measurements. No real PayPal Sandbox capture was attempted: deployment credentials are not available in this workspace. Physical headset tracking/controller behavior, PayPal popup handoff on a headset browser, and real Sandbox buyer approval still require verification. The existing cinematic remains an animation; it is not evidence of payment or identity verification.
