import '../config/loadEnv.js';
import fs from 'fs';
import path from 'path';

const SUITES = [
  'route-readiness.performance.json',
  'user-journey.performance.json',
  'page-operations.performance.json',
];

function loadSuiteReport(label, suiteFile) {
  const filePath = path.resolve('reports', 'playwright', `${label}.${suiteFile}`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function formatDelta(abs, pct) {
  const improved = abs < 0; // lower ms = faster = better
  const sign = abs >= 0 ? '+' : '';
  const arrow = improved ? '▲' : abs === 0 ? '=' : '▼';
  return `${arrow} ${sign}${abs.toFixed(1)}ms (${sign}${pct.toFixed(1)}%)`;
}

function compareSuite(labelA, labelB, suiteFile) {
  const reportA = loadSuiteReport(labelA, suiteFile);
  const reportB = loadSuiteReport(labelB, suiteFile);

  if (!reportA && !reportB) return null;

  const suiteName = suiteFile.replace('.performance.json', '');
  const summaryA = reportA?.summary || {};
  const summaryB = reportB?.summary || {};

  const allOps = new Set([...Object.keys(summaryA), ...Object.keys(summaryB)]);
  if (allOps.size === 0) return null;

  const results = {};

  console.log(`\n  SUITE: ${suiteName.toUpperCase()}`);
  console.log('  ' + '─'.repeat(76));
  console.log(
    `  ${'Operation'.padEnd(38)} ${labelA.padStart(10)}   →   ${labelB.padStart(10)}   Delta`,
  );
  console.log('  ' + '─'.repeat(76));

  for (const op of [...allOps].sort()) {
    const a = summaryA[op]?.mean_ms ?? null;
    const b = summaryB[op]?.mean_ms ?? null;

    if (a == null || b == null) {
      console.log(`  ${op.padEnd(38)} ${'N/A'.padStart(10)}       ${'N/A'.padStart(10)}`);
      continue;
    }

    const abs = b - a;
    const pct = a !== 0 ? (abs / a) * 100 : 0;
    const delta = formatDelta(abs, pct);

    console.log(
      `  ${op.padEnd(38)} ${String(a).padStart(10)}ms  →  ${String(b).padStart(10)}ms   ${delta}`,
    );

    results[op] = { [labelA]: a, [labelB]: b, abs_delta: abs, pct_delta: pct };
  }

  return { suite: suiteName, operations: results };
}

function comparePlaywright(labelA, labelB) {
  console.log('\n' + '═'.repeat(80));
  console.log(`  PLAYWRIGHT COMPARISON: ${labelA.toUpperCase()} vs ${labelB.toUpperCase()}`);
  console.log('═'.repeat(80));

  const allResults = {};
  let totalImproved = 0, totalDegraded = 0, totalUnchanged = 0;

  for (const suiteFile of SUITES) {
    const result = compareSuite(labelA, labelB, suiteFile);
    if (!result) {
      console.log(`\n  [skipped] ${suiteFile} — no data for one or both labels`);
      continue;
    }

    allResults[result.suite] = result.operations;

    for (const data of Object.values(result.operations)) {
      if (data.abs_delta < 0) totalImproved++;
      else if (data.abs_delta > 0) totalDegraded++;
      else totalUnchanged++;
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log(
    `  SUMMARY: ${totalImproved} faster  ${totalDegraded} slower  ${totalUnchanged} unchanged`,
  );
  console.log('═'.repeat(80) + '\n');

  // Save JSON
  const outputDir = path.resolve('reports', 'playwright');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(
    outputDir,
    `comparison_${labelA}_vs_${labelB}.json`,
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        _meta: {
          labelA,
          labelB,
          generated_at: new Date().toISOString(),
        },
        suites: allResults,
      },
      null,
      2,
    ),
  );

  console.log(`  Comparison saved to: ${outputPath}\n`);
}

const [, , labelA, labelB] = process.argv;

if (!labelA || !labelB) {
  console.error('Usage: node scripts/comparePlaywright.js <labelA> <labelB>');
  console.error('Example: node scripts/comparePlaywright.js base base-performance');
  process.exit(1);
}

comparePlaywright(labelA, labelB);
