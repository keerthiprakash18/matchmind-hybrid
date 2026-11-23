/** Deterministic cross-check of time references in AI text against logged observations.
 * This detects unlogged timestamps, not the truth of a tactical claim.
 */
export function analyzeEvidence(text, events) {
  const logged = new Set(events.map(e => Number(e.minute)).filter(n => Number.isInteger(n) && n >= 0 && n <= 120));
  const referenced = new Set();
  const pattern = /\b(?:minute\s+|min\.?\s+|at\s+(?:minute\s+)?)(\d{1,3})\b|\b(\d{1,3})\s*(?:min(?:ute)?s?\b|['’′])/gi;
  const input = String(text ?? '');
  for (const match of input.matchAll(pattern)) {
    const minute = Number(match[1] ?? match[2]);
    if (Number.isInteger(minute) && minute <= 120) referenced.add(minute);
  }
  const cited = [...referenced].filter(minute => logged.has(minute)).sort((a,b)=>a-b);
  const unlogged = [...referenced].filter(minute => !logged.has(minute)).sort((a,b)=>a-b);
  return {
    loggedEventCount: events.length,
    linkedEventCount: events.filter(e => cited.includes(Number(e.minute))).length,
    citedMinutes: cited,
    unloggedMinutes: unlogged
  };
}
