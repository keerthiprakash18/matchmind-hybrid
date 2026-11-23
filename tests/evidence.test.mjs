import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeEvidence } from '../src/evidence.mjs';

const notes=[{minute:8},{minute:21},{minute:41}];
test('checks the model citations against recorded event minutes',()=>{
 const evidence=analyzeEvidence('At minute 8 a recovery; (21 min) a wide overload; at 99\u2032 a pass. 41\' was observed.', notes);
 assert.deepEqual(evidence.citedMinutes,[8,21,41]);
 assert.deepEqual(evidence.unloggedMinutes,[99]);
 assert.equal(evidence.linkedEventCount,3);
});
test('ignores list numbering and tactics unrelated to event timestamps',()=>{
 const evidence=analyzeEvidence('1. Keep a narrow 4-4-2 shape. 2. Provide 2v1 cover. No timestamp referenced.', notes);
 assert.deepEqual(evidence.citedMinutes,[]);
 assert.deepEqual(evidence.unloggedMinutes,[]);
});
test('handles repeated references and does not claim semantic verification',()=>{
 const evidence=analyzeEvidence('minute 8, minute 8, at minute 33', [{minute:8},{minute:8},{minute:11}]);
 assert.equal(evidence.linkedEventCount,2);
 assert.deepEqual(evidence.unloggedMinutes,[33]);
});
