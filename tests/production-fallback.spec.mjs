import { test, expect } from '@playwright/test';

test.use({baseURL:'https://matchmind-hybrid.vercel.app'});

test('production Hybrid falls back to Cloud on browser without a local model', async ({page}) => {
  test.setTimeout(150_000);
  await page.goto('https://matchmind-hybrid.vercel.app/', {waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading', {name:/Better decisions/i})).toBeVisible();
  await expect(page.locator('.device-readiness')).toContainText(/unavailable|not supported|could not be checked/i, {timeout:20_000});
  const studio=page.locator('#ai-studio');
  await studio.getByRole('button', {name:/^Hybrid Device first, cloud fallback$/i}).click();
  await studio.getByRole('checkbox', {name:/I understand that this analysis may use cloud inference/i}).check();
  await studio.getByRole('button', {name:/Generate match intelligence/i}).click();
  const success=studio.getByText('Analysis generated');
  const appCheckError=studio.getByText(/App Check authorization failed/i);
  await Promise.race([
    success.waitFor({state:'visible',timeout:120_000}),
    appCheckError.waitFor({state:'visible',timeout:120_000}).then(()=>{throw new Error('Production anti-bot App Check rejected automated headless browser; not a fallback proof.');})
  ]);
  const receipt=studio.locator('.evidence-receipt');
  await expect(receipt).toContainText('Hybrid');
  await expect(receipt.locator('.evidence-metrics')).toContainText('CLOUD');
  await page.screenshot({path:'hybrid-cloud-fallback-real-run.png',fullPage:false});
  console.log('Verified: requested Hybrid; browser had no local model; Firebase SDK returned actual CLOUD.');
});
