# Devpost submission — English draft

> This is a **draft**. Complete real URLs and verify every claim before submitting. Never substitute synthetic or staged results for genuine model output.

## Title
MatchMind — Hybrid AI for Grassroots Football Coaches

## Tagline
Turn touchline observations into coaching decisions, on-device when available and in the cloud when needed.

## The problem
Grassroots football coaches have limited time, incomplete manually recorded notes, and unpredictable device connectivity. Rich performance platforms can require tracking hardware or continuous data access; a coach needs a practical halftime briefing from the evidence they already have.

## What MatchMind does
MatchMind turns short, time-stamped match observations into evidence-linked tactical insights. Coaches log recoveries, wide overloads, chances and press-breaking moments in a simple timeline. A deterministic dashboard summarizes only recorded events and highlights coaching questions from event-specific rules — independently of the generative model, with no invented performance metrics. Using the **Firebase AI Logic Hybrid Inference SDK**, MatchMind prefers Chrome's on-device **Gemini Nano** when supported and uses **Gemini Cloud** when necessary. The application exposes the model's actual reported inference source instead of guessing. A separate evidence receipt matches cited event timestamps with recorded notes and clearly warns this does **not** verify the truth of tactical claims. Coaches explicitly acknowledge potential cloud transfer before Cloud or Hybrid requests, can save a browser-tab session, export events and take a coaching brief into their team discussion.

## How we built it
- React 19, TypeScript, Vite 6, lucide icons.
- Firebase AI Logic (Web SDK), `getGenerativeModel`, `InferenceMode.PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `ONLY_IN_CLOUD`.
- Chrome Prompt API / Gemini Nano for supported desktop local inference.
- Gemini Developer API via Firebase AI Logic for cloud inference.
- Firebase App Check and reCAPTCHA Enterprise for request protection.
- Zero account requirements, no Firestore and no user data backend; explicit `sessionStorage` save only.
- GitHub Actions for unit tests, TypeScript/Vite production build, npm security audit and desktop/mobile Chromium smoke tests.

## Technical differentiator
The AI is **not a chat widget pretending to be local**. It uses Firebase's actual hybrid routing and surfaces actual response provenance. Its groundedness guard checks cited minutes against the input observations, while explicitly distinguishing a timestamp match from genuine factual verification. The same workflow can be used at the touchline, in a short halftime interval, without complex analytics infrastructure.

## Impact
The target is volunteer and grassroots coaches, especially teams without match tracking tools. MatchMind helps turn incomplete notes into transparent, reviewable suggestions. The current demonstration uses fictional teams and synthetic events, so it **does not claim measured improvement, real-match validation or real-user adoption**.

## What was built during the hackathon
An original MatchMind starter and subsequent GitHub V0.2 updates were implemented during the hackathon submission window. The submission-period work includes Firebase cloud/local/hybrid integration, match notebook, evidence chart, editable team labels, local session workflows, exports, route-provenance indicators, evidence receipt, safe UI and CI/security checks. AI coding assistants were used for development and tests were run through GitHub Actions. No FC ARENA code or production data is included.

## What remains to confirm before submitting
- Record a real Hybrid → Cloud fallback on a device/browser where no on-device model is available.
- Test the **deployed HTTPS version** with App Check without a debug token.
- Public source repository with detectable open-source license.
- Free public testing link accessible through judging (no secrets).
- Public English YouTube video (maximum 3 minutes): **INSERT FINAL URL**.
- **INSERT FINAL DEMO URL**.
- Add genuine screenshots from actual product, remove debug tokens/PII.

## Honest limitations
On-device Gemini Nano requires supported Chrome desktop and an installed model. Suggestions are generated from manual observations, not sensor/video feeds. No score, player identity, possession percentage, or outcomes are inferred without evidence. Production cost, quotas, and availability may vary.

## Judging fit
- **Technological implementation:** three genuine Firebase AI Logic inference modes, App Check, reported model provenance, unit/E2E/security CI.
- **Design:** coherent coach workflow from observation → insight → evidence → export, including mobile.
- **Potential impact:** a useful workflow for resource-constrained grassroots coaches without specialized equipment.
- **Quality of idea:** accountable hybrid coaching aid with transparent evidence rather than an opaque chat answer.

Follow the official entry form prompts and verify the exact spelling of platform and category before submission.
