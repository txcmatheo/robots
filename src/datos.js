// Datos base de los dos robots (EngineAI T800 Max). Las pieles definitivas llegan desde
// public/disenos/*.json (ver cargarEntregas en main.js); aquí quedan los valores de respaldo.

// ---------- utilidades de dibujo (impresos en canvas) ----------
export function texto(ctx, W, H, t, o = {}) {
  const size = o.size || H * 0.5;
  ctx.save();
  ctx.font = `${o.weight || 900} ${size}px ${o.font || 'Unbounded'}`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  const x = o.x != null ? o.x * W : W / 2, y = o.y != null ? o.y * H : H / 2;
  const maxW = o.maxW ? o.maxW * W : W * 0.94;
  const m = ctx.measureText(t).width;
  if (m > maxW) { ctx.translate(x, y); ctx.scale(maxW / m, 1); ctx.translate(-x, -y); }
  ctx.fillStyle = o.color || '#fff';
  ctx.fillText(t, x, y);
  ctx.restore();
}

// ---------- colores de fábrica del T800 Max ----------
const BL = '#eceef0', GR = '#9da1a6', PL = '#b7bbc0';
export const MODELO = { id: 't800', nombre: 'ENGINEAI T800 MAX', corto: 'EngineAI T800 Max' };
export const FABRICA = {
  casco: [BL, 'factory'], coronilla: [GR, 'factory'], pecho: [BL, 'factory'], pecho_inf: ['#3a3c41', 'factory'],
  mochila: [BL, 'factory'], hombro: [PL, 'factorym'], brazo: [BL, 'factory'], antebrazo: [BL, 'factory'], cadera: [BL, 'factory'],
  muslo: [BL, 'factory'], rodilla: [PL, 'factorym'], espinillera: ['#5a5d63', 'factorym'], bota: [BL, 'factory'],
};
export const IMPRESOS_FABRICA = {
  pecho: (c, W, H) => { texto(c, W, H, 'T800', { size: H * 0.16, color: '#16171a', y: 0.62, maxW: 0.3 }); c.fillStyle = '#d0242b'; c.fillRect(W * 0.7, H * 0.22, W * 0.07, H * 0.18); },
  mochila: (c, W, H) => { texto(c, W, H, 'ENGINEAI', { size: H * 0.08, color: '#2a2b2f', y: 0.18, maxW: 0.6 }); c.fillStyle = '#d0242b'; c.fillRect(W * 0.3, H * 0.34, W * 0.4, H * 0.05); },
};

export const ARTISTAS = [
  { id: 'westcol', nombre: 'WESTCOL', acento: '#F4A3C4', recomendado: 0, conceptos: [] },
  { id: 'blessd', nombre: 'BLESSD', acento: '#2651B5', recomendado: 0, conceptos: [] },
];

// canción oficial de cada uno (reproductor de YouTube en miniatura)
export const CANCION = {
  westcol: { id: 'F1_aOX0acbY', t: 'La Plena (W Sound 05)', c: 'Beéle, Westcol, Ovy On The Drums · W Sound' },
  blessd: { id: 'zcw8NlHljF4', t: 'Mírame', c: 'Blessd × Ovy On The Drums · Siempre Blessd' },
};

