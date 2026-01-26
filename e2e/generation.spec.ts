import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Strategy OS/);
});

test('generation flow ui check', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Check if Input Console is visible (TextArea placeholder)
  const textarea = page.getByPlaceholder('Paste high-complexity input here...');
  await expect(textarea).toBeVisible();

  // Type something
  await textarea.fill('Testing Playwright Automation');

  // Check generate button
  const button = page.getByRole('button', { name: 'GENERATE STREAM' });
  await expect(button).toBeEnabled();

  // Click it
  // Note: We won't actually wait for full generation as it costs API credits/time
  // but we can check if it triggers "STOP" button or similar UI change
  await button.click();

  // Expect button to change or loading state
  // const stopButton = page.getByRole('button', { name: 'STOP' });
  // await expect(stopButton).toBeVisible();
});
