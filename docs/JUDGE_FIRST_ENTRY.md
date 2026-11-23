# MatchMind judge-first entry and authentication decision

## Decision: No mandatory login
The official #BuildHybridAI 2026 rules **do not require Firebase Authentication**. They require a functional, freely testable project. If an entrant's site is private, login credentials must be given in testing instructions, which introduces friction. Instead, the MatchMind judged experience should run in guest mode with clearly fictional demo data and zero accounts.

This is a design decision, not a claim that Firebase Authentication is unsupported: Authentication would become useful later for multi-device session sync, saved player rosters, or team collaboration. It is not needed for a browser-tab session with no database.

## Recommended judge experience
1. **First load (< 5 seconds):** see value proposition and clearly labeled synthetic match observations, without registration.
2. **Explore the demo:** a single control takes the judge to the Hybrid AI studio. The currently loaded fictional match remains intact.
3. **Start blank match:** confirm before replacing any unsaved observations; restore from the tab-saved session remains possible.
4. **Load demo match:** bring back six documented fictional observations, after explicit confirmation.
5. **Privacy:** On-device does not require cloud consent. Cloud and Hybrid must disclose possible transfer and require acknowledgment.
6. **Provenance:** never guess a model route; display actual Firebase SDK inferenceSource and a timestamp-only evidence receipt.
7. **Production:** verify the deployment in an incognito session. A Vercel login challenge is *deployment protection*, not the app's authentication screen. For final judging, make the production demo accessible without Vercel login. Keep App Check enforced.

## Future accounts (not necessary for competition)
When teams actually need cross-device history, add **optional** Firebase Authentication and carefully scoped Firestore rules with coach/team membership authorization, account deletion and retention controls. Do not add sign-in solely to make the demo look more complex.

## Release gate
Do not claim public/judge access until a signed-out incognito Chrome window can open the production HTTPS URL and Cloud + Hybrid inference works after valid production App Check attestation. Record the test results. The owner must keep the deployed site live until judging ends.

Sources: https://firebasehybridaihackathon.devpost.com/rules
