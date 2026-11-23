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
