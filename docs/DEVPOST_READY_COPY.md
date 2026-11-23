# MatchMind — #BuildHybridAI 2026 Devpost-ready submission copy

**Submission status:** All written sections are drafted. **DO NOT mark submitted until:** (1) repository is public and license detectable; (2) a real public YouTube demo video URL is provided; (3) final HTTPS build is checked. No video URL is invented here.

## Project title
**MatchMind — Hybrid AI for Grassroots Football Coaches**

## Tagline
**From touchline observations to accountable coaching decisions — on-device first, cloud when needed.**

## Challenge / Platform
**#BuildHybridAI 2026 · Web (Chrome)**

## Inspiration
Grassroots football coaches often work with very little: a notebook, a few crucial moments, and a short halftime break. Full performance-tracking systems may require sensors, analysts or connectivity. We wanted a practical assistant that could help coaches reason from the observations they actually captured, while being explicit about uncertainty. Hybrid inference is especially relevant because the ideal private, low-latency on-device model is not available on every browser or computer.

## What it does
MatchMind turns timestamped manual match observations into reviewable, evidence-linked coaching suggestions. A coach logs recoveries, shots, big chances, wide overloads and broken presses. A deterministic dashboard counts **only** those entries; it never invents possession percentages or a missing score.

The coach can request a halftime briefing, tactical adjustments or training priorities using **Firebase AI Logic** in one of three modes: on-device only, cloud only, or hybrid device-preferred inference. MatchMind shows the **actual inference route reported by the Firebase SDK**, not a route guessed from the selected button.

It also highlights tactical *questions* using transparent local rules, separate from the generative model. An evidence receipt cross-checks AI-cited minute references against the actual notebook; that check is deliberately described as timestamp matching, **not factual verification**. Coaches remain responsible for tactical decisions.

The no-login web app includes a clearly fictional sample match, a guest-first experience, an optional tab-session save/restore, CSV export, a downloadable Markdown coaching brief, and an explicit acknowledgment before Cloud or Hybrid requests may transmit observations.

## How we built it
- **React 19 + TypeScript + Vite 6** for a responsive web application.
- **Firebase AI Logic Hybrid Inference SDK** with `getGenerativeModel`, `InferenceMode.ONLY_ON_DEVICE`, `InferenceMode.ONLY_IN_CLOUD`, and `InferenceMode.PREFER_ON_DEVICE`.
- **Gemini Nano 4** for supported Chrome desktop on-device inference.
- **Gemini Cloud** via Firebase AI Logic for cloud responses.
- **Firebase App Check** with production reCAPTCHA Enterprise attestation; local debug attestation is restricted to development.
- Client-side deterministic signal calculations, bounded observations, text-safe React rendering and CSV formula-injection mitigation.
- GitHub Actions with automated unit tests, TypeScript/Vite production build, high-severity npm audit, browser tests for desktop/mobile, and automated WCAG checks.
- **Vercel** for the HTTPS web demo.

All observations in the public demonstration use **fictional teams and synthetic events**. There is no Firestore match database or requirement to create an account.

## Technical differentiator
Hybrid inference isn't just a label: MatchMind calls the actual Firebase AI Logic SDK and displays the returned source. User-visible evidence receipts expose the chosen mode, actual route, elapsed time and coverage of cited event minutes. A rules-based layer provides explainable coaching questions without invoking AI. A privacy-aware consent step makes potential cloud transfer clear before it happens.

## Challenges we ran into
Early browser testing surfaced genuine Firebase App Check attestation errors and a retired Cloud model. We corrected model selection, set up stable local development and production-domain reCAPTCHA Enterprise configuration, and tested actual Cloud and on-device responses. We also identified an inference-source label mismatch in the UI and corrected it using the SDK's real values.

The hardest product decision was to avoid presenting generated tactical explanations as certain. MatchMind explicitly distinguishes recorded facts, deterministic counts, and unverified AI suggestions.

## Accomplishments
- A functioning public HTTPS web app, with **Cloud inference verified in Chrome and Edge** and **on-device inference verified in compatible Chrome** in real user demonstrations.
- **Hybrid device-first behavior reported ON DEVICE** in real testing.
- A coherent end-to-end workflow: Observe → Review evidence → Choose inference mode → Generate suggestions → Verify source → Export briefing.
- Automated build, audit, desktop/mobile browser and accessibility quality gates passing on the reviewed V0.2 code.
- Guest-first access without signup, and privacy disclosures for cloud-bound observations.

**Do not claim Hybrid → Cloud fallback was independently proven unless a separate real Hybrid/CLOUD receipt is captured.** Cloud-only execution does not prove fallback.

## What we learned
Hybrid AI is most useful when the product explains both **what it knows** and **where the inference happened**. A fast local answer can be useful and private, but model availability and quality vary. Cloud can improve reach, but adds network, quota and privacy considerations. We learned to prefer narrow, testable evidence checks over impossible promises of hallucination-free AI.

## What's next
Validate Hybrid → Cloud fallback in a browser without a local model; seek feedback from real volunteer coaches; refine model evaluation with documented tactical test cases; and explore optional team collaboration with appropriately secured accounts and storage, rather than adding unnecessary signup to the competition demo.

## Links
**Live web demo:** https://matchmind-hybrid.vercel.app/

**Source code:** https://github.com/keerthiprakash18/matchmind-hybrid

**Open-source license:** MIT (repository LICENSE)

**Public YouTube demonstration:** `INSERT_ACTUAL_PUBLIC_VIDEO_URL` — real app footage, English, <= 3 minutes, no debug tokens or personal information.

**Testing instructions:** open the demo in Chrome desktop, begin with fictional match notes, select Cloud and acknowledge cloud transfer, click Generate, inspect the CLOUD badge and evidence receipt; on supported Chrome with local model installed, select On-device and verify ON DEVICE. Hybrid prefers the local route. See `docs/JUDGE_TESTING.md` for capability restrictions.

## Built during the hackathon period
Original MatchMind client, synthetic football match-notebook workflow, Firebase AI Logic cloud/local/hybrid integration, Firebase App Check configuration, event statistics, route provenance, evidence receipt, local save/export features, browser-focused design, performance/security checks and production deployment were implemented during the hackathon window. AI coding assistance was used. No source code, trademarks or production player data from FC ARENA are used.

## Review checklist — do not skip
- [ ] GitHub repository switched from Private to Public; verify MIT badge visible.
- [ ] Production HTTPS final build opens without a login, and Cloud App Check request succeeds.
- [ ] On-device and Hybrid local screenshots captured from a real compatible Chrome desktop.
- [ ] If claiming automatic fallback, include Hybrid mode returning actual Cloud source on unsupported browser.
- [ ] Record and publish a genuine 3-minute-or-shorter English YouTube demo; paste real video URL.
- [ ] Verify Devpost account eligibility, submission category, all required checkboxes and legal terms.
- [ ] Keep app available for judging through December 16, 2026.

**Deadline:** November 30, 2026 at 2:00 p.m. PST = December 1, 2026 at 3:30 a.m. IST.

**Official rules:** https://firebasehybridaihackathon.devpost.com/rules
