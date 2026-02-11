import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers';

test.describe('UnifiedCanvas Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page, { seedDemoKeys: true });
  });

  test('renders default UnifiedCanvas shell', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('link', { name: /StrategyOS/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editor view' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview view' })).toBeVisible();
  });

  test('can switch between editor and preview modes', async ({ page }) => {
    await page.getByRole('button', { name: 'Preview view' }).click();
    await expect(page.getByRole('button', { name: 'LinkedIn' })).toBeVisible();
    await expect(page.getByText('LinkedIn').first()).toBeVisible();

    await page.getByRole('button', { name: 'Editor view' }).click();
    await expect(page.getByRole('button', { name: 'LinkedIn' })).not.toBeVisible();
  });
});
