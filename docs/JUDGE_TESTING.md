# MatchMind — Judge testing guide (English)

## Fast route: 90-second evaluation
1. Open the **deployed HTTPS link** provided on the Devpost form (not localhost).
2. The workspace starts with **clearly labeled synthetic demo events**. No account, personal data or paid API key required.
3. Inspect the dashboard and the evidence-frequency chart; these show **counts of manually logged observations**, not live telemetry, possession or match tracking.
4. Choose **Cloud**, acknowledge the on-screen cloud-transfer notice, select *Halftime briefing*, and click **Generate match intelligence**. Read the suggested adjustments and the **Inference & evidence receipt**. Confirm the actual source says **CLOUD**.
5. Add or remove an observation; the previous AI answer should be cleared automatically. Generate a new analysis to demonstrate evidence-linked updates.
6. Export the coaching brief or observations CSV. Use Save/Restore to test voluntary browser-tab storage.

## Chrome desktop — Gemini Nano and Hybrid
- Native on-device inference requires a compatible **Chrome desktop 139+**, sufficient disk/storage and the multimodal Prompt API flag `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` enabled. Initial model download is device-specific.
- Choose **On-device**. Generate and verify that the Firebase SDK reports **ON DEVICE** in the result, not just that a local model is detected.
- Choose **Hybrid**, acknowledge the possible cloud transfer, and generate. On a prepared Chrome desktop with a local model, it should prefer local; inspect the actual reported source.
- To verify fallback, use a separate browser/device without the supported Prompt API (for example Edge), with production App Check working. Hybrid should report **CLOUD**; this demonstration must actually be run and recorded. Merely testing Cloud mode is *not* proof of fallback.
- The evidence receipt shows **model route, elapsed time and observed timestamp coverage**. Timestamp matching is *not* a claim that model reasoning is factually verified.

## Capabilities and boundaries
- No live-match API, video analysis, wearable sensors, user registration or backend match database.
- Manual notes may be incomplete. Suggestions can be wrong; the human coach makes the final tactical decision.
- App Check can reject unregistered sites/profiles. For public deployment use real reCAPTCHA Enterprise attestation and a registered production hostname; **do not publish developer debug tokens or screenshots revealing them**.
- Inference can consume Firebase / Gemini quota. There is no guarantee of real-time availability.
- Remote/on-device availability depends on browser, device and connectivity. Only say "works offline" for a tested local inference on a browser where the model is already installed.
- The code is open-source under the repository license. No affiliation with football clubs or FC ARENA.

## URLs and screenshots to add only after deployment
- Public demo: https://matchmind-hybrid.vercel.app/ (served on Vercel, no authentication gate)
- Source repository: https://github.com/keerthiprakash18/matchmind-hybrid
- 3-minute YouTube demo: **PENDING genuine recording and public upload**
- Evidence screenshots: **PENDING — redact all tokens and credentials**

The test app should remain publicly accessible through the end of the judging period (December 16, 2026). Verify it again after the final submission.
