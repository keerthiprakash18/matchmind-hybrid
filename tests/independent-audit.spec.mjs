import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';

const baseURL=process.env.BASE_URL || 'http://127.0.0.1:4173';
test.use({baseURL});
const production=baseURL.startsWith('https://');

test('AUDIT: actual live headers and public page/asset footprint', async ({page})=>{
  const response=await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading',{name:/Better decisions/i})).toBeVisible();
  const h=response.headers();
  const headerNames=[
    'content-security-policy','content-security-policy-report-only','strict-transport-security',
    'x-content-type-options','x-frame-options','referrer-policy','permissions-policy'
  ];
  const posture=Object.fromEntries(headerNames.map(n=>[n,h[n]||'MISSING']));
  console.log('AUDIT_HEADER_POSTURE '+JSON.stringify(posture));
  // Observe missing security headers as findings. Do not block launch on an audit-only branch.
  const scripts=await page.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')));
  console.log('AUDIT_SCRIPT_COUNT '+scripts.length);
  for(const path of ['/.env','/.git/config','/package-lock.json']){
    const resp=await page.request.get(path);
    const body=(await resp.text()).slice(0,800);
    expect(body).not.toMatch(/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/);
    expect(body).not.toMatch(/^\s*VITE_FIREBASE_API_KEY=.+/m);
    console.log('AUDIT_PUBLIC_FILE '+path+' status='+resp.status()+' type='+resp.headers()['content-type']);
  }
});

test('AUDIT: no uncaught browser exceptions and standard error state without model invocation',async({page})=>{
  const jsErrors=[];
  page.on('pageerror',e=>jsErrors.push(e.message));
  await page.goto('/');
  await page.getByRole('button',{name:'Explore the demo'}).click();
  await page.getByRole('button',{name:'Save session'}).click();
  await page.getByRole('button',{name:'Export session'}).click();
  await page.getByRole('button',{name:'Coaching brief'}).click();
  expect(jsErrors).toEqual([]);
});

test('AUDIT: hostile notes are escaped in the DOM and guarded for spreadsheet export',async({page})=>{
  await page.goto('/');
  const malicious='<img src=x onerror=window.MATCHMIND_XSS_AUDIT=1>';
  await page.getByPlaceholder('e.g. Left side exposed during transition...').fill(malicious);
  await page.getByRole('button',{name:'Log observation'}).click();
  const notebook=page.locator('#notebook');
  await expect(notebook.getByText(malicious)).toBeVisible();
  expect(await notebook.locator('img').count()).toBe(0);
  expect(await page.evaluate(()=>window.MATCHMIND_XSS_AUDIT||null)).toBeNull();
  await page.getByPlaceholder('e.g. Left side exposed during transition...').fill('=HYPERLINK("https://invalid.example","click")');
  await page.getByRole('button',{name:'Log observation'}).click();
  const p=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export CSV'}).click();
  const download=await p;
  const buffer=await (await import('node:fs/promises')).readFile(await download.path(),'utf8');
  expect(buffer).toContain('"\'=HYPERLINK(');
});

test('AUDIT: invalid portable JSON is rejected with original notes preserved',async({page})=>{
  await page.goto('/');
  const fixture={schemaVersion:2,home:'Attack FC',away:'Other',events:[
    {id:'bad/../../id',minute:4,team:'Us',type:'Shot',note:'malicious'}
  ]};
  await page.getByLabel('Choose MatchMind session JSON file').setInputFiles({
    name:'untrusted.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))
  });
  await expect(page.locator('.event')).toHaveCount(6);
  await expect(page.getByText(/Import rejected/)).toBeVisible();
  const large=' '.repeat(128*1024+1);
  await page.getByLabel('Choose MatchMind session JSON file').setInputFiles({
    name:'oversized.json',mimeType:'application/json',buffer:Buffer.from(large)
  });
  await expect(page.locator('.event')).toHaveCount(6);
});

test('AUDIT: keyboard accessible edit form and consent revocation after evidence edits',async({page})=>{
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to match workspace'})).toBeFocused();
  await page.getByRole('button',{name:'Edit event at minute 8'}).click();
  await expect(page.getByRole('textbox',{name:'Edit observation text at 8'})).toBeVisible();
  const studio=page.locator('#ai-studio');
  await studio.getByRole('button',{name:/^Cloud Remote model only$/i}).click();
  const consent=studio.getByRole('checkbox',{name:/may use cloud inference/i});
  await consent.check();
  await page.getByRole('textbox',{name:'Edit observation text at 8'}).fill('Corrected match observation.');
  await page.getByRole('button',{name:'Save changes'}).click();
  await expect(consent).not.toBeChecked();
  await expect(studio.getByRole('button',{name:/Generate match intelligence/i})).toBeDisabled();
});

