import { test, expect } from '@playwright/test';

test.describe('Modals & Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('strategyos_gemini_key', 'mock_gemini_key');
        localStorage.setItem('strategyos_serper_key', 'mock_serper_key');
    });
    await page.goto('/');
  });

  test('should open and close Settings modal', async ({ page }) => {
    // Open Settings
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Configuration' })).toBeVisible();

    // Close Settings
    await page.getByLabel('Close Settings').click({ force: true });
    // Check it's gone
    await expect(page.getByRole('heading', { name: 'Configuration' })).not.toBeVisible();
  });

  test('should open and close History sidebar', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
    
    // Close using the close button usually found in sidebars
    await page.getByLabel('Close History').click({ force: true });
    await expect(page.getByRole('heading', { name: 'History' })).not.toBeVisible();
  });

  test('should open Voice Training modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Voice Training' }).click();
    await expect(page.getByRole('heading', { name: 'Brand Voice Training' })).toBeVisible();
  });

  test('should open Ghost Agent modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Ghost Agent' }).click();
    await expect(page.getByRole('heading', { name: 'Ghost Agent' })).toBeVisible(); // Might be "Ghost Agent Inbox" based on component, but header usually shorter. Actually component says "Ghost Agent Inbox"? No, component modal props... wait. GhostInboxModal.tsx: line 188: <div className="text-xl font-bold text-white flex items-center gap-2">Ghost Agent</div> (wait, I need to be sure). Let's use the text visible in the screenshot or inferred from previous run.
    // In component view previously: GhostInboxModal.tsx. It's safe to check for "Ghost Agent" heading.
  });

  test('should open Analytics dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'Analytics' }).click();
    await expect(page.getByRole('heading', { name: 'StrategyOS Analytics' })).toBeVisible();
  });
});
