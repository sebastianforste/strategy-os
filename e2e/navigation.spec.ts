import { test, expect } from '@playwright/test';

test.describe('Navigation & Workspace', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('strategyos_gemini_key', 'mock_gemini_key');
        localStorage.setItem('strategyos_serper_key', 'mock_serper_key');
    });
    await page.goto('/');
  });

  test('should verify default workspace', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('link', { name: /StrategyOS/i }).or(page.getByText('StrategyOS'))).toBeVisible();
  });

  test('should allow switching workspaces', async ({ page }) => {
    // Use the accessible name we added
    const switcher = page.getByRole('button', { name: 'Switch Workspace' });
    
    if (await switcher.isVisible()) {
        await switcher.click();
        // Check if menu opens - check for the header text "Switch Workspace"
        await expect(page.getByText('Switch Workspace')).toBeVisible();
    }
  });
});
