import fs from 'fs';
import path from 'path';

const reportsDir = path.resolve('reports', 'playwright');
const outputPath = path.join(reportsDir, 'summary.json');

const EXCLUDED_FILES = new Set(['summary.json', 'pw_results.json']);

if (!fs.existsSync(reportsDir)) {
  console.error('No Playwright reports directory found at reports/playwright');
  process.exit(1);
}

const reportFiles = fs
  .readdirSync(reportsDir)
  .filter((file) => file.endsWith('.json') && !EXCLUDED_FILES.has(file))
  .sort();

if (reportFiles.length === 0) {
  console.error('No Playwright performance JSON reports found to summarize.');
  process.exit(1);
}

const reports = reportFiles.map((file) => {
  const fullPath = path.join(reportsDir, file);
  const report = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  return {
    file,
    suite: report.suite,
    variant: report.variant,
    report_label: report.report_label,
    generated_at: report.generated_at,
    summary: report.summary,
  };
});

const summary = {
  generated_at: new Date().toISOString(),
  report_count: reports.length,
  reports,
};

fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
console.log(`\nPlaywright summary written to ${outputPath}`);
console.log(`Included ${reports.length} report(s):\n`);

for (const r of reports) {
  console.log(`  [${r.variant || '?'}] ${r.suite || r.file}`);
  if (r.summary && Object.keys(r.summary).length > 0) {
    const top = Object.entries(r.summary)
      .slice(0, 5)
      .map(([name, s]) => `${name}: ${s.mean_ms}ms`)
      .join('  |  ');
    console.log(`    ${top}`);
  }
  console.log();
}
