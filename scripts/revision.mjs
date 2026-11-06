// Capturas de revisión: celular (portada, cara a cara, robot), La piel (varias alturas) y cierre.
import puppeteer from 'puppeteer-core';
const OUT = process.argv[2];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const w = ms => new Promise(r => setTimeout(r, ms));
async function abrir(vp) {
  const p = await b.newPage(); await p.setViewport(vp); p.on('pageerror', e => console.log('ERROR:', e.message));
  await p.goto('http://localhost:5174/', { waitUntil: 'load' });
  await p.waitForFunction(() => document.querySelector('#press') && !document.querySelector('#press').disabled, { timeout: 60000 });
  return p;
}
const ir = (p, n) => p.evaluate(n => { for (let i = 0; i < n; i++) dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); }, n);
// celular
const m = await abrir({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await w(2500); await m.screenshot({ path: `${OUT}/m_portada.jpg`, type: 'jpeg', quality: 75 });
await m.click('#press'); await w(800); const sk = await m.$('#io-skip'); if (sk) await sk.click(); await w(3500);
await m.screenshot({ path: `${OUT}/m_cara.jpg`, type: 'jpeg', quality: 75 });
await ir(m, 1); await w(4500); await m.screenshot({ path: `${OUT}/m_westcol.jpg`, type: 'jpeg', quality: 75 });
await m.click('#b-ficha').catch(() => { }); await w(600); await m.screenshot({ path: `${OUT}/m_ficha.jpg`, type: 'jpeg', quality: 75 });
await m.close();
// escritorio: La piel y cierre
const d = await abrir({ width: 1440, height: 900 });
await d.click('#press'); await w(800); const sk2 = await d.$('#io-skip'); if (sk2) await sk2.click(); await w(3500);
await ir(d, 1); await w(2500); await ir(d, 1); await w(2500); await ir(d, 1); await w(3500);
const alto = await d.evaluate(() => document.querySelector('#piel').scrollHeight);
let k = 0; for (let y = 0; y < alto; y += 850) { await d.evaluate(y => { document.querySelector('#piel').scrollTop = y; }, y); await w(1300); await d.screenshot({ path: `${OUT}/d_piel_${k++}.jpg`, type: 'jpeg', quality: 72 }); }
await ir(d, 1); await w(9000); await d.screenshot({ path: `${OUT}/d_cierre.jpg`, type: 'jpeg', quality: 75 });
console.log('piel', k, 'pantallas');
await b.close();
