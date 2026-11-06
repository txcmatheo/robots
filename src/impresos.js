// Impresos de cada piel, dibujados a la medida de los paneles reales del EngineAI T800 Max.
//
// Cada zona del robot se proyecta desde un lienzo que cubre la caja de la pieza, pero solo una parte
// de esa caja es panel plano. Las zonas seguras se midieron proyectando una cuadrícula sobre el robot:
//   pecho        franja alta del peto (el emblema central, que no se forra, queda en y≈0,58)
//   mochila      casi toda la espalda
//   muslo        mitad alta (la baja ya es la rótula)
//   espinillera  casi entera: el mejor lienzo vertical
// Todo se dibuja dentro de esas áreas, con texto que se ajusta sin deformarse.
import { texto, kickLogo, cruzGotica, rayoCarrera, siglas, grietas, cadena, vinilo } from './datos.js';

export const ZONA_SEGURA = {
  pecho: [0.12, 0.09, 0.88, 0.46],
  mochila: [0.1, 0.1, 0.9, 0.9],
  muslo: [0.22, 0.07, 0.78, 0.52],
  espinillera: [0.22, 0.1, 0.78, 0.9],
};
const ORO = '#E8C27A', NEGRO = '#0B0B0D', BLANCO = '#F2F2F0', KICK = '#53FC18', AZUL = '#1F4FE0', CIELO = '#9CC2EE', PLATA = '#D1D1D1';

