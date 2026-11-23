import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSession, escapeCsvCell, exportEventsCsv, exportBrief, eventDistribution } from '../src/session.mjs';
const event={id:'e1',minute:21,team:'Opponent',type:'Wide overload',note:'2v1 on the left.'};
test('safe explicit browser session schema',()=>{
  const s=validateSession({schemaVersion:2,home:' H '.repeat(30),away:'Away',events:[event]});
  assert.equal(s.home.length,42);
  assert.equal(s.events.length,1);
  assert.throws(()=>validateSession({schemaVersion:2,home:'H',away:'A',events:Array(51).fill(event)}));
  assert.throws(()=>validateSession({schemaVersion:2,home:'H',away:'A',events:[{...event,minute:121}]}));
  assert.throws(()=>validateSession({schemaVersion:2,home:'H',away:'A',events:[event,event]}));
});
test('CSV formula injection is prevented',()=>{
  assert.match(escapeCsvCell('=HYPERLINK("x")'),/"'=HYPERLINK/);
  assert.match(escapeCsvCell(' +SUM(1,2)'),/"' \+SUM/);
  assert.match(exportEventsCsv([{...event,note:'=1+1'}]),/"'=1\+1"/);
});
test('brief carries provenance and does not misrepresent inference',()=>{
  const brief=exportBrief({home:'H',away:'A',events:[event],goal:'Halftime briefing',output:'Suggestion.',source:'UNREPORTED'});
  assert.match(brief,/not a live match feed/);
  assert.match(brief,/Coach review required/);
  assert.match(brief,/UNREPORTED/);
});
test('timelines count actual logged events only',()=>{
  assert.deepEqual(eventDistribution([{minute:0},{minute:29},{minute:30},{minute:91},{minute:119}]),[2,1,0,2]);
});
