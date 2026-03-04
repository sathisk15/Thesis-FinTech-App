import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const DEBUG_PORT = 9222;

const PAGES = [
  { url: '/dashboard', name: 'dashboard' },
  { url: '/account', name: 'accounts' },
  { url: '/transactions', name: 'transactions' },
  { url: '/transfer', name: 'transfer' },
  { url: '/pay', name: 'pay' },
  { url: '/settings', name: 'settings' },
];

async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: [`--remote-debugging-port=${DEBUG_PORT}`],
  });
}

async function openLoginPage(browser) {
  const page = await browser.newPage();

  await page.goto(`${BASE_URL}/login`, {
    waitUntil: 'networkidle2',
  });

  return page;
}

async function performLogin(page) {
  await page.type('input[name="email"]', 'sathis@gmail.com');
  await page.type('input[name="password"]', '123');

  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('✅ Logged in successfully');
}

async function setupLoggedInBrowser() {
  const browser = await launchBrowser();
  const page = await openLoginPage(browser);

  await performLogin(page);

  return browser;
}

async function runLighthouseAudit(url, port) {
  const result = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'info',
    disableStorageReset: true,
  });

  return JSON.parse(result.report);
}

function extractMetrics(report) {
  return {
    performance: report.categories.performance.score * 100,
    fcp: report.audits['first-contentful-paint'].numericValue,
    lcp: report.audits['largest-contentful-paint'].numericValue,
    speedIndex: report.audits['speed-index'].numericValue,
    tbt: report.audits['total-blocking-time'].numericValue,
    cls: report.audits['cumulative-layout-shift'].numericValue,
  };
}

async function runSingleTest(pageConfig, runs) {
  const results = [];

  for (let i = 0; i < runs; i++) {
    const browser = await setupLoggedInBrowser();

    const report = await runLighthouseAudit(
      BASE_URL + pageConfig.url,
      DEBUG_PORT,
    );

    const metrics = extractMetrics(report);

    results.push(metrics);

    await browser.close();

    console.log(`✅ Test completed for ${pageConfig.name}`);
  }

  return results;
}

async function runAllTests(pages, runs) {
  const metrics = {};
  for (const page of pages) {
    metrics[page.name] = await runSingleTest(page, runs);
  }
  return metrics;
}

function saveReport(metrics) {
  fs.writeFileSync(
    './lighthouse/reports/metrics.json',
    JSON.stringify(metrics),
  );

  console.log('✅ Lighthouse report generated');
}

async function startAudit({ runs = 1 }) {
  const metrics = await runAllTests(PAGES, runs);

  saveReport(metrics);
}

startAudit({ runs: 1 });