test('AUDIT: 50-observation cap cannot be bypassed through the form',async({page})=>{
  await page.goto('/');
  const field=page.getByPlaceholder('e.g. Left side exposed during transition...');
  for(let i=0;i<44;i++){
    await field.fill('Recorded event '+i);
    await page.getByRole('button',{name:'Log observation'}).click();
  }
  await expect(page.locator('.event')).toHaveCount(50);
  await expect(page.getByRole('button',{name:'Log observation'})).toBeDisabled();
  await expect(page.locator('.counter')).toHaveText('50/50');
});

test('AUDIT: responsive and WCAG scans at every breakpoint, report ALL findings',async({page})=>{
  const all=[];
  for(const width of [320,360,390,570,768,1024,1440]){
    await page.setViewportSize({width,height:850});
    await page.goto('/');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    if(overflow>2) all.push({width,kind:'horizontal-overflow',pixels:overflow});
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    const failures=scan.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}));
    console.log('AUDIT_AXE '+JSON.stringify({width,failures,overflow}));
    for(const f of failures)all.push({width,...f});
    if(width===320 || width===390 || width===1440){
      mkdirSync('artifacts/audit',{recursive:true});
      await page.screenshot({path:'artifacts/audit/'+(production?'prod':'local')+'-'+width+'.png',fullPage:true});
    }
  }
  expect(all,'Independent WCAG/reflow findings across all widths').toEqual([]);
});

test('AUDIT: live Firebase model output, evidence controls, exports and report accessibility', async({page})=>{
  test.skip(!production,'Real AI request only runs once on the authorized production site.');
  test.setTimeout(150000);
  await page.goto('/');
  const studio=page.locator('#ai-studio');
  await studio.getByRole('button',{name:/^Hybrid Device first, cloud fallback$/i}).click();
  await studio.getByRole('checkbox',{name:/may use cloud inference/i}).check();
  await studio.getByRole('button',{name:/Generate match intelligence/i}).click();
  const generated=studio.getByText('Analysis generated');
  const reportedError=studio.getByRole('alert');
  try {
    await Promise.race([
      generated.waitFor({state:'visible',timeout:90000}),
      reportedError.waitFor({state:'visible',timeout:90000}).then(async()=>{
        throw new Error('MODEL_UI_ERROR: '+(await reportedError.innerText()).slice(0,350));
      })
    ]);
  } catch (error) {
    const status=await studio.locator('.analysis-status').allTextContents();
    const errs=await reportedError.allTextContents();
    console.log('AUDIT_AI_FAILURE '+JSON.stringify({status,errors:errs}));
    mkdirSync('artifacts/audit',{recursive:true});
    await page.screenshot({path:'artifacts/audit/prod-inference-failure.png',fullPage:true});
    throw error;
  }
  await expect(studio.locator('.ai-result .report-section').first()).toBeVisible();
  await expect(studio.locator('.evidence-receipt')).toContainText('ACTUAL ROUTE');
  const source=await studio.locator('.evidence-metrics').innerText();
  console.log('AUDIT_REAL_INFERENCE_SOURCE '+source.replace(/\\s+/g,' '));
  const scan=await new AxeBuilder({page}).include('#ai-studio').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  console.log('AUDIT_DYNAMIC_AXE '+JSON.stringify(scan.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))));
  const promise=page.waitForEvent('download');
  await studio.getByRole('button',{name:'Download briefing'}).click();
  const file=await promise;
  expect(file.suggestedFilename()).toBe('matchmind-coaching-brief.md');
  const raw=await (await import('node:fs/promises')).readFile(await file.path(),'utf8');
  expect(raw).toMatch(/## AI analysis/);
  expect(raw).not.toMatch(/API_KEY|FIREBASE_APPCHECK_DEBUG_TOKEN/);
  mkdirSync('artifacts/audit',{recursive:true});
  await page.screenshot({path:'artifacts/audit/prod-generated-report.png',fullPage:true});
  expect(scan.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);
});
