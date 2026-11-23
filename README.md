# MatchMind Hybrid · #BuildHybridAI 2026

**Match observations → evidence-linked coaching decisions.** A football analysis workspace powered by Firebase AI Logic hybrid inference. The goal is to make useful tactical help available on compatible Chrome devices, with a Firebase cloud option when on-device inference is not available.

> **State:** V0.2 candidate on a review branch. The owner has demonstrated real **Cloud**, **On-device**, and **Hybrid → On-device** inference using the Firebase SDK-reported source in Chrome desktop. **Hybrid → Cloud fallback remains unverified** until tested on a browser/device without a local model. Do not describe the project as universally offline-capable.

## Features
- Editable fictional fixture labels, synthetic match-event demo and precise event-based statistics.
- Manual observation timeline, truthful last-recorded minute, event distribution and bounded 50-event notebook.
- **Evidence-led coaching signals** computed deterministically from logged event types and minutes, independent of generative AI, with explicit non-predictive labeling.
- AI focus modes: halftime briefing, tactical adjustments and training priorities.
- AI inference: **Hybrid**, **On-device only**, **Cloud only** using Firebase AI Logic.
- SDK-provided inference provenance badge with an **Inference & evidence receipt**: requested mode, actual route, elapsed time, timestamp coverage and unlogged timestamp warning. This is not a guarantee that AI reasoning is accurate.
- Explicit tab-only save/restore and clear. No backend database or silent persistence.
- Export CSV (formula injection protected), download Markdown coaching brief and copy report.
- Privacy disclosure and **explicit opt-in acknowledgment** before Cloud/Hybrid requests can send match notes to cloud; local-only requires no cloud consent. Accessible controls and safe UI errors do not echo raw API URLs or credentials.

## Quick start

Use Node.js 22 LTS.

```sh
npm ci
cp .env.example .env
npm test
npm run dev
```

In PowerShell, use `Copy-Item .env.example .env` to create a local environment file. Then open the displayed localhost URL in **Chrome Desktop 139+** if you want to evaluate on-device AI.

### Configure Firebase
1. Firebase project, Web App, **Firebase AI Logic**, Gemini Developer API, and **App Check** must be configured separately from other applications.
2. Copy the public Web App config into the corresponding `VITE_FIREBASE_*` keys in local `.env`; put the **public reCAPTCHA Enterprise site key** in `VITE_APPCHECK_SITE_KEY`. Never use service-account keys, private Gemini API keys, or an App Check debug token as a `VITE_` variable.
3. Local **development only**: set `VITE_ENABLE_APP_CHECK_DEBUG=true`. Register the automatically logged debug token for the matching Web App in Firebase Console. Never share it or use debug mode in production.
4. Set **production** `VITE_ENABLE_APP_CHECK_DEBUG=false` in the hosting provider. Deploy only after enforcing App Check for the real deployed domain.

## Verification

```sh
npm test
node scripts/security-gates.mjs
npm run build
npm audit --audit-level=high
```

- Unit tests cover observation validation, prompt boundaries, session schema, CSV injection and error redaction.
- Browser QA, genuine Chrome on-device inference and real hybrid fallback require device testing. **Do not simulate a local-model result.**
- The previously vulnerable transitive `@grpc/grpc-js@1.9.16` has been overridden with the patched `1.13.6`, and the lockfile includes a verified registry integrity hash. CI must still validate the full dependency tree and the actual Firebase build. Don't use `npm audit fix --force` blindly.
- Current app sends observations to cloud only when generating cloud/hybrid inference; it does not upload them to Firestore.
- Developer tokens shown in older screenshots should be revoked and replaced outside public view.

See the [competition release acceptance criteria](docs/RELEASE_ACCEPTANCE.md), [security and QA checks](docs/QA_AND_SECURITY.md), [judge testing guide](docs/JUDGE_TESTING.md), [submission description draft](docs/DEVPOST_SUBMISSION_DRAFT.md) and [three-minute demo storyboard](docs/DEMO_SCRIPT_3_MIN.md).

## Submission gates

Public repository with license, published deployed build, real inference evidence, accessibility and security checks, and a public <=3-minute English YouTube demonstration. Official contest deadline **November 30, 2026, 2:00 p.m. PST**.

This independent project is **not connected to FC ARENA**. Match teams and observations are fictional, not a real sports data feed. MatchMind does not promise winning a prize.
