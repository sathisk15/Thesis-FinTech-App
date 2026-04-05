/**
 * dashboard.spec.js — Dashboard filter operation timing
 *
 * Measures re-render latency for every interactive filter across all 5
 * dashboard sections: KPI, Trends, Breakdown, Health, Activity.
 *
 * Thesis relevance:
 *   - V2 P1: React.memo on all 12 dashboard sub-components — reduces
 *            re-renders when a filter changes in one section
 *   - V2 P2: useMemo for KPI calculations and chart data — avoids
 *            recomputing derived values on every filter update
 *   - V2 P3: useCallback for filter handlers — stable references prevent
 *            unnecessary child re-renders
 *
 * Report: {label}.dashboard.performance.json
 */

import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import { loginThroughUi } from '../../utils/helpers.js';

test.describe.configure({ mode: 'serial' });

test('dashboard initial render', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'dashboard.performance.json',
    suiteName: 'dashboard-operations',
    testInfo,
  });

  await recorder.measure('dashboard_initial_render_ms', async () => {
    await loginThroughUi(page);
    await expect(page.getByTestId('dashboard-kpi-section')).toBeVisible();
  });

  recorder.flush();
});

test('dashboard KPI section filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'dashboard.performance.json',
    suiteName: 'dashboard-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await expect(page.getByTestId('dashboard-kpi-section')).toBeVisible();

  const kpi = page.getByTestId('dashboard-kpi-section');

  // Read first real account from the dropdown
  const accountOptions = await kpi
    .getByTestId('dashboard-account-filter')
    .evaluateAll((selects) =>
      selects[0]
        ? [...selects[0].querySelectorAll('option[value]:not([value="all"])')].map((o) => ({
            value: o.value,
            label: o.textContent?.trim(),
          }))
        : [],
    );
  const firstAccount = accountOptions[0];

  await recorder.measure('kpi_timerange_filter_ms', async () => {
    await kpi.getByTestId('dashboard-time-filter-last_3_months').click();
    await page.waitForTimeout(50);
  });

  await recorder.measure('kpi_account_filter_ms', async () => {
    if (firstAccount) {
      await kpi.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(50);
  });

  await recorder.measure('kpi_clear_ms', async () => {
    await kpi.getByTitle('Clear filters').click();
    await page.waitForTimeout(50);
  });

  recorder.flush();
});

test('dashboard Trends section filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'dashboard.performance.json',
    suiteName: 'dashboard-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await expect(page.getByTestId('dashboard-trends-section')).toBeVisible();

  const trends = page.getByTestId('dashboard-trends-section');

  const accountOptions = await trends
    .getByTestId('dashboard-account-filter')
    .evaluateAll((selects) =>
      selects[0]
        ? [...selects[0].querySelectorAll('option[value]:not([value="all"])')].map((o) => ({
            value: o.value,
            label: o.textContent?.trim(),
          }))
        : [],
    );
  const firstAccount = accountOptions[0];

  await recorder.measure('trends_range_filter_ms', async () => {
    await trends.getByTestId('trends-range-filter-6m').click();
    await page.waitForTimeout(50);
  });

  await recorder.measure('trends_account_filter_ms', async () => {
    if (firstAccount) {
      await trends.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(50);
  });

  await recorder.measure('trends_clear_ms', async () => {
    await trends.getByTitle('Clear filters').click();
    await page.waitForTimeout(50);
  });

  recorder.flush();
});

test('dashboard Breakdown section filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'dashboard.performance.json',
    suiteName: 'dashboard-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await expect(page.getByTestId('dashboard-breakdown-section')).toBeVisible();

  const breakdown = page.getByTestId('dashboard-breakdown-section');

  const accountOptions = await breakdown
    .getByTestId('dashboard-account-filter')
    .evaluateAll((selects) =>
      selects[0]
        ? [...selects[0].querySelectorAll('option[value]:not([value="all"])')].map((o) => ({
            value: o.value,
            label: o.textContent?.trim(),
          }))
        : [],
    );
  const firstAccount = accountOptions[0];

  await recorder.measure('breakdown_timerange_filter_ms', async () => {
    await breakdown.getByTestId('dashboard-time-filter-last_3_months').click();
    await page.waitForTimeout(50);
  });

  await recorder.measure('breakdown_account_filter_ms', async () => {
    if (firstAccount) {
      await breakdown.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(50);
  });

  await recorder.measure('breakdown_clear_ms', async () => {
    await breakdown.getByTitle('Clear filters').click();
    await page.waitForTimeout(50);
  });

  recorder.flush();
});

test('dashboard Health section filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'dashboard.performance.json',
    suiteName: 'dashboard-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await expect(page.getByTestId('dashboard-health-section')).toBeVisible();

  const health = page.getByTestId('dashboard-health-section');

  const accountOptions = await health
    .getByTestId('dashboard-account-filter')
    .evaluateAll((selects) =>
      selects[0]
        ? [...selects[0].querySelectorAll('option[value]:not([value="all"])')].map((o) => ({
            value: o.value,
            label: o.textContent?.trim(),
          }))
        : [],
    );
  const firstAccount = accountOptions[0];

  await recorder.measure('health_timerange_filter_ms', async () => {
    await health.getByTestId('dashboard-time-filter-this_month').click();
    await page.waitForTimeout(50);
  });

  await recorder.measure('health_account_filter_ms', async () => {
    if (firstAccount) {
      await health.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(50);
  });

  await recorder.measure('health_clear_ms', async () => {
    await health.getByTitle('Clear filters').click();
    await page.waitForTimeout(50);
  });

  recorder.flush();
});

test('dashboard Activity section filters', async ({ page }, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'dashboard.performance.json',
    suiteName: 'dashboard-operations',
    testInfo,
  });

  await loginThroughUi(page);
  await expect(page.getByTestId('dashboard-activity-section')).toBeVisible();

  const activity = page.getByTestId('dashboard-activity-section');

  const accountOptions = await activity
    .getByTestId('dashboard-account-filter')
    .evaluateAll((selects) =>
      selects[0]
        ? [...selects[0].querySelectorAll('option[value]:not([value="all"])')].map((o) => ({
            value: o.value,
            label: o.textContent?.trim(),
          }))
        : [],
    );
  const firstAccount = accountOptions[0];

  await recorder.measure('activity_account_filter_ms', async () => {
    if (firstAccount) {
      await activity.getByTestId('dashboard-account-filter').selectOption(firstAccount.value);
    }
    await page.waitForTimeout(50);
  });

  recorder.flush();
});
