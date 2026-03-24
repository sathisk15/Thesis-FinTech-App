import puppeteer from 'puppeteer';
import { startFlow } from 'lighthouse';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173'; // use production preview server

const EXPERIMENT_CONFIG = {
  runs: 5,
};

const PAGES = [
  { url: '/dashboard', name: 'dashboard' },
  { url: '/account', name: 'accounts' },
  { url: '/transactions', name: 'transactions' },
  { url: '/transfer', name: 'transfer' },
  { url: '/pay', name: 'pay' },
  { url: '/settings', name: 'settings' },
];

function extractMetrics(lhr) {
  return {
    performance: lhr.categories.performance.score * 100,
    fcp: lhr.audits['first-contentful-paint'].numericValue,
    lcp: lhr.audits['largest-contentful-paint'].numericValue,
    speedIndex: lhr.audits['speed-index'].numericValue,
    tbt: lhr.audits['total-blocking-time'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue,
  };
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr) {
  const m = mean(arr);
  return Math.sqrt(
    arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / arr.length,
  );
}

function computeStatistics(results) {
  const metrics = Object.keys(results[0]);
  const stats = {};

  metrics.forEach((metric) => {
    const values = results.map((r) => r[metric]);
    stats[`${metric}_mean`] = mean(values);
    stats[`${metric}_std`] = std(values);
  });

  return stats;
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, {
    waitUntil: 'networkidle0',
  });

  await page.type('input[name="email"]', 'sathis@gmail.com');
  await page.type('input[name="password"]', '123');

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  console.log('✅ Logged in');
}

async function runExperiment() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--remote-debugging-port=9222'],
  });

  const page = await browser.newPage();

  await login(page);

  const results = {};

  for (const pageConfig of PAGES) {
    const pageResults = [];

    for (let i = 0; i < EXPERIMENT_CONFIG.runs; i++) {
      console.log(`🔁 Run ${i + 1} for ${pageConfig.name}`);

      const flow = await startFlow(page, {
        name: `${pageConfig.name}-flow`,
      });

      const step = await flow.navigate(`${BASE_URL}${pageConfig.url}`, {
        stepName: `${pageConfig.name} load`,
      });

      const lhr = step.lhr;

      const metrics = extractMetrics(lhr);

      pageResults.push(metrics);
    }

    results[pageConfig.name] = {
      runs: pageResults,
      statistics: computeStatistics(pageResults),
    };
  }

  const dir = path.resolve('reports');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(
    path.join(dir, 'performance_metrics.json'),
    JSON.stringify(results, null, 2),
  );

  await browser.close();

  console.log('✅ Experiment completed');
}

runExperiment();
