import test from 'node:test';
import assert from 'node:assert/strict';
import {recordInferenceRun,MAX_RECENT_ROUTES} from '../src/inferenceHistory.mjs';

const receipt={requested:'hybrid',source:'on_device',durationMs:5501,loggedEvents:6,citedEvents:5};

test('comparison records only trusted route metadata and never user notes',()=>{
  const result=recordInferenceRun([], {...receipt,prompt:'sensitive note',output:'model output',apiKey:'private'});
  assert.deepEqual(result,[{requested:'hybrid',source:'on_device',durationMs:5501,loggedEvents:6,citedEvents:5}]);
  assert.ok(!JSON.stringify(result).includes('sensitive note'));
  assert.ok(!JSON.stringify(result).includes('private'));
});
test('comparison is newest-first, bounded to three and never assumes a route',()=>{
  let history=[];
  for(let i=0;i<8;i++) history=recordInferenceRun(history,{...receipt,durationMs:1000+i,source:i%2?'in_cloud':'untrusted'});
  assert.equal(history.length,MAX_RECENT_ROUTES);
  assert.equal(history[0].durationMs,1007);
  assert.equal(history[0].source,'in_cloud');
  assert.equal(history[1].source,'UNREPORTED');
});
test('invalid and impossible source receipts fail closed',()=>{
  for(const row of [
    {...receipt,requested:'unknown'},
    {...receipt,durationMs:-3},
    {...receipt,loggedEvents:51},
    {...receipt,citedEvents:7},
    {...receipt,source:null}
  ]) assert.throws(()=>recordInferenceRun([],row),/Invalid inference metadata/);
});
