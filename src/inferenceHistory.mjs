/** Transient SDK-provenance comparisons for a single unchanged notebook.
 * Stores no user-entered notes, prompt, model answer or personal identifiers.
 */
export const MAX_RECENT_ROUTES = 3;
export function recordInferenceRun(history, receipt) {
  if (!Array.isArray(history) || !receipt ||
      !['hybrid','local','cloud'].includes(receipt.requested) ||
      typeof receipt.source !== 'string' ||
      !Number.isFinite(receipt.durationMs) || receipt.durationMs < 0 ||
      !Number.isInteger(receipt.loggedEvents) || receipt.loggedEvents < 0 || receipt.loggedEvents > 50 ||
      !Number.isInteger(receipt.citedEvents) || receipt.citedEvents < 0 ||
      receipt.citedEvents > receipt.loggedEvents) {
    throw new Error('Invalid inference metadata');
  }
  // Missing provider provenance must stay unverified; never guess the source.
  const source=['on_device','ON_DEVICE','in_cloud','IN_CLOUD'].includes(receipt.source)
    ? receipt.source : 'UNREPORTED';
  const clean={
    requested:receipt.requested, source,
    durationMs:Math.round(receipt.durationMs),
    loggedEvents:receipt.loggedEvents,
    citedEvents:receipt.citedEvents
  };
  return [clean, ...history].slice(0,MAX_RECENT_ROUTES);
}
