import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import {
  loginThroughUi,
  logoutThroughUi,
  openNavigation,
  getSelectOptions,
} from '../../utils/helpers.js';

test.describe.configure({ mode: 'serial' });

// ─── Test 1: Core Auth & Transaction Flows ────────────────────────────────────

test('core auth and transaction flows', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'page-operations.performance.json',
    suiteName: 'page-operations',
    testInfo,
  });

  const flowStart = performance.now();

  await recorder.measure('login_ms', async () => {
    await loginThroughUi(page);
  });

  await openNavigation(page, 'nav-transfer', '**/transfer', page.getByTestId('transfer-page'));

  await recorder.measure('transfer_fill_form_ms', async () => {
    const fromOptions = await getSelectOptions(page, 'transfer-from-account');
    const fromOption = fromOptions[0];
    if (!fromOption) throw new Error('No transfer source accounts available');
    await page.getByTestId('transfer-from-account').selectOption(fromOption.value);

    const toOptions = await getSelectOptions(page, 'transfer-to-account');
    const toOption = toOptions.find((o) => o.value !== fromOption.value) || toOptions[0];
    if (!toOption) throw new Error('No transfer destination accounts available');
    await page.getByTestId('transfer-to-account').selectOption(toOption.value);

    await page.getByTestId('transfer-amount').fill('10');
    await page.getByTestId('transfer-description').fill('Ops perf transfer');
  });

  await recorder.measure('transfer_submit_ms', async () => {
    await page.getByTestId('transfer-submit').click();
    await page.waitForURL('**/transactions');
    await expect(page.getByTestId('transactions-page')).toBeVisible();
  });

  await openNavigation(page, 'nav-pay', '**/pay', page.getByTestId('pay-page'));

  await recorder.measure('pay_fill_form_ms', async () => {
    const payOptions = await getSelectOptions(page, 'pay-from-account');
    const payOption = payOptions[0];
    if (!payOption) throw new Error('No payment source accounts available');
    await page.getByTestId('pay-from-account').selectOption(payOption.value);
    await page.getByTestId('pay-recipient-name').fill('Ops Recipient');
    await page.getByTestId('pay-bank-name').fill('Test Bank');
    await page.getByTestId('pay-recipient-account').fill('DE12345678');
    await page.getByTestId('pay-amount').fill('5');
    await page.getByTestId('pay-description').fill('Ops perf payment');
  });

  await recorder.measure('pay_submit_ms', async () => {
    await page.getByTestId('pay-submit').click();
    await page.waitForURL('**/transactions');
    await expect(page.getByTestId('transactions-page')).toBeVisible();
  });

  await recorder.measure('logout_ms', async () => {
    await logoutThroughUi(page);
  });

  recorder.record('complete_flow_ms', performance.now() - flowStart);
  recorder.flush();
});

// ─── Test 2: Dashboard Section Filters ────────────────────────────────────────