// dibuja dentro de la zona segura: draw(c, w, h) recibe el área ya trasladada y recortada
function en(zona, draw) {
  return (c, W, H) => {
    const [x0, y0, x1, y1] = ZONA_SEGURA[zona];
    c.save(); c.translate(x0 * W, y0 * H); const w = (x1 - x0) * W, h = (y1 - y0) * H;
    c.beginPath(); c.rect(0, 0, w, h); c.clip(); draw(c, w, h); c.restore();
  };
}
// texto que cabe entero: el mayor tamaño que entra en ancho y alto, sin estirar letras
function ajustado(c, w, h, t, { font = 'Unbounded', weight = 900, color = BLANCO, x = 0.5, y = 0.5, fitW = 0.92, fitH = 0.5, track = 0 } = {}) {
  c.save(); c.font = `${weight} 100px ${font}`; if (track) c.letterSpacing = `${track}px`;
  const m = c.measureText(t).width || 1; const size = Math.min(100 * (fitW * w) / m, fitH * h);
  c.font = `${weight} ${size}px ${font}`; if (track) c.letterSpacing = `${track * size / 100}px`;
  c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x * w, y * h); c.restore();
  return size;
}
// texto vertical (de abajo arriba) ajustado al área
function vertical(c, w, h, t, o = {}) {
  c.save(); c.translate(w / 2, h / 2); c.rotate(-Math.PI / 2); c.translate(-h / 2, -w / 2);
  ajustado(c, h, w, t, { fitW: 0.96, fitH: 0.8, ...o }); c.restore();
}
function marco(c, w, h, color, grosor = 0.012) { c.save(); c.strokeStyle = color; c.lineWidth = Math.min(w, h) * grosor; const m = c.lineWidth; c.strokeRect(m, m, w - 2 * m, h - 2 * m); c.restore(); }
function filete(c, w, h, color, y, alto = 0.012, ancho = 0.4) { c.fillStyle = color; c.fillRect(w * (0.5 - ancho / 2), h * y, w * ancho, h * alto); }
function remachesBorde(c, w, h, n = 12) {
  const r = Math.min(w, h) * 0.016, m = r * 2.2;
  const p = (x, y) => { const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#c9ccd1'); g.addColorStop(1, '#2a2b2e'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  for (let i = 0; i <= n; i++) { const t = i / n; p(m + t * (w - 2 * m), m); p(m + t * (w - 2 * m), h - m); }
  const nv = Math.round(n * h / w); for (let i = 1; i < nv; i++) { const t = i / nv; p(m, m + t * (h - 2 * m)); p(w - m, m + t * (h - 2 * m)); }
}
function remache(c, x, y, r) { const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#c9ccd1'); g.addColorStop(1, '#2a2b2e'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function filaRemaches(c, x0, y0, x1, y1, n, r) { r ??= Math.hypot(x1 - x0, y1 - y0) / n * 0.18; for (let i = 0; i <= n; i++) { const t = i / n; remache(c, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r); } }
// cruz tipo daga: el brazo de abajo largo y en punta, con puntas florenzadas
function daga(c, x, y, s, color = NEGRO) {
  c.save(); c.translate(x, y); c.fillStyle = color; const a = s * 0.12;
  c.beginPath(); c.moveTo(-a / 2, -s * 0.55); c.lineTo(a / 2, -s * 0.55); c.lineTo(a / 2, s * 0.75); c.lineTo(0, s); c.lineTo(-a / 2, s * 0.75); c.closePath(); c.fill();
  c.fillRect(-s * 0.42, -s * 0.3 - a / 2, s * 0.84, a);
  for (const [px, py] of [[0, -s * 0.55], [-s * 0.42, -s * 0.3], [s * 0.42, -s * 0.3]]) for (const [dx, dy] of [[0, 0], [a * 0.85, 0], [-a * 0.85, 0], [0, a * 0.85], [0, -a * 0.85]]) { c.beginPath(); c.arc(px + dx, py + dy, a * 0.6, 0, Math.PI * 2); c.fill(); }
  c.beginPath(); c.arc(0, -s * 0.3, a * 1.1, 0, Math.PI * 2); c.fill(); c.restore();
}
// acolchado en rombos con puntada dorada y un botón en cada cruce, como el de una bata de lujo
function acolchado(c, w, h, color = 'rgba(232,196,120,.85)', paso = 0.2) {
  const d = Math.min(w, h) * paso; c.save(); c.strokeStyle = color; c.lineWidth = d * 0.04; c.lineWidth = d * 0.06; c.setLineDash([d * 0.14, d * 0.07]);
  for (let x = -h; x < w + h; x += d) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + h, h); c.stroke(); c.beginPath(); c.moveTo(x, 0); c.lineTo(x - h, h); c.stroke(); }
  c.setLineDash([]); c.fillStyle = '#D4AF6A'; for (let y = 0; y <= h + d; y += d / 2) for (let x = ((y / (d / 2)) % 2) * d / 2; x <= w + d; x += d) { c.beginPath(); c.arc(x, y, d * 0.05, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
// texto en arco (las batas de boxeo llevan el nombre curvo en la espalda)
function arco(c, w, h, t, { y = 0.4, radio = 0.9, size = 0.16, color = '#D4AF6A', font = 'Bodoni Moda', weight = 700, borde = null } = {}) {
  c.save(); const R = w * radio, cx = w / 2, cy = h * y + R; c.font = `italic ${weight} ${h * size}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const total = c.measureText(t).width * 1.08; let ang = -Math.PI / 2 - total / R / 2;
  for (const ch of t) { const a = c.measureText(ch).width * 1.08; ang += a / R / 2; c.save(); c.translate(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); c.rotate(ang + Math.PI / 2); if (borde) { c.lineWidth = h * size * 0.08; c.strokeStyle = borde; c.strokeText(ch, 0, 0); } c.fillStyle = color; c.fillText(ch, 0, 0); c.restore(); ang += a / R / 2; }
  c.restore();
}
// franja vertical con escalones de píxel (como los cortes de la K de Kick)
function franjaPixel(c, x, y, w, h, color, espejo = false) {
  c.fillStyle = color; c.fillRect(x, y, w * 0.55, h); const p = w * 0.45, n = Math.floor(h / (p * 2));
  for (let i = 0; i < n; i++) if (i % 2 === 0) c.fillRect(espejo ? x - p * 0 : x + w * 0.55, y + i * p * 2, p, p * 1.2);
}
// hilera de bloques que se apagan, como un medidor de señal
function pixeles(c, w, y, y2, color) { const n = 12, p = w * 0.045, g = (w * 0.8 - n * p) / (n - 1); c.save(); c.fillStyle = color; for (let i = 0; i < n; i++) { c.globalAlpha = 1 - i / n * 0.85; c.fillRect(w * 0.1 + i * (p + g), y2, p, p); } c.restore(); }
// rayo con contorno blanco por fuera (se lee desde lejos sobre el rojo)
function rayoPro(c, w, h, o) {
  c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = Math.min(w, h) * 0.02;
  rayoCarrera(c, w, h, { ...o, w: o.w * 1.06, h: o.h * 1.08 }); c.restore();
  c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = BLANCO; c.fillRect(0, 0, w, h); c.restore(); // halo blanco
  rayoCarrera(c, w, h, o);
}
function estelas(c, w, h, y0, y1, n) { c.save(); c.lineCap = 'round'; for (let i = 0; i < n; i++) { const y = h * (y0 + (y1 - y0) * i / (n - 1)), L = w * (0.18 + 0.22 * ((i * 37) % 5) / 5); c.strokeStyle = `rgba(242,242,240,${0.25 + 0.12 * (i % 3)})`; c.lineWidth = h * 0.012; c.beginPath(); c.moveTo(w * 0.02, y); c.lineTo(w * 0.02 + L, y); c.stroke(); } c.restore(); }
function cuadros(c, x, y, w, h, nx, ny) { const cw = w / nx, ch = h / ny; for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { c.fillStyle = (i + j) % 2 ? NEGRO : BLANCO; c.fillRect(x + i * cw, y + j * ch, cw + 0.5, ch + 0.5); } }
function puntos(c, lista, r, color) { c.save(); c.fillStyle = color; for (const [x, y] of lista) { c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); c.fill(); } c.restore(); }
function pliegues(c, w, h, color = 'rgba(110,118,130,.32)') {
  c.save(); c.strokeStyle = color; c.lineCap = 'round'; c.lineWidth = w * 0.035;
  for (const k of [0.18, 0.4, 0.62, 0.84]) { c.beginPath(); c.moveTo(w * k, 0); c.bezierCurveTo(w * (k + 0.07), h * 0.35, w * (k - 0.06), h * 0.7, w * (k + 0.02), h); c.stroke(); }
  c.restore();
}

// franja baja del peto, bajo el emblema central: aquí van hebillas, placas y rejillas
function bajo(draw, [x0, y0, x1, y1] = [0.3, 0.76, 0.7, 0.97]) { return (c, W, H) => { c.save(); c.translate(x0 * W, y0 * H); draw(c, (x1 - x0) * W, (y1 - y0) * H); c.restore(); }; }
const todo = (...fs) => (c, W, H) => fs.forEach(f => f(c, W, H));

export const IMPRESOS = {
  'W SOUND ORO': {
    // el vinilo usa el emblema del pecho como eje: el disco gira alrededor de la pieza que no se forra
    pecho: (c, W, H) => { vinilo(c, W, H, { x: 0.5, y: 0.585, r: 0.4 }); en('pecho', (c, w, h) => ajustado(c, w, h, 'W SOUND', { color: ORO, y: 0.32, fitH: 0.42, track: 18 }))(c, W, H); },
    mochila: en('mochila', (c, w, h) => {
      ajustado(c, w, h, 'W SOUND', { color: ORO, y: 0.4, fitW: 0.98, fitH: 0.3, track: 6 });
      filete(c, w, h, ORO, 0.56, 0.008, 0.36);
      ajustado(c, w, h, 'MEDELLÍN · COLOMBIA', { font: 'JetBrains Mono', weight: 700, color: 'rgba(242,242,240,.8)', y: 0.64, fitW: 0.6, fitH: 0.05, track: 20 });
    }),
    espinillera: en('espinillera', (c, w, h) => vertical(c, w, h, 'WESTCOL', { color: ORO, track: 6 })),
    antebrazo: (c, W, H) => { c.fillStyle = ORO; c.fillRect(0, H * 0.1, W, H * 0.03); c.fillRect(0, H * 0.87, W, H * 0.03); },
  },
  KICK: {
    // el verde Kick sale de casco y botas a detalles con el mismo lenguaje pixelado del logo
    mochila: en('mochila', (c, w, h) => { kickLogo(c, w, h, { y: 0.4, w: 0.9 }); ajustado(c, w, h, 'WESTCOL', { font: 'JetBrains Mono', weight: 800, color: BLANCO, y: 0.66, fitW: 0.5, fitH: 0.07, track: 30 }); pixeles(c, w, h * 0.12, h * 0.86, KICK); }),
    muslo: en('muslo', (c, w, h) => { franjaPixel(c, w * 0.04, 0, w * 0.14, h, KICK); franjaPixel(c, w * 0.82, 0, w * 0.14, h, KICK, true); }),
    espinillera: en('espinillera', (c, w, h) => { c.fillStyle = KICK; c.fillRect(w * 0.04, 0, w * 0.05, h); c.fillRect(w * 0.91, 0, w * 0.05, h); c.save(); c.translate(w * 0.12, 0); vertical(c, w * 0.76, h, 'WESTCOL', { color: BLANCO, track: 6 }); c.restore(); }),
    antebrazo: (c, W, H) => { c.fillStyle = KICK; c.fillRect(0, H * 0.08, W, H * 0.06); c.fillRect(0, H * 0.18, W, H * 0.02); c.fillRect(0, H * 0.86, W, H * 0.06); },
    brazo: (c, W, H) => { c.fillStyle = KICK; c.fillRect(W * 0.44, H * 0.08, W * 0.12, H * 0.84); },
  },
  'KID W': {
    // agujeros de vapor: arco de puntos bajo cada hombro, como en la figura
    pecho_puntos: (c, W, H) => { const r = W * 0.024; const L = []; for (const s of [-1, 1]) for (let k = 0; k < 5; k++) L.push([W * (0.5 + s * (0.2 + k * 0.055)), H * (0.12 + k * k * 0.006)]); puntos(c, L, r, '#5A1A33'); },
    mochila: en('mochila', (c, w, h) => { const r = w * 0.03; const L = []; for (const s of [-1, 1]) for (let k = 0; k < 6; k++) L.push([w * (0.5 + s * 0.17), h * (0.14 + k * 0.12)]); puntos(c, L, r, '#5A1A33'); }),
    // hebilla dorada lisa sobre el cinturón negro
    pecho_inf: (c, W, H) => { const g = c.createLinearGradient(0, H * 0.25, 0, H * 0.8); g.addColorStop(0, '#F7D25A'); g.addColorStop(1, '#B9811A'); c.fillStyle = g; c.beginPath(); c.roundRect(W * 0.38, H * 0.25, W * 0.24, H * 0.5, W * 0.03); c.fill(); c.lineWidth = W * 0.01; c.strokeStyle = '#6B4A0E'; c.stroke(); },
    muslo: en('muslo', (c, w, h) => pliegues(c, w, h)),
    espinillera: en('espinillera', (c, w, h) => pliegues(c, w, h)),
    antebrazo: (c, W, H) => { c.fillStyle = '#E8B53A'; c.fillRect(0, H * 0.04, W, H * 0.05); c.fillRect(0, H * 0.91, W, H * 0.05); },
    bota: (c, W, H) => { c.fillStyle = NEGRO; c.fillRect(0, 0, W, H * 0.36); c.fillStyle = '#E8B53A'; c.fillRect(0, H * 0.36, W, H * 0.05); },
  },
  'G WAGON': {
    // como en sus fotos: remaches en cada costura, cruces tipo daga de varios tamaños, rejilla con barra cromada
    // y la tapa de la llanta de repuesto en la espalda
    pecho: en('pecho', (c, w, h) => { remachesBorde(c, w, h, 16); filaRemaches(c, w * 0.06, h * 0.22, w * 0.94, h * 0.22, 16); daga(c, w * 0.3, h * 0.56, h * 0.42); cruzGotica(c, w * 0.72, h * 0.48, h * 0.2, NEGRO); cruzGotica(c, w * 0.56, h * 0.84, h * 0.1, NEGRO); }),
    mochila: en('mochila', (c, w, h) => {
      remachesBorde(c, w, h, 14); filaRemaches(c, w * 0.5, h * 0.06, w * 0.5, h * 0.94, 14);
      const R = Math.min(w, h) * 0.34; c.save(); c.fillStyle = '#121214'; c.beginPath(); c.arc(w / 2, h * 0.52, R, 0, Math.PI * 2); c.fill(); c.lineWidth = R * 0.07; c.strokeStyle = '#9EA1A7'; c.stroke(); c.restore();
      for (let i = 0; i < 18; i++) { const t = i / 18 * Math.PI * 2; remache(c, w / 2 + Math.cos(t) * R * 0.86, h * 0.52 + Math.sin(t) * R * 0.86, R * 0.045); }
      cruzGotica(c, w / 2, h * 0.53, R * 0.5, '#9EA1A7');
      cruzGotica(c, w * 0.2, h * 0.16, h * 0.05, NEGRO); cruzGotica(c, w * 0.82, h * 0.88, h * 0.05, NEGRO);
    }),
    pecho_inf: (c, W, H) => { c.fillStyle = '#0C0C0E'; c.fillRect(W * 0.14, H * 0.2, W * 0.72, H * 0.6); c.fillStyle = '#3A3C40'; for (let k = 0; k < 11; k++) c.fillRect(W * (0.17 + k * 0.062), H * 0.26, W * 0.024, H * 0.48); c.fillStyle = '#D7DADF'; c.fillRect(W * 0.485, H * 0.22, W * 0.03, H * 0.56); },
    muslo: en('muslo', (c, w, h) => { remachesBorde(c, w, h, 6); daga(c, w * 0.5, h * 0.48, h * 0.36); cruzGotica(c, w * 0.78, h * 0.86, h * 0.06, NEGRO); }),
    espinillera: en('espinillera', (c, w, h) => { filaRemaches(c, w * 0.1, h * 0.04, w * 0.1, h * 0.96, 16); filaRemaches(c, w * 0.9, h * 0.04, w * 0.9, h * 0.96, 16); cruzGotica(c, w * 0.5, h * 0.2, w * 0.18, NEGRO); cruzGotica(c, w * 0.5, h * 0.55, w * 0.12, NEGRO); cruzGotica(c, w * 0.5, h * 0.82, w * 0.08, NEGRO); }),
    antebrazo: (c, W, H) => { for (const y of [0.12, 0.88]) filaRemaches(c, W * 0.05, H * y, W * 0.95, H * y, 6, Math.min(W, H) * 0.035); },
  },
  'RAYO W': {
    // decoración de carreras: un rayo protagonista por panel, con contorno blanco y estelas de velocidad
    pecho: en('pecho', (c, w, h) => { estelas(c, w, h, 0.18, 0.5, 5); rayoPro(c, w, h, { x: 0.52, y: 0.52, w: 1.02, h: 0.92, rot: -0.1 }); }),
    mochila: en('mochila', (c, w, h) => { estelas(c, w, h, 0.12, 0.6, 7); rayoPro(c, w, h, { x: 0.5, y: 0.5, w: 1.0, h: 0.62, rot: -0.22 }); }),
    muslo: en('muslo', (c, w, h) => rayoPro(c, w, h, { x: 0.5, y: 0.52, w: 1.0, h: 0.62, rot: -Math.PI / 2 })),
    espinillera: en('espinillera', (c, w, h) => { cuadros(c, 0, 0, w, h * 0.12, 6, 2); c.save(); c.translate(0, h * 0.16); vertical(c, w, h * 0.84, 'WESTCOL', { font: 'JetBrains Mono', weight: 800, color: BLANCO, track: 8 }); c.restore(); }),
    antebrazo: (c, W, H) => { c.fillStyle = '#FFC400'; c.fillRect(0, H * 0.1, W, H * 0.07); c.fillStyle = '#FF8A00'; c.fillRect(0, H * 0.19, W, H * 0.035); },
    bota: (c, W, H) => { c.fillStyle = BLANCO; c.fillRect(0, H * 0.2, W, H * 0.05); c.fillStyle = '#D3121B'; c.fillRect(0, H * 0.27, W, H * 0.025); },
  },
  'E.P.H.D.M': {
    // la cadena cuelga del cuello; las siglas con cuernos son el héroe del peto
    pecho: (c, W, H) => { cadena(c, W, H, '#C5CCD0', 0.06, 0.1); en('pecho', (c, w, h) => siglas(c, w, h, 'E.P.H.D.M', { y: 0.66, size: h * 0.46, cuernos: true, color: PLATA, maxW: 0.96 }))(c, W, H); },
    mochila: en('mochila', (c, w, h) => {
      grietas(c, w, h, 'rgba(209,209,209,.22)', 3, 0.5, 0.5);
      siglas(c, w, h, 'EL PEOR', { y: 0.42, size: h * 0.16, color: PLATA, maxW: 0.92 });
      ajustado(c, w, h, 'HOMBRE DEL MUNDO', { font: 'JetBrains Mono', weight: 800, color: PLATA, y: 0.56, fitW: 0.82, fitH: 0.06, track: 12 });
    }),
    espinillera: en('espinillera', (c, w, h) => vertical(c, w, h, 'BLESSD', { color: PLATA, track: 4 })),
  },
  'E.M.H.D.M': {
    pecho: en('pecho', (c, w, h) => siglas(c, w, h, 'E.M.H.D.M', { y: 0.66, size: h * 0.46, color: BLANCO, halo: true, haloColor: CIELO, maxW: 0.96, gastado: false })),
    mochila: en('mochila', (c, w, h) => {
      c.save(); c.strokeStyle = CIELO; c.lineWidth = h * 0.016; c.beginPath(); c.ellipse(w / 2, h * 0.22, w * 0.2, h * 0.045, 0, 0, Math.PI * 2); c.stroke(); c.restore();
      siglas(c, w, h, 'EL MEJOR', { y: 0.44, size: h * 0.16, color: BLANCO, maxW: 0.92, gastado: false });
      ajustado(c, w, h, 'HOMBRE DEL MUNDO', { font: 'JetBrains Mono', weight: 800, color: BLANCO, y: 0.58, fitW: 0.82, fitH: 0.06, track: 12 });
    }),
    espinillera: en('espinillera', (c, w, h) => vertical(c, w, h, 'BLESSD', { color: AZUL, track: 4 })),
  },
  'CAMPEÓN': {
    pecho: en('pecho', (c, w, h) => acolchado(c, w, h)),
    mochila: en('mochila', (c, w, h) => acolchado(c, w, h)),
    // pantaloneta: pretina dorada y franja lateral
    muslo: (c, W, H) => { c.fillStyle = '#D4AF6A'; c.fillRect(W * 0.1, H * 0.06, W * 0.8, H * 0.05); c.fillStyle = '#F1E6D2'; c.fillRect(W * 0.1, H * 0.11, W * 0.8, H * 0.012); c.fillStyle = '#D4AF6A'; c.fillRect(W * 0.18, H * 0.11, W * 0.05, H * 0.42); c.fillRect(W * 0.77, H * 0.11, W * 0.05, H * 0.42); },
    // botas altas: cordones cruzados al centro
    espinillera: en('espinillera', (c, w, h) => { c.save(); c.strokeStyle = '#2A0710'; c.lineWidth = w * 0.035; c.lineCap = 'round'; for (let k = 0; k < 10; k++) { const y = h * (0.06 + k * 0.09); c.beginPath(); c.moveTo(w * 0.36, y); c.lineTo(w * 0.64, y + h * 0.06); c.moveTo(w * 0.64, y); c.lineTo(w * 0.36, y + h * 0.06); c.stroke(); } c.fillStyle = '#D4AF6A'; for (let k = 0; k <= 10; k++) for (const x of [0.33, 0.67]) { c.beginPath(); c.arc(w * x, h * (0.06 + k * 0.09), w * 0.025, 0, Math.PI * 2); c.fill(); } c.restore(); }),
    // vendas de mano cruzadas
    antebrazo: (c, W, H) => { c.save(); c.strokeStyle = 'rgba(160,140,110,.45)'; c.lineWidth = Math.min(W, H) * 0.03; for (let k = -1; k < 7; k++) { c.beginPath(); c.moveTo(0, H * k / 6); c.lineTo(W, H * (k + 1.4) / 6); c.stroke(); } c.restore(); },
    bota: (c, W, H) => { c.fillStyle = '#D4AF6A'; c.fillRect(0, H * 0.14, W, H * 0.04); },
  },
};
// los textos en mayúsculas siguen sin uso: texto() queda disponible para impresos futuros
void texto;

// el torso inferior no recibe calcos en el modelo: lo que se diseñó para él va a la franja baja del peto
for (const d of Object.values(IMPRESOS)) {
  const base = d.pecho || d.pecho_puntos, inf = d.pecho_inf;
  if (inf) d.pecho = base ? todo(base, bajo(inf)) : bajo(inf);
  else if (d.pecho_puntos) d.pecho = d.pecho_puntos;
  delete d.pecho_inf; delete d.pecho_puntos;
}
