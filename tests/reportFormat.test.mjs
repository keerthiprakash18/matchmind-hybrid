import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReportBlocks } from '../src/reportFormat.mjs';

test('renders raw local-model markdown as structured heading, bullet and paragraph blocks',()=>{
 const result=parseReportBlocks('## Halftime Briefing\n**Overview:** Transition chances\n* (8 min) Ball recovery\n1. Defend the left side.');
 assert.deepEqual(result.map(x=>x.kind),['heading','paragraph','bullet','numbered']);
 assert.equal(result[0].text,'Halftime Briefing');
 assert.equal(result[2].text,'(8 min) Ball recovery');
});
test('retains untrusted content as text instead of interpreting HTML',()=>{
 const blocks=parseReportBlocks('<img src=x onerror=alert(1)>\n- **Coach:** Review evidence');
 assert.equal(blocks[0].kind,'paragraph');
 assert.match(blocks[0].text,/<img/);
 assert.equal(blocks[1].kind,'bullet');
});
