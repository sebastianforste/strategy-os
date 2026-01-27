import { test, expect } from '@playwright/test';

test.describe('Content Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('strategyos_gemini_key', 'mock_gemini_key');
        localStorage.setItem('strategyos_serper_key', 'mock_serper_key');
    });
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/StrategyOS/);
  });

  test('generation UI elements are present', async ({ page }) => {
    // Check Input
    const textarea = page.getByPlaceholder(/What strategy do you want to build today|Paste high-complexity input/i);
    await expect(textarea).toBeVisible();

    // Check Generate Button (using the text from StreamingConsole.tsx)
    const button = page.getByRole('button', { name: /INITIATE SEQUENCE/i });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled(); // Should be disabled when input is empty
  });

  test('should enable button when input is provided', async ({ page }) => {
    const textarea = page.getByPlaceholder(/What strategy do you want to build today|Paste high-complexity input/i);
    await textarea.fill('Test Strategy Input');
    
    const button = page.getByRole('button', { name: /INITIATE SEQUENCE/i });
    await expect(button).toBeEnabled();
  });
});
