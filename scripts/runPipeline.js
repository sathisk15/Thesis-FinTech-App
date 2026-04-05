/**
 * runPipeline.js — Master audit pipeline
 *
 * Runs all three audit tools in sequence for the current THESIS_VARIANT,
 * then auto-appends a [MEASUREMENT] entry to ACTIVITY_LOG.md.
 *
 * Usage:
 *   THESIS_VARIANT=base npm run audit:pipeline
 *   THESIS_VARIANT=base-performance npm run audit:pipeline
 *   THESIS_VARIANT=base-performance-security npm run audit:pipeline
 */

import '../config/loadEnv.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const VARIANT = process.env.THESIS_VARIANT;

if (!VARIANT) {
  console.error('\n❌  THESIS_VARIANT is not set.');
  console.error('    Usage: THESIS_VARIANT=base npm run audit:pipeline\n');
  process.exit(1);
}

const LABEL = process.env.AUDIT_LABEL || VARIANT;
const SKIP_SONAR = process.env.PIPELINE_SKIP_SONAR === 'true';

function run(cmd, label) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`▶  ${label}`);
  console.log('─'.repeat(60));
  execSync(cmd, { stdio: 'inherit' });
}

function getGitMeta() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { stdio: 'pipe' }).toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
    return { hash, branch };
  } catch {
    return { hash: 'unknown', branch: 'unknown' };
  }
}

function readLighthouseResults() {
  const filePath = path.resolve('reports', 'lighthouse', `${LABEL}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const pages = Object.keys(report).filter((k) => k !== '_meta');
    return pages.map((page) => {
      const mean = report[page]?.statistics?.performance_mean;
      return mean != null ? `${page} ${mean.toFixed(1)}` : null;
    }).filter(Boolean);
  } catch {
    return null;
  }
}

function readPlaywrightResults() {
  const summaryPath = path.resolve('reports', 'playwright', 'summary.json');
  if (!fs.existsSync(summaryPath)) return null;
  try {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    const keyOps = ['login', 'dashboard-load', 'transfer', 'route:dashboard', 'route:transactions'];
    const found = [];
    for (const r of summary.reports || []) {
      for (const opName of keyOps) {
        const op = r.summary?.[opName];
        if (op) found.push(`${opName} ${op.mean_ms}ms`);
      }
    }
    return found.length > 0 ? found : null;
  } catch {
    return null;
  }
}

function appendActivityLog(git, lighthouseLines, playwrightLines) {
  const logPath = path.resolve('ACTIVITY_LOG.md');
  if (!fs.existsSync(logPath)) return;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const time = now.toISOString().slice(11, 16) + ' UTC'; // HH:MM UTC

  const lhSection = lighthouseLines
    ? `- Lighthouse scores (mean): ${lighthouseLines.join(', ')}`
    : '- Lighthouse: see reports/lighthouse/' + LABEL + '.json';

  const pwSection = playwrightLines
    ? `- Playwright key timings (mean): ${playwrightLines.join(', ')}`
    : '- Playwright: see reports/playwright/summary.json';

  const sonarNote = SKIP_SONAR
    ? '- SonarQube: skipped (PIPELINE_SKIP_SONAR=true)'
    : `- SonarQube: project \`fintech-app-${VARIANT}\``;

  const entry = `
### ${today} ${time} \`[MEASUREMENT]\`
**Audit pipeline run — variant: \`${VARIANT}\`**
${lhSection}
${pwSection}
${sonarNote}
- Commit: \`${git.hash}\` (branch: \`${git.branch}\`)
- Reports: \`reports/lighthouse/${LABEL}.json\`, \`reports/playwright/summary.json\`
- **Purpose:** Measurement run for thesis variant ${VARIANT}

---
`;

  const current = fs.readFileSync(logPath, 'utf8');
  const insertAfter = '## 2026';
  const insertIdx = current.indexOf(insertAfter);

  if (insertIdx === -1) {
    fs.appendFileSync(logPath, entry);
  } else {
    const lineEnd = current.indexOf('\n', insertIdx);
    const updated =
      current.slice(0, lineEnd + 1) + entry + current.slice(lineEnd + 1);
    fs.writeFileSync(logPath, updated);
  }

  console.log(`\n📝  Activity log updated: ACTIVITY_LOG.md`);
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(`  AUDIT PIPELINE — variant: ${VARIANT}`);
  console.log('═'.repeat(60));

  // 1. Lighthouse
  run(
    `AUDIT_LABEL=${LABEL} THESIS_VARIANT=${VARIANT} node scripts/runLighthouse.js`,
    'Lighthouse audit',
  );

  // 2. Playwright
  run(
    `THESIS_VARIANT=${VARIANT} PLAYWRIGHT_RESULTS_LABEL=${LABEL} npx playwright test --config=playwright/playwright.config.js`,
    'Playwright performance tests',
  );

  // 3. Playwright summary
  run('node scripts/summarizePlaywrightReports.js', 'Playwright summary');

  // 4. SonarQube
  if (!SKIP_SONAR) {
    run(
      `THESIS_VARIANT=${VARIANT} SONAR_SKIP_TESTS=true node scripts/sonar-analysis.js`,
      'SonarQube scan',
    );
  } else {
    console.log('\n[skipped] SonarQube (PIPELINE_SKIP_SONAR=true)');
  }

  // 5. Auto-log results to ACTIVITY_LOG.md
  const git = getGitMeta();
  const lighthouseLines = readLighthouseResults();
  const playwrightLines = readPlaywrightResults();
  appendActivityLog(git, lighthouseLines, playwrightLines);

  console.log('\n' + '═'.repeat(60));
  console.log(`  Pipeline complete — variant: ${VARIANT}`);
  console.log('═'.repeat(60) + '\n');
}

main().catch((err) => {
  console.error('\n❌  Pipeline failed:', err.message || err);
  process.exit(1);
});
