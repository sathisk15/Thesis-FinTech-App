/**
 * auth.spec.js — Authentication timing measurements
 *
 * Measures login, logout, and re-login timing for the seeded user.
 *
 * Thesis relevance:
 *   - V3 S3: express-rate-limit on /api/auth/login adds server-side overhead
 *   - V3 S7: JWT moved from localStorage to HttpOnly cookie changes
 *            the auth handshake — measures any latency delta
 *
 * Report: {label}.auth.performance.json
 */

import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import { playwrightUser } from '../../utils/config.js';

test.describe.configure({ mode: 'serial' });

test('auth timing — login, logout, re-login', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'auth.performance.json',
    suiteName: 'auth-timing',
    testInfo,
  });

  // ── Login ────────────────────────────────────────────────────────────────
  await recorder.measure('login_ms', async () => {
    await page.context().clearCookies();
    await page.goto('/login');
    await expect(page.getByTestId('login-page')).toBeVisible();
    await page.getByTestId('login-email').fill(playwrightUser.email);
    await page.getByTestId('login-password').fill(playwrightUser.password);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByText('Key Financial Metrics')).toBeVisible();
  });

  // ── Logout ───────────────────────────────────────────────────────────────
  await recorder.measure('logout_ms', async () => {
    await page.getByTestId('logout-button').click();
    await page.waitForURL('**/login');
    await expect(page.getByTestId('login-page')).toBeVisible();
  });

  // ── Re-login (session cleared) ───────────────────────────────────────────
  // Measures a second consecutive login — important for V3 S3 rate limiting
  // which tracks requests per IP within a time window.
  await recorder.measure('login_after_logout_ms', async () => {
    await page.getByTestId('login-email').fill(playwrightUser.email);
    await page.getByTestId('login-password').fill(playwrightUser.password);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByText('Key Financial Metrics')).toBeVisible();
  });

  recorder.flush();
});
