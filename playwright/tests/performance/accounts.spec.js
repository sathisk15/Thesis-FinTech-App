/**
 * accounts.spec.js — Account operation timing
 *
 * Measures page load, modal open, account creation, and deposit timing
 * for the Accounts page using the seeded user.
 *
 * Thesis relevance:
 *   - V3 S4: express-validator on POST /accounts and POST /accounts/:id/deposit
 *            adds server-side validation overhead — visible in create_account_ms
 *            and deposit_ms
 *   - V3 S7: JWT in HttpOnly cookie changes how credentials are sent with
 *            each API request — affects all backend-bound operations here
 *
 * Report: {label}.accounts.performance.json
 */

import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import { loginThroughUi, openNavigation, selectOptionByText } from '../../utils/helpers.js';

test.describe.configure({ mode: 'serial' });

test('accounts page load', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'accounts.performance.json',
    suiteName: 'accounts-operations',
    testInfo,
  });

  await loginThroughUi(page);

  await recorder.measure('accounts_page_load_ms', async () => {
    await openNavigation(
      page,
      'nav-account',
      '**/account',
      page.getByTestId('accounts-page'),
    );
  });

  recorder.flush();
});

test('accounts create account', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'accounts.performance.json',
    suiteName: 'accounts-operations',
    testInfo,
  });

  const uniqueToken = `${Date.now()}-${testInfo.repeatEachIndex}`;
  const accountName = `Test Account ${uniqueToken}`;
  const accountNumber = `AC${String(Date.now()).slice(-8)}`;

  await loginThroughUi(page);
  await openNavigation(page, 'nav-account', '**/account', page.getByTestId('accounts-page'));

  await recorder.measure('add_account_modal_open_ms', async () => {
    await page.getByTestId('accounts-link-button').click();
    await expect(page.getByTestId('add-account-modal')).toBeVisible();
  });

  await recorder.measure('create_account_ms', async () => {
    await page.getByTestId('add-account-name').fill(accountName);
    await page.getByTestId('add-account-type').selectOption('Savings');
    await page.getByTestId('add-account-number').fill(accountNumber);
    await page.getByTestId('add-account-initial-balance').fill('500');
    await page.getByTestId('add-account-submit').click();
    await expect(page.getByTestId('add-account-modal')).toBeHidden();
    await expect(page.getByText(accountName)).toBeVisible();
  });

  recorder.flush({ created_account_name: accountName, created_account_number: accountNumber });
});

test('accounts deposit', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'accounts.performance.json',
    suiteName: 'accounts-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await openNavigation(page, 'nav-account', '**/account', page.getByTestId('accounts-page'));

  await recorder.measure('deposit_modal_open_ms', async () => {
    await page.getByTestId('accounts-deposit-button').click();
    await expect(page.getByTestId('deposit-modal')).toBeVisible();
  });

  await recorder.measure('deposit_ms', async () => {
    // Select first available account
    const options = await page
      .locator('[data-testid="deposit-account-select"] option')
      .evaluateAll((opts) =>
        opts.filter((o) => o.value).map((o) => ({ value: o.value, label: o.textContent?.trim() })),
      );
    if (options[0]) {
      await page.getByTestId('deposit-account-select').selectOption(options[0].value);
    }
    await page.getByTestId('deposit-amount-input').fill('100');
    await page.getByTestId('deposit-description-input').fill('Playwright deposit test');
    await page.getByTestId('deposit-submit').click();
    await expect(page.getByTestId('deposit-modal')).toBeHidden();
  });

  recorder.flush();
});
