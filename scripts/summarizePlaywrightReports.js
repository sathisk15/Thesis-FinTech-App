import fs from 'fs';
import path from 'path';

const reportsDir = path.resolve('reports', 'playwright');
const outputPath = path.join(reportsDir, 'summary.json');

if (!fs.existsSync(reportsDir)) {
  console.error('No Playwright reports directory found at reports/playwright');
  process.exit(1);
}

const reportFiles = fs
  .readdirSync(reportsDir)
  .filter(
    (file) => file.endsWith('.json') && file !== 'summary.json',
  )
  .sort();

if (reportFiles.length === 0) {
  console.error('No Playwright JSON reports found to summarize.');
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

console.log(`Playwright summary written to ${outputPath}`);
