/**
 * settings.spec.js — Settings page operation timing
 *
 * Measures page load, profile update, and password change timing.
 * Password is restored to the original after the change test so that
 * subsequent runs (and seed-based login) continue to work.
 *
 * Thesis relevance:
 *   - V3 S4: express-validator on PUT /auth/user/profile and
 *            PUT /auth/user/change-password adds validation overhead
 *   - V3 S7: JWT in HttpOnly cookie affects all authenticated PUT requests
 *
 * Report: {label}.settings.performance.json
 */

import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import { loginThroughUi, openNavigation, measureApiCall } from '../../utils/helpers.js';
import { playwrightUser } from '../../utils/config.js';

test.describe.configure({ mode: 'serial' });

test('settings page load', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'settings.performance.json',
    suiteName: 'settings-operations',
    testInfo,
  });

  await loginThroughUi(page);

  await recorder.measure('settings_page_load_ms', async () => {
    await openNavigation(
      page,
      'nav-settings',
      '**/settings',
      page.getByTestId('settings-page'),
    );
  });

  recorder.flush();
});

test('settings profile update', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'settings.performance.json',
    suiteName: 'settings-operations',
    testInfo,
  });

  const contactValue = `+48${String(Date.now()).slice(-9)}`;

  await loginThroughUi(page);
  await openNavigation(page, 'nav-settings', '**/settings', page.getByTestId('settings-page'));

  await measureApiCall(
    page,
    recorder,
    'settings_profile_update_ms',
    '/api/auth/user/profile',
    async () => {
      await page.getByTestId('settings-contact').fill(contactValue);
      await page.getByTestId('settings-save-profile').click();
    },
  );

  await expect(page.getByTestId('settings-contact')).toHaveValue(contactValue);

  recorder.flush();
});

test('settings password change', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'settings.performance.json',
    suiteName: 'settings-operations',
    testInfo,
  });

  const originalPassword = playwrightUser.password;
  const tempPassword = `${originalPassword}_tmp`;

  await loginThroughUi(page);
  await openNavigation(page, 'nav-settings', '**/settings', page.getByTestId('settings-page'));

  // ── Change to temp password ───────────────────────────────────────────────
  await measureApiCall(
    page,
    recorder,
    'settings_password_change_ms',
    '/api/auth/user/change-password',
    async () => {
      await page.getByTestId('settings-current-password').fill(originalPassword);
      await page.getByTestId('settings-new-password').fill(tempPassword);
      await page.getByTestId('settings-confirm-password').fill(tempPassword);
      await page.getByTestId('settings-change-password-submit').click();
    },
  );

  // ── Restore original password so subsequent runs still work ──────────────
  await page.getByTestId('settings-current-password').fill(tempPassword);
  await page.getByTestId('settings-new-password').fill(originalPassword);
  await page.getByTestId('settings-confirm-password').fill(originalPassword);
  await page.getByTestId('settings-change-password-submit').click();

  // Wait for the restore to complete before flushing
  await page.waitForResponse(
    (r) => r.url().includes('/api/auth/user/change-password') && r.ok(),
  );

  recorder.flush();
});
