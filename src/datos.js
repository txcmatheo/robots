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

// Logotipo de Kick: trazos tomados del archivo oficial (lienzo 1982×666). En producción se imprime el vector oficial con permiso de Kick.
const KICK_K = [[5,4],[215,4],[215,149],[286,149],[286,76],[356,76],[356,4],[568,4],[568,223],[497,223],[497,296],[427,296],[427,369],[497,369],[497,442],[568,442],[568,662],[356,662],[356,589],[286,589],[286,516],[215,516],[215,662],[5,662]];
const KICK_FORMAS = [
  KICK_K,
  [[638,4],[850,4],[850,662],[638,662]],
  [[991,3],[1343,3],[1343,222],[1131,222],[1131,441],[1343,441],[1343,661],[991,661],[991,589],[920,589],[920,76],[991,76]],
  KICK_K.map(([x, y]) => [x + 1409, y]),
];
function kickLogo(c, W, H, { color = KICK, x = 0.5, y = 0.5, w = 0.8 } = {}) {
  const s = Math.min((W * w) / 1972, (H * 0.9) / 659); const ox = x * W - (1972 * s) / 2 - 5 * s, oy = y * H - (659 * s) / 2 - 3 * s;
  c.save(); c.fillStyle = color;
  for (const f of KICK_FORMAS) { c.beginPath(); f.forEach(([px, py], i) => (i ? c.lineTo : c.moveTo).call(c, ox + px * s, oy + py * s)); c.closePath(); c.fill(); }
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
// rayo de carreras con degradado amarillo-naranja y contorno rojo oscuro
function rayoCarrera(c, W, H, { x = 0.5, y = 0.5, w = 0.9, h = 0.5, rot = 0 } = {}) {
  const pts = [[0, 0.42], [0.42, 0.3], [0.36, 0.5], [1, 0.18], [0.5, 0.62], [0.56, 0.44], [0.02, 0.72]];
  c.save(); c.translate(x * W, y * H); c.rotate(rot); const bw = w * W, bh = h * H; c.translate(-bw / 2, -bh / 2);
  const g = c.createLinearGradient(0, 0, bw, 0); g.addColorStop(0, '#FF8A00'); g.addColorStop(0.55, '#FFC400'); g.addColorStop(1, '#FFE45C');
  c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo : c.moveTo).call(c, px * bw, (py - 0.18) / 0.54 * bh)); c.closePath();
  c.lineJoin = 'round'; c.lineWidth = Math.min(bw, bh) * 0.06; c.strokeStyle = '#7A0A0A'; c.stroke(); c.fillStyle = g; c.fill(); c.restore();
}
function numeroCarrera(c, W, H, { x = 0.5, y = 0.5, r = 0.3, txt = 'W' } = {}) {
  const R = Math.min(W, H) * r; c.save(); c.fillStyle = '#F2F2F0'; c.beginPath(); c.arc(x * W, y * H, R, 0, Math.PI * 2); c.fill();
  c.lineWidth = R * 0.12; c.strokeStyle = '#0B0B0D'; c.stroke(); c.restore();
  wMono(c, W, H, { color: '#D3121B', stroke: '#0B0B0D', sw: R * 0.06, x, y, s: r * 1.15 });
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
    idea: 'Su casa es Kick: negro satinado, verde Kick en casco, antebrazos y botas, el logo de Kick grande en el pecho y su canal en la espalda.',
    paleta: [NEGRO, KICK, '#1A1C1F', BLANCO, CROMO],
    z: {
      casco: [KICK, 'gloss'], coronilla: [NEGRO, 'gloss'], pecho: [NEGRO, 'satin'], pecho_inf: ['#1A1C1F', 'matte'],
      mochila: [NEGRO, 'satin'], hombro: [CROMO, 'chrome'], brazo: [NEGRO, 'satin'], antebrazo: [KICK, 'gloss'],
      cadera: ['#1A1C1F', 'matte'], muslo: [NEGRO, 'satin'], rodilla: [CROMO, 'chrome'], espinillera: ['#1A1C1F', 'carbon'], bota: [KICK, 'gloss'],
    },
    p: {
      pecho: (c, W, H) => kickLogo(c, W, H, { y: 0.5, w: 0.84 }),
      mochila: (c, W, H) => { wMono(c, W, H, { color: KICK, y: 0.36, s: 0.42 }); texto(c, W, H, 'kick.com/westcol', { size: H * 0.075, color: BLANCO, y: 0.78, maxW: 0.86, font: 'JetBrains Mono', weight: 700 }); },
      muslo: (c, W, H) => vertical(c, W, H, 'WESTCOL', { size: W * 0.5, color: KICK }),
      espinillera: (c, W, H) => { c.fillStyle = KICK; c.fillRect(W * 0.08, H * 0.04, W * 0.84, H * 0.025); },
    },
    glow: { pecho: true },
  },
  {
    nombre: 'KID W', acento: '#F49AC1', visor: '#FF2A2A',
    idea: 'Inspirado en el pequeño Buu: piel rosa con los agujeros de vapor en pecho y espalda, muñequeras negras con filete dorado, pantalón blanco amplio, cinturón negro con hebilla dorada y la W, y botas café dorado con caña negra.',
    paleta: ['#F49AC1', '#0B0B0D', '#E8B53A', '#F2F2F0', '#A8661C'],
    z: {
      casco: ['#F49AC1', 'gloss'], coronilla: ['#F49AC1', 'gloss'], pecho: ['#F49AC1', 'gloss'], pecho_inf: ['#F49AC1', 'gloss'],
      mochila: ['#F49AC1', 'gloss'], hombro: ['#F49AC1', 'pearl'], brazo: ['#F49AC1', 'gloss'], antebrazo: ['#1A1A1C', 'satin'],
      cadera: ['#0B0B0D', 'satin'], muslo: ['#F2F2F0', 'satin'], rodilla: ['#F2F2F0', 'satin'], espinillera: ['#F2F2F0', 'satin'], bota: ['#A8661C', 'gloss'],
    },
    p: {
      // agujeros de vapor: dos arcos de puntos bajo los hombros
      pecho: (c, W, H) => { c.save(); c.fillStyle = '#3A1020'; for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const x = W * (0.5 + sx * (0.16 + k * 0.07)), y = H * (0.14 + k * k * 0.012); c.beginPath(); c.ellipse(x, y, W * 0.018, H * 0.014, 0, 0, Math.PI * 2); c.fill(); } c.restore(); },
      mochila: (c, W, H) => { c.save(); c.fillStyle = '#3A1020'; for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(W * (0.5 + sx * 0.14), H * (0.2 + k * 0.13), Math.min(W, H) * 0.028, 0, Math.PI * 2); c.fill(); } c.restore(); },
      antebrazo: (c, W, H) => { c.fillStyle = '#E8B53A'; c.fillRect(0, H * 0.02, W, H * 0.06); c.fillRect(0, H * 0.92, W, H * 0.06); },
      cadera: (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#F7D25A'); g.addColorStop(1, '#C98E1E'); c.fillStyle = g; c.beginPath(); c.moveTo(W * 0.32, H * 0.08); c.lineTo(W * 0.68, H * 0.08); c.lineTo(W * 0.6, H * 0.92); c.lineTo(W * 0.4, H * 0.92); c.closePath(); c.fill(); wMono(c, W, H, { color: '#0B0B0D', y: 0.42, s: 0.42 }); },
      muslo: (c, W, H) => { c.save(); c.strokeStyle = 'rgba(120,128,140,.35)'; c.lineWidth = W * 0.025; for (let k = 0.18; k < 1; k += 0.16) { c.beginPath(); c.moveTo(W * k, 0); c.bezierCurveTo(W * (k + 0.08), H * 0.3, W * (k - 0.06), H * 0.65, W * (k + 0.03), H); c.stroke(); } c.restore(); },
      espinillera: (c, W, H) => { c.save(); c.strokeStyle = 'rgba(120,128,140,.35)'; c.lineWidth = W * 0.03; for (let k = 0.25; k < 1; k += 0.25) { c.beginPath(); c.moveTo(W * k, 0); c.quadraticCurveTo(W * (k + 0.07), H * 0.5, W * k, H * 0.85); c.stroke(); } c.restore(); },
      bota: (c, W, H) => { c.fillStyle = '#0B0B0D'; c.fillRect(0, 0, W, H * 0.34); c.fillStyle = '#E8B53A'; c.fillRect(0, H * 0.34, W, H * 0.08); },
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
    nombre: 'RAYO W', acento: '#FFC400', visor: '#FFC400',
    idea: 'Inspirado en el coche de carreras rojo más famoso: rojo caramelo brillante, rayos amarillo-naranja en pecho y muslos, hombros amarillos, número de carrera con la W y botas negras como llantas con letras blancas.',
    paleta: ['#D3121B', '#FFC400', '#FF8A00', '#0B0B0D', '#F2F2F0'],
    z: {
      casco: ['#D3121B', 'gloss'], coronilla: ['#D3121B', 'gloss'], pecho: ['#D3121B', 'gloss'], pecho_inf: ['#D3121B', 'gloss'],
      mochila: ['#D3121B', 'gloss'], hombro: ['#FFC400', 'gloss'], brazo: ['#D3121B', 'gloss'], antebrazo: ['#D3121B', 'gloss'],
      cadera: ['#0B0B0D', 'satin'], muslo: ['#D3121B', 'gloss'], rodilla: ['#C9CCD1', 'chrome'], espinillera: ['#0B0B0D', 'satin'], bota: ['#0B0B0D', 'satin'],
    },
    p: {
      pecho: (c, W, H) => { rayoCarrera(c, W, H, { x: 0.46, y: 0.5, w: 0.86, h: 0.62, rot: -0.08 }); },
      mochila: (c, W, H) => { numeroCarrera(c, W, H, { y: 0.42, r: 0.3 }); texto(c, W, H, 'W RACING', { size: H * 0.1, color: '#FFC400', y: 0.86, maxW: 0.8 }); },
      muslo: (c, W, H) => { rayoCarrera(c, W, H, { x: 0.5, y: 0.5, w: 1.6, h: 0.42, rot: Math.PI / 2 }); },
      antebrazo: (c, W, H) => { c.fillStyle = '#FFC400'; c.fillRect(0, H * 0.82, W, H * 0.06); },
      espinillera: (c, W, H) => vertical(c, W, H, 'WESTCOL', { size: W * 0.34, color: '#F2F2F0', font: 'JetBrains Mono', weight: 800 }),
      bota: (c, W, H) => { c.fillStyle = '#F2F2F0'; c.fillRect(0, H * 0.18, W, H * 0.07); c.fillRect(0, H * 0.75, W, H * 0.07); },
    },
    glow: {},
  },
];

