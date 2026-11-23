# MatchMind Hybrid — #BuildHybridAI 2026

A privacy-aware football observation notebook with **real Firebase AI Logic hybrid inference**. This is a **phase-one starter**, not yet a deployed or Firebase-tested submission.

## The idea

Grassroots coaches often record tactical observations with unreliable connectivity. MatchMind logs fictional/demo match events in-session and asks Gemini to produce grounded coaching insights, preferring the on-device model when available and falling back to cloud through the **same Firebase AI Logic SDK**. Its interface discloses `response.inferenceSource` (device/cloud), separates observations from recommendations, and never invents match scores.

**Important:** MatchMind is not affiliated with or connected to FC ARENA. All demo data is fictitious. There is no live sports feed, database or upload. The starter does not claim AI results without Firebase setup.

## Run

Requires Node.js 20+.

```bash
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Visit the local URL. The notebook/dashboard work without Firebase. AI analysis requires the Firebase setup below. A correct full build also requires `npm run build` and tests with `npm test`.

## Configure *real* Firebase inference

1. Create a **new independent Firebase project** at https://console.firebase.google.com/ (not FC ARENA production).
2. Register a Web app. Go to **AI Services → AI Logic → Get started**, enable the **Gemini Developer API** provider, and confirm **Security → App Check → APIs → Firebase AI Logic** is **Enforced**.
3. In App Check register the web app with **reCAPTCHA Enterprise**, and put the public site key (NOT the secret key) in `VITE_APPCHECK_SITE_KEY`. Use a real production App Check provider when deploying.
4. Fill the `VITE_FIREBASE_*` values from Firebase's web-app config in a private `.env`. These are public identifiers by design but should not be confused with secret server credentials. Do **not** commit debug tokens, API secrets, service accounts, or private credentials.
5. For **localhost only** set `VITE_ENABLE_APP_CHECK_DEBUG=true`. Start the app, click Generate, find the debug token in local browser DevTools, safelist it at **Firebase Console → App Check → Apps → Manage debug tokens**. Never include this token in GitHub, screenshots, video, public logs, or production builds.
6. For local on-device Gemini Nano, use desktop **Google Chrome 139+** and enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, restart, and make sure the local model downloads. Hardware constraints apply. The app invokes `initializeDeviceModel` from the click handler. The first run may instead use cloud while the local model downloads.
7. With **Hybrid** chosen, check the AI result's **actual** `ON_DEVICE` or `IN_CLOUD` indicator. Test **On-device** and **Cloud** separately, and prove both paths in the demo. No platform is advertised as offline-capable unless a real on-device inference test succeeds.

Official docs: https://firebase.google.com/docs/ai-logic/hybrid/web/get-started

## Security and truthfulness gates before a public demo

- Never submit real players' personally identifying information; use synthetic observations. This starter keeps session state in browser memory, not localStorage or Firestore.
- App Check must remain **enforced**; use genuine reCAPTCHA Enterprise attestation for production. Never publish debug token or enable debug mode on production.
- Test input length limits, content encoding, prompt-injection resistance, fallback failures, runaway cost controls, quota consumption, Chrome compatibility, keyboard navigation, and mobile overflow.
- Do not call the app 'offline-first' for unsupported browsers; the offline-only route requires Gemini Nano available and downloaded. Set user expectation clearly.
- Add integration/E2E tests and real local/cloud smoke test; no simulated analysis may be represented as true AI output.
- CI: add dependency auditing, secrets scan, typecheck and build, E2E. Verify `git check-ignore .env` and `git ls-files .env` returns nothing. Avoid deploying with unresolved high severity CVEs.
- If you later add accounts or saved events: implement authentication, ownership-scoped read/write rules, storage access restrictions, throttling/quotas, and redacted logs before public deployment.
- The Devpost submission needs a public repository with visible open-source license, honest README, working link/test access, and a public YouTube demo no longer than 3 minutes in English. Do not publish any unrelated private projects.

## Design system

Editorial navy / ivory / cobalt, Fraunces headings, simple direct metrics, responsive mobile layout, no gradients or glassmorphism. Artificial data is clearly marked. The AI status is sourced from the SDK response rather than fabricated.

## Roadmap to submission

- [x] Standalone React/Vite interface with notebook, event stats and analysis controls
- [x] Firebase AI Logic `PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `ONLY_IN_CLOUD` integration in source
- [x] App Check integration points and explicit setup instructions
- [x] Isolated starter; no production access or data changes
- [ ] Install dependencies / successfully compile / browser QA in a connected development environment
- [ ] Connect actual Firebase, register App Check debug token locally
- [ ] Verify Gemini Nano + cloud using real browser evidence
- [ ] Run security, UX/accessibility, performance and failure-path audits
- [ ] Publish separate public GitHub repo and deployed working demo
- [ ] Record truthful three-minute YouTube demo; complete Devpost submission by Nov 30, 2026 2pm PST

The code uses Firebase AI Logic at runtime, not a standalone Gemini REST fetch. This is an initial implementation; the real SDK setup and browser test are mandatory before saying it is contest-ready.
