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

function buildSummary(runs) {
  if (!runs || runs.length === 0) return {};

  const grouped = new Map();

  for (const run of runs) {
    if (!run.measurements) continue;
    for (const measurement of run.measurements) {
      const entry = grouped.get(measurement.name) || [];
      entry.push(measurement.duration_ms);
      grouped.set(measurement.name, entry);
    }
  }

  return Object.fromEntries(
    [...grouped.entries()].map(([name, values]) => [
      name,
      {
        count: values.length,
        mean_ms: round(getMean(values)),
        min_ms: round(Math.min(...values)),
        max_ms: round(Math.max(...values)),
        p95_ms: getP95(values),
        std_dev_ms: round(getStdDev(values)),
      },
    ]),
  );
}

function readExistingReport(filePath, suiteName) {
  if (!fs.existsSync(filePath)) {
    return {
      suite: suiteName,
      variant: thesisVariant,
      audit_label: AUDIT_LABEL,
      report_label: resultsLabel,
      generated_at: new Date().toISOString(),
      runs: [],
      summary: {},
    };
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
    this.startedAt = new Date().toISOString();
    this.measurements = [];
  }

  async measure(name, action, metadata = {}) {
    const started = performance.now();
    const result = await action();
    const duration = round(performance.now() - started);

    this.measurements.push({
      name,
      duration_ms: duration,
      recorded_at: new Date().toISOString(),
      ...metadata,
    });

    return {
      result,
      durationMs: duration,
    };
  }

  record(name, durationMs, metadata = {}) {
    this.measurements.push({
      name,
      duration_ms: round(durationMs),
      recorded_at: new Date().toISOString(),
      ...metadata,
    });
  }

  flush(extra = {}) {
    ensureReportDir();

    // Prefix filename with resultsLabel so each variant saves its own file.
    // e.g. PLAYWRIGHT_RESULTS_LABEL=base → base.route-readiness.performance.json
    const labeledName = resultsLabel
      ? `${resultsLabel}.${this.reportName}`
      : this.reportName;
    const filePath = path.join(playwrightReportDir, labeledName);
    const report = readExistingReport(filePath, this.suiteName);

    report.variant = thesisVariant;
    report.audit_label = AUDIT_LABEL;
    report.report_label = resultsLabel;
    report.generated_at = new Date().toISOString();
    report.runs.push({
      test_title: this.testInfo.title,
      file: this.testInfo.file,
      browser: this.testInfo.project.name,
      repeat_each_index: this.testInfo.repeatEachIndex,
      started_at: this.startedAt,
      completed_at: new Date().toISOString(),
      measurements: this.measurements,
      ...extra,
    });
    report.summary = buildSummary(report.runs);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    return filePath;
  }
}