// ---------- Blessd ----------
// Sus dos discos de 2026 como dos pieles: EL MEJOR HOMBRE DEL MUNDO (el azul de su pelo, el halo)
// y EL PEOR HOMBRE DEL MUNDO (negro, trap, los cuernos sobre la H).
function siglas(c, W, H, t, { y = 0.5, size = H * 0.2, color = BLANCO, cuernos = false, halo = false, haloColor = '#F2F2F0', maxW = 0.9, gastado = true } = {}) {
  c.save(); c.font = `900 ${size}px Unbounded`; c.textBaseline = 'middle';
  const m = c.measureText(t).width, sx = Math.min(1, (maxW * W) / m);
  c.translate(W / 2 - (m * sx) / 2, y * H); c.scale(sx, 1); c.fillStyle = color; c.fillText(t, 0, 0);
  if (gastado) { // estarcido gastado como en la portada
    c.globalCompositeOperation = 'destination-out'; let sd = 11; const rn = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
    for (let i = 0; i < 160; i++) { c.beginPath(); c.arc(rn() * m, (rn() - 0.5) * size * 0.8, size * (0.008 + rn() * 0.03), 0, Math.PI * 2); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  const i = t.indexOf('H'); if (i >= 0 && (cuernos || halo)) {
    const xh = c.measureText(t.slice(0, i)).width + c.measureText('H').width / 2, by = -size * 0.42, k = size * 0.42;
    if (cuernos) { c.fillStyle = color; for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(xh + sg * k * 0.12, by); c.quadraticCurveTo(xh + sg * k * 1.05, by - k * 0.15, xh + sg * k * 0.78, by - k * 1.05); c.quadraticCurveTo(xh + sg * k * 0.62, by - k * 0.4, xh + sg * k * 0.02, by + k * 0.05); c.closePath(); c.fill(); } }
    if (halo) { c.strokeStyle = haloColor; c.lineWidth = size * 0.06; c.beginPath(); c.ellipse(xh, by - k * 0.55, k * 0.75, k * 0.2, 0, 0, Math.PI * 2); c.stroke(); }
  }
  c.restore();
}
function grietas(c, W, H, color = '#D1D1D1', seed = 7, cx = 0.5, cy = 0.45) {
  c.save(); c.strokeStyle = color; c.lineCap = 'round'; let sd = seed; const rn = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
  for (let i = 0; i < 9; i++) { let x = cx * W, y = cy * H, a = (i / 9) * Math.PI * 2 + rn() * 0.4; c.lineWidth = Math.max(2, H * 0.01); c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 6; k++) { a += (rn() - 0.5) * 0.8; const L = Math.min(W, H) * (0.06 + rn() * 0.1); x += Math.cos(a) * L; y += Math.sin(a) * L; c.lineTo(x, y); } c.stroke(); }
  c.restore();
}
function cadena(c, W, H, color = '#C5CCD0', y0 = 0.05, depth = 0.4) { // cadena cubana helada
  c.save(); c.strokeStyle = color; c.lineWidth = H * 0.03; c.shadowColor = '#ffffff'; c.shadowBlur = H * 0.02;
  for (let i = 0; i < 18; i++) { const t = i / 17, x = W * (0.16 + 0.68 * t), y = H * (y0 + Math.sin(t * Math.PI) * depth); c.beginPath(); c.ellipse(x, y, H * 0.035, H * 0.022, i % 2 ? 0.7 : -0.7, 0, Math.PI * 2); c.stroke(); }
  c.restore();
}
const AZUL_B = '#1F4FE0', CIELO = '#9CC2EE', NEGRO_B = '#0A0A0A', ASFALTO = '#3C3D41', PLATA = '#C5CCD0';
export const BLESSD_DISENOS = [
  {
    nombre: 'E.P.H.D.M', acento: '#D1D1D1', visor: '#E8E8E8',
    idea: 'El Peor Hombre del Mundo: negro trap de punta a punta, las siglas estarcidas con los cuernos sobre la H, vidrio partido y cadena helada en el pecho, cromo en hombros y rótulas, piernas asfalto.',
    paleta: [NEGRO_B, ASFALTO, '#D1D1D1', PLATA],
    z: {
      casco: [NEGRO_B, 'matte'], coronilla: [NEGRO_B, 'gloss'], pecho: [NEGRO_B, 'matte'], pecho_inf: [NEGRO_B, 'matte'],
      mochila: [NEGRO_B, 'matte'], hombro: [PLATA, 'chrome'], brazo: [NEGRO_B, 'matte'], antebrazo: ['#1E1F22', 'satin'],
      cadera: [NEGRO_B, 'matte'], muslo: [ASFALTO, 'satin'], rodilla: [PLATA, 'chrome'], espinillera: ['#1A1B1E', 'carbon'], bota: [NEGRO_B, 'matte'],
    },
    p: {
      pecho: (c, W, H) => { grietas(c, W, H, 'rgba(209,209,209,.55)', 7, 0.7, 0.35); cadena(c, W, H, PLATA, 0.02, 0.22); siglas(c, W, H, 'E.P.H.D.M', { y: 0.68, size: H * 0.2, cuernos: true, maxW: 0.86 }); },
      mochila: (c, W, H) => { siglas(c, W, H, 'EL PEOR', { y: 0.32, size: H * 0.17, maxW: 0.84 }); texto(c, W, H, 'HOMBRE DEL MUNDO', { size: H * 0.065, color: '#D1D1D1', y: 0.52, font: 'JetBrains Mono', weight: 800, maxW: 0.8 }); grietas(c, W, H, 'rgba(209,209,209,.4)', 3, 0.5, 0.8); },
      muslo: (c, W, H) => vertical(c, W, H, 'EL PEOR', { size: W * 0.5, color: '#D1D1D1' }),
      espinillera: (c, W, H) => { c.fillStyle = '#D1D1D1'; c.fillRect(W * 0.08, H * 0.04, W * 0.84, H * 0.012); },
    },
    glow: {},
  },
  {
    nombre: 'E.M.H.D.M', acento: AZUL_B, visor: AZUL_B,
    idea: 'El Mejor Hombre del Mundo: el azul de su pelo en casco, brazos y cadera, blanco y cielo como la portada, las siglas con el halo encima de la H en el pecho y el nombre completo en la espalda.',
    paleta: [AZUL_B, BLANCO, CIELO, PLATA],
    z: {
      casco: [AZUL_B, 'gloss'], coronilla: [AZUL_B, 'pearl'], pecho: [BLANCO, 'gloss'], pecho_inf: [AZUL_B, 'gloss'],
      mochila: [BLANCO, 'gloss'], hombro: [AZUL_B, 'pearl'], brazo: [AZUL_B, 'gloss'], antebrazo: [BLANCO, 'gloss'],
      cadera: [AZUL_B, 'satin'], muslo: [BLANCO, 'gloss'], rodilla: [PLATA, 'chrome'], espinillera: [CIELO, 'gloss'], bota: [BLANCO, 'gloss'],
    },
    p: {
      pecho: (c, W, H) => siglas(c, W, H, 'E.M.H.D.M', { y: 0.6, size: H * 0.22, color: AZUL_B, halo: true, haloColor: '#E8C27A', maxW: 0.86 }),
      mochila: (c, W, H) => { c.save(); c.strokeStyle = '#E8C27A'; c.lineWidth = H * 0.018; c.beginPath(); c.ellipse(W / 2, H * 0.14, W * 0.18, H * 0.04, 0, 0, Math.PI * 2); c.stroke(); c.restore(); siglas(c, W, H, 'EL MEJOR', { y: 0.36, size: H * 0.15, color: AZUL_B, maxW: 0.84 }); texto(c, W, H, 'HOMBRE DEL MUNDO', { size: H * 0.065, color: AZUL_B, y: 0.55, font: 'JetBrains Mono', weight: 800, maxW: 0.8 }); },
      muslo: (c, W, H) => vertical(c, W, H, 'BLESSD', { size: W * 0.5, color: AZUL_B }),
      bota: (c, W, H) => { c.fillStyle = AZUL_B; c.fillRect(0, H * 0.74, W, H * 0.12); },
    },
    glow: {},
  },
];
