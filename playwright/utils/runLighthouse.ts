const lighthouse = require('lighthouse');
const { chromium } = require('playwright');

async function runLighthouse(url, options = {}) {
  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9222'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  const runnerResult = await lighthouse(url, {
    port: 9222,
    output: 'json',
    logLevel: 'info',
    onlyCategories: ['performance'],
    ...options,
  });

  await browser.close();

  return runnerResult.lhr;
}

module.exports = { runLighthouse };
