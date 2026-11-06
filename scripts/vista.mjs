// Captura rápida de la vista actual: node scripts/vista.mjs salida.jpg [ancho] [alto] [pasos→]
import puppeteer from 'puppeteer-core';
const [, , OUT = 'vista.jpg', W = '1440', H = '900', PASOS = '0'] = process.argv;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'], defaultViewport: { width: +W, height: +H } });
const p = await b.newPage(); p.on('pageerror', e => console.log('ERROR:', e.message)); p.on('console', m => m.type() === 'error' && console.log('consola:', m.text()));
await p.goto('http://localhost:5174/', { waitUntil: 'load' });
await p.waitForFunction(() => document.querySelector('#press') && !document.querySelector('#press').disabled, { timeout: 60000 });
const w = ms => new Promise(r => setTimeout(r, ms));
if (process.env.PORTADA) { await w(2500); await p.screenshot({ path: OUT, type: 'jpeg', quality: 82 }); await b.close(); process.exit(0); }
await p.click('#press'); await w(800); const sk = await p.$('#io-skip'); if (sk) await sk.click(); await w(3500);
for (let i = 0; i < +PASOS; i++) { await p.evaluate(() => dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))); await w(4200); }
if (process.env.EVAL) console.log(JSON.stringify(await p.evaluate(process.env.EVAL)));
await p.screenshot({ path: OUT, type: 'jpeg', quality: 82 }); await b.close();
