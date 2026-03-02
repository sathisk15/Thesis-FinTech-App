const { test } = require('@playwright/test');
const { runLighthouse } = require('../utils/runLighthouse');
const fs = require('fs');
const path = require('path');
const baseUrl = 'http://localhost:5173';
const urls = ['/settings', '/dashboard'];
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJzYXRoaXNAZ21haWwuY29tIiwiaWF0IjoxNzcyNDYyNDcwLCJleHAiOjE3NzI1NDg4NzB9.WqNgslVJXDjM3Jfdwykuse5DVGy5xehMzFmm-Atd30E';

test.describe('Performance Measure - Lighthouse Metrics', () => {
  test('log and save performance metrics', async () => {
    const metrics = {};

    for (const url of urls) {
      const link = `${baseUrl}${url}`;
      const lhr = await runLighthouse(link, token);
      metrics[url] = {
        page: url,
        url: link,
        timestamp: new Date().toISOString(),
        performanceScore: lhr.categories.performance.score * 100,
        firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint:
          lhr.audits['largest-contentful-paint'].numericValue,
        speedIndex: lhr.audits['speed-index'].numericValue,
        totalBlockingTime: lhr.audits['total-blocking-time'].numericValue,
        cumulativeLayoutShift:
          lhr.audits['cumulative-layout-shift'].numericValue,
        timeToInteractive: lhr.audits['interactive'].numericValue,
      };
      console.log('Audited URL:', lhr.finalUrl);
    }

    console.log('Lighthouse Performance Metrics');
    console.table(metrics);

    const resultsDir = path.join(__dirname, '../results');
    const filePath = path.join(resultsDir, 'performance.metrics.json');

    fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2));

    console.log(`Metrics saved to ${filePath}`);
  });
});
