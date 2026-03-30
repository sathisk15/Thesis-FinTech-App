import { expect } from '@playwright/test';
import { playwrightUser } from './config.js';

export async function waitForDashboard(page) {
  await page.waitForURL('**/dashboard');
  await expect(page.getByText('Key Financial Metrics')).toBeVisible();
}

export async function loginThroughUi(page) {
  await page.context().clearCookies();
  await page.goto('/login');
  await expect(page.getByTestId('login-page')).toBeVisible();
  await page.getByTestId('login-email').fill(playwrightUser.email);
  await page.getByTestId('login-password').fill(playwrightUser.password);
  await page.getByTestId('login-submit').click();
  await waitForDashboard(page);
}

export async function logoutThroughUi(page) {
  await page.getByTestId('logout-button').click();
  await page.waitForURL('**/login');
  await expect(page.getByTestId('login-page')).toBeVisible();
}

export async function openNavigation(page, navTestId, urlPattern, readyLocator) {
  await page.getByTestId(navTestId).click();
  await page.waitForURL(urlPattern);
  await expect(readyLocator).toBeVisible();
}

export async function getSelectOptions(page, testId) {
  return page.locator(`[data-testid="${testId}"] option`).evaluateAll((options) =>
    options
      .filter((option) => option.value)
      .map((option) => ({
        value: option.value,
        label: option.textContent?.trim() || '',
      })),
  );
}

export async function selectOptionByText(page, testId, textFragment) {
  const options = await getSelectOptions(page, testId);
  const match = options.find((option) => option.label.includes(textFragment));

  if (!match) {
    throw new Error(
      `No option found for ${testId} containing text: ${textFragment}`,
    );
  }

  await page.getByTestId(testId).selectOption(match.value);

  return match;
}
