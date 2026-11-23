# MatchMind — competition demo narration (English; target 2:45–2:55)

**Only use real captured footage and SDK provenance.** This script is not proof that all items have been tested. Record final demonstration after production App Check and hybrid fallback have passed.

## 00:00–00:22 — The real problem
**Voice:** "Football coaching happens in real time, often without expensive tracking systems. At halftime, coaches may have only a few handwritten observations and seconds to decide what to change. Meet MatchMind: a football intelligence notebook that turns limited evidence into reviewable tactical suggestions."

**Show:** Opening workspace, title, six clearly labeled fictional observations. Do not show real player data.

## 00:22–00:48 — Capture evidence
**Voice:** "I can record a ball recovery, a wide overload, or a broken press with a timestamp and a short explanation. MatchMind counts only the observations I enter. It never claims to measure possession, live player positions, or an unknown match score."

**Show:** Log one demo observation, evidence-frequency chart, truthful latest recorded minute.

## 00:48–01:18 — Cloud inference and cited evidence
**Voice:** "First, the Cloud path. Before notes leave this browser, MatchMind clearly asks for my acknowledgment. Using Firebase AI Logic and App Check, Gemini generates a halftime briefing with timestamps tied to my recorded events. The coaching decision is still mine."

**Show:** Cloud mode, cloud-transfer consent, Generate, genuine response marked CLOUD. **Do not stage or paste generated output.**

## 01:18–01:53 — On-device inference
**Voice:** "On supported Chrome desktops, the same experience can use Gemini Nano running on the device. I select On-device. This result is not a mock response — the Firebase SDK reports that the inference actually happened on-device."

**Show:** On-device mode, genuine response, ON DEVICE source badge and evidence receipt. Do not claim offline network-disconnected use without a separate offline test.

## 01:53–02:25 — Hybrid and graceful fallback
**Voice, only if both paths are truly demonstrated:** "Hybrid is where MatchMind becomes useful across different devices. With a local model, it prefers on-device analysis. On a device without that model, it falls back to Gemini Cloud. MatchMind displays the actual route instead of guessing."

**Show:** A genuine Hybrid → ON DEVICE response and a separately recorded **Hybrid → CLOUD** response from a browser without Gemini Nano. If fallback has NOT been proven, replace this segment with "Our current demonstration verifies Hybrid's device-first path; cloud fallback is implemented through Firebase and remains under test" and do not show simulated fallback.

## 02:25–02:50 — Accountability and finish
**Voice:** "MatchMind checks whether the minutes cited by the AI are in my notebook and warns when they aren't. It lets me save a tab session and export a coaching brief. Privacy controls, evidence boundaries and a simple workflow make hybrid AI genuinely useful at the touchline — not just another chatbot."

**Show:** Evidence receipt, brief download, front page branding. Finish on the MatchMind wordmark.

## Final recording checklist
- [ ] Full video <= 180 seconds, narration/subtitles in English, public YouTube link.
- [ ] Full desktop recording with no console debug tokens, email, user identifiers or personal projects visible.
- [ ] Show actual SDK ON DEVICE and CLOUD responses and honest Hybrid fallback evidence.
- [ ] The exact deployed HTTPS version has been tested and matches final repository commit.
- [ ] Screenshots use synthetic teams; no copyrighted logos or third-party marks.
- [ ] Verify captions and export links with Chrome in an ordinary profile.
