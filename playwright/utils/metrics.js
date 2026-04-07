import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { playwrightReportDir, resultsLabel, thesisVariant } from './config.js';

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
  } catch {
    return thesisVariant;
  }
}

function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: 'pipe' }).toString().trim();
  } catch {
    return 'unknown';
  }
}

const AUDIT_LABEL = process.env.AUDIT_LABEL || getGitBranch();

function round(value) {
  return Math.round(value * 100) / 100;
}

function getMean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getStdDev(values) {
  if (values.length < 2) return 0;
  const mean = getMean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function getP95(values) {
  if (values.length < 2) return round(values[0] ?? 0);
  const sorted = [...values].sort((a, b) => a - b);
  return round(sorted[Math.ceil(0.95 * sorted.length) - 1]);
}

// Append measurements from one run into the metric-keyed report structure,
// then recompute statistics for each updated metric.
function buildMetrics(report, measurements) {
  for (const { name, duration_ms } of measurements) {
    if (!report[name]) {
      report[name] = { runs: [], statistics: {} };
    }
    report[name].runs.push(round(duration_ms));
  }

  // Recompute statistics for every metric after appending
  for (const key of Object.keys(report)) {
    if (key === '_meta') continue;
    const values = report[key].runs;
    report[key].statistics = {
      mean: round(getMean(values)),
      min: round(Math.min(...values)),
      max: round(Math.max(...values)),
      std: round(getStdDev(values)),
      p95: getP95(values),
    };
  }
}

function makeMeta(suiteName) {
  return {
    suite: suiteName,
    variant: thesisVariant,
    label: AUDIT_LABEL,
    branch: getGitBranch(),
    commitHash: getCommitHash(),
    timestamp: new Date().toISOString(),
  };
}

function readExistingReport(filePath, suiteName) {
  if (!fs.existsSync(filePath)) {
    return { _meta: makeMeta(suiteName) };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureReportDir() {
  fs.mkdirSync(playwrightReportDir, { recursive: true });
}

export class PerformanceRecorder {
  constructor({ reportName, suiteName, testInfo }) {
    this.reportName = reportName;
    this.suiteName = suiteName;
    this.testInfo = testInfo;
    this.measurements = [];
  }

  async measure(name, action, metadata = {}) {
    const started = performance.now();
    const result = await action();
    const duration = round(performance.now() - started);

    this.measurements.push({
      name,
      duration_ms: duration,
      ...metadata,
    });

    return { result, durationMs: duration };
  }

  record(name, durationMs, metadata = {}) {
    this.measurements.push({
      name,
      duration_ms: round(durationMs),
      ...metadata,
    });
  }

  flush() {
    ensureReportDir();

    const labeledName = resultsLabel
      ? `${resultsLabel}.${this.reportName}`
      : this.reportName;
    const filePath = path.join(playwrightReportDir, labeledName);
    const report = readExistingReport(filePath, this.suiteName);

    // Refresh meta on every flush
    report._meta = makeMeta(this.suiteName);

    buildMetrics(report, this.measurements);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    return filePath;
  }
}