export const ZONAS = {
  casco: { nombre: 'Casco', trato: 'PPF de color + impreso', nota: 'Respeta la apertura de cámara y el visor.' },
  coronilla: { nombre: 'Coronilla', trato: 'PPF de color', nota: 'Pieza lisa, ideal para color shift o cromo.' },
  visor: { nombre: 'Visor y cámaras', trato: 'Sin forrar', nota: 'Óptica del robot: nunca se cubre.', libre: true },
  cuello: { nombre: 'Cuello', trato: 'Sin forrar', nota: 'Junta móvil y puertos.', libre: true },
  pecho: { nombre: 'Pecho', trato: 'Impreso + PPF', nota: 'El lienzo principal: aquí vive el lettering.' },
  emblema: { nombre: 'Emblema y rejilla', trato: 'Sin forrar', nota: 'Posible sensor o ventilación: se respeta.', libre: true },
  pecho_inf: { nombre: 'Torso inferior', trato: 'PPF de color', nota: 'Sin tapar la rejilla.' },
  mochila: { nombre: 'Mochila', trato: 'Impreso', nota: 'El mensaje de la espalda. Ranura y rejillas libres.' },
  hombro: { nombre: 'Discos de hombro', trato: 'PPF cromo o color', nota: 'Solo la cara plana; el borde que gira queda libre.' },
  brazo: { nombre: 'Brazos', trato: 'PPF de color + tiras impresas', nota: 'Se corta en dos piezas por el arco.' },
  codo: { nombre: 'Codos', trato: 'Sin forrar', nota: 'Articulación móvil.', libre: true },
  antebrazo: { nombre: 'Antebrazos', trato: 'PPF de color', nota: 'Superficie larga y libre.' },
  mano: { nombre: 'Manos', trato: 'Sin forrar', nota: 'Agarre y articulación.', libre: true },
  cadera: { nombre: 'Cadera', trato: 'PPF de color', nota: 'Rejilla hexagonal libre.' },
  articulacion: { nombre: 'Articulaciones', trato: 'Sin forrar', nota: 'Movimiento y calor.', libre: true },
  muslo: { nombre: 'Muslos', trato: 'Impreso grande', nota: 'La mejor superficie de lienzo del robot.' },
  rodilla: { nombre: 'Rótulas', trato: 'PPF cromo', nota: 'Pieza plana y circular.' },
  espinillera: { nombre: 'Espinilleras', trato: 'Satinado, carbono o impreso', nota: 'Rejillas traseras libres.' },
  bota: { nombre: 'Botas', trato: 'PPF de color', nota: 'Sin forrar la suela ni la flexión del tobillo.' },
};

// ---------- diseños nuevos de Westcol ----------
// Basados en lo público de él: streamer de Medellín que transmite en vivo, su sello W Sound
// y la W como monograma. Cada uno trae impresos que se proyectan sobre los paneles reales.
function vertical(ctx, W, H, t, o = {}) {
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(o.ccw ? -Math.PI / 2 : Math.PI / 2); ctx.translate(-H / 2, -W / 2);
  texto(ctx, H, W, t, o); ctx.restore();
}
function wMono(c, W, H, { color = '#fff', stroke = null, sw = 0, x = 0.5, y = 0.5, s = 0.62 } = {}) {
  // W angulosa dibujada a mano (no depende de ninguna fuente)
  const cx = x * W, cy = y * H, h = Math.min(W, H) * s, w = h * 1.25, t = h * 0.2;
  c.save(); c.translate(cx - w / 2, cy - h / 2); c.beginPath();
  c.moveTo(0, 0); c.lineTo(t * 1.1, 0); c.lineTo(w * 0.3, h * 0.66); c.lineTo(w * 0.5 - t * 0.35, h * 0.2); c.lineTo(w * 0.5 + t * 0.35, h * 0.2);
  c.lineTo(w * 0.7, h * 0.66); c.lineTo(w - t * 1.1, 0); c.lineTo(w, 0); c.lineTo(w * 0.78, h); c.lineTo(w * 0.62, h); c.lineTo(w * 0.5, h * 0.55);
  c.lineTo(w * 0.38, h); c.lineTo(w * 0.22, h); c.closePath();
  if (stroke) { c.lineWidth = sw; c.strokeStyle = stroke; c.lineJoin = 'miter'; c.stroke(); }
  c.fillStyle = color; c.fill(); c.restore();
}
function rec(c, W, H, x, y, r, color) { c.save(); c.fillStyle = color; c.shadowColor = color; c.shadowBlur = r * 1.5; c.beginPath(); c.arc(x * W, y * H, r, 0, Math.PI * 2); c.fill(); c.restore(); }
function ondas(c, W, H, color, n = 18) { // ecualizador
  c.save(); c.fillStyle = color; const bw = W / (n * 1.6);
  for (let i = 0; i < n; i++) { const h = H * (0.15 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))); c.fillRect(i * bw * 1.6 + bw * 0.3, (H - h) / 2, bw, h); }
  c.restore();
}
const KICK = '#53FC18', NEGRO = '#0B0B0D', ORO = '#E8C27A', BLANCO = '#F2F2F0', ROJO = '#FF0700', CROMO = '#B1B3B2';
function vinilo(c, W, H, { x = 0.5, y = 0.5, r = 0.42, label = ORO } = {}) { // disco con surcos
  const cx = x * W, cy = y * H, R = Math.min(W, H) * r;
  c.save(); c.fillStyle = '#050506'; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(232,194,122,.35)'; c.lineWidth = Math.max(1, R * 0.012);
  for (let k = 0.42; k < 0.98; k += 0.045) { c.beginPath(); c.arc(cx, cy, R * k, 0, Math.PI * 2); c.stroke(); }
  c.fillStyle = label; c.beginPath(); c.arc(cx, cy, R * 0.36, 0, Math.PI * 2); c.fill(); c.restore();
}
function vapor(c, W, H, color = 'rgba(255,255,255,.85)', n = 5, seed = 3) { // nubes de vapor de cómic
  let sd = seed; const rnd = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
  c.save(); c.fillStyle = color; c.strokeStyle = 'rgba(11,11,13,.55)'; c.lineWidth = Math.min(W, H) * 0.012;
  for (let k = 0; k < n; k++) {
    const x = W * (0.15 + rnd() * 0.7), y = H * (0.12 + rnd() * 0.76), r = Math.min(W, H) * (0.07 + rnd() * 0.07);
    c.beginPath(); for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; c.moveTo(x + Math.cos(a) * r * 0.7 + r * 0.55, y + Math.sin(a) * r * 0.5); c.arc(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.5, r * 0.55, 0, Math.PI * 2); }
    c.fill(); c.stroke();
  }
  c.restore();
}

