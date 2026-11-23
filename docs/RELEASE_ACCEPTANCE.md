# MatchMind · Competition release acceptance criteria

Prepared against the official #BuildHybridAI 2026 rules, as checked 2026-11-23.
Official rules: https://firebasehybridaihackathon.devpost.com/rules
Deadline: **2026-11-30 14:00 PST = 2026-12-01 03:30 IST**.

## Hard requirements — no submission without these
- [ ] A public GitHub repository, with the complete runnable source, identifiable open-source license, clear Firebase AI Logic calls, and installation instructions.
- [x] Working HTTPS site is reachable on Chrome and Edge and real production Cloud App Check inference was shown in an earlier build. **Retest final merged commit for AI**; maintain public access through 2026-12-16 judging.
- [x] Real public HTTPS Hybrid → Cloud inference accepted under production App Check, verified by GitHub Actions run 45181931811. Final release must retain the same production App Check configuration.
- [ ] Real Chrome desktop Gemini Nano response (SDK says ON_DEVICE), and Cloud response (SDK says IN_CLOUD) recorded.
- [x] **Hybrid → cloud fallback actually tested** on public HTTPS in unsupported-model Chromium, 2026-11-23, GitHub Actions run 45181931811. Requested Hybrid; Firebase SDK returned CLOUD. Not a simulated route.
- [ ] English YouTube demo <= 3 minutes, public and viewable without a login; footage shows real app output and source.
- [ ] English Devpost description, supported platform = Web (Chrome), code and demo URLs, and accurate description of features, work completed during contest.
- [ ] No Firebase debug token, actual player PII, live secret, or private Gemini/Cloud credentials visible in Git history, recording or submission materials.
- [ ] Screenshots/video show exactly the shipped commit; no staged output or fake results.

## Product quality & technology
- [x] Working real Firebase Cloud analysis (owner screenshot).
- [x] Working real on-device Chrome Gemini Nano analysis (owner screenshot).
- [x] Hybrid prefer-device response actually reported ON_DEVICE (owner screenshot).
- [x] GitHub Actions unit, typecheck/build, audit, desktop and mobile Chromium checks passed on a previous PR commit.
- [ ] Current PR head CI **all three jobs green** after final code changes.
- [ ] Browser AI verification repeated after adding privacy consent, formatting, and deterministic rule-based signal updates.
- [ ] Human QA for 320px, 390px, tablet, desktop; zoom 200%; keyboard-only and screen-reader; reduced motion.
- [ ] Robust error/slow-loading/retry checks, network-limited fallback proof.
- [ ] Check potential model quota usage; do not activate paid billing without budget controls/authorization.
- [ ] Deploy without `VITE_ENABLE_APP_CHECK_DEBUG=true`, revoke old exposed debug tokens.
- [x] PR #3 merged into PR #2, then PR #2 merged into main with green CI; Vercel triggered production build. **Final deployed behavior needs a post-merge check.**

## Evaluation against four equally weighted judging criteria
1. **Technology:** genuine Firebase AI Logic SDK routing and App Check, real inference source, responsive browser tests, security audit. Remaining: final deployed commit recheck and local model evidence.
2. **Design:** clear observe → analyze → verify → export flow, session management, visible data limitations and cloud-consent disclosure. Remaining: manual design and accessibility review.
3. **Potential impact:** a short, transparent halftime workflow for volunteer/grassroots coaches. Remaining: real coach feedback or usability evidence, not invented impact metrics.
4. **Idea quality:** accountable and privacy-aware sports decision support with evidence checks. Remaining: polished 3-minute narrative that demonstrates why hybrid matters.

## Shipping sequence
1. Confirm **current PR CI**, finish any regressions, verify actual hybrid fallback.
2. Connect Vercel to this independent repository; set only public Firebase Web config and recaptcha site key as build-time variables via Vercel UI. Set debug=false; verify provider origin/domain.
3. Inspect the live HTTPS deployment, actual App Check, all three routes, and exported files. Ensure no restricted access.
4. Merge reviewed PR; publish repository with MIT license detected and make app freely available.
5. Record a clean English video in three minutes or less, with genuine Cloud, On-device, Hybrid and fallback source verification.
6. Submit before deadline, then verify public links and preserve access through judging.

**This file is a gate, not evidence that incomplete checks passed.** A security scan or success screenshot does not guarantee a bug-free system or a prize.
