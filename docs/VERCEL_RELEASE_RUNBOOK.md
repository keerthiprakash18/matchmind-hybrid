# MatchMind — production deployment and rollback runbook

## Preflight (non-negotiable)
1. Review and merge only a **green** GitHub PR. Do not deploy an unreviewed draft to production.
2. Run `npm ci`, `npm test`, `npm run build`, `npm audit --audit-level=high`; verify GitHub Chromium desktop/mobile and accessibility gates.
3. Inspect `git ls-files` for accidental `.env`, OAuth tokens, App Check debug token, private keys, credentials or copied browser data. `.env.example` must contain only empty placeholders.
4. Revoke debug tokens that appeared in screenshots; ensure the production build never activates debug attestation.
5. Keep the original Firebase project configuration and separate FC ARENA systems entirely untouched.

## Vercel setup
- Team: use the connected Vercel team designated by the owner; **never automatically select a different team**.
- Import GitHub repo `keerthiprakash18/matchmind-hybrid`; framework **Vite**, root `./`, production branch `main`.
- Build command `npm run build`; output `dist`. The repository already includes `vercel.json` with baseline security headers.
- Add the following **public Firebase web config** in **Vercel Environment Variables**, not in GitHub: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_APPCHECK_SITE_KEY`.
- Set `VITE_ENABLE_APP_CHECK_DEBUG=false` for **Production and Preview**. Never paste a Firebase App Check debug token or service-account key into Vercel frontend environment variables.
- Vercel environment changes require a redeploy to apply to Vite's baked build output.
- In Google Cloud reCAPTCHA Enterprise / Firebase App Check, register the **actual production hostname**, verifying the correct domain and Web App registration. ReCAPTCHA public site keys are visible in the browser by design.
- Use Firebase AI Logic App Check enforcement with actual production reCAPTCHA Enterprise verification, not development debug attestation.
- Do not enable paid services or billing plans without user authorization. Verify Spark quotas and free-tier limitations.

## Browser acceptance checklist
- Load deployed HTTPS site in a fresh normal Chrome session and a mobile browser.
- No console errors, missing fonts/icons, horizontal overflow or inaccessible mobile navigation.
- **Cloud** generates actual evidence-based advice and SDK-reported `CLOUD`; check App Check is genuinely valid on deployed domain.
- On compatible Chrome desktop with the installed local model, **On-device** returns SDK-reported `ON_DEVICE`.
- **Hybrid** prefers `ON_DEVICE` on compatible Chrome desktop; on unsupported device/browser, returns SDK-reported `CLOUD`. If fallback cannot be verified, do not claim it was.
- Record the actual request mode, source and duration receipt; do not disclose developer tokens.
- Verify Save/Restore, Clear, CSV, briefing export, changing observation invalidates prior AI answer.
- Verify test page works without account/login and remains accessible until judging ends.
- Run Lighthouse and manual WCAG keyboard testing (automated axe alone is insufficient).

## Release decision
**Go** only if build, audit, browser a11y tests and actual deployed cloud inference pass, with key limitations disclosed. **No-go** if App Check rejects the deployed domain, Firebase credentials are exposed, or the app is inaccessible to judges.

## Rollback
Revert the GitHub merge or use Vercel deployment rollback after checking the target team/project and source commit. This app currently has no server-side match data migrations, so rollback should not touch databases. Restore a known-good deployed version and verify the public URL in a fresh session.

## Submission deadline
Official deadline: **November 30, 2026, 2:00 p.m. PST** (**December 1, 2026, 3:30 a.m. IST**). Submit earlier to allow verification. Judges' test access must remain available through the judging period.
