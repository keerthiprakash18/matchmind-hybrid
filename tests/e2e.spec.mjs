import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
test.use({ baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173' });

test('desktop workspace preserves local session and exports safe CSV', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Better decisions/i })).toBeVisible();
  await expect(page.locator('.event')).toHaveCount(6);
  await page.getByRole('textbox', { name: 'Our team name' }).fill('Blue City FC');
  await page.getByPlaceholder('e.g. Left side exposed during transition...').fill('Opposition overloaded the left flank.');
  await page.getByRole('button', { name: 'Log observation' }).click();
  await expect(page.locator('.event')).toHaveCount(7);
  await page.getByRole('button', { name: 'Save session' }).click();
  await expect(page.getByText(/Saved in this browser tab only/)).toBeVisible();
  await page.getByRole('button', { name: /Delete event at minute/ }).first().click();
  await expect(page.locator('.event')).toHaveCount(6);
  await page.getByRole('button', { name: 'Restore' }).click();
  await expect(page.locator('.event')).toHaveCount(7);
  await expect(page.getByRole('textbox', { name: 'Our team name' })).toHaveValue('Blue City FC');
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('matchmind-observations.csv');
  const csv=readFileSync(await download.path(),'utf8');
  expect(csv).toContain('Opposition overloaded the left flank.');
});

test('mobile layout avoids horizontal overflow and supports notebook actions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Better decisions/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save session' })).toBeVisible();
  const overflow=await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Export CSV' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: /AI studio/i }).click();
  await expect(page).toHaveURL(/#ai-studio$/);
});

test('dynamic fixture labels and latest recorded event stay accurate', async ({page}) => {
  await page.goto('/');
  await expect(page.getByText('LAST RECORDED EVENT · 41′')).toBeVisible();
  await page.getByRole('textbox', {name:'Our team name'}).fill('Scarlet City');
  await expect(page.locator('.team-monogram.blue')).toHaveText('S');
  await page.getByPlaceholder('e.g. Left side exposed during transition...').fill('Observed pressing detail.');
  await page.getByLabel('MIN', {exact:true}).fill('120');
  await page.getByRole('button', {name:'Log observation'}).click();
  await expect(page.getByText('LAST RECORDED EVENT · 120′')).toBeVisible();
});


test('cloud and hybrid inference require informed cloud-transfer consent; local mode does not', async ({ page }) => {
  await page.goto('/');
  const studio=page.locator('#ai-studio');
  const generate=studio.getByRole('button', { name: /Generate match intelligence/i });
  const consent=studio.getByRole('checkbox', { name: /I understand that this analysis may use cloud inference/i });
  await studio.getByRole('button', { name: /^Cloud Remote model only$/i }).click();
  await expect(generate).toBeDisabled();
  await expect(consent).toBeVisible();
  await consent.check();
  await expect(generate).toBeEnabled();
  await studio.getByRole('button', { name: /^Hybrid Device first, cloud fallback$/i }).click();
  await expect(consent).toBeChecked();
  await expect(generate).toBeEnabled();
  await studio.getByRole('button', { name: /^On-device Local model only$/i }).click();
  await expect(consent).not.toBeVisible();
  await expect(generate).toBeEnabled();
});


test('capture clean desktop and mobile visual review screenshots', async ({ page }) => {
  mkdirSync('artifacts', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.screenshot({ path: 'artifacts/matchmind-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.screenshot({ path: 'artifacts/matchmind-mobile.png', fullPage: true });
});


test('tactical signals are derived from observations and clear with the notebook', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Signals worth reviewing' })).toBeVisible();
  await expect(page.locator('.signal-card').first()).toContainText('21′');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Clear notes' }).click();
  await expect(page.locator('.signal-card')).toHaveCount(0);
  await expect(page.getByText(/No tactical findings are inferred from an empty notebook/i)).toBeVisible();
});
