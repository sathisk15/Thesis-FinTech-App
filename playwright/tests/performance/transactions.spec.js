/**
 * transactions.spec.js — Transaction filter operation timing
 *
 * Measures response latency for every filter on the Transactions page:
 * search, date range, amount range, flow (incoming/outgoing), sort, combined.
 *
 * Thesis relevance:
 *   - V2 P5: react-window FixedSizeList virtualization — affects
 *            transactions_initial_load_ms (renders only visible rows)
 *   - V2 P6: 300ms debounce on search input — in V1 every keystroke
 *            triggers a filter; in V2 only the final value does.
 *            transactions_search_ms captures this difference.
 *
 * Report: {label}.transactions.performance.json
 */

import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import { loginThroughUi, openNavigation } from '../../utils/helpers.js';

test.describe.configure({ mode: 'serial' });

test('transactions initial load', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'transactions.performance.json',
    suiteName: 'transactions-operations',
    testInfo,
  });

  await loginThroughUi(page);

  await recorder.measure('transactions_initial_load_ms', async () => {
    await openNavigation(
      page,
      'nav-transactions',
      '**/transactions',
      page.getByTestId('transactions-page'),
    );
    await expect(page.getByTestId('transactions-table-body')).toBeVisible();
  });

  recorder.flush();
});

test('transactions search filter', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'transactions.performance.json',
    suiteName: 'transactions-operations',
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
  await expect(page.getByTestId('transactions-search')).toHaveValue('');

  recorder.flush();
});

test('transactions individual filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'transactions.performance.json',
    suiteName: 'transactions-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await openNavigation(
    page,
    'nav-transactions',
    '**/transactions',
    page.getByTestId('transactions-page'),
  );

  await recorder.measure('transactions_date_filter_ms', async () => {
    await page.getByTestId('transactions-from-date').fill('2024-01-01');
    await page.getByTestId('transactions-to-date').fill('2026-12-31');
    await page.waitForTimeout(50);
    await expect(page.getByTestId('transactions-table-body')).toBeVisible();
  });

  await page.getByTestId('transactions-clear').click();

  await recorder.measure('transactions_amount_filter_ms', async () => {
    await page.getByTestId('transactions-min-amount').fill('10');
    await page.getByTestId('transactions-max-amount').fill('5000');
    await page.waitForTimeout(50);
    await expect(page.getByTestId('transactions-table-body')).toBeVisible();
  });

  await page.getByTestId('transactions-clear').click();

  await recorder.measure('transactions_flow_filter_ms', async () => {
    await page.getByTestId('transactions-flow-filter').selectOption('incoming');
    await page.waitForTimeout(50);
    await expect(page.getByTestId('transactions-table-body')).toBeVisible();
  });

  await page.getByTestId('transactions-clear').click();

  await recorder.measure('transactions_sort_ms', async () => {
    await page.getByTestId('transactions-sort').selectOption('amount-desc');
    await page.waitForTimeout(50);
    await expect(page.getByTestId('transactions-table-body')).toBeVisible();
  });

  await page.getByTestId('transactions-clear').click();

  recorder.flush();
});

test('transactions combined filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'transactions.performance.json',
    suiteName: 'transactions-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await openNavigation(
    page,
    'nav-transactions',
    '**/transactions',
    page.getByTestId('transactions-page'),
  );

  await recorder.measure('transactions_combined_filters_ms', async () => {
    await page.getByTestId('transactions-search').fill('Order placed');
    await page.getByTestId('transactions-from-date').fill('2024-01-01');
    await page.getByTestId('transactions-to-date').fill('2026-12-31');
    await page.getByTestId('transactions-min-amount').fill('1');
    await page.getByTestId('transactions-max-amount').fill('9999');
    await page.getByTestId('transactions-flow-filter').selectOption('all');
    await page.getByTestId('transactions-sort').selectOption('date-desc');
    await expect(page.getByTestId('transactions-table-body')).toContainText('Order placed');
  });

  await recorder.measure('transactions_clear_all_ms', async () => {
    await page.getByTestId('transactions-clear').click();
    await expect(page.getByTestId('transactions-search')).toHaveValue('');
  });

  recorder.flush();
});
