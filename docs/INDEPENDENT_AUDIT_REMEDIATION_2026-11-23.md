# MatchMind — independent V2 audit remediation and release gates
Audit baseline: `3f35bc0ba15f6d06bd14d31f96d3139e164a504a` (23 Nov 2026). Review original `docs/RELEASE_ACCEPTANCE.md` and PR #8.

## Fixes implemented on this branch
1. **WCAG color contrast:** production-configured `.ready-badge` and the generated Limitation index use darker foregrounds, preserving the visual design. Independent axe scans cover 320/360/390/570/768/1024/1440px AND a real generated report after production release.
2. **Analytic honesty:** a bucket with zero recorded events displays a zero-height bar. Regression test adds a blank match and a single event and verifies the geometry.
3. **Enforced CSP:** `vercel.json` now sets `Content-Security-Policy` with restrictive scripts, no objects, no framing, same-origin base, and explicit Firebase/reCAPTCHA/Google Fonts resources. Verify Firebase App Check, local Nano and fallback in real browsers after release; CSP is a compatibility-sensitive defense in depth.
4. **Fail-closed build:** Vercel `buildCommand` points at `npm run release:verify` (unit tests → source security gate → production dependency audit → TypeScript/Vite build). Any failure prevents that Vercel deployment from succeeding. Existing GitHub Chromium/WCAG tests stay active. **Limit:** the custom command does not by itself require GitHub Playwright jobs to finish before domain aliasing; configure Required Deployment Checks in Vercel for that stronger guard.
5. **Independent regression:** read-only GitHub Actions audit checks public files, XSS-like input, CSV injection, invalid/oversized JSON, consent invalidation, 50-event limit, responsive design, WCAG across breakpoints and one authorized production Hybrid inference. A failing report does not automatically mean an exploit.

## Firebase owner-only quota / billing sign-off — NOT VERIFIED by repository access
The code alone cannot reveal project-level or provider-specific quotas, App Check metrics, IAM, Google Cloud billing, API key restrictions or budget alerts. No credentials should be pasted into chat or committed.

To verify, sign in with project **Owner/Editor** privileges in Firebase/Google Cloud Console. Record screenshots **without tokens, payment information or secrets**.

- Firebase Console → **Security → App Check → APIs**: Firebase AI Logic requests should be enforced; check metrics for rejected/unverified traffic. Review reCAPTCHA Enterprise allowed production domains; never add a production reCAPTCHA key to localhost.
- Google Cloud Console → **APIs & Services → Enabled APIs & Services → Firebase AI Logic API → Quotas & System Limits**. Filter to **Generate content requests** and the relevant region. Google's documented default *per-user* quota is **100 requests/min**, NOT evidence of this project's current setting. Confirm the actual current quota and choose an appropriately lower one for a solo hackathon, considering latency and legitimate judge traffic. Also check Gemini provider RPM/RPD/TPM/TPD; its model limits can be more restrictive.
- Google Cloud Console → **APIs & Services → Credentials**: for the web API key, check HTTP referrer/application restrictions and API restriction allowlist (Firebase AI Logic plus required Firebase services).
- Google Cloud Console → **Billing → Budgets & alerts**: verify budget, alert recipients and thresholds; budget alerts alone do not cap spend. Check whether a supported spend cap exists for the applicable Google service/project.
- Firebase Console → **AI Logic → Monitoring**: inspect 4xx/429 error rates, latency, calls and token usage. Cloud console and quota policies must be checked by an authorized human account; an SDK client or CI test cannot prove this state.
- Avoid turning on Firebase Authentication just to pass these checks; the project intentionally has a no-login demo. Evaluate whether authenticated-users mode is compatible before changing it.

**Owner-only sign-off needed**: quota screenshot, API restriction screenshot, App Check enforcement screenshot, budget evidence; no sensitive identifiers. If unavailable, report Firebase quotas as *unverified* and do not claim the entire security audit finished.

## Required GitHub/Vercel configuration (project settings, not repository code)
The Vercel build gate is active in source. For stronger promotion ordering, visit Vercel Project → Settings → Build and Deployment → **Deployment Checks** and add/require the matching Node test/typecheck/checks for Production. As of Apr 2026, Native Deployment Checks can block production aliasing; users must enable the required check in project settings (a `package.json` script alone does not automatically register it).
If enabled, require both source/build and post-build browser checks as appropriate, then verify an intentionally failing commit cannot become public. GitHub branch protection/rulesets should additionally require the key GitHub Actions jobs and block direct pushes. This repository's current owner-token does not have verified protection-settings permissions. Do not state these platform controls are configured unless Console confirms them.

## Final release verification
- exact PR head: Node tests, TypeScript/Vite production build, independent Chromium/axe across all widths, dependency audit, source security.
- Vercel project reports Production READY for the merged commit.
- Production header includes enforced CSP; verify headers from public HTTPS.
- Production demo loads, real Firebase App Check Hybrid → Cloud fallback generates a report, no CSP errors, genuine AI receipt and Markdown export; independently reproduce ON DEVICE on compatible Chrome with installed Nano.
- Run the production independent-audit workflow; accept only 0 axe issues, 0 overflow, 0 incorrect chart bucket bars. No real-load or intrusive security test is authorized.
- Keep previous production deployment available for rollback.

## References
- https://firebase.google.com/docs/ai-logic/quotas
- https://firebase.google.com/docs/ai-logic/production-checklist
- https://firebase.google.com/docs/ai-logic/app-check
- https://vercel.com/docs/deployment-checks
- https://vercel.com/changelog/native-deployment-checks
