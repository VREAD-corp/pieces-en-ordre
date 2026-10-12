import { defineConfig } from '@playwright/test';
const live = !!process.env.BASE_URL;
export default defineConfig({
  testDir: 'tests',
  timeout: 60000,
  workers: 2,
  reporter: [['list']],
  use: { baseURL: process.env.BASE_URL || 'http://localhost:4317/pieces-en-ordre/', screenshot: 'only-on-failure' },
  projects: [
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: live ? undefined : { command: 'node scripts/serve.mjs', url: 'http://localhost:4317/pieces-en-ordre/', reuseExistingServer: true },
});
