// Streams console output of a page for N seconds (debugging boot problems).
//   node tools/probe.mjs "/?nolock=1" 90
import puppeteer from 'puppeteer-core';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
const [urlPath = '/', secs = '60'] = process.argv.slice(2);
const chrome = fs.readdirSync(path.join(os.homedir(), '.agent-browser/browsers')).map((d) => path.join(os.homedir(), '.agent-browser/browsers', d, 'chrome')).find((p) => fs.existsSync(p));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, protocolTimeout: 600000, args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const t0 = Date.now();
const ts = () => ((Date.now() - t0) / 1000).toFixed(1).padStart(6);
page.on('console', (m) => console.log(ts(), `[${m.type()}]`, m.text().slice(0, 400)));
page.on('pageerror', (e) => console.log(ts(), '[pageerror]', e.message, e.stack?.split('\n').slice(0, 3).join(' | ')));
page.on('requestfailed', (r) => console.log(ts(), '[reqfail]', r.url().slice(0, 120), r.failure()?.errorText));
await page.goto('http://localhost:5173' + urlPath, { waitUntil: 'load', timeout: 120000 });
console.log(ts(), 'loaded');
const end = Date.now() + Number(secs) * 1000;
while (Date.now() < end) {
  await new Promise((r) => setTimeout(r, 5000));
  try {
    const st = await Promise.race([page.evaluate(() => ({ ready: !!window.__ready, frames: window.__frames ?? 0, text: document.body.innerText.slice(0, 160).replace(/\s+/g, ' ') })), new Promise((r) => setTimeout(() => r('busy'), 4000))]);
    console.log(ts(), 'state', JSON.stringify(st));
  } catch (e) { console.log(ts(), 'eval failed', e.message); }
}
await browser.close();
