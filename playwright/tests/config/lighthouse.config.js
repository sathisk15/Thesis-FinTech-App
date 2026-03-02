const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');

async function runLighthouse(url, token) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--remote-debugging-port=9222'],
  });

  const client = await CDP({ port: 9222 });
  const { Page, Runtime } = client;

  await Page.enable();

  // Go to base origin first
  await Page.navigate({ url: 'http://localhost:5173' });
  await Page.loadEventFired();

  // Inject token into localStorage
  await Runtime.evaluate({
    expression: `
      localStorage.setItem('token', '${token}');
    `,
  });

  // Now run Lighthouse on protected route
  const result = await lighthouse(url, {
    port: chrome.port,
  });

  await client.close();
  await chrome.kill();

  return result.lhr;
}

module.exports = { runLighthouse };
