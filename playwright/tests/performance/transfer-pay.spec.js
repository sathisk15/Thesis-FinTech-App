/**
 * transfer-pay.spec.js — Transfer and payment operation timing
 *
 * Measures form fill and submit timing for internal transfers
 * and external payments separately and as a combined flow.
 *
 * Thesis relevance:
 *   - V3 S4: express-validator on POST /accounts/transfer and POST /payments
 *            adds server-side validation overhead — visible in submit timings
 *   - V3 S7: JWT in HttpOnly cookie changes credential delivery per request
 *
 * Report: {label}.transfer-pay.performance.json
 */

import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import { loginThroughUi, logoutThroughUi, openNavigation, getSelectOptions } from '../../utils/helpers.js';

test.describe.configure({ mode: 'serial' });

test('transfer and payment flow', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'transfer-pay.performance.json',
    suiteName: 'transfer-pay-operations',
    testInfo,
  });

  const flowStart = performance.now();

  await recorder.measure('login_ms', async () => {
    await loginThroughUi(page);
  });

  // ── Transfer ─────────────────────────────────────────────────────────────
  await openNavigation(page, 'nav-transfer', '**/transfer', page.getByTestId('transfer-page'));

  await recorder.measure('transfer_fill_form_ms', async () => {
    const fromOptions = await getSelectOptions(page, 'transfer-from-account');
    const fromOption = fromOptions[0];
    if (!fromOption) throw new Error('No transfer source accounts available');

    await page.getByTestId('transfer-from-account').selectOption(fromOption.value);

    const toOptions = await getSelectOptions(page, 'transfer-to-account');
    const toOption = toOptions.find((o) => o.value !== fromOption.value) || toOptions[1];
    if (!toOption) throw new Error('No transfer destination accounts available');

    await page.getByTestId('transfer-to-account').selectOption(toOption.value);
    await page.getByTestId('transfer-amount').fill('10');
    await page.getByTestId('transfer-description').fill('Playwright transfer test');
  });

  await recorder.measure('transfer_submit_ms', async () => {
    await page.getByTestId('transfer-submit').click();
    await page.waitForURL('**/transactions');
    await expect(page.getByTestId('transactions-page')).toBeVisible();
  });

  // ── Pay ───────────────────────────────────────────────────────────────────
  await openNavigation(page, 'nav-pay', '**/pay', page.getByTestId('pay-page'));

  await recorder.measure('pay_fill_form_ms', async () => {
    const payOptions = await getSelectOptions(page, 'pay-from-account');
    const payOption = payOptions[0];
    if (!payOption) throw new Error('No payment source accounts available');

    await page.getByTestId('pay-from-account').selectOption(payOption.value);
    await page.getByTestId('pay-recipient-name').fill('Playwright Recipient');
    await page.getByTestId('pay-bank-name').fill('Test Bank');
    await page.getByTestId('pay-recipient-account').fill('DE12345678');
    await page.getByTestId('pay-amount').fill('5');
    await page.getByTestId('pay-description').fill('Playwright payment test');
  });

  await recorder.measure('pay_submit_ms', async () => {
    await page.getByTestId('pay-submit').click();
    await page.waitForURL('**/transactions');
    await expect(page.getByTestId('transactions-page')).toBeVisible();
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  await recorder.measure('logout_ms', async () => {
    await logoutThroughUi(page);
  });

  recorder.record('complete_flow_ms', performance.now() - flowStart);
  recorder.flush();
});
