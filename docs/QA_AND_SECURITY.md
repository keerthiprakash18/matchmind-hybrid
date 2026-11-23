# MatchMind V0.2 — verification and security gates

## Known verified
- In earlier local tests, the original starter had 4/4 unit tests and a production Vite build.
- Latest owner screenshot showed a genuine Firebase AI Logic generated response in Cloud mode.
- Firebase App Check Web registration was completed in Firebase console.

## New work — must verify after this PR
- Unit tests (including session validation, CSV formula escaping, error redaction), TypeScript build, browser desktop/mobile layout.
- Test on Chrome 139+ with on-device model; record a real `ON_DEVICE` result before saying it works offline.
- Verify cloud inference separately and prove hybrid fallback when model is unsupported.
- Test 1-50 events, empty/invalid notes, restore session and clear confirmation, download CSV/brief, no stale AI result after edits.
- Audit dependency CVEs. Current branch overrides vulnerable `@grpc/grpc-js@1.9.16` with patched `1.13.6`, and uses a registry-sourced SHA-512 integrity in `package-lock.json`. **Pending: rerun strict npm audit and confirm npm ci + Firebase build success in CI.** Never suppress failures or use `npm audit fix --force` (it can break Firebase hybrid SDK).
- Verify production `VITE_ENABLE_APP_CHECK_DEBUG=false`. Previously exposed debug tokens in screenshots should be revoked. Keep them out of any versioned source or public demo.
- Firebase env vars in Vercel must be set in the platform dashboard, not in GitHub; `.env` must remain untracked.
- App Check protects API usage but does not replace anti-abuse, quotas or ownership validation for future stored accounts.
- Redact internal URLs, prompt text, tokens and user-supplied data in public logs.

## Go/no-go gates
1. CI green: unit tests + TypeScript/Vite build + dependency audit.
2. App Check production-domain reCAPTCHA Enterprise attestation verified.
3. Real AI cloud response and on-device response on supported hardware, with SDK-reported inference source.
4. Mobile and keyboard interaction QA.
5. Public working demo and open-source repository only once reviewed; complete demo video, rules and disclosure.

No production deployment, paid billing activation or GitHub main merge should occur before the user has reviewed those gates.
