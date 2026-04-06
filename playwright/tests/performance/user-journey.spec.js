/**
 * user-journey.spec.js — Full realistic user journey timing
 *
 * Simulates how a real user interacts with the app in one session:
 * login → create account → deposit → transfer → pay → dashboard filters
 * → view transactions → update settings → logout.
 *
 * Uses seed data (no register step). Unique account name/number generated
 * per run so repeated runs don't conflict.
 *
 * Thesis relevance:
 *   - V1 → V2: overall journey time shows cumulative performance improvement
 *   - V2 → V3: security overhead across all operations shows combined cost
 *   - full_user_journey_ms is the single headline metric for V1 vs V3 comparison
 *
 * Report: {label}.user-journey.performance.json
 */

import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import {
  getSelectOptions,
  loginThroughUi,
  logoutThroughUi,
  openNavigation,
  selectOptionByText,
} from '../../utils/helpers.js';

test.describe.configure({ mode: 'serial' });

test('full realistic user journey', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'user-journey.performance.json',
    suiteName: 'full-finance-user-journey',
    testInfo,
  });

  const started = performance.now();
  const uniqueToken = `${Date.now()}-${testInfo.repeatEachIndex}`;
  const accountName = `Journey Account ${uniqueToken}`;
  const accountNumber = `AC${String(Date.now()).slice(-8)}`;
  const contactValue = `+48${String(Date.now()).slice(-9)}`;

  // ── 1. Login ─────────────────────────────────────────────────────────────
  await recorder.measure('login_ms', async () => {
    await loginThroughUi(page);
  });

  // ── 2. Navigate to Accounts ───────────────────────────────────────────────
  await recorder.measure('open_accounts_page_ms', async () => {
    await openNavigation(
      page,
      'nav-account',
      '**/account',
      page.getByTestId('accounts-page'),
    );
  });

  // ── 3. Create a new account ───────────────────────────────────────────────
  await recorder.measure('create_account_ms', async () => {
    await page.getByTestId('accounts-link-button').click();
    await expect(page.getByTestId('add-account-modal')).toBeVisible();
    await page.getByTestId('add-account-name').fill(accountName);
    await page.getByTestId('add-account-type').selectOption('Savings');
    await page.getByTestId('add-account-number').fill(accountNumber);
    await page.getByTestId('add-account-initial-balance').fill('500');
    await page.getByTestId('add-account-submit').click();
    await expect(page.getByTestId('add-account-modal')).toBeHidden();
    await expect(page.getByText(accountName)).toBeVisible();
  });

  // ── 4. Deposit into new account ───────────────────────────────────────────
  await recorder.measure('deposit_ms', async () => {
    await page.getByTestId('accounts-deposit-button').click();
    await expect(page.getByTestId('deposit-modal')).toBeVisible();
    await selectOptionByText(page, 'deposit-account-select', accountNumber.slice(-4));
    await page.getByTestId('deposit-amount-input').fill('200');
    await page.getByTestId('deposit-description-input').fill('Journey deposit');
    await page.getByTestId('deposit-submit').click();
    await expect(page.getByTestId('deposit-modal')).toBeHidden();
    await expect(page.getByText(accountName)).toBeVisible();
  });

  // ── 5. Transfer between accounts ─────────────────────────────────────────
  await recorder.measure('transfer_ms', async () => {
    await openNavigation(
      page,
      'nav-transfer',
      '**/transfer',
      page.getByTestId('transfer-page'),
    );

    const fromOptions = await getSelectOptions(page, 'transfer-from-account');
    const fromOption = fromOptions[0];
    if (!fromOption) throw new Error('No transfer source accounts available');

    await page.getByTestId('transfer-from-account').selectOption(fromOption.value);

    const toOptions = await getSelectOptions(page, 'transfer-to-account');
    const toOption = toOptions.find((o) => o.value !== fromOption.value) || toOptions[1];
    if (!toOption) throw new Error('No transfer destination accounts available');

    await page.getByTestId('transfer-to-account').selectOption(toOption.value);
    await page.getByTestId('transfer-amount').fill('25');
    await page.getByTestId('transfer-description').fill('Journey transfer');
    await page.getByTestId('transfer-submit').click();
    await page.waitForURL('**/transactions');
    await expect(page.getByTestId('transactions-page')).toBeVisible();
  });

  // ── 6. External payment ───────────────────────────────────────────────────
  await recorder.measure('external_payment_ms', async () => {
    await openNavigation(page, 'nav-pay', '**/pay', page.getByTestId('pay-page'));

    const payOptions = await getSelectOptions(page, 'pay-from-account');
    const payOption = payOptions[0];
    if (!payOption) throw new Error('No payment source accounts available');

    await page.getByTestId('pay-from-account').selectOption(payOption.value);
    await page.getByTestId('pay-recipient-name').fill('Journey Recipient');
    await page.getByTestId('pay-bank-name').fill('Demo Bank');
    await page.getByTestId('pay-recipient-account').fill('DE12345678');
    await page.getByTestId('pay-amount').fill('15');
    await page.getByTestId('pay-description').fill('Journey payment');
    await page.getByTestId('pay-submit').click();
    await page.waitForURL('**/transactions');
    await expect(page.getByTestId('transactions-page')).toBeVisible();
  });

  // ── 7. Browse transactions ────────────────────────────────────────────────
  await recorder.measure('transactions_search_ms', async () => {
    await page.getByTestId('transactions-search').fill('Order placed');
    await expect(page.getByTestId('transactions-table-body')).toContainText('Order placed');
    await page.getByTestId('transactions-clear').click();
  });

  // ── 8. Navigate to Dashboard and interact with filters ───────────────────
  await recorder.measure('open_dashboard_ms', async () => {
    await openNavigation(
      page,
      'nav-dashboard',
      '**/dashboard',
      page.getByTestId('dashboard-kpi-section'),
    );
  });

  await recorder.measure('dashboard_kpi_filter_ms', async () => {
    const kpi = page.getByTestId('dashboard-kpi-section');
    await kpi.getByTestId('dashboard-time-filter-last_3_months').click();
    await page.waitForTimeout(50);
  });

  await recorder.measure('dashboard_trends_filter_ms', async () => {
    const trends = page.getByTestId('dashboard-trends-section');
    await trends.getByTestId('trends-range-filter-6m').click();
    await page.waitForTimeout(50);
  });

  // ── 9. Update settings profile ────────────────────────────────────────────
  await recorder.measure('settings_profile_update_ms', async () => {
    await openNavigation(
      page,
      'nav-settings',
      '**/settings',
      page.getByTestId('settings-page'),
    );

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/auth/user/profile') && r.request().method() === 'PUT' && r.ok(),
    );

    await page.getByTestId('settings-contact').fill(contactValue);
    await page.getByTestId('settings-save-profile').click();
    await responsePromise;
    await expect(page.getByTestId('settings-contact')).toHaveValue(contactValue);
  });

  // ── 10. Logout ────────────────────────────────────────────────────────────
  await recorder.measure('logout_ms', async () => {
    await logoutThroughUi(page);
  });

  recorder.record('full_user_journey_ms', performance.now() - started);
  recorder.flush({
    generated_account_name: accountName,
    generated_account_number: accountNumber,
  });
});
