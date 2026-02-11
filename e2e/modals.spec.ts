import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers';

test.describe('Modals & Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page, { seedDemoKeys: true });
  });

  test('should open and close Settings modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Configuration' })).toBeVisible();

    await page.getByLabel('Close Settings').click({ force: true });
    await expect(page.getByRole('heading', { name: 'Configuration' })).not.toBeVisible();
  });

  test('should open and close History sidebar', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
    
    await page.getByLabel('Close History').click({ force: true });
    await expect(page.getByRole('heading', { name: 'History' })).not.toBeVisible();
  });

  test('should open Voice Training modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Voice Training' }).click();
    await expect(page.getByRole('heading', { name: 'Brand Voice Training' })).toBeVisible();
  });

  test('should open Ghost Agent modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Ghost Agent' }).click();
    await expect(page.getByRole('heading', { name: 'Ghost Agent' })).toBeVisible();
  });

  test('should open Analytics dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'Analytics' }).click();
    await expect(page.getByRole('heading', { name: 'StrategyOS Analytics' })).toBeVisible();
  });
});
