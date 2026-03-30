import '../config/loadEnv.js';
import fs from 'fs';
import path from 'path';

const METRIC_LABELS = {
  performance: 'Performance Score',
  fcp: 'First Contentful Paint (ms)',
  lcp: 'Largest Contentful Paint (ms)',
  speedIndex: 'Speed Index (ms)',
  tbt: 'Total Blocking Time (ms)',
  cls: 'Cumulative Layout Shift',
};

// Lower is better for all metrics except performance score
const LOWER_IS_BETTER = ['fcp', 'lcp', 'speedIndex', 'tbt', 'cls'];

function loadReport(label) {
  const filePath = path.resolve('reports', 'lighthouse', `${label}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Report not found for label "${label}": ${filePath}`);
    console.error('Run: AUDIT_LABEL=' + label + ' npm run audit:lighthouse');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function delta(base, compare, metricKey) {
  const abs = compare - base;
  const pct = base !== 0 ? (abs / base) * 100 : 0;
  return { abs, pct };
}

function formatDelta(abs, pct, metricKey) {
  const isLowerBetter = LOWER_IS_BETTER.includes(metricKey);
  const improved = isLowerBetter ? abs < 0 : abs > 0;
  const sign = abs >= 0 ? '+' : '';
  const arrow = improved ? '▲' : abs === 0 ? '=' : '▼';
  return `${arrow} ${sign}${abs.toFixed(2)} (${sign}${pct.toFixed(1)}%)`;
}

function compareReports(labelA, labelB) {
  const reportA = loadReport(labelA);
  const reportB = loadReport(labelB);

  const metaA = reportA._meta || {};
  const metaB = reportB._meta || {};

  console.log('\n' + '═'.repeat(80));
  console.log(`  LIGHTHOUSE COMPARISON: ${labelA.toUpperCase()} vs ${labelB.toUpperCase()}`);
  console.log('═'.repeat(80));
  console.log(`  ${labelA}: branch=${metaA.branch || '?'}, commit=${metaA.commitHash || '?'}, at=${metaA.timestamp || '?'}`);
  console.log(`  ${labelB}: branch=${metaB.branch || '?'}, commit=${metaB.commitHash || '?'}, at=${metaB.timestamp || '?'}`);
  console.log('═'.repeat(80) + '\n');

  const pages = Object.keys(reportA).filter((k) => k !== '_meta');
  const comparison = {};

  for (const page of pages) {
    const statsA = reportA[page]?.statistics;
    const statsB = reportB[page]?.statistics;

    if (!statsA || !statsB) continue;

    console.log(`  PAGE: ${page.toUpperCase()}`);
    console.log('  ' + '─'.repeat(76));

    const pageComparison = {};

    for (const metricKey of Object.keys(METRIC_LABELS)) {
      const meanKeyA = `${metricKey}_mean`;
      const meanKeyB = `${metricKey}_mean`;

      const valA = statsA[meanKeyA];
      const valB = statsB[meanKeyB];

      if (valA == null || valB == null) continue;

      const { abs, pct } = delta(valA, valB, metricKey);
      const label = METRIC_LABELS[metricKey];
      const formatted = formatDelta(abs, pct, metricKey);

      console.log(`    ${label.padEnd(34)} ${labelA}: ${valA.toFixed(2).padStart(10)}  →  ${labelB}: ${valB.toFixed(2).padStart(10)}   ${formatted}`);

      pageComparison[metricKey] = {
        [labelA]: valA,
        [labelB]: valB,
        abs_delta: abs,
        pct_delta: pct,
      };
    }

    comparison[page] = pageComparison;
    console.log();
  }

  console.log('═'.repeat(80) + '\n');

  // Save JSON comparison
  const outputDir = path.resolve('reports', 'lighthouse');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `comparison_${labelA}_vs_${labelB}.json`);

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        _meta: {
          labelA,
          labelB,
          generated_at: new Date().toISOString(),
          metaA,
          metaB,
        },
        pages: comparison,
      },
      null,
      2,
    ),
  );

  console.log(`  Comparison saved to: ${outputPath}\n`);
}

const [, , labelA, labelB] = process.argv;

if (!labelA || !labelB) {
  console.error('Usage: node scripts/compareReports.js <labelA> <labelB>');
  console.error('Example: node scripts/compareReports.js base performance');
  process.exit(1);
}

compareReports(labelA, labelB);
