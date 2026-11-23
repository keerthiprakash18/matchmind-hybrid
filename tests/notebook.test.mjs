import test from 'node:test';
import assert from 'node:assert/strict';
import { filterObservations } from '../src/notebook.mjs';
import { exportSessionJson, importSessionJson, MAX_SESSION_FILE_BYTES } from '../src/session.mjs';

const events=[
  {id:'a',minute:12,team:'Us',type:'Shot',note:'Cutback attempt.'},
  {id:'b',minute:38,team:'Opponent',type:'Wide overload',note:'Overload on the left.'},
  {id:'c',minute:45,team:'Us',type:'Ball recovery',note:'Central interception.'}
];
const original={schemaVersion:2,home:'Our club',away:'Opposition',events};

test('search is presentation-only and filters by team, type, note and minute', () => {
  assert.deepEqual(filterObservations(events,{search:'left'}).map(e=>e.id),['b']);
  assert.deepEqual(filterObservations(events,{search:'45'}).map(e=>e.id),['c']);
  assert.deepEqual(filterObservations(events,{search:'CENTRAL',team:'Us',type:'Ball recovery'}).map(e=>e.id),['c']);
  assert.deepEqual(filterObservations(events,{team:'Opponent',type:'Shot'}),[]);
  assert.equal(events.length,3);
});

test('session JSON round trip preserves user notes but never appends model output', () => {
  const json=exportSessionJson(original);
  assert.deepEqual(importSessionJson(json),original);
  assert.doesNotMatch(json,/inferenceSource|firebase|privacyAcknowledged|apiKey|AI analysis/);
});

test('import rejects malformed event shapes instead of fabricating event IDs or times', () => {
  const variants=[
    {...events[0],minute:'12'},
    {...events[0],minute:null},
    {...events[0],minute:12.4},
    {...events[0],id:'../../malicious'},
    {...events[0],id:null},
    {...events[0],team:'Some team'},
    {...events[0],note:'   '}
  ];
  for(const event of variants) {
    assert.throws(()=>importSessionJson(JSON.stringify({...original,events:[event]})));
  }
  assert.throws(()=>importSessionJson(JSON.stringify({...original,events:[events[0],events[0]]})));
  assert.throws(()=>importSessionJson(JSON.stringify({...original,schemaVersion:99})));
  assert.throws(()=>importSessionJson('not json'));
});

test('import refuses oversized JSON before parsing', () => {
  assert.throws(()=>importSessionJson(' '.repeat(MAX_SESSION_FILE_BYTES+1)));
  assert.throws(()=>importSessionJson(null));
});
