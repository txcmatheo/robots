// Métricas de rendimiento con Edge sin ventana: node scripts/metricas.mjs [ancho] [alto] [movil]
// Mide: tiempo hasta ENTRAR habilitado, bytes transferidos, draw calls, fps en cara a cara y en el capítulo.
import puppeteer from 'puppeteer-core';
const [, , W = '1440', H = '900', MOVIL] = process.argv;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage();
await p.setViewport({ width: +W, height: +H, deviceScaleFactor: MOVIL ? 2 : 1, isMobile: !!MOVIL, hasTouch: !!MOVIL });
if (MOVIL) { const c = await p.target().createCDPSession(); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
let errores = 0; p.on('pageerror', () => errores++);
const t0 = Date.now(); await p.goto('http://localhost:5174/', { waitUntil: 'load' });
await p.waitForFunction(() => document.querySelector('#press') && !document.querySelector('#press').disabled, { timeout: 90000 });
const listo = Date.now() - t0;
const bytes = await p.evaluate(() => performance.getEntriesByType('resource').reduce((a, e) => a + (e.transferSize || e.encodedBodySize || 0), 0));
const w = ms => new Promise(r => setTimeout(r, ms));
const fps = () => p.evaluate(() => new Promise(res => { let n = 0; const t = performance.now(); (function f() { n++; if (performance.now() - t < 3000) requestAnimationFrame(f); else res(Math.round(n / 3)); })(); }));
const calls = () => p.evaluate(() => { const r = window.__sp?.renderer; if (!r) return null; r.info.autoReset = false; r.info.reset(); return new Promise(res => requestAnimationFrame(() => { const c = r.info.render.calls; r.info.autoReset = true; res(c); })); });
await p.click('#press'); await w(800); const sk = await p.$('#io-skip'); if (sk) await sk.click(); await w(3500);
const sel = { fps: await fps(), calls: await calls() };
await p.evaluate(() => dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))); await w(4500);
const gar = { fps: await fps(), calls: await calls() };
const heap = await p.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);
console.log(JSON.stringify({ vista: `${W}x${H}${MOVIL ? ' movil cpu x4' : ''}`, listoMs: listo, kb: Math.round(bytes / 1024), caraACara: sel, capitulo: gar, heapMB: heap, errores }));
await b.close();
