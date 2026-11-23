import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
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
});
