// Fotografía cada piel de frente y de espaldas con Edge sin ventana: node scripts/capturas.mjs [salida] [artista]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
const OUT = process.argv[2] || 'capturas'; const SOLO = process.argv[3]; mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new',
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
  defaultViewport: { width: 1280, height: 900 },
});
const page = await browser.newPage();
page.on('pageerror', e => console.log('ERROR página:', e.message));
await page.goto('http://localhost:5174/', { waitUntil: 'load' });
await page.waitForFunction(() => document.querySelector('#press') && !document.querySelector('#press').disabled, { timeout: 60000 });
const w = ms => new Promise(r => setTimeout(r, ms));
await page.click('#press'); await w(800); await page.click('#io-skip'); await w(3500);
for (const [cap, artista] of [[1, 'westcol'], [2, 'blessd']]) {
  if (SOLO && SOLO !== artista) continue;
  await page.evaluate(n => { for (let i = 0; i < n; i++) dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); }, cap === 1 ? 1 : 1);
  await w(4500);
  await page.evaluate(() => { document.querySelector('#b-rot').classList.contains('on') && document.querySelector('#b-rot').click(); document.querySelectorAll('.ui, #labels, #leaders, #bottom, #top, #yt-mini, #tags, .fx, #cursor').forEach(e => e.style.visibility = 'hidden'); });
  const n = await page.evaluate(() => document.querySelectorAll('#g-concepts .tab').length);
  for (let k = 0; k < n; k++) {
    await page.evaluate(k => dispatchEvent(new KeyboardEvent('keydown', { key: String(k + 1) })), k); await w(3200);
    const nombre = await page.evaluate(k => document.querySelectorAll('#g-concepts .tab b')[k].textContent.split('·')[1].trim(), k);
    for (const [lado, z] of [['frente', 2.35], ['espalda', -2.35]]) {
      await page.evaluate(z => { const sp = window.__sp; sp.controls.autoRotate = false; sp.camera.position.set(0, 1.0, z); sp.controls.target.set(0, 0.88, 0); sp.look.set(0, 0.88, 0); sp.controls.update(); }, z);
      await w(1500);
      const f = `${OUT}/${artista}_${String(k + 1)}_${nombre.replace(/[^A-Za-z0-9]+/g, '-')}_${lado}.jpg`;
      await page.screenshot({ path: f, type: 'jpeg', quality: 80, clip: { x: 340, y: 0, width: 600, height: 900 } }); console.log(f);
    }
  }
  await page.evaluate(() => document.querySelectorAll('.ui, #labels, #leaders, #bottom, #top, #yt-mini, #tags').forEach(e => e.style.visibility = ''));
}
await browser.close();
