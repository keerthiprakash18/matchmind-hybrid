/** Minimal safe formatting for untrusted AI-generated text. No raw HTML is inserted. */
export function parseReportBlocks(text) {
  return String(text ?? '').split(/\r?\n/)
    .map(line=>line.trim())
    .filter(Boolean)
    .map(line=>{
      const heading=line.match(/^#{1,4}\s+(.+)$/);
      if(heading) return {kind:'heading',text:heading[1]};
      const bullet=line.match(/^[-*•]\s+(.+)$/);
      if(bullet) return {kind:'bullet',text:bullet[1]};
      const numbered=line.match(/^(\d{1,2})[.)]\s+(.+)$/);
      if(numbered) return {kind:'numbered',text:numbered[1]+'. '+numbered[2]};
      return {kind:'paragraph',text:line};
    });
}


/**
 * Presentation-only normalization for two genuinely different model formats:
 * section labels ("Overview:", "Insights:") and small-model numbered sections
 * ("(1)", "(2)", "(3)", "(4)"). Text is NEVER rewritten into new coaching facts.
 * Unknown formats remain visible in a neutral Analysis section.
 */
const SECTION_TITLES = Object.freeze({
  overview: 'Match overview',
  insights: 'Evidence & insights',
  adjustments: 'Coaching adjustments',
  limitations: 'Limitations & unknowns'
});
const SECTION_ALIASES = Object.freeze({
  overview:'overview',summary:'overview','match overview':'overview',
  insights:'insights',insight:'insights',evidence:'insights',
  observations:'insights','key observations':'insights','key insights':'insights',
  suggestions:'adjustments',suggestion:'adjustments',
  recommendations:'adjustments',recommendation:'adjustments',
  adjustments:'adjustments','tactical adjustments':'adjustments',
  'coaching adjustments':'adjustments','training priorities':'adjustments',
  limitations:'limitations',limitation:'limitations',
  unknowns:'limitations','limitations and unknowns':'limitations',
  'limitations & unknowns':'limitations'
});

function sectionKey(label) {
  return SECTION_ALIASES[String(label).toLowerCase().replace(/[\s]+/g,' ').trim()] ?? null;
}
function sectionMarker(line) {
  const numbered = line.match(/^\(([1-4])\)(?:\s+(.*))?$/);
  if (numbered) {
    const key = ['overview','insights','adjustments','limitations'][Number(numbered[1])-1];
    return {key, content:(numbered[2]||'').trim()};
  }
  // Only recognize explicit labels, not arbitrary prose or fabricated sections.
  const unstyled = line.replace(/^#{1,4}\s*/, '').replace(/\*\*/g,'').trim();
  const exactly = sectionKey(unstyled.replace(/:$/,''));
  if (exactly) return {key:exactly,content:''};
  const colon = line.indexOf(':');
  if (colon > -1 && colon < 38) {
    const label = line.slice(0,colon).replace(/^#{1,4}\s*/, '').replace(/\*\*/g,'').trim();
    const key = sectionKey(label);
    if (key) {
      return {key,content:line.slice(colon+1).replace(/^\*\*/,'').trim()};
    }
  }
  return null;
}

export function structureCoachingReport(text) {
  const result=[];
  let current={key:'analysis',title:'Coaching report',blocks:[]};
  const flush = () => {
    if (current.blocks.length) result.push(current);
  };
  for (const rawLine of String(text??'').split(/\r?\n/)) {
    const line=rawLine.trim();
    if(!line) continue;
    const marker=sectionMarker(line);
    if(marker) {
      flush();
      current={key:marker.key,title:SECTION_TITLES[marker.key],blocks:[]};
      if(marker.content) current.blocks.push(...parseReportBlocks(marker.content));
      continue;
    }
    // Titles/prefaces often repeated by local models; remove ONLY pure boilerplate.
    if (/^(?:#{1,4}\s*)?(?:here['’]s (?:a )?)?(?:the )?(?:halftime briefing|tactical adjustments|training priorities)\s*:?[\s]*$/i.test(line)) continue;
    current.blocks.push(...parseReportBlocks(line));
  }
  flush();
  return result.length?result:[{key:'analysis',title:'Coaching report',blocks:[{kind:'paragraph',text:'No readable report content was returned.'}]}];
}

/** Adjacent bullet/numbered lines become semantic lists (without editing AI text). */
export function groupReportBlocks(blocks) {
  const groups=[];
  for(const block of blocks) {
    if(block.kind==='bullet'||block.kind==='numbered') {
      const kind=block.kind==='numbered'?'ordered':'bullets';
      const prior=groups[groups.length-1];
      const content=kind==='ordered'?block.text.replace(/^\d{1,2}\.\s*/,''):block.text;
      if(prior?.kind===kind) prior.items.push(content);
      else groups.push({kind,items:[content]});
    } else {
      groups.push({kind:block.kind,text:block.text});
    }
  }
  return groups;
}
