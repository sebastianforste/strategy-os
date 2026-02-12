import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers';

async function openToolAction(page: import('@playwright/test').Page, label: string) {
  await page.getByRole('button', { name: 'Open tools panel' }).click();
  await expect(page.getByRole('dialog', { name: 'Tools' })).toBeVisible();
  await page.getByRole('button', { name: label, exact: true }).click();
}

test.describe('Modals & Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page, { seedDemoKeys: true });
  });

  test('should open and close Settings modal', async ({ page }) => {
    await openToolAction(page, 'Settings');
    const settingsDialog = page.locator('[role="dialog"][aria-labelledby="settings-dialog-title"]:visible').first();
    await expect(settingsDialog).toBeVisible();

    await page.locator('button[aria-label="Close Settings"]:visible').first().click({ force: true });
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"][aria-labelledby="settings-dialog-title"]:visible')).toHaveCount(0);
  });

  test('should open and close History sidebar', async ({ page }) => {
    await openToolAction(page, 'History');
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
    
    await page.getByLabel('Close History').click({ force: true });
    await expect(page.getByRole('heading', { name: 'History' })).not.toBeVisible();
  });

  test('should open Voice Training modal', async ({ page }) => {
    await openToolAction(page, 'Voice Training');
    await expect(page.getByRole('heading', { name: 'Brand Voice Training' })).toBeVisible();
  });

  test('should open Ghost Agent modal', async ({ page }) => {
    await openToolAction(page, 'Ghost Agent');
    await expect(page.getByRole('heading', { name: 'Ghost Agent' })).toBeVisible();
  });

  test('should open Analytics dashboard', async ({ page }) => {
    await openToolAction(page, 'Analytics');
    await expect(page.getByRole('heading', { name: 'StrategyOS Analytics' })).toBeVisible();
  });
});
