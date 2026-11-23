/** Safe, actionable inference errors; never surface raw URLs, keys, tokens or prompts. */
export function friendlyInferenceError(error) {
  const text = error instanceof Error ? error.message : String(error ?? '');
  if (/app check|attestation|appcheck|recaptcha/i.test(text)) return 'App Check authorization failed. Verify the debug token for this Web App locally; never share debug credentials.';
  if (/404|no longer available|model.*not found/i.test(text)) return 'AI model unavailable. Verify the configured Firebase AI Logic model is currently supported.';
  if (/429|quota|resource.exhausted|rate.limit/i.test(text)) return 'Request limit reached. Review free-tier quota, then retry later.';
  if (/offline|network|fetch failed|failed to fetch/i.test(text)) return 'Network unavailable. On-device mode requires a compatible Chrome model already installed.';
  if (/on.device|device.*unsupported|model.*download|not available/i.test(text)) return 'On-device AI is not ready. Check Chrome support or select Cloud mode.';
  return 'AI request failed. Check browser diagnostics for the error code without sharing private observations or tokens.';
}
