import '../config/loadEnv.js';
import { defineConfig } from '@playwright/test';

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.LIGHTHOUSE_BASE_URL ||
  'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  outputDir: './test-results',
  reporter: [['list']],
  repeatEach: Number(process.env.PLAYWRIGHT_REPEAT_EACH || 1),
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    viewport: {
      width: 1440,
      height: 960,
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
});
