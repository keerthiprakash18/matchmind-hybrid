# MatchMind Hybrid · #BuildHybridAI 2026

**Match observations → evidence-linked coaching decisions.** A football analysis workspace powered by Firebase AI Logic hybrid inference. The goal is to make useful tactical help available on compatible Chrome devices, with a Firebase cloud option when on-device inference is not available.

> **Release status:** V1 integrated coaching workspace. GitHub Actions runs unit, build, dependency, Chromium and automated accessibility gates on release changes. Firebase on-device inference requires a compatible Chrome desktop and an installed Gemini Nano model; retain hardware-based verification as a separate acceptance check. User screenshots demonstrate real Cloud, On-device and Hybrid → On-device inference in previously tested builds. A successful Cloud request on an earlier production build was reported. **A real Hybrid → Cloud fallback on the public production site was verified by a headless Chromium GitHub Actions run (2026-11-23, run 45181931811); the newest release's local-device behavior still requires final Chrome desktop verification.** Do not claim universally offline operation.

## Live project

- **Website:** https://matchmind-hybrid.vercel.app/
- **Source:** https://github.com/keerthiprakash18/matchmind-hybrid
- **Quick demo:** open the site → Explore the demo → select a mode → consent if cloud can be used → Generate match intelligence. Web Chrome desktop is the required local-model platform.
- No account or paid key required for the deployed synthetic demo. Cloud quota and on-device browser support still apply.

## Features
- Editable fictional fixture labels, synthetic match-event demo and precise event-based statistics.
- Full 50-event notebook with safe inline editing, undo deletion, search and team/event filters. Filtered views never alter the underlying observations used by AI or statistics.
- **All applicable evidence-led coaching signals** are computed deterministically from logged event types and minutes, independently of generative AI, with explicitly non-predictive labeling.
- AI focus modes: halftime briefing, tactical adjustments and training priorities.
- **Consistent evidence-linked AI reports**: Gemini Nano's labels and Gemini Cloud's numbered/plain-text variations render as the same readable, semantically grouped Overview → Insights → Coaching adjustments → Limitations experience. The renderer never invents or rewrites tactical facts; original model text remains available in the Markdown coaching brief.
- **Live route comparison for an unchanged notebook**: up to three recent real Firebase SDK inference results (requested mode, reported route, duration and timestamp coverage), held only in tab memory without saving prompts, notes or model output. Editing observations clears comparisons and any stale AI report.
- AI inference: **Hybrid**, **On-device only**, **Cloud only** using Firebase AI Logic.
- SDK-provided inference provenance badge with an **Inference & evidence receipt**: requested mode, actual route, elapsed time, timestamp coverage and unlogged timestamp warning. This is not a guarantee that AI reasoning is accurate.
- Explicit browser-tab save/restore and clear, plus bounded validated JSON export/import for continuity between devices. No backend database or silent persistence. Invalid/oversized imports are rejected without losing existing notes.
- Export CSV (formula injection protected), download Markdown coaching brief **even without AI** (logged counts and deterministic questions included), and copy generated AI reports.
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

- Unit tests cover observation validation, prompt boundaries, session schema, CSV injection, error redaction, actual example Cloud/Nano report formatting, and metadata-only route history. Browser tests verify responsive layouts, keyboard accessibility and local coaching workflows.
- Chrome local and Cloud inference were demonstrated in user screenshots on 2026-11-23: Hybrid requested → SDK reported ON DEVICE (19.6s), On-device only → ON DEVICE (5.5s), and Cloud only → CLOUD (3.0s). These were observations on the then-current V1 production build, not a guarantee across later code changes or all devices. **Real Hybrid → Cloud fallback was verified on the public HTTPS site in GitHub Actions run 45181931811**, where a Chromium browser without a local model requested Hybrid and the Firebase SDK reported CLOUD. This proof applies to the tested production deployment; retest after any inference-routing changes.
- The previously vulnerable transitive `@grpc/grpc-js@1.9.16` has been overridden with the patched `1.13.6`, and the lockfile includes a verified registry integrity hash. CI must still validate the full dependency tree and the actual Firebase build. Don't use `npm audit fix --force` blindly.
- Current app sends observations to cloud only when generating cloud/hybrid inference; it does not upload them to Firestore.
- Developer tokens shown in older screenshots should be revoked and replaced outside public view.

See [privacy](PRIVACY.md), [security disclosure](SECURITY.md), [release acceptance](docs/RELEASE_ACCEPTANCE.md), [security and QA checks](docs/QA_AND_SECURITY.md), [judge testing guide](docs/JUDGE_TESTING.md), [submission description draft](docs/DEVPOST_SUBMISSION_DRAFT.md), and [three-minute demo storyboard](docs/FINAL_DEMO_NARRATION.md).

## Submission gates

Public repository verified (2026-11-23) with MIT LICENSE file; published deployed build, real inference evidence, accessibility and security checks, and a public <=3-minute English YouTube demonstration. Official contest deadline **November 30, 2026, 2:00 p.m. PST**.

This independent project is **not connected to FC ARENA**. Match teams and observations are fictional, not a real sports data feed. MatchMind does not promise winning a prize.
