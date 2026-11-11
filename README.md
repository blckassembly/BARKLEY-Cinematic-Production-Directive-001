# BARKLEY judges demo

Demo name sign-in → desktop or immersive store → synthetic ID scenario → product education → $1 USD PayPal Sandbox order → server-verified receipt. Each experience has an independent order. The original cinematic remains available from the lobby.

## Run

Use Node 22.12+ and `npm install`, then `npm run dev:full`. Plain `npm run dev` runs only Vite and cannot process payments. Run `npm run lint`, `npm run build`, and `npm test` for validation.

## PayPal Sandbox on Vercel

Set `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` on the Vercel **Preview** environment, then create a new preview deployment of this branch. Copy credentials directly from the PayPal Sandbox REST app. Rotate any secret shared in chat. Never use a `VITE_` prefix for the secret. No credentials are committed. Local development can use a gitignored `.env.local` (load it explicitly) or `.env`.

Vercel serves `api/paypal/[action].js` as a serverless function. Config exposes the public client id; create fixes the amount and description on the server; capture validates an expiring signed order ticket, mode, completed status, amount, and currency. PayPal request ids prevent duplicate payment requests for the same checkout attempt. There is no webhook listener; the simulator URL should stay blank.

Use a separate PayPal Sandbox Personal account to pay the Sandbox Business account. This version uses the established PayPal Buttons SDK and Orders v2 API, not an unverified SDK v6 migration. Credentials saved in PayPal are not automatically available in Vercel. A successful build does not establish a successful PayPal test transaction.

## VR

WebXR requires HTTPS (or localhost), a supported browser and headset, and user permission. Browser preview uses orbit controls. In-headset, point a controller at the bottom screen button to run the synthetic eligibility scenario and acknowledge product information. At payment, the button exits VR and continues the accessible browser checkout. PayPal approval happens outside immersive VR. Physical headset validation is required before presenting this as headset-tested.

## Scope

Demo sign-in is a tab-local guest name, not authentication. Identity, age, face matching, and liveness use explicit synthetic scenarios; no documents or biometrics are collected. CA/NY selects the demo context, not a verified regulatory rules engine. Purchase limits, inventory, lab results, dispensing, and fulfillment are not implemented. Product quantities are fictional. No real goods are sold.

Ganzevoort is an illustrative reserve/conversion/settlement concept. No reserves, stablecoins (including USD1), crypto exchange, bank rail, or central-bank connection is implemented. PayPal Sandbox does not establish eligibility for live cannabis payment acceptance or any regulatory status.

## Stress checks

`npm test` exercises malformed/expired/tampered tickets, missing credentials, server-owned amounts, mode separation, provider failures, pending captures, currency mismatches, and 100 concurrent replay checks using a mocked provider. It does not load-test PayPal or establish production throughput. With `npm run dev:full` running without payment credentials, run `npm run test:browser` (Chromium defaults to `/usr/bin/chromium`; override `CHROMIUM_PATH` if needed). This checks eligibility blocks, acknowledgment, both demo choices, mocked SDK approval/cancel, 30 navigation cycles, mobile overflow, and 10 concurrent sessions. `DEMO_URL` overrides localhost. Do not run these synthetic browser tests against a live checkout.
