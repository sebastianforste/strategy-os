import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers';

test.describe('Content Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page, { seedDemoKeys: true });
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/StrategyOS/);
  });

  test('generation UI elements are present', async ({ page }) => {
    const textarea = page.getByPlaceholder(/What strategy do you want to build today/i);
    await expect(textarea).toBeVisible();

    const button = page.getByRole('button', { name: /INITIATE SEQUENCE/i });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
  });

  test('should enable button when input is provided', async ({ page }) => {
    const textarea = page.getByPlaceholder(/What strategy do you want to build today/i);
    await textarea.fill('Test Strategy Input');
    
    const button = page.getByRole('button', { name: /INITIATE SEQUENCE/i });
    await expect(button).toBeEnabled();
  });

  test('omni command input stays focused on UnifiedCanvas generation flow', async ({ page }) => {
    const input = page.getByLabel('Omni command input');
    await input.click();
    await input.fill('/help');
    await expect(input).toHaveValue('/help');
  });
});
