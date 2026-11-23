import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReportBlocks, structureCoachingReport, groupReportBlocks } from '../src/reportFormat.mjs';

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


test('real cloud response: numbered sections become consistently labelled cards without inventing content',()=>{
  const cloud = `(1) First half showed attacking transition moments.
(2)
• At minute 14 our team made a first-time shot.
• At minute 21 opponent created a two-versus-one overload.
(3)
• Suggest midfield support for left back.
• Suggest changing first line of pressing.
(4) Final score and possession are unknown.`;
  const sections=structureCoachingReport(cloud);
  assert.deepEqual(sections.map(s=>s.key),['overview','insights','adjustments','limitations']);
  assert.deepEqual(sections.map(s=>s.title),['Match overview','Evidence & insights','Coaching adjustments','Limitations & unknowns']);
  assert.equal(sections[0].blocks[0].text,'First half showed attacking transition moments.');
  assert.deepEqual(groupReportBlocks(sections[1].blocks),[{kind:'bullets',items:[
    'At minute 14 our team made a first-time shot.',
    'At minute 21 opponent created a two-versus-one overload.'
  ]}]);
  assert.equal(sections[3].blocks[0].text,'Final score and possession are unknown.');
});

test('real on-device response: overview and markdown headings map onto same cards',()=>{
  const nano = `Halftime Briefing
Overview: Transition opportunities were observed.
Insights: At minute 8 we recovered the ball on the right.
Suggestions:
- Practice quick transitions.
- Protect the left side.
Limitations: Formations and match score were not tracked.`;
  const sections=structureCoachingReport(nano);
  assert.deepEqual(sections.map(s=>s.key),['overview','insights','adjustments','limitations']);
  assert.equal(sections[0].blocks[0].text,'Transition opportunities were observed.');
  assert.equal(groupReportBlocks(sections[2].blocks)[0].items.length,2);
  assert.equal(sections[3].blocks[0].text,'Formations and match score were not tracked.');
});

test('unknown model layouts remain visible and untrusted HTML stays inert text',()=>{
  const text='<img src=x onerror=alert(1)>\n1. Review minute 21.\n2. Adjust midfield cover.';
  const sections=structureCoachingReport(text);
  assert.equal(sections.length,1);
  assert.equal(sections[0].key,'analysis');
  assert.match(sections[0].blocks[0].text,/<img/);
  assert.deepEqual(groupReportBlocks(sections[0].blocks.slice(1)),[
    {kind:'ordered',items:['Review minute 21.','Adjust midfield cover.']}
  ]);
});

test('markdown emphasis around a section label preserves content',()=>{
  const sections=structureCoachingReport('**Overview:** The notes mention a shot.\n## Insights\n- minute 14 attempt');
  assert.deepEqual(sections.map(s=>s.key),['overview','insights']);
  assert.equal(sections[0].blocks[0].text,'The notes mention a shot.');
  assert.equal(sections[1].blocks[0].kind,'bullet');
});

test('never manufacture a coaching claim from absent output',()=>{
  const sections=structureCoachingReport('');
  assert.equal(sections[0].key,'analysis');
  assert.match(sections[0].blocks[0].text,/No readable report content/);
  assert.doesNotMatch(JSON.stringify(sections),/minute 21|recovery on the right/);
});
