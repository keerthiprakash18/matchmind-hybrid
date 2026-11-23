/** Browser-tab session helpers. No storage is used without user action. */
import { summarize } from './logic.mjs';
import { deriveSignals } from './signals.mjs';
export const SESSION_KEY = 'matchmind-session-v2';
export const MAX_EVENTS = 50;
export const MAX_NOTE_LENGTH = 240;
const ALLOWED_TYPES = new Set(['Shot','Big chance','Ball recovery','Turnover','Wide overload','Press broken']);
const safeText = (value, max) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
export function normalizeSessionEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) return null;
  const minute = event.minute;
  if (typeof minute !== 'number' || !Number.isInteger(minute) || minute < 0 || minute > 120) return null;
  if (event.team !== 'Us' && event.team !== 'Opponent') return null;
  if (!ALLOWED_TYPES.has(event.type)) return null;
  const note = typeof event.note === 'string' ? safeText(event.note,MAX_NOTE_LENGTH) : '';
  if (!note) return null;
  // Never create new IDs while importing untrusted files: broken references must be rejected.
  if (typeof event.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(event.id)) return null;
  const id = event.id;
  return {id, minute, team:event.team, type:event.type, note};
}
export function validateSession(session) {
  if (!session || typeof session !== 'object' || session.schemaVersion !== 2 || !Array.isArray(session.events) || session.events.length > MAX_EVENTS) throw new Error('Invalid session version or event count.');
  if (typeof session.home !== 'string' || typeof session.away !== 'string') throw new Error('Invalid team labels.');
  const events=session.events.map(normalizeSessionEvent);
  if(events.some(item=>item===null)) throw new Error('Session contains an invalid event.');
  const ids=new Set(events.map(item=>item.id));
  if(ids.size!==events.length) throw new Error('Session contains duplicate event IDs.');
  return {schemaVersion:2,home:safeText(session.home,42)||'Our team',away:safeText(session.away,42)||'Opposition',events:events.sort((a,b)=>a.minute-b.minute)};
}
export function escapeCsvCell(value) {
  let text=String(value ?? '').replace(/[\u0000-\u001f\u007f]/g,' ');
  if(/^\s*[=+\-@]/.test(text)) text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
}
export function exportEventsCsv(events) {
  const rows=[['Minute','Team','Event','Observation'],...events.map(e=>[e.minute,e.team,e.type,e.note])];
  return rows.map(row=>row.map(escapeCsvCell).join(',')).join('\r\n')+'\r\n';
}
export function exportBrief({home,away,events,goal,output,source}) {
  const lines=['# MatchMind · Coaching brief','','Fixture: '+safeText(home,42)+' vs '+safeText(away,42),'Focus: '+safeText(goal,40),'Inference source: '+(source||'Not verified'),'Data provenance: User-entered notes, not a live match feed.','','## Logged events',''];
  for(const event of events) lines.push(event.minute+"' · "+event.team+" · "+event.type+": "+safeText(event.note,240));
  const counts=summarize(events);
  lines.push('','## Recorded event counts (not live match statistics)','',
    'Our shots: '+counts.shots,
    'Our big chances: '+counts.bigChances,
    'Our recoveries: '+counts.recoveries,
    'Opponent threats logged: '+counts.opponentThreats,
    '',
    '## Evidence-led coaching review questions','');
  const review=deriveSignals(events);
  if(!review.length) lines.push('Not enough logged events for rule-based review questions.');
  for(const signal of review) {
    lines.push('- '+safeText(signal.title,100)+' ('+signal.minutes.join("', ")+"'): "+safeText(signal.detail,300));
  }
  lines.push('','## AI analysis','',output||'Not generated. Your observation summary and review questions above do not require AI.','','AI suggestions are not verified match facts. Coach review required.','');
  return lines.join('\n');
}
export function eventDistribution(events) {
  return [0,30,60,90].map(start=>events.filter(e=>e.minute>=start && e.minute<=(start===90?120:start+29)).length);
}

/** Explicit and portable export. AI outputs and consent are never included. */
export function exportSessionJson(session) {
  return JSON.stringify(validateSession(session), null, 2) + '\n';
}

/** Hard cap before JSON parsing limits accidental and hostile oversized imports. */
export const MAX_SESSION_FILE_BYTES = 128 * 1024;
export function importSessionJson(json) {
  if (typeof json !== 'string' || new TextEncoder().encode(json).length > MAX_SESSION_FILE_BYTES) {
    throw new Error('Invalid or oversized session file.');
  }
  return validateSession(JSON.parse(json));
}
