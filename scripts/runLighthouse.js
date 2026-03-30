import '../config/loadEnv.js';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { pathToFileURL } from 'url';

const BASE_URL = process.env.LIGHTHOUSE_BASE_URL || 'http://localhost:5173';
const DEBUG_PORT = Number(process.env.LIGHTHOUSE_DEBUG_PORT || 9222);
const LIGHTHOUSE_EMAIL =
  process.env.LIGHTHOUSE_EMAIL || process.env.SEED_USER_EMAIL || 'sathis@gmail.com';
const LIGHTHOUSE_PASSWORD =
  process.env.LIGHTHOUSE_PASSWORD || process.env.SEED_USER_PASSWORD || '123';
const LIGHTHOUSE_RUNS = Number(process.env.LIGHTHOUSE_RUNS || 1);

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
  } catch {
    return 'unlabeled';
  }
}

const AUDIT_LABEL = process.env.AUDIT_LABEL || getGitBranch();

const EXPERIMENT_CONFIG = {
  runs: LIGHTHOUSE_RUNS,
};

function getGitMetadata() {
  try {
    const commitHash = execSync('git rev-parse --short HEAD', { stdio: 'pipe' })
      .toString()
      .trim();
    return { branch: AUDIT_LABEL, commitHash };
  } catch {
    return { branch: AUDIT_LABEL, commitHash: 'unknown' };
  }
}

const PAGES = [
  { url: '/dashboard', name: 'dashboard' },
  { url: '/account', name: 'accounts' },
  { url: '/transactions', name: 'transactions' },
  { url: '/transfer', name: 'transfer' },
  { url: '/pay', name: 'pay' },
  { url: '/settings', name: 'settings' },
];

async function launchBrowser() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer-profile-'));

  return puppeteer.launch({
    headless: true,
    args: [
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${tempDir}`,
      '--disable-cache',
    ],
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
  await page.type('input[name="email"]', LIGHTHOUSE_EMAIL);
  await page.type('input[name="password"]', LIGHTHOUSE_PASSWORD);

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForFunction(() => window.location.pathname !== '/login', {
      timeout: 15000,
    }),
  ]);

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

    formFactor: 'desktop',

    // Experimental flags
    throttlingMethod: 'simulate',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
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
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(
      arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / (arr.length - 1),
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
  const { branch, commitHash } = getGitMetadata();
  const timestamp = new Date().toISOString();

  const report = {
    _meta: {
      label: AUDIT_LABEL,
      branch,
      commitHash,
      timestamp,
      node_version: process.version,
    },
    ...metrics,
  };

  const lighthouseDir = path.resolve('reports', 'lighthouse');
  const historyDir = path.join(lighthouseDir, 'history');

  fs.mkdirSync(historyDir, { recursive: true });

  // Latest report for this label (used by compareReports.js)
  const latestPath = path.join(lighthouseDir, `${AUDIT_LABEL}.json`);
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
  console.log('✅ Lighthouse report saved at:', latestPath);

  // Permanent archive with timestamp
  const safeTimestamp = timestamp.replace(/[:.]/g, '-');
  const archivePath = path.join(historyDir, `${AUDIT_LABEL}_${safeTimestamp}.json`);
  fs.writeFileSync(archivePath, JSON.stringify(report, null, 2));
  console.log('📦 Archived at:', archivePath);
}

export async function startAudit({ runs = EXPERIMENT_CONFIG.runs } = {}) {
  const metrics = await runAllTests(PAGES, runs);

  saveReport(metrics);
}

async function main() {
  try {
    await startAudit({ runs: EXPERIMENT_CONFIG.runs });
  } catch (error) {
    console.error('Lighthouse audit failed:', error);
    process.exit(1);
  }
}

const isDirectExecution =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main();
}
