import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'x-e2e-token': 'playwright',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'PORT=3100 E2E_DEMO_AUTH=true E2E_TEST_UTILS=true E2E_TOKEN=playwright PUBLISH_ENGINE_TEST_MODE=true npm run dev',
    url: 'http://localhost:3100',
    // Always boot a dedicated server with the correct e2e env vars.
    reuseExistingServer: false,
  },
});
