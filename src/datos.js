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
export function vinilo(c, W, H, { x = 0.5, y = 0.5, r = 0.42, label = ORO } = {}) { // disco con surcos
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
export function kickLogo(c, W, H, { color = KICK, x = 0.5, y = 0.5, w = 0.8 } = {}) {
  const s = Math.min((W * w) / 1972, (H * 0.9) / 659); const ox = x * W - (1972 * s) / 2 - 5 * s, oy = y * H - (659 * s) / 2 - 3 * s;
  c.save(); c.fillStyle = color;
  for (const f of KICK_FORMAS) { c.beginPath(); f.forEach(([px, py], i) => (i ? c.lineTo : c.moveTo).call(c, ox + px * s, oy + py * s)); c.closePath(); c.fill(); }
  c.restore();
}

// motivos de la G: cruz gótica de puntas florenzadas y filas de remaches
export function cruzGotica(c, x, y, s, color = '#0B0B0D') {
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
export function rayoCarrera(c, W, H, { x = 0.5, y = 0.5, w = 0.9, h = 0.5, rot = 0 } = {}) {
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
    // negro manda; el oro solo vive en cromo (coronilla, hombros, rótulas, botas) y en el impreso. Fuera el rojo suelto.
    nombre: 'W SOUND ORO', acento: ORO, visor: ORO,
    idea: 'La edición de estudio de su sello W Sound: negro piano con cromo oro en coronilla, hombros, rótulas y botas. En el pecho, un vinilo dorado; en la espalda, la firma del sello.',
    paleta: [NEGRO, ORO, '#F2C230'],
    z: {
      casco: [NEGRO, 'gloss'], coronilla: ['#F2C230', 'gold'], pecho: [NEGRO, 'gloss'], pecho_inf: [NEGRO, 'satin'],
      mochila: [NEGRO, 'gloss'], hombro: ['#F2C230', 'gold'], brazo: [NEGRO, 'gloss'], antebrazo: [NEGRO, 'gloss'],
      cadera: [NEGRO, 'satin'], muslo: [NEGRO, 'gloss'], rodilla: ['#F2C230', 'gold'], espinillera: [NEGRO, 'carbon'], bota: ['#F2C230', 'gold'],
    },
    p: {
      // héroe: el vinilo con la W grande en la etiqueta dorada
      pecho: (c, W, H) => { vinilo(c, W, H, { x: 0.5, y: 0.5, r: 0.46 }); },
      // héroe: W SOUND; debajo, un filete y MEDELLÍN pequeños en el mismo oro
      mochila: (c, W, H) => { texto(c, W, H, 'W SOUND', { size: H * 0.18, color: ORO, y: 0.34, maxW: 0.86 }); c.fillStyle = ORO; c.fillRect(W * 0.34, H * 0.49, W * 0.32, H * 0.01); texto(c, W, H, 'MEDELLÍN', { size: H * 0.06, color: 'rgba(232,194,122,.7)', y: 0.58, font: 'JetBrains Mono', weight: 700, maxW: 0.5 }); },
      muslo: (c, W, H) => vertical(c, W, H, 'WESTCOL', { size: W * 0.46, color: ORO }),
      antebrazo: (c, W, H) => { c.fillStyle = ORO; c.fillRect(0, H * 0.08, W, H * 0.03); c.fillRect(0, H * 0.89, W, H * 0.03); },
    },
    glow: {},
  },
  {
    // negro mate-satinado de punta a punta; el verde Kick solo arriba (casco), abajo (botas) y en el logo. Sin cromo.
    nombre: 'KICK', acento: KICK, visor: KICK,
    idea: 'Su casa es Kick: negro satinado con el verde de la marca en casco, hombros y botas, y el logo oficial grande en la espalda. Franjas pixeladas como la K de Kick en muslos, brazos y espinilleras.',
    paleta: [NEGRO, KICK, '#1A1C1F', BLANCO],
    z: {
      casco: [KICK, 'gloss'], coronilla: [NEGRO, 'gloss'], pecho: [NEGRO, 'satin'], pecho_inf: ['#1A1C1F', 'matte'],
      mochila: [NEGRO, 'satin'], hombro: [KICK, 'gloss'], brazo: [NEGRO, 'satin'], antebrazo: [NEGRO, 'gloss'],
      cadera: ['#1A1C1F', 'matte'], muslo: [NEGRO, 'satin'], rodilla: [NEGRO, 'gloss'], espinillera: ['#1A1C1F', 'carbon'], bota: [KICK, 'gloss'],
    },
    p: {
      pecho: (c, W, H) => kickLogo(c, W, H, { y: 0.5, w: 0.84 }),
      muslo: (c, W, H) => vertical(c, W, H, 'WESTCOL', { size: W * 0.46, color: BLANCO }),
    },
    glow: { pecho: true },
  },
  {
    // rosa manda; negro solo en muñequeras, cinturón y caña de la bota; dorado solo en filetes y hebilla.
    nombre: 'KID W', acento: '#F49AC1', visor: '#FF2A2A',
    idea: 'Inspirado en el pequeño Buu: piel rosa, muñequeras negras con filete dorado, cinturón negro con hebilla dorada y pantalón blanco amplio. Botas café con caña negra.',
    paleta: ['#F49AC1', NEGRO, '#E8B53A', BLANCO, '#A8661C'],
    z: {
      casco: ['#F49AC1', 'gloss'], coronilla: ['#F49AC1', 'gloss'], pecho: ['#F49AC1', 'gloss'], pecho_inf: [NEGRO, 'satin'],
      mochila: ['#F49AC1', 'gloss'], hombro: ['#F49AC1', 'pearl'], brazo: ['#F49AC1', 'gloss'], antebrazo: [NEGRO, 'satin'],
      cadera: [NEGRO, 'satin'], muslo: [BLANCO, 'satin'], rodilla: [BLANCO, 'satin'], espinillera: [BLANCO, 'satin'], bota: ['#A8661C', 'gloss'],
    },
    p: {
      // héroe: la hebilla dorada con la W, al pie del pecho, justo encima del cinturón negro (torso inferior)
      pecho: (c, W, H) => { const g = c.createLinearGradient(0, H * 0.62, 0, H * 0.94); g.addColorStop(0, '#F7D25A'); g.addColorStop(1, '#C98E1E'); c.fillStyle = g; c.beginPath(); c.roundRect(W * 0.36, H * 0.62, W * 0.28, H * 0.32, W * 0.03); c.fill(); c.lineWidth = W * 0.012; c.strokeStyle = NEGRO; c.stroke(); },
      // héroe: la W negra grande con vapor de cómic, el guiño a Buu enojado
      mochila: (c, W, H) => vapor(c, W, H, 'rgba(255,255,255,.9)', 6, 5),
      antebrazo: (c, W, H) => { c.fillStyle = '#E8B53A'; c.fillRect(0, H * 0.02, W, H * 0.06); c.fillRect(0, H * 0.92, W, H * 0.06); },
      // pliegues suaves del pantalón amplio (sin héroe: es tela)
      muslo: (c, W, H) => { c.save(); c.strokeStyle = 'rgba(120,128,140,.3)'; c.lineWidth = W * 0.025; for (let k = 0.22; k < 1; k += 0.2) { c.beginPath(); c.moveTo(W * k, 0); c.bezierCurveTo(W * (k + 0.08), H * 0.3, W * (k - 0.06), H * 0.65, W * (k + 0.03), H); c.stroke(); } c.restore(); },
      bota: (c, W, H) => { c.fillStyle = NEGRO; c.fillRect(0, 0, W, H * 0.34); c.fillStyle = '#E8B53A'; c.fillRect(0, H * 0.34, W, H * 0.05); },
    },
    glow: {},
  },
  {
    // acero gastado manda; negro mate en brazos, cadera y botas (los rines); carbono en coronilla y torso inferior.
    nombre: 'G WAGON', acento: '#C9CCD1', visor: '#FFD9A0',
    idea: 'Su G Wagon personalizada hecha piel: acero gastado con remaches en el borde de cada panel grande y una cruz gótica negra como sello. Carbono forjado como el capó y negro mate como los rines.',
    paleta: ['#8A8D93', NEGRO, '#2A2B2E', '#C9CCD1'],
    z: {
      casco: ['#B4B7BD', 'acero'], coronilla: ['#ffffff', 'carbon'], pecho: ['#B4B7BD', 'acero'], pecho_inf: ['#ffffff', 'carbon'],
      mochila: ['#B4B7BD', 'acero'], hombro: ['#B4B7BD', 'acero'], brazo: [NEGRO, 'matte'], antebrazo: ['#B4B7BD', 'acero'],
      cadera: [NEGRO, 'matte'], muslo: ['#B4B7BD', 'acero'], rodilla: ['#C9CCD1', 'chrome'], espinillera: ['#B4B7BD', 'acero'], bota: [NEGRO, 'matte'],
    },
    p: {
      // una sola cruz por panel; la de la espalda es la más grande (el héroe de la pieza)
      pecho: (c, W, H) => { remaches(c, W, H, 0.05, 14); cruzGotica(c, W * 0.5, H * 0.52, H * 0.28); },
      mochila: (c, W, H) => { remaches(c, W, H, 0.05, 12); cruzGotica(c, W * 0.5, H * 0.52, H * 0.38); },
      muslo: (c, W, H) => { remaches(c, W, H, 0.07, 10); cruzGotica(c, W * 0.5, H * 0.45, Math.min(W * 0.3, H * 0.25)); },
      espinillera: (c, W, H) => remaches(c, W, H, 0.07, 8),
    },
    glow: {},
  },
  {
    // rojo caramelo manda; el amarillo-naranja solo en los rayos; negro en cadera, espinilleras y botas (las llantas).
    nombre: 'RAYO W', acento: '#FFC400', visor: '#FFC400',
    idea: 'Un coche de carreras rojo hecho robot: rojo caramelo brillante con rayos amarillo-naranja en pecho y muslos, y un rayo grande en la espalda. Piernas negras como llantas, con letras blancas.',
    paleta: ['#D3121B', '#FFC400', NEGRO, BLANCO],
    z: {
      casco: ['#D3121B', 'gloss'], coronilla: ['#D3121B', 'gloss'], pecho: ['#D3121B', 'gloss'], pecho_inf: ['#D3121B', 'gloss'],
      mochila: ['#D3121B', 'gloss'], hombro: ['#D3121B', 'gloss'], brazo: ['#D3121B', 'gloss'], antebrazo: ['#D3121B', 'gloss'],
      cadera: [NEGRO, 'satin'], muslo: ['#D3121B', 'gloss'], rodilla: ['#C9CCD1', 'chrome'], espinillera: [NEGRO, 'satin'], bota: [NEGRO, 'satin'],
    },
    p: {
      pecho: (c, W, H) => { rayoCarrera(c, W, H, { x: 0.48, y: 0.5, w: 0.88, h: 0.66, rot: -0.08 }); },
      mochila: (c, W, H) => rayoCarrera(c, W, H, { x: 0.5, y: 0.5, w: 0.84, h: 0.56, rot: -0.12 }),
      muslo: (c, W, H) => { rayoCarrera(c, W, H, { x: 0.5, y: 0.5, w: 1.5, h: 0.46, rot: Math.PI / 2 }); },
      espinillera: (c, W, H) => vertical(c, W, H, 'WESTCOL', { size: W * 0.34, color: BLANCO, font: 'JetBrains Mono', weight: 800 }),
      bota: (c, W, H) => { c.fillStyle = BLANCO; c.fillRect(0, H * 0.18, W, H * 0.05); },
    },
    glow: {},
  },
  {
    // boxeo de lujo: la bata de campeón hecha a medida. Vino satinado manda; el oro es el del cinturón.
    nombre: 'CAMPEÓN', acento: '#D4AF6A', visor: '#D4AF6A',
    idea: 'Flow de boxeador de lujo: vino satinado como una bata de campeón hecha a medida, acolchado en rombos dorados y su nombre en arco en la espalda. Cinturón de oro, vendas crema en los antebrazos y botas altas de boxeo.',
    paleta: ['#5A0F1F', '#D4AF6A', '#F1E6D2', NEGRO],
    z: {
      casco: ['#5A0F1F', 'gloss'], coronilla: ['#F2C230', 'gold'], pecho: ['#5A0F1F', 'satin'], pecho_inf: ['#5A0F1F', 'satin'],
      mochila: ['#5A0F1F', 'satin'], hombro: ['#F2C230', 'gold'], brazo: ['#5A0F1F', 'satin'], antebrazo: ['#F1E6D2', 'satin'],
      cadera: ['#B8913A', 'gold'], muslo: ['#5A0F1F', 'gloss'], rodilla: ['#F1E6D2', 'satin'], espinillera: ['#F1E6D2', 'gloss'], bota: ['#F1E6D2', 'gloss'],
    },
    p: {},
    glow: {},
  },
];

// ---------- Blessd ----------
// Sus dos discos de 2026 como dos pieles: EL MEJOR HOMBRE DEL MUNDO (el azul de su pelo, el halo)
// y EL PEOR HOMBRE DEL MUNDO (negro, trap, los cuernos sobre la H).
export function siglas(c, W, H, t, { y = 0.5, size = H * 0.2, color = BLANCO, cuernos = false, halo = false, haloColor = '#F2F2F0', maxW = 0.9, gastado = true } = {}) {
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
export function grietas(c, W, H, color = '#D1D1D1', seed = 7, cx = 0.5, cy = 0.45) {
  c.save(); c.strokeStyle = color; c.lineCap = 'round'; let sd = seed; const rn = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
  for (let i = 0; i < 9; i++) { let x = cx * W, y = cy * H, a = (i / 9) * Math.PI * 2 + rn() * 0.4; c.lineWidth = Math.max(2, H * 0.01); c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 6; k++) { a += (rn() - 0.5) * 0.8; const L = Math.min(W, H) * (0.06 + rn() * 0.1); x += Math.cos(a) * L; y += Math.sin(a) * L; c.lineTo(x, y); } c.stroke(); }
  c.restore();
}
export function cadena(c, W, H, color = '#C5CCD0', y0 = 0.05, depth = 0.4) { // cadena cubana helada
  c.save(); c.strokeStyle = color; c.lineWidth = H * 0.03; c.shadowColor = '#ffffff'; c.shadowBlur = H * 0.02;
  for (let i = 0; i < 18; i++) { const t = i / 17, x = W * (0.16 + 0.68 * t), y = H * (y0 + Math.sin(t * Math.PI) * depth); c.beginPath(); c.ellipse(x, y, H * 0.035, H * 0.022, i % 2 ? 0.7 : -0.7, 0, Math.PI * 2); c.stroke(); }
  c.restore();
}
const AZUL_B = '#1F4FE0', CIELO = '#9CC2EE', NEGRO_B = '#0A0A0A', ASFALTO = '#3C3D41', PLATA = '#C5CCD0';
export const BLESSD_DISENOS = [
  {
    // negro manda; plata solo en cromo (hombros, rótulas) y en el impreso. Pecho: las siglas son el héroe, la cadena acompaña.
    nombre: 'E.P.H.D.M', acento: '#D1D1D1', visor: '#E8E8E8',
    idea: 'El Peor Hombre del Mundo: negro trap de punta a punta, con las siglas estarcidas y los cuernos sobre la H en el pecho. Cadena helada, cromo en hombros y rótulas, vidrio partido en la espalda.',
    paleta: [NEGRO_B, ASFALTO, '#D1D1D1', PLATA],
    z: {
      casco: [NEGRO_B, 'matte'], coronilla: [NEGRO_B, 'gloss'], pecho: [NEGRO_B, 'matte'], pecho_inf: [NEGRO_B, 'matte'],
      mochila: [NEGRO_B, 'matte'], hombro: [PLATA, 'chrome'], brazo: [NEGRO_B, 'matte'], antebrazo: [NEGRO_B, 'satin'],
      cadera: [NEGRO_B, 'matte'], muslo: [ASFALTO, 'satin'], rodilla: [PLATA, 'chrome'], espinillera: [NEGRO_B, 'carbon'], bota: [NEGRO_B, 'matte'],
    },
    p: {
      pecho: (c, W, H) => { cadena(c, W, H, PLATA, 0.02, 0.18); siglas(c, W, H, 'E.P.H.D.M', { y: 0.64, size: H * 0.24, cuernos: true, maxW: 0.9 }); },
      mochila: (c, W, H) => { grietas(c, W, H, 'rgba(209,209,209,.28)', 3, 0.5, 0.5); siglas(c, W, H, 'EL PEOR', { y: 0.4, size: H * 0.18, maxW: 0.84 }); texto(c, W, H, 'HOMBRE DEL MUNDO', { size: H * 0.06, color: '#D1D1D1', y: 0.58, font: 'JetBrains Mono', weight: 800, maxW: 0.76 }); },
      muslo: (c, W, H) => vertical(c, W, H, 'BLESSD', { size: W * 0.5, color: '#D1D1D1' }),
    },
    glow: {},
  },
  {
    // el azul de Blessd manda (casco, torso, espalda, brazos, botas); blanco de segundo; cielo solo en halo y espinilleras.
    nombre: 'E.M.H.D.M', acento: AZUL_B, visor: CIELO,
    idea: 'El Mejor Hombre del Mundo: el azul de Blessd de punta a punta, con las siglas blancas y el halo cielo sobre la H en el pecho. Piernas blancas y espinilleras cielo, como la portada.',
    paleta: [AZUL_B, BLANCO, CIELO, PLATA],
    z: {
      casco: [AZUL_B, 'gloss'], coronilla: [AZUL_B, 'pearl'], pecho: [AZUL_B, 'gloss'], pecho_inf: [BLANCO, 'gloss'],
      mochila: [AZUL_B, 'gloss'], hombro: [BLANCO, 'pearl'], brazo: [AZUL_B, 'gloss'], antebrazo: [BLANCO, 'gloss'],
      cadera: [BLANCO, 'satin'], muslo: [BLANCO, 'gloss'], rodilla: [PLATA, 'chrome'], espinillera: [CIELO, 'gloss'], bota: [AZUL_B, 'gloss'],
    },
    p: {
      pecho: (c, W, H) => siglas(c, W, H, 'E.M.H.D.M', { y: 0.62, size: H * 0.24, color: BLANCO, halo: true, haloColor: CIELO, maxW: 0.9, gastado: false }),
      mochila: (c, W, H) => { siglas(c, W, H, 'EL MEJOR', { y: 0.4, size: H * 0.18, color: BLANCO, halo: false, maxW: 0.84, gastado: false }); texto(c, W, H, 'HOMBRE DEL MUNDO', { size: H * 0.06, color: CIELO, y: 0.58, font: 'JetBrains Mono', weight: 800, maxW: 0.76 }); },
      muslo: (c, W, H) => vertical(c, W, H, 'BLESSD', { size: W * 0.5, color: AZUL_B }),
    },
    glow: {},
  },
];
