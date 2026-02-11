import type { Page } from '@playwright/test';

export interface StrategyKeys {
  gemini: string;
  serper: string;
}

export const DEMO_KEYS: StrategyKeys = {
  gemini: 'demo',
  serper: '',
};

export async function seedKeys(page: Page, keys: StrategyKeys = DEMO_KEYS): Promise<void> {
  await page.addInitScript((payload: StrategyKeys) => {
    localStorage.setItem('strategyos_keys', JSON.stringify(payload));
    // Keep legacy keys in sync for backward compatibility.
    localStorage.setItem('strategyos_gemini_key', payload.gemini || '');
    localStorage.setItem('strategyos_serper_key', payload.serper || '');
  }, keys);
}

export async function clearKeys(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('strategyos_keys');
    localStorage.removeItem('strategyos_gemini_key');
    localStorage.removeItem('strategyos_serper_key');
  });
}

export async function gotoHome(
  page: Page,
  options: { seedDemoKeys?: boolean } = {}
): Promise<void> {
  if (options.seedDemoKeys) {
    await seedKeys(page);
  } else {
    await clearKeys(page);
  }
  await page.goto('/');
}
