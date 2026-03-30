import { test, expect } from '@playwright/test';
import { PerformanceRecorder } from '../../utils/metrics.js';
import {
  loginThroughUi,
  openNavigation,
} from '../../utils/helpers.js';

test('measure authenticated route readiness and filter response', async ({
  page,
}, testInfo) => {
  const recorder = new PerformanceRecorder({
    reportName: 'route-readiness.performance.json',
    suiteName: 'authenticated-route-readiness',
    testInfo,
  });

  await recorder.measure('login_to_dashboard_ms', async () => {
    await loginThroughUi(page);
  });

  const routes = [
    {
      name: 'dashboard_route_ready_ms',
      navTestId: 'nav-dashboard',
      urlPattern: '**/dashboard',
      readyLocator: page.getByText('Key Financial Metrics'),
    },
    {
      name: 'accounts_route_ready_ms',
      navTestId: 'nav-account',
      urlPattern: '**/account',
      readyLocator: page.getByTestId('accounts-page'),
    },
    {
      name: 'transactions_route_ready_ms',
      navTestId: 'nav-transactions',
      urlPattern: '**/transactions',
      readyLocator: page.getByTestId('transactions-page'),
    },
    {
      name: 'transfer_route_ready_ms',
      navTestId: 'nav-transfer',
      urlPattern: '**/transfer',
      readyLocator: page.getByTestId('transfer-page'),
    },
    {
      name: 'pay_route_ready_ms',
      navTestId: 'nav-pay',
      urlPattern: '**/pay',
      readyLocator: page.getByTestId('pay-page'),
    },
    {
      name: 'settings_route_ready_ms',
      navTestId: 'nav-settings',
      urlPattern: '**/settings',
      readyLocator: page.getByTestId('settings-page'),
    },
  ];

  for (const route of routes) {
    await recorder.measure(route.name, async () => {
      await openNavigation(
        page,
        route.navTestId,
        route.urlPattern,
        route.readyLocator,
      );
    });
  }

  await openNavigation(
    page,
    'nav-transactions',
    '**/transactions',
    page.getByTestId('transactions-page'),
  );

  await recorder.measure('transactions_search_filter_ms', async () => {
    await page.getByTestId('transactions-search').fill('Order placed');
    await expect(page.getByTestId('transactions-table-body')).toContainText(
      'Order placed',
    );
  });

  recorder.flush();
});
