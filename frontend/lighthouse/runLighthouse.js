import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import fs from 'fs';

const baseURL = 'http://localhost:5173';

async function loginAndGetPort() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--remote-debugging-port=9222'],
  });

  const page = await browser.newPage();

  await page.goto('http://localhost:5173/login', {
    waitUntil: 'networkidle2',
  });

  await page.type('input[name="email"]', 'sathis@gmail.com');
  await page.type('input[name="password"]', '123');

  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('✅ Logged in successfully');

  return { browser, port: 9222 };
}

async function startAudit() {
  const { browser, port } = await loginAndGetPort();

  const pages = [
    { url: '/dashboard', page: 'Dashboard' },
    { url: '/account', page: 'Accounts' },
    { url: '/transactions', page: 'Transactions' },
    { url: '/transfer', page: 'Transfer' },
    { url: '/pay', page: 'Pay' },
    { url: '/settings', page: 'Settings' },
  ];

  for (const page of pages) {
    const result = await lighthouse(baseURL + page.url, {
      port,
      output: 'json',
      logLevel: 'info',
      disableStorageReset: true,
    });

    fs.writeFileSync(`./lighthouse/reports/${page.page}.html`, result.report);

    console.log(`✅ Lighthouse report generated: ${page.page}.html`);
  }

  await browser.close();
}

startAudit();
