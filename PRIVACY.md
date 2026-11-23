# MatchMind privacy notice (2026)

MatchMind is an independent football match-notebook demo. This repository contains a client-side web app, not a hosted user database.

## Data you enter
- Match team names, event minutes, event types and free-text observations are entered in your browser. The default example contains **fictional match data**.
- Your changes live in the active browser tab's in-memory state. Clicking **Save session** stores a copy in that tab's browser `sessionStorage`; it is not uploaded to MatchMind's own database. **Restore** reloads it; **Clear notes** deletes the tab-saved copy and in-memory notes after confirmation.
- Download / Copy actions export text to your local device or clipboard. You control where that exported material is stored.

## AI requests and third parties
- **On-device mode** asks a supported Chrome desktop's model to run inference locally. Network activity for application loading, SDK setup and App Check may still occur; do not assume that the entire site is functional offline.
- **Cloud mode** sends the current observations to Firebase AI Logic and the configured Gemini cloud backend. **Hybrid mode** prefers on-device inference but may transmit the observations to Gemini cloud when falling back.
- Cloud and Hybrid require explicit browser-session acknowledgment before generation. Do not enter real player names, contact details or other sensitive personal information into this demonstration.
- Google's Firebase/Gemini services and Vercel hosting may process operational request metadata according to their applicable policies. MatchMind currently has no optional application-level analytics, custom tracking pixel or account database.

## Deletion, accuracy and control
- Close your browser tab to end the in-memory workspace and tab session; or use **Clear notes** to clear them immediately. Exports saved elsewhere must be deleted separately.
- AI suggestions can be mistaken. MatchMind's evidence receipt checks cited timestamps, **not** whether tactical statements are factually true. A human coach should review every recommendation.

## Scope
This statement describes the application as released from the repository in November 2026, not any third-party browser extension or platform feature. For privacy concerns, contact the project maintainer through GitHub.
