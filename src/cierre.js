/* Cierre animado: los hilos de color de Westcol y Blessd convergen en "Segunda piel." */
import { gsap } from 'gsap';
import './cierre.css';


function hex2rgb(h) {
  let s = String(h).replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ---------- canvas: lineas de luz, hilos de colores, destello, particulas ---------- */
function crearFx(canvas, acentos, S) {
  const ctx = canvas.getContext('2d');
  const cols = acentos.slice(0, 4).map(hex2rgb);
  const ORO = [232, 194, 122];
  const NV = 9;
  let dpr = 1;
  // brillo de cada mota pintado una sola vez (antes: un degradado radial nuevo por mota y por cuadro)
  const mota = document.createElement('canvas'); mota.width = mota.height = 64;
  { const m = mota.getContext('2d'), g = m.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,236,190,1)'); g.addColorStop(0.3, 'rgba(232,194,122,.5)'); g.addColorStop(1, 'rgba(232,194,122,0)');
    m.fillStyle = g; m.fillRect(0, 0, 64, 64); }

  const parts = Array.from({ length: 80 }, () => ({
    x: Math.random(), y: Math.random(),
    v: 5 + Math.random() * 18, r: 0.5 + Math.random() * 1.4,
    f: Math.random() * 6.28, k: 0.6 + Math.random() * 1.6, a: 0.25 + Math.random() * 0.6,
  }));

  function medir() {
    // es un fondo de luces difusas: en pantallas densas 1.5 basta y se dibuja casi la mitad de píxeles
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    S.w = w; S.h = h;
  }

  function inicio(i) {
    const { w, h } = S;
    return [[-0.03 * w, 0.14 * h], [1.03 * w, 0.22 * h], [-0.03 * w, 0.88 * h], [1.03 * w, 0.8 * h]][i];
  }
  function pto(i, t) {
    const [sx, sy] = inicio(i);
    const mx = (sx + S.cx) / 2, my = (sy + S.cy) / 2;
    const dx = S.cx - sx, dy = S.cy - sy, L = Math.hypot(dx, dy) || 1;
    const sg = i % 2 ? 1 : -1;
    const cx = mx + (-dy / L) * L * 0.26 * sg, cy = my + (dx / L) * L * 0.26 * sg;
    const u = 1 - t;
    return [u * u * sx + 2 * u * t * cx + t * t * S.cx, u * u * sy + 2 * u * t * cy + t * t * S.cy];
  }

  function dibujar(dt) {
    const { w, h, cx, cy, t } = S;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const mx = Math.max(w, h);

    // resplandor de fondo
    if (S.glow > 0.001) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, mx * 0.62);
      g.addColorStop(0, `rgba(232,194,122,${0.13 * S.glow})`);
      g.addColorStop(0.5, `rgba(232,194,122,${0.04 * S.glow})`);
      g.addColorStop(1, 'rgba(232,194,122,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }

    // rayos finos desde el centro
    if (S.rays > 0.001) {
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * 6.2832 + t * 0.012;
        const x2 = cx + Math.cos(a) * mx, y2 = cy + Math.sin(a) * mx;
        const g = ctx.createLinearGradient(cx, cy, x2, y2);
        g.addColorStop(0, `rgba(241,237,230,${0.0})`);
        g.addColorStop(0.18, `rgba(241,237,230,${0.07 * S.rays})`);
        g.addColorStop(1, 'rgba(241,237,230,0)');
        ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x2, y2); ctx.stroke();
      }
    }

    // lineas verticales finas con un brillo que viaja
    if (S.lines > 0.001) {
      ctx.lineWidth = 1;
      // el degradado vertical es el mismo para todas las líneas: uno por cuadro
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(241,237,230,0)');
      g.addColorStop(0.5, `rgba(241,237,230,${0.075 * S.lines})`);
      g.addColorStop(1, 'rgba(241,237,230,0)');
      ctx.strokeStyle = g; ctx.beginPath();
      for (let i = 0; i < NV; i++) { const x = Math.round(w * (i + 0.5) / NV) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      ctx.stroke();
      for (let i = 0; i < NV; i++) {
        const x = Math.round(w * (i + 0.5) / NV) + 0.5;
        const sp = 0.05 + (i % 4) * 0.022, ph = (i * 0.37) % 1;
        const yy = (((t * sp + ph) % 1.5) - 0.25) * h, len = h * 0.2;
        const g2 = ctx.createLinearGradient(0, yy - len, 0, yy);
        g2.addColorStop(0, 'rgba(232,194,122,0)');
        g2.addColorStop(1, `rgba(255,236,190,${0.5 * S.lines})`);
        ctx.strokeStyle = g2; ctx.beginPath(); ctx.moveTo(x, yy - len); ctx.lineTo(x, yy); ctx.stroke();
      }
    }

    // cuatro hilos de los colores de los artistas hacia el centro
    for (let i = 0; i < 4; i++) {
      const p = S.th[i];
      if (p <= 0.001) continue;
      const c = cols[i] || ORO;
      // estela suave
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.2 * S.trail})`;
      ctx.beginPath();
      let q = pto(i, 0); ctx.moveTo(q[0], q[1]);
      const NS = 48;
      for (let k = 1; k <= NS; k++) { q = pto(i, (k / NS) * p); ctx.lineTo(q[0], q[1]); }
      ctx.stroke();
      // cabeza brillante
      const tail = Math.max(0, p - 0.38), M = 36;
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      let a0 = pto(i, tail);
      for (let k = 1; k <= M; k++) {
        const b0 = pto(i, tail + (p - tail) * (k / M));
        const al = Math.pow(k / M, 1.7);
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${al})`;
        ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(b0[0], b0[1]); ctx.stroke();
        a0 = b0;
      }
      if (p < 0.999) {
        const g = ctx.createRadialGradient(a0[0], a0[1], 0, a0[0], a0[1], 22);
        g.addColorStop(0, `rgba(255,255,255,.95)`);
        g.addColorStop(0.25, `rgba(${c[0]},${c[1]},${c[2]},.7)`);
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(a0[0], a0[1], 22, 0, 6.2832); ctx.fill();
      }
    }

    // onda de choque
    if (S.ring > 0.001 && S.ring < 0.999) {
      const e = 1 - S.ring;
      for (let j = 0; j < 2; j++) {
        const rr = Math.pow(S.ring, j ? 0.7 : 0.5) * mx * (j ? 0.5 : 0.72);
        ctx.lineWidth = j ? 1 : 2;
        ctx.strokeStyle = `rgba(255,232,180,${0.55 * e * e * (j ? 0.6 : 1)})`;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.stroke();
      }
    }

    // destello central
    if (S.flash > 0.001) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, mx * 0.4);
      g.addColorStop(0, `rgba(255,248,230,${0.85 * S.flash})`);
      g.addColorStop(0.2, `rgba(232,194,122,${0.4 * S.flash})`);
      g.addColorStop(1, 'rgba(232,194,122,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }

    // polvo dorado
    if (S.parts > 0.001) {
      for (const p of parts) {
        p.y -= (p.v * dt) / h; p.x += Math.sin(t * 0.4 + p.f) * 0.00012;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        const tw = 0.5 + 0.5 * Math.sin(t * p.k + p.f);
        const al = p.a * tw * S.parts;
        const x = p.x * w, y = p.y * h, rr = p.r * 3.4;
        if (al < 0.004) continue;
        ctx.globalAlpha = al; ctx.drawImage(mota, x - rr, y - rr, rr * 2, rr * 2);
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  return { medir, dibujar };
}

/* ---------- API ---------- */
export function mostrarCierre(contenedor, { acentos = ['#F4A3C4', '#2651B5'], nombres = ['WESTCOL', 'BLESSD'], sub = 'ENGINEAI T800 MAX · PPF', alTerminar } = {}) {
  if (!contenedor) return;
  if (contenedor.__cz) limpiar(contenedor);
  const estado = { muerto: false, tls: [], ticker: null, onResize: null };
  contenedor.__cz = estado;
  Promise.race([document.fonts.load('italic 700 60px "Chakra Petch"'), new Promise((r) => setTimeout(r, 900))])
    .catch(() => { }).then(() => { if (!estado.muerto) construir(); });

  function construir() {
    contenedor.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'cz';
    const letras = 'Segunda piel.'.split('').map((c) =>
      c === ' ' ? '<span class="cz-chm" style="width:.28em"><span class="cz-ch">&nbsp;</span></span>'
        : `<span class="cz-chm"><span class="cz-ch">${c}</span></span>`).join('');
    // cuatro hilos: los dos colores, cada uno desde dos esquinas
    const colores = [acentos[0], acentos[1], acentos[1], acentos[0]].map((c) => c || '#a9bbff');
    root.innerHTML = `
      <canvas class="cz-fx" aria-hidden="true"></canvas>
      <div class="cz-vig"></div>
      <div class="cz-stage">
        <p class="cz-duo"><b style="--c:${colores[0]}">${nombres[0]}</b><i>×</i><b style="--c:${colores[1]}">${nombres[1]}</b></p>
        <h2 class="cz-h1" aria-label="Segunda piel.">
          <span class="cz-h1-base" aria-hidden="true">${letras}</span>
          <span class="cz-h1-shine" aria-hidden="true">Segunda piel.</span>
        </h2>
        <div class="cz-rule" aria-hidden="true"><i></i><i></i></div>
        <p class="cz-m1">${sub}</p>
        <p class="cz-m2">Dos robots. Una piel para cada uno.</p>
      </div>
      <div class="cz-flash"></div>`;
    contenedor.appendChild(root);

    const $ = (s) => root.querySelector(s);
    const stage = $('.cz-stage'), duo = root.querySelectorAll('.cz-duo b, .cz-duo i');
    const shH = $('.cz-h1-shine'), chars = root.querySelectorAll('.cz-ch'), rule = root.querySelectorAll('.cz-rule i');
    const m1 = $('.cz-m1'), m2 = $('.cz-m2'), flash = $('.cz-flash');
    rule[0].style.background = colores[0]; rule[1].style.background = colores[1];
    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const S = { t: 0, w: 1, h: 1, cx: 0, cy: 0, lines: 0, rays: 0, parts: 0, glow: 0, flash: 0, ring: 0, trail: 1, th: [0, 0, 0, 0] };
    const fx = crearFx($('.cz-fx'), colores, S);
    const medir = () => { fx.medir(); const r = stage.getBoundingClientRect(); S.cx = r.left + r.width / 2; S.cy = r.top + r.height / 2; };
    medir();
    estado.onResize = () => { if (!estado.muerto) medir(); };
    addEventListener('resize', estado.onResize);
    // el canvas deja de dibujarse cuando ya no hay nada en movimiento
    estado.ticker = (tiempo, dt) => { if (document.hidden) return; S.t += Math.min(dt / 1000, 0.05); fx.dibujar(Math.min(dt / 1000, 0.05)); };
    gsap.ticker.add(estado.ticker);

    const V = (el, nombre, desde, hasta, dur, ease, pos, tl) => {
      const o = { v: desde }; el.style.setProperty(nombre, desde);
      tl.to(o, { v: hasta, duration: dur, ease, onUpdate: () => el.style.setProperty(nombre, o.v.toFixed(2)) }, pos);
    };
    gsap.set(chars, { yPercent: 115, rotate: 5, filter: 'blur(10px)' });
    gsap.set([m1, m2], { y: 10 });
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    estado.tls.push(tl);
    tl.to(S, { lines: 1, duration: 1.8, ease: 'power1.out' }, 0.05)
      .to(S, { parts: 1, duration: 2.4, ease: 'power1.inOut' }, 0.15)
      .to(S, { rays: 1, glow: 0.45, duration: 2, ease: 'power1.in' }, 0.3);
    for (let i = 0; i < 4; i++) tl.to(S.th, { [i]: 1, duration: 1.75, ease: 'power2.inOut' }, 0.3 + i * 0.1);
    tl.to(S, { flash: 1, duration: 0.12 }, 2.1).to(S, { flash: 0, duration: 1.1, ease: 'power3.out' }, 2.22)
      .to(S, { glow: 1, duration: 1.6 }, 2.1).to(S, { trail: 0.4, duration: 2, ease: 'power1.out' }, 2.4)
      .fromTo(S, { ring: 0 }, { ring: 1, duration: 1.7, ease: 'power1.out' }, 2.1)
      .to(flash, { opacity: 0.8, duration: 0.1 }, 2.1).to(flash, { opacity: 0, duration: 0.9 }, 2.2)
      .to(duo, { opacity: 1, duration: 0.8, stagger: 0.15, ease: 'expo.out' }, 2.3)
      .to(chars, { yPercent: 0, rotate: 0, filter: 'blur(0px)', duration: 1.15, ease: 'power4.out', stagger: 0.05 }, 2.6)
      .to(rule, { scaleX: 1, duration: 0.8, ease: 'power3.inOut', stagger: 0.1 }, 3.2)
      .to(m1, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 3.5)
      .to(m2, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 3.8)
      .set(shH, { opacity: 1 }, 4.0);
    V(shH, '--s', 95, 5, 1.5, 'power2.inOut', 4.0, tl);
    tl.set(shH, { opacity: 0 }, 5.6);
    tl.call(() => {
      if (estado.muerto) return;
      if (typeof alTerminar === 'function') { try { alTerminar(); } catch (e) { console.error(e); } }
      if (reducido) return;
      const idle = gsap.timeline({ repeat: -1, repeatDelay: 3, delay: 1.2 }); estado.tls.push(idle);
      idle.set(shH, { opacity: 1 }, 0); V(shH, '--s', 90, 10, 1.8, 'power2.inOut', 0, idle); idle.set(shH, { opacity: 0 }, 1.85);
    }, null, 5.8);
    if (reducido) tl.progress(1);
  }
}

function limpiar(contenedor) {
  const e = contenedor && contenedor.__cz;
  if (!e) return;
  e.muerto = true;
  e.tls.forEach((t) => t.kill());
  if (e.ticker) gsap.ticker.remove(e.ticker);
  if (e.onResize) removeEventListener('resize', e.onResize);
  contenedor.__cz = null;
}

export function ocultarCierre(contenedor) {
  if (!contenedor) return;
  const root = contenedor.querySelector('.cz');
  const e = contenedor.__cz;
  if (e) { e.tls.forEach((t) => t.kill()); e.tls = []; }
  if (!root) { limpiar(contenedor); contenedor.innerHTML = ''; return; }
  gsap.to(root, { opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => { limpiar(contenedor); contenedor.innerHTML = ''; } });
}
