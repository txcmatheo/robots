// Fotogramas de la entrada: node scripts/intro.mjs carpeta
import puppeteer from 'puppeteer-core';
const OUT = process.argv[2];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'], defaultViewport: { width: 1280, height: 720 } });
const p = await b.newPage(); p.on('pageerror', e => console.log('ERROR:', e.message));
await p.goto('http://localhost:5174/', { waitUntil: 'load' });
await p.waitForFunction(() => document.querySelector('#press') && !document.querySelector('#press').disabled, { timeout: 60000 });
const w = ms => new Promise(r => setTimeout(r, ms));
await p.click('#press'); const t0 = Date.now();
for (const t of [3.2, 4.6, 6.6, 8.0, 10.0, 11.6, 13.2]) { await w(t * 1000 - (Date.now() - t0)); await p.screenshot({ path: `${OUT}/intro_${String(t).replace('.', '_')}.jpg`, type: 'jpeg', quality: 70 }); }
await w(5000); await p.screenshot({ path: `${OUT}/intro_fin.jpg`, type: 'jpeg', quality: 70 });
await b.close();