// Colección de Westcol. Reemplaza a la del JSON: fuera Majin W; el guiño a Buu queda solo en KID W.

// Logotipo de Kick dibujado en bloques (aproximación para la maqueta; en producción se imprime el archivo oficial con permiso de Kick)
const KICK_PX = {
  K: ['X..X', 'X.X.', 'XX..', 'X.X.', 'X..X'],
  I: ['X', 'X', 'X', 'X', 'X'],
  C: ['XXX', 'X..', 'X..', 'X..', 'XXX'],
};
function kickLogo(c, W, H, { color = KICK, x = 0.5, y = 0.5, w = 0.8 } = {}) {
  const letras = ['K', 'I', 'C', 'K'].map(l => KICK_PX[l]); const cols = letras.reduce((a, l) => a + l[0].length, 0) + letras.length - 1;
  const cell = Math.min((W * w) / cols, H * 0.9 / 5); const tw = cols * cell; let cx = x * W - tw / 2; const cy = y * H - cell * 2.5;
  c.save(); c.fillStyle = color;
  for (const l of letras) { l.forEach((fila, r) => [...fila].forEach((p, k) => { if (p === 'X') c.fillRect(cx + k * cell, cy + r * cell, cell + 0.5, cell + 0.5); })); cx += (l[0].length + 1) * cell; }
  c.restore();
}

