import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveSignals } from '../src/signals.mjs';
import { sampleEvents } from '../src/logic.mjs';

test('tactical signals are grounded in actual recorded event types',()=>{
 const signals=deriveSignals(sampleEvents);
 assert.equal(signals.length,4);
 assert.deepEqual(signals.find(x=>x.id==='wide-overload').minutes,[21]);
 assert.deepEqual(signals.find(x=>x.id==='press-broken').minutes,[35]);
 assert.equal(signals.find(x=>x.id==='recovery').count,2);
 assert.deepEqual(signals.find(x=>x.id==='chance').minutes,[30]);
});
test('missing observations cannot generate tactical findings',()=>{
 assert.deepEqual(deriveSignals([]),[]);
 assert.deepEqual(deriveSignals([{team:'Us',type:'Shot',minute:99}]),[]);
 assert.deepEqual(deriveSignals(undefined),[]);
});
test('duplicated times are not treated as distinct timestamps',()=>{
 const signals=deriveSignals([{team:'Opponent',type:'Wide overload',minute:22},{team:'Opponent',type:'Wide overload',minute:22}]);
 assert.equal(signals[0].count,2);
 assert.deepEqual(signals[0].minutes,[22]);
});