test('dashboard section filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'page-operations.performance.json',
    suiteName: 'page-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await page.goto('/dashboard');
  await expect(page.getByText('Key Financial Metrics')).toBeVisible();

  // Read a real account from the KPI section's dropdown to use across all sections
  const kpiSection = page.getByTestId('dashboard-kpi-section');
  const accountOptions = await kpiSection
    .getByTestId('dashboard-account-filter')
    .evaluateAll((selects) =>
      selects[0]
        ? [...selects[0].querySelectorAll('option[value]:not([value="all"])')].map((o) => ({
            value: o.value,
            label: o.textContent,
          }))
        : [],
    );
  const firstAccount = accountOptions[0];

  // ── KPI Section ──
  await recorder.measure('kpi_timerange_filter_ms', async () => {
    await kpiSection.getByTestId('dashboard-time-filter-last_3_months').click();
    await page.waitForTimeout(300);
  });

  await recorder.measure('kpi_account_filter_ms', async () => {
    if (firstAccount) {
      await kpiSection.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(300);
  });

  await recorder.measure('kpi_clear_ms', async () => {
    await kpiSection.getByTitle('Clear filters').click();
    await page.waitForTimeout(300);
  });

  // ── Trends Section ──
  const trendsSection = page.getByTestId('dashboard-trends-section');

  await recorder.measure('trends_range_filter_ms', async () => {
    await trendsSection.getByTestId('trends-range-filter-6m').click();
    await page.waitForTimeout(300);
  });

  await recorder.measure('trends_account_filter_ms', async () => {
    if (firstAccount) {
      await trendsSection.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(300);
  });

  await recorder.measure('trends_clear_ms', async () => {
    await trendsSection.getByTitle('Clear filters').click();
    await page.waitForTimeout(300);
  });

  // ── Breakdown Section ──
  const breakdownSection = page.getByTestId('dashboard-breakdown-section');

  await recorder.measure('breakdown_timerange_filter_ms', async () => {
    await breakdownSection.getByTestId('dashboard-time-filter-last_3_months').click();
    await page.waitForTimeout(300);
  });

  await recorder.measure('breakdown_account_filter_ms', async () => {
    if (firstAccount) {
      await breakdownSection.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(300);
  });

  await recorder.measure('breakdown_clear_ms', async () => {
    await breakdownSection.getByTitle('Clear filters').click();
    await page.waitForTimeout(300);
  });

  // ── Health Section ──
  const healthSection = page.getByTestId('dashboard-health-section');

  await recorder.measure('health_timerange_filter_ms', async () => {
    await healthSection.getByTestId('dashboard-time-filter-this_month').click();
    await page.waitForTimeout(300);
  });

  await recorder.measure('health_account_filter_ms', async () => {
    if (firstAccount) {
      await healthSection.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(300);
  });

  await recorder.measure('health_clear_ms', async () => {
    await healthSection.getByTitle('Clear filters').click();
    await page.waitForTimeout(300);
  });

  // ── Recent Activity Section ──
  const activitySection = page.getByTestId('dashboard-activity-section');

  await recorder.measure('activity_account_filter_ms', async () => {
    if (firstAccount) {
      await activitySection.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(300);
  });

  recorder.flush();
});

// ─── Test 3: Transactions Filters ─────────────────────────────────────────────

test('transactions filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'page-operations.performance.json',
    suiteName: 'page-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await openNavigation(
    page,
    'nav-transactions',
    '**/transactions',
    page.getByTestId('transactions-page'),
  );

  await recorder.measure('transactions_search_ms', async () => {
    await page.getByTestId('transactions-search').fill('Order placed');
    await expect(page.getByTestId('transactions-table-body')).toContainText('Order placed');
  });

  await page.getByTestId('transactions-clear').click();

  await recorder.measure('transactions_date_filter_ms', async () => {
    await page.getByTestId('transactions-from-date').fill('2024-01-01');
    await page.getByTestId('transactions-to-date').fill('2026-03-30');
    await page.waitForTimeout(300);
  });

  await recorder.measure('transactions_amount_filter_ms', async () => {
    await page.getByTestId('transactions-min-amount').fill('10');
    await page.getByTestId('transactions-max-amount').fill('1000');
    await page.waitForTimeout(300);
  });

  await recorder.measure('transactions_flow_filter_ms', async () => {
    await page.getByTestId('transactions-flow-filter').selectOption('incoming');
    await page.waitForTimeout(300);
  });

  await recorder.measure('transactions_sort_ms', async () => {
    await page.getByTestId('transactions-sort').selectOption('date-asc');
    await page.waitForTimeout(300);
  });

  await page.getByTestId('transactions-clear').click();

  await recorder.measure('transactions_combined_filters_ms', async () => {
    await page.getByTestId('transactions-search').fill('Order placed');
    await page.getByTestId('transactions-from-date').fill('2024-01-01');
    await page.getByTestId('transactions-to-date').fill('2026-03-30');
    await page.getByTestId('transactions-min-amount').fill('1');
    await page.getByTestId('transactions-max-amount').fill('5000');
    await page.getByTestId('transactions-flow-filter').selectOption('all');
    await expect(page.getByTestId('transactions-table-body')).toContainText('Order placed');
  });

  await recorder.measure('transactions_clear_all_ms', async () => {
    await page.getByTestId('transactions-clear').click();
    await expect(page.getByTestId('transactions-search')).toHaveValue('');
  });

  recorder.flush();
});
