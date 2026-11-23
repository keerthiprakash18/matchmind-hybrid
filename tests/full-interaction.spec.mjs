import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Run locally by default. Set BASE_URL=https://matchmind-hybrid.vercel.app
// for true production UI checks. No Firebase tokens, model mocks or real AI
// responses are needed for these interaction-only tests.
test.use({ baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173' });

test('every desktop navigation entry reaches the correct section', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/MatchMind/);
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  for (const [label,target] of [
    ['Match overview','#overview'],
    ['Live notebook','#notebook'],
    ['AI studio','#ai-studio'],
    ['How it works','#how-it-works']
  ]) {
    await nav.getByRole('link',{name:new RegExp(label,'i')}).click();
    await expect(page).toHaveURL(new RegExp(target+'$'));
    await expect(page.locator(target)).toBeVisible();
  }
});

test('guest CTA, safe blank reset, protected demo loading and empty guards', async ({page})=>{
  await page.goto('/');
  await expect(page.locator('.event')).toHaveCount(6);
  await page.getByRole('button',{name:'Explore the demo'}).click();
  await expect(page.locator('#ai-studio')).toBeVisible();
  page.once('dialog',d=>d.dismiss());
  await page.getByRole('button',{name:'Start blank match'}).click();
  await expect(page.locator('.event')).toHaveCount(6);
  page.once('dialog',d=>d.accept());
  await page.getByRole('button',{name:'Start blank match'}).click();
  await expect(page.locator('.event')).toHaveCount(0);
  await expect(page.getByRole('textbox',{name:'Our team name'})).toHaveValue('Our team');
  await expect(page.getByRole('button',{name:'Export CSV'})).toBeDisabled();
  await expect(page.getByRole('button',{name:/Generate match intelligence/i})).toBeDisabled();
  page.once('dialog',d=>d.dismiss());
  await page.getByRole('button',{name:'Load demo match'}).click();
  await expect(page.locator('.event')).toHaveCount(0);
  page.once('dialog',d=>d.accept());
  await page.getByRole('button',{name:'Load demo match'}).click();
  await expect(page.locator('.event')).toHaveCount(6);
  await expect(page.getByRole('textbox',{name:'Our team name'})).toHaveValue('Eastport FC');
});

test('save, refresh, explicit restore, clear-cancel and irreversible clear', async ({page})=>{
  await page.goto('/');
  await page.getByRole('textbox',{name:'Our team name'}).fill('Audit FC');
  await page.getByRole('button',{name:'Save session'}).click();
  await expect(page.getByText(/Saved in this browser tab only/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('textbox',{name:'Our team name'})).toHaveValue('Eastport FC');
  await page.getByRole('button',{name:'Restore'}).click();
  await expect(page.getByRole('textbox',{name:'Our team name'})).toHaveValue('Audit FC');
  page.once('dialog',d=>d.dismiss());
  await page.getByRole('button',{name:'Clear notes'}).click();
  await expect(page.locator('.event')).toHaveCount(6);
  page.once('dialog',d=>d.accept());
  await page.getByRole('button',{name:'Clear notes'}).click();
  await expect(page.locator('.event')).toHaveCount(0);
  await expect(page.getByText(/No tactical findings are inferred/i)).toBeVisible();
  await page.getByRole('button',{name:'Restore'}).click();
  await expect(page.getByText(/No saved session found/i)).toBeVisible();
});

test('form buttons, team and event type selectors, count and removal', async ({page})=>{
  await page.goto('/');
  await page.getByRole('textbox',{name:'Opponent team name'}).fill('East Ridge');
  await page.locator('.event-form').getByLabel('MIN',{exact:true}).fill('67');
  await page.locator('.event-form').locator('.form-row select').nth(0).selectOption('Opponent');
  await page.locator('.event-form').locator('.form-row select').nth(1).selectOption('Turnover');
  await page.getByPlaceholder('e.g. Left side exposed during transition...').fill('A new match observation.');
  await page.getByRole('button',{name:'Log observation'}).click();
  await expect(page.locator('.event')).toHaveCount(7);
  await expect(page.locator('.counter')).toContainText('7/50');
  await expect(page.locator('.event').last()).toContainText('67');
  await expect(page.locator('.event').last()).toContainText('A new match observation.');
  await expect(page.getByPlaceholder('e.g. Left side exposed during transition...')).toHaveValue('');
  await page.getByRole('button',{name:'Delete event at minute 67'}).click();
  await expect(page.locator('.event')).toHaveCount(6);
  await expect(page.locator('.counter')).toContainText('6/50');
});

test('CSV download escapes dangerous formulas and preserves real notes',async ({page})=>{
  await page.goto('/');
  await page.getByPlaceholder('e.g. Left side exposed during transition...').fill('=HYPERLINK("https://example.invalid","click")');
  await page.getByRole('button',{name:'Log observation'}).click();
  const promise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export CSV'}).click();
  const file=await promise;
  expect(file.suggestedFilename()).toBe('matchmind-observations.csv');
  const csv=readFileSync(await file.path(),'utf8');
  expect(csv).toContain('HYPERLINK');
  expect(csv).toContain('"\'=HYPERLINK(');
  expect(csv).toContain('Minute,Team,Event,Observation'.replaceAll(/([^,]+)/g,'"$1"'));
});

test('all analysis goals, three inference buttons and privacy guard work without real API calls',async ({page})=>{
  await page.goto('/');
  const studio=page.locator('#ai-studio');
  const generate=studio.getByRole('button',{name:/Generate match intelligence/i});
  const consent=studio.getByRole('checkbox',{name:/I understand that this analysis may use cloud inference/i});
  const dropdown=studio.locator('#goal');
  for(const goal of ['Halftime briefing','Tactical adjustments','Training priorities']){
    await dropdown.selectOption(goal);await expect(dropdown).toHaveValue(goal);
  }
  await studio.getByRole('button',{name:/^Cloud Remote model only$/i}).click();
  await expect(generate).toBeDisabled();
  await expect(consent).toBeVisible();
  await consent.check();await expect(generate).toBeEnabled();
  await studio.getByRole('button',{name:/^Hybrid Device first, cloud fallback$/i}).click();
  await expect(consent).toBeChecked();await expect(generate).toBeEnabled();
  await studio.getByRole('button',{name:/^On-device Local model only$/i}).click();
  await expect(consent).not.toBeVisible();
  await expect(generate).toBeEnabled();
  // This is an interaction test. It DOES NOT claim live model inference passed.
});

test('mobile nav and no horizontal overflow across practical widths',async ({page})=>{
  for(const width of [320,360,390,768,1024,1440]){
    await page.setViewportSize({width,height:850});
    await page.goto('/');
    await expect(page.getByRole('heading',{name:/Better decisions/i})).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'viewport '+width).toBeLessThanOrEqual(2);
    await expect(page.getByRole('button',{name:'Save session'})).toBeAttached();
    if(width<=390){
      const nav=page.getByRole('navigation',{name:'Mobile navigation'});
      await expect(nav).toBeVisible();
      await nav.getByRole('link',{name:/AI studio/i}).click();
      await expect(page).toHaveURL(/#ai-studio$/);
    }
  }
});

test('public page remains free of uncaught browser script exceptions',async ({page})=>{
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  const response=await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading',{name:/Better decisions/i})).toBeVisible();
  await page.getByRole('button',{name:'Explore the demo'}).click();
  await page.getByRole('button',{name:'Save session'}).click();
  expect(errors).toEqual([]);
});
