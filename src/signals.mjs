/** Deterministic observations-to-signal rules, not predictive AI or match telemetry. */
const rules = [
  {id:'wide-overload',team:'Opponent',type:'Wide overload',title:'Wide overload recorded',detail:'Ask whether the nearby midfielder or winger can support the isolated full-back. This is a coaching question, not a diagnosed weakness.',tone:'watch'},
  {id:'press-broken',team:'Opponent',type:'Press broken',title:'First-line press bypassed',detail:'Review the recorded press-breaking moments before adjusting compactness or pressing triggers.',tone:'watch'},
  {id:'recovery',team:'Us',type:'Ball recovery',title:'Ball recovery opportunities',detail:'Check what happened after recovery. A recovery alone does not establish a successful transition or chance.',tone:'positive'},
  {id:'chance',team:'Us',type:'Big chance',title:'Big chances logged',detail:'Examine how the logged chances developed and whether those patterns could be reproduced.',tone:'positive'},
];
export function deriveSignals(events) {
  if (!Array.isArray(events)) return [];
  return rules.flatMap(rule => {
    const relevant=events.filter(e=>e?.team===rule.team&&e?.type===rule.type);
    if(relevant.length===0)return [];
    const minutes=[...new Set(relevant.map(e=>e.minute).filter(v=>Number.isInteger(v)&&v>=0&&v<=120))].sort((a,b)=>a-b);
    return [{
      id:rule.id,title:rule.title,detail:rule.detail,tone:rule.tone,
      count:relevant.length,
      minutes
    }];
  }).slice(0,3);
}