// motivos de la G: cruz gótica de puntas florenzadas y filas de remaches
function cruzGotica(c, x, y, s, color = '#0B0B0D') {
  c.save(); c.translate(x, y); c.fillStyle = color; const a = s * 0.16;
  c.fillRect(-a / 2, -s, a, s * 2); c.fillRect(-s * 0.72, -a / 2 - s * 0.22, s * 1.44, a);
  for (const [px, py] of [[0, -s], [0, s], [-s * 0.72, -s * 0.22], [s * 0.72, -s * 0.22]]) {
    for (const [dx, dy] of [[0, 0], [a * 0.9, 0], [-a * 0.9, 0], [0, a * 0.9], [0, -a * 0.9]]) { c.beginPath(); c.arc(px + dx, py + dy, a * 0.62, 0, Math.PI * 2); c.fill(); }
  }
  c.beginPath(); c.arc(0, -s * 0.22, a * 1.1, 0, Math.PI * 2); c.fill(); c.restore();
}
function remaches(c, W, H, m = 0.05, n = 14, color = '#c9ccd1') {
  c.save(); const r = Math.min(W, H) * 0.012;
  const punto = (x, y) => { const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, color); g.addColorStop(1, '#2a2b2e'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  for (let i = 0; i <= n; i++) { const t = i / n; punto(W * (m + t * (1 - 2 * m)), H * m); punto(W * (m + t * (1 - 2 * m)), H * (1 - m)); punto(W * m, H * (m + t * (1 - 2 * m))); punto(W * (1 - m), H * (m + t * (1 - 2 * m))); }
  c.restore();
}
const NAVY = '#14213D', AMARILLO = '#F5C518';

// Colección de Westcol, pensada para el T800 Max real:
//  - impresos solo en paneles planos y grandes (pecho, mochila, muslos, espinilleras);
//  - en piezas curvas o pequeñas (casco, hombros, rótulas, botas) solo color o filetes simples;
//  - ningún impreso cruza una junta ni tapa visor, rejillas o puertos (las zonas son paneles reales).
export const WESTCOL_DISENOS = [
  {
    nombre: 'W SOUND ORO', acento: ORO, visor: ORO,
    idea: 'La edición de estudio de W Sound: negro piano, cromo oro en hombros, cadera, rótulas y botas, un vinilo con la W en el pecho y la firma del sello en la espalda.',
    paleta: [NEGRO, ORO, '#F2C230', ROJO],
    z: {
      casco: [NEGRO, 'gloss'], coronilla: ['#F2C230', 'gold'], pecho: [NEGRO, 'gloss'], pecho_inf: [NEGRO, 'satin'],
      mochila: [NEGRO, 'gloss'], hombro: ['#F2C230', 'gold'], brazo: [NEGRO, 'gloss'], antebrazo: [NEGRO, 'gloss'],
      cadera: ['#F2C230', 'gold'], muslo: [NEGRO, 'gloss'], rodilla: ['#F2C230', 'gold'], espinillera: [NEGRO, 'carbon'], bota: ['#F2C230', 'gold'],
    },
    p: {
      pecho: (c, W, H) => { vinilo(c, W, H, { x: 0.5, y: 0.5, r: 0.46 }); wMono(c, W, H, { color: NEGRO, y: 0.5, s: 0.22 }); },
      mochila: (c, W, H) => { texto(c, W, H, 'W SOUND', { size: H * 0.16, color: ORO, y: 0.3, maxW: 0.86 }); c.fillStyle = ROJO; c.fillRect(W * 0.3, H * 0.44, W * 0.4, H * 0.012); texto(c, W, H, 'MEDELLÍN', { size: H * 0.07, color: BLANCO, y: 0.56, font: 'JetBrains Mono', weight: 700, maxW: 0.6 }); },
      muslo: (c, W, H) => vertical(c, W, H, 'WESTCOL', { size: W * 0.46, color: ORO }),
      antebrazo: (c, W, H) => { c.fillStyle = ORO; c.fillRect(0, H * 0.08, W, H * 0.03); c.fillRect(0, H * 0.89, W, H * 0.03); },
      espinillera: (c, W, H) => { c.fillStyle = ORO; c.fillRect(W * 0.08, H * 0.04, W * 0.84, H * 0.02); },
    },
    glow: {},
  },
  {
    nombre: 'KICK', acento: KICK, visor: KICK,
    idea: 'Su casa es Kick: negro satinado de estudio, verde Kick en casco, antebrazos y botas, el logo de Kick grande en el pecho y su canal en la espalda.',
    paleta: [NEGRO, KICK, '#1A1C1F', BLANCO, CROMO],
    z: {
      casco: [KICK, 'gloss'], coronilla: [NEGRO, 'gloss'], pecho: [NEGRO, 'satin'], pecho_inf: ['#1A1C1F', 'matte'],
      mochila: [NEGRO, 'satin'], hombro: [CROMO, 'chrome'], brazo: [NEGRO, 'satin'], antebrazo: [KICK, 'gloss'],
      cadera: ['#1A1C1F', 'matte'], muslo: [NEGRO, 'satin'], rodilla: [CROMO, 'chrome'], espinillera: ['#1A1C1F', 'carbon'], bota: [KICK, 'gloss'],
    },
    p: {
      pecho: (c, W, H) => { kickLogo(c, W, H, { y: 0.44, w: 0.78 }); rec(c, W, H, 0.3, 0.86, H * 0.035, '#ff2d2d'); texto(c, W, H, 'EN VIVO', { size: H * 0.08, color: BLANCO, x: 0.56, y: 0.86, maxW: 0.4, font: 'JetBrains Mono', weight: 800 }); },
      mochila: (c, W, H) => { wMono(c, W, H, { color: KICK, y: 0.36, s: 0.42 }); texto(c, W, H, 'kick.com/westcol', { size: H * 0.075, color: BLANCO, y: 0.78, maxW: 0.86, font: 'JetBrains Mono', weight: 700 }); },
      muslo: (c, W, H) => vertical(c, W, H, 'WESTCOL', { size: W * 0.5, color: KICK }),
      espinillera: (c, W, H) => { c.fillStyle = KICK; c.fillRect(W * 0.08, H * 0.04, W * 0.84, H * 0.025); },
    },
    glow: { pecho: true },
  },
  {
    nombre: 'KID W', acento: '#E040A0', visor: '#E040A0',
    idea: 'Inspirado en el pequeño Buu: piel rosa, pantalón blanco y amplio, cinturón negro con hebilla de oro, botas negras y nubes de vapor impresas.',
    paleta: ['#F49AC1', BLANCO, NEGRO, '#F2C230', '#E040A0'],
    z: {
      casco: ['#F49AC1', 'gloss'], coronilla: ['#F49AC1', 'pearl'], pecho: ['#F49AC1', 'gloss'], pecho_inf: ['#F49AC1', 'gloss'],
      mochila: ['#F49AC1', 'gloss'], hombro: ['#F49AC1', 'pearl'], brazo: ['#F49AC1', 'gloss'], antebrazo: ['#F49AC1', 'gloss'],
      cadera: [NEGRO, 'satin'], muslo: [BLANCO, 'satin'], rodilla: [BLANCO, 'satin'], espinillera: [BLANCO, 'satin'], bota: [NEGRO, 'gloss'],
    },
    p: {
      cadera: (c, W, H) => { c.fillStyle = '#F2C230'; c.fillRect(W * 0.36, H * 0.14, W * 0.28, H * 0.72); wMono(c, W, H, { color: NEGRO, y: 0.5, s: 0.5 }); },
      mochila: (c, W, H) => vapor(c, W, H, 'rgba(255,255,255,.9)', 6, 7),
      brazo: (c, W, H) => vapor(c, W, H, 'rgba(255,255,255,.9)', 2, 11),
      muslo: (c, W, H) => { c.save(); c.strokeStyle = 'rgba(11,11,13,.18)'; c.lineWidth = W * 0.02; for (let k = 0.2; k < 1; k += 0.2) { c.beginPath(); c.moveTo(W * k, 0); c.quadraticCurveTo(W * (k + 0.06), H * 0.5, W * k, H); c.stroke(); } c.restore(); },
      bota: (c, W, H) => { c.fillStyle = '#F2C230'; c.fillRect(0, H * 0.08, W, H * 0.14); },
    },
    glow: {},
  },
  {
    nombre: 'G WAGON', acento: '#FFD9A0', visor: '#FFD9A0',
    idea: 'Su G Wagon hecha piel: acero gastado y rayado en todo el cuerpo, remaches en los bordes de cada panel, cruces góticas negras en muslos, pecho y espalda, carbono forjado como el capó y negro mate como los rines.',
    paleta: ['#9EA1A7', '#0B0B0D', '#2A2B2E', '#C9CCD1', '#FFD9A0'],
    z: {
      casco: ['#C3C6CC', 'acero'], coronilla: ['#ffffff', 'carbon'], pecho: ['#C3C6CC', 'acero'], pecho_inf: ['#ffffff', 'carbon'],
      mochila: ['#C3C6CC', 'acero'], hombro: ['#C3C6CC', 'acero'], brazo: ['#0B0B0D', 'matte'], antebrazo: ['#C3C6CC', 'acero'],
      cadera: ['#0B0B0D', 'matte'], muslo: ['#C3C6CC', 'acero'], rodilla: ['#C9CCD1', 'chrome'], espinillera: ['#C3C6CC', 'acero'], bota: ['#0B0B0D', 'matte'],
    },
    p: {
      pecho: (c, W, H) => { remaches(c, W, H, 0.05, 16); cruzGotica(c, W * 0.5, H * 0.52, H * 0.3); },
      mochila: (c, W, H) => { remaches(c, W, H, 0.05, 12); cruzGotica(c, W * 0.5, H * 0.55, H * 0.36); },
      muslo: (c, W, H) => { remaches(c, W, H, 0.07, 10); cruzGotica(c, W * 0.5, H * 0.32, W * 0.3); cruzGotica(c, W * 0.5, H * 0.72, W * 0.22); },
      espinillera: (c, W, H) => remaches(c, W, H, 0.07, 10),
      antebrazo: (c, W, H) => remaches(c, W, H, 0.08, 8),
    },
    glow: {},
  },
  {
    nombre: 'WEST SANTOS', acento: AMARILLO, visor: AMARILLO,
    idea: 'El robot con la camiseta de su club en la Kings League: blanco, azul marino y amarillo de los uniformes de West Santos, número 1 del presidente en la espalda.',
    paleta: [BLANCO, NAVY, AMARILLO, NEGRO],
    z: {
      casco: [NAVY, 'gloss'], coronilla: [AMARILLO, 'gloss'], pecho: [BLANCO, 'gloss'], pecho_inf: [NAVY, 'satin'],
      mochila: [BLANCO, 'gloss'], hombro: [AMARILLO, 'gloss'], brazo: [NAVY, 'satin'], antebrazo: [BLANCO, 'gloss'],
      cadera: [NAVY, 'satin'], muslo: [NAVY, 'satin'], rodilla: [AMARILLO, 'gloss'], espinillera: [BLANCO, 'gloss'], bota: [NAVY, 'gloss'],
    },
    p: {
      pecho: (c, W, H) => { c.fillStyle = NAVY; c.fillRect(0, H * 0.06, W, H * 0.1); c.fillStyle = AMARILLO; c.fillRect(0, H * 0.16, W, H * 0.04); texto(c, W, H, 'WEST SANTOS', { size: H * 0.15, color: NAVY, y: 0.52, maxW: 0.86 }); texto(c, W, H, 'FC', { size: H * 0.12, color: AMARILLO, y: 0.74 }); },
      mochila: (c, W, H) => { texto(c, W, H, 'WESTCOL', { size: H * 0.12, color: NAVY, y: 0.2, maxW: 0.8 }); texto(c, W, H, '1', { size: H * 0.56, color: NAVY, y: 0.6 }); },
      muslo: (c, W, H) => { c.fillStyle = AMARILLO; c.fillRect(W * 0.08, 0, W * 0.1, H); c.fillRect(W * 0.82, 0, W * 0.1, H); },
      espinillera: (c, W, H) => { c.fillStyle = NAVY; for (let k = 0; k < 3; k++) c.fillRect(W * 0.08, H * (0.06 + k * 0.05), W * 0.84, H * 0.022); },
    },
    glow: {},
  },
];
