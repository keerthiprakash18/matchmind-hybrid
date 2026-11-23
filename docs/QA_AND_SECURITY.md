# MatchMind V0.2 — verification and security gates

## Known verified
- In earlier local tests, the original starter had 4/4 unit tests and a production Vite build.
- Owner's screenshots showed genuine Firebase AI Logic responses for Cloud, On-device, and Hybrid → On-device (with SDK-reported source). Hybrid → Cloud fallback remains to be proved independently.
- Firebase App Check Web registration was completed in Firebase console. A real cloud response was accepted on the public HTTPS site in Actions 45181931811; this does not certify every device/browser.

## New work — must verify after this PR
- GitHub Actions CI run **45146854933** passed unit tests (including session validation, CSV formula escaping, evidence timestamp matching and error redaction), TypeScript/Vite production build, npm dependency audit, desktop/mobile Chromium smoke and WCAG 2.1 AA automated scans. These are not substitutes for real-world manual testing.
- On-device source was observed on Chrome desktop. **Offline network-disconnected inference has not yet been verified.** Test it separately before making offline claims.
- Verified Hybrid → Cloud on the public production site using a real unsupported-model Chromium run, GitHub Actions 45181931811 (2026-11-23). Retest after any routing or Firebase configuration change.
- Test 1-50 events, empty/invalid notes, restore session and clear confirmation, download CSV/brief, no stale AI result after edits. Confirm Cloud/Hybrid cannot send observations without explicit browser-session consent; On-device should not require cloud consent.
- Audit dependency CVEs. Current branch overrides vulnerable `@grpc/grpc-js@1.9.16` with patched `1.13.6`, and uses a registry-sourced SHA-512 integrity in `package-lock.json`. Strict npm audit, npm ci and TypeScript/Vite production build passed on PR CI 45149336690; rerun on the final PR commit before release. Never suppress failures or use `npm audit fix --force` (it can break Firebase hybrid SDK).
- Verify production `VITE_ENABLE_APP_CHECK_DEBUG=false`. Previously exposed debug tokens in screenshots should be revoked. Keep them out of any versioned source or public demo.
- Firebase env vars in Vercel must be set in the platform dashboard, not in GitHub; `.env` must remain untracked.
- App Check protects API usage but does not replace anti-abuse, quotas or ownership validation for future stored accounts.
- Redact internal URLs, prompt text, tokens and user-supplied data in public logs.

## Go/no-go gates
1. CI green: unit tests + TypeScript/Vite build + dependency audit.
2. App Check production-domain reCAPTCHA Enterprise attestation verified.
3. Real AI cloud response and on-device response on supported hardware, with SDK-reported inference source.
4. Automated mobile/desktop and WCAG 2.1 AA scans are green; **manual** keyboard screen-reader/browser testing and actual responsive design review remain mandatory.
5. Public working demo and open-source repository only once reviewed; complete demo video, rules and disclosure.

No production deployment, paid billing activation or GitHub main merge should occur before the user has reviewed those gates.
