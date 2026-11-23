# MatchMind security and responsible disclosure

## Security model
MatchMind is a client-side React app with Firebase AI Logic and Firebase App Check. It does **not** expose a custom server, user-account database or administrative API. Only public Firebase Web configuration and the public reCAPTCHA Enterprise site key appear in the frontend build. Private service-account credentials and App Check debug tokens must **never** be committed.

- Production Firebase App Check uses reCAPTCHA Enterprise and the registered hostname. **Do not** bypass App Check to make a demo work.
- `VITE_ENABLE_APP_CHECK_DEBUG=false` is required in deployed environments; debug token mode is restricted in code to local development.
- Source changes run unit tests, TypeScript/Vite build, high-severity dependency audit, static secret-file hygiene checks, desktop/mobile Chromium smoke checks and automated WCAG checks.
- Match observations are escaped by React, limited in length/count and not rendered with `dangerouslySetInnerHTML`. CSV export guards against spreadsheet formula injection.
- Hybrid and Cloud require an explicit user acknowledgment that observations may leave their device.

## Known limitations
- Browser SDK and app-level checks do not replace Cloud-side quotas, billing controls or network abuse monitoring.
- Automated scans are not a proof of zero vulnerabilities. Browser extensions, cross-origin network issues, model outputs and generated suggestions cannot be guaranteed secure or correct.
- The synthetic demo is not appropriate for storing personal or sensitive records. Availability of Gemini Nano varies by browser and device.
- Production App Check is affected by legitimate anti-bot risk scoring and quotas.

## Reporting a vulnerability
Please avoid posting exploit details, tokens or private logs in a public GitHub issue. Contact the maintainer privately through the GitHub profile, if a private channel is available, and provide the affected URL, impact and minimal reproduction. Do not run invasive tests against the live Firebase project without authorization.

## Release verification
- Current dependency audit: GitHub Actions passed on V0.2 candidate, with `@grpc/grpc-js` pinned to a patched compatible release.
- Latest deployment must be tested under an unauthenticated browser, with real App Check attestation and no debug credentials.
- See [release acceptance](docs/RELEASE_ACCEPTANCE.md), [privacy](PRIVACY.md), and [judge testing](docs/JUDGE_TESTING.md).
