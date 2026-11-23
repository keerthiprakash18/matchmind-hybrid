# MatchMind — final contest handoff (November 23, 2026)

## Completed and confirmed

| Gate | Result |
| --- | --- |
| V0.2 code integration | PR #3 merged into PR #2, then PR #2 merged into `main`. |
| Review branch unit/build/security/browser gates | All three CI jobs passed on both reviewed PR heads. |
| Public web deployment | Vercel `main` Production build READY; public hostname https://matchmind-hybrid.vercel.app/. |
| Vercel authentication | Production publicly accessible. Preview deployments require Vercel authentication. |
| Firebase production cloud | Real Cloud response on previous deployed build confirmed by owner screenshot, with real CLOUD SDK source and App Check enforced. |
| Chrome desktop local model | Real ON_DEVICE response confirmed by owner screenshot. |
| Hybrid device-preferred behavior | Real Hybrid → ON_DEVICE response confirmed by owner screenshot. |
| No custom login or database | Guest-first, fictional demo data and explicit browser-tab session save. |
| Repo source | Full React/Vite app + Firebase AI Logic + tests + MIT license in `main`. |
| Documentation | README, SECURITY, PRIVACY, judge guide, English script, and polished Devpost copy. |

## Honest remaining blockers

- **GitHub repository visibility remains PRIVATE.** Owner must switch this existing repo to Public at https://github.com/keerthiprakash18/matchmind-hybrid/settings. Before publication, confirm earlier exposed App Check debug tokens are revoked and no credentials appear in any commit or screenshots. No GitHub repository-settings write action is available in the connected first-party GitHub integration.
- **Public YouTube video remains missing.** Record actual browser footage of real Cloud and ON_DEVICE responses, with a <=3-minute English narration or English subtitles. Never fabricate Gemini responses or route badges.
- **Devpost entry has NOT been submitted.** Submission requires the entrant to sign into Devpost, accept contest terms, supply a real YouTube URL and verify eligibility; do not claim completion.
- **Hybrid → Cloud fallback remains UNVERIFIED.** Separate Cloud-only success proves cloud inference but not fallback. A controlled production test file and workflow exist in `.github/workflows/hybrid-fallback-audit.yml`; its real-world result has not been verified yet.
- **Final merged production commit AI run has not been manually re-verified.** Earlier owner screenshots verified the prior production build; Vercel reports newest main deployment READY. Use ordinary unauthenticated browser if needing final-release screenshots.

## Required order
1. Revoke screenshot-exposed Firebase App Check debug tokens; leave production App Check enforcement enabled and Vercel debug flag false.
2. Make GitHub repo public and check MIT license is recognized at the top.
3. Record/edit actual demonstration video from the current live HTTPS site; use `docs/FINAL_DEMO_NARRATION.md` and keep the duration <= 3 minutes.
4. Upload the video to YouTube as Public. Provide correct Devpost URL, GitHub URL and video URL.
5. In Devpost, select Web/Chrome, paste sections from `docs/DEVPOST_READY_COPY.md`, confirm the original-work and eligibility rules, and submit before 2026-11-30 14:00 PST / 2026-12-01 03:30 IST.
6. Verify public repo, video and app in signed-out sessions; preserve availability until judging ends 2026-12-16.

## Do not misrepresent
The product is a grounded coaching-assistant prototype, not a real-match API or a clinical-grade decision system. AI can hallucinate, and the evidence receipt checks timestamp overlap only. App Check does not make the app abuse-proof. Automated passes do not guarantee a zero-defect project or a prize.
