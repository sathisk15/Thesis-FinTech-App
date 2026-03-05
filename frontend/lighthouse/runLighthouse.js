import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const DEBUG_PORT = 9222;

const EXPERIMENT_CONFIG = {
  repetitions: 10, // number of experiment repetitions
};

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

    // Experimental flags
    throttlingMethod: 'simulate',
    screenEmulation: { disabled: true },
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

function computeStatistics(results) {
  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const std = (arr) => {
    const m = mean(arr);
    return Math.sqrt(
      arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length,
    );
  };

  const statistics = {};

  // automatically detect all metrics from result object
  const metrics = Object.keys(results[0]);

  metrics.forEach((metric) => {
    const values = results.map((r) => r[metric]);

    statistics[`${metric}_mean`] = mean(values);
    statistics[`${metric}_std`] = std(values);
  });

  return statistics;
}

async function runSingleTest(pageConfig, runs) {
  const results = [];

  const browser = await setupLoggedInBrowser();

  for (let i = 0; i < runs; i++) {
    console.log(`🔁 Run ${i + 1} for ${pageConfig.name}`);

    const report = await runLighthouseAudit(
      BASE_URL + pageConfig.url,
      DEBUG_PORT,
    );

    const metrics = extractMetrics(report);

    results.push(metrics);
  }

  await browser.close();

  return results;
}

async function runAllTests(pages, runs) {
  const metrics = {};

  for (const page of pages) {
    const results = await runSingleTest(page, runs);

    metrics[page.name] = {
      runs: results,
      statistics: computeStatistics(results),
    };
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

startAudit({ runs: EXPERIMENT_CONFIG.repetitions });
