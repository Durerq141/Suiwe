// Headless screenshots of the running dev server.
//   node tools/shots.mjs <url-path> <out.png> [--w 1600 --h 900 --wait 6000 --eval "js"]
import puppeteer from 'puppeteer-core';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [urlPath = '/', out = 'shots/shot.png'] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const base = process.env.BASE_URL ?? 'http://localhost:5173';
const chrome = process.env.CHROME ?? fs.readdirSync(path.join(os.homedir(), '.agent-browser/browsers')).map((d) => path.join(os.homedir(), '.agent-browser/browsers', d, 'chrome')).find((p) => fs.existsSync(p));

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  protocolTimeout: 600000,
  args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--window-size=${opt('w', 1600)},${opt('h', 900)}`],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: Number(opt('w', 1600)), height: Number(opt('h', 900)) });
  const logs = [];
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  await page.goto(base + urlPath, { waitUntil: 'load', timeout: 120000 });
  const readyExpr = opt('ready', '');
  if (readyExpr) {
    const t0 = Date.now();
    await page.waitForFunction(readyExpr, { timeout: Number(opt('timeout', 300000)), polling: 1000 });
    logs.push(`[ready] after ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  await new Promise((r) => setTimeout(r, Number(opt('wait', 3000))));
  const ev = opt('eval', '');
  if (ev) { const r = await page.evaluate(ev); if (r !== undefined) logs.push('[eval] ' + JSON.stringify(r)); await new Promise((r) => setTimeout(r, Number(opt('after', 1500)))); }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out });
  console.log(logs.slice(-Number(opt('logs', 40))).join('\n'));
} finally {
  await browser.close();
}
