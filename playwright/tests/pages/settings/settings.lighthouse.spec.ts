const { test } = require('@playwright/test');
const { runLighthouse } = require('../../utils/runLighthouse');
const fs = require('fs');
const path = require('path');

test.describe('Settings Page - Lighthouse Metrics', () => {
  test('log and save performance metrics', async () => {
    const SETTINGS_URL = 'http://localhost:5173/settings';

    const lhr = await runLighthouse(SETTINGS_URL);

    const metrics = {
      page: 'Settings',
      url: SETTINGS_URL,
      timestamp: new Date().toISOString(),
      performanceScore: lhr.categories.performance.score * 100,
      firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
      largestContentfulPaint:
        lhr.audits['largest-contentful-paint'].numericValue,
      speedIndex: lhr.audits['speed-index'].numericValue,
      totalBlockingTime: lhr.audits['total-blocking-time'].numericValue,
      cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
      timeToInteractive: lhr.audits['interactive'].numericValue,
    };

    console.log('📊 Lighthouse Performance Metrics — Settings Page');
    console.table(metrics);

    const resultsDir = path.join(__dirname, '../../results');
    const filePath = path.join(resultsDir, 'settings.metrics.json');

    fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2));

    console.log(`✅ Metrics saved to ${filePath}`);
  });
});
