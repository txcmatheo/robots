// Pieles extra de Blessd (Stiven Mesa Londoño, Itagüí). Tres eras más allá de los discos de 2026:
//  - ERA MORADA: el pelo morado que él atribuye a Trunks (indicios en videos de fans; sin nota de prensa).
//  - HECHO EN MEDELLÍN: su primer álbum (27-oct-2021) y "Medallo", producida con Ovy On The Drums.
//  - TRINIDAD BENDITA: su disco de 2025, el católico de los tatuajes religiosos y "bendito" en los dedos.
// Cada impreso respeta las zonas seguras medidas sobre el T800 Max y mide el texto para no deformarlo.
import { cruzGotica } from './datos.js';

// ---------- utilidades locales ----------
// Escribe t dentro de la caja [x0,y0,x1,y1] (fracciones) al mayor tamaño que quepa sin estirar.
function enCaja(c, W, H, t, [x0, y0, x1, y1], { font = 'Unbounded', weight = 900, color = '#fff', max = Infinity, italic = false, track = 0 } = {}) {
  const bw = (x1 - x0) * W, bh = (y1 - y0) * H;
  c.save();
  const f = (s) => `${italic ? 'italic ' : ''}${weight} ${s}px '${font}'`;
  c.font = f(100);
  const ancho100 = c.measureText(t).width + track * 100 * Math.max(0, t.length - 1);
  const s = Math.min(max, bh * 0.92, (bw / ancho100) * 100);
  c.font = f(s); c.fillStyle = color; c.textBaseline = 'middle'; c.textAlign = 'center';
  if (track) { // espaciado manual entre letras
    const total = c.measureText(t).width + track * s * (t.length - 1);
    let x = (x0 * W + x1 * W) / 2 - total / 2; c.textAlign = 'left';
    for (const ch of t) { c.fillText(ch, x, (y0 + y1) / 2 * H); x += c.measureText(ch).width + track * s; }
  } else c.fillText(t, (x0 + x1) / 2 * W, (y0 + y1) / 2 * H);
  c.restore();
  return s;
}
// Texto vertical (de abajo hacia arriba) dentro de la caja, sin deformar.
function enCajaVertical(c, W, H, t, [x0, y0, x1, y1], o = {}) {
  c.save();
  const cx = (x0 + x1) / 2 * W, cy = (y0 + y1) / 2 * H, bw = (x1 - x0) * W, bh = (y1 - y0) * H;
  c.translate(cx, cy); c.rotate(-Math.PI / 2);
  // tras rotar, el largo disponible es bh y el alto de letra es bw
  enCaja(c, bh, bw, t, [-0.5, -0.5, 0.5, 0.5], o);
  c.restore();
}
// Rosario: cuentas sobre una curva colgante + crucifijo al final.
function rosario(c, W, H, o = {}) {
  const { color = '#D4AF37', x0 = 0.16, x1 = 0.84, y0 = 0.1, fondo = 0.34, cuentas = 23, cruz = true } = o;
  c.save(); c.fillStyle = color; c.strokeStyle = color; c.lineWidth = Math.max(1.5, H * (o.hilo ?? 0.004));
  const r = Math.min(W, H) * (o.r ?? 0.013);
  const pt = (t) => [W * (x0 + (x1 - x0) * t), H * (y0 + (fondo - y0) * Math.sin(t * Math.PI))];
  c.beginPath(); for (let i = 0; i <= 60; i++) { const [x, y] = pt(i / 60); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  for (let i = 0; i < cuentas; i++) { const [x, y] = pt((i + 0.5) / cuentas); c.beginPath(); c.arc(x, y, i % 6 === 5 ? r * 1.6 : r, 0, Math.PI * 2); c.fill(); }
  if (cruz) { // crucifijo colgando del centro
    const x = W / 2, y = H * fondo, s = H * 0.022;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + s * 0.8); c.stroke();
    c.fillRect(x - s * 0.18, y + s * 0.8, s * 0.36, s * 2.6);
    c.fillRect(x - s * 0.8, y + s * 1.4, s * 1.6, s * 0.34);
  }
  c.restore();
}
function anillo(c, W, H, { x = 0.5, y = 0.5, r = 0.3, color = '#fff', grosor = 0.02 } = {}) {
  c.save(); c.strokeStyle = color; c.lineWidth = Math.min(W, H) * grosor;
  c.beginPath(); c.arc(x * W, y * H, r * Math.min(W, H), 0, Math.PI * 2); c.stroke(); c.restore();
}
function filete(c, W, H, color, y, g = 0.012, x0 = 0.12, x1 = 0.88) { c.save(); c.fillStyle = color; c.fillRect(x0 * W, y * H, (x1 - x0) * W, g * H); c.restore(); }

// ---------- paletas ----------
const MORADO = '#5B2A9E', UVA = '#2A1146', LILA = '#C9B3F2', PLATA = '#C5CCD0', BLANCO = '#F4F4F2';
const VERDE = '#0E6B3A', VERDE_O = '#08391F', HUESO = '#EFEDE4', ORO = '#D4AF37';
const MARFIL = '#EEE7D8', ORO_V = '#C9A13B', VINO = '#5E1420', NEGRO = '#111113';

export const BLESSD_EXTRA = [
  {
    // morado manda en todo el cuerpo; lila solo en impresos y espinilleras; plata en hombros/rótulas.
    nombre: 'ERA MORADA', acento: MORADO, visor: LILA,
    idea: 'El morado que Blessd se tiñó por Trunks antes de que el azul se volviera su firma: uva y morado de punta a punta, pecho limpio y EL BENDITO dentro de un aura de energía en lo alto de la espalda.',
    paleta: [MORADO, UVA, LILA, PLATA],
    z: {
      casco: [MORADO, 'shift'], coronilla: [LILA, 'pearl'], pecho: [MORADO, 'gloss'], pecho_inf: [UVA, 'satin'],
      mochila: [MORADO, 'gloss'], hombro: [PLATA, 'chrome'], brazo: [UVA, 'satin'], antebrazo: [MORADO, 'gloss'],
      cadera: [UVA, 'matte'], muslo: [MORADO, 'gloss'], rodilla: [PLATA, 'chrome'], espinillera: [UVA, 'gloss'], bota: [MORADO, 'shift'],
    },
    p: {
      mochila: (c, W, H) => {
        // todo en la parte alta de la placa: el puerto central (y≈0,47) y las rejillas de abajo quedan libres
        anillo(c, W, H, { x: 0.5, y: 0.26, r: 0.2, color: 'rgba(201,179,242,.4)', grosor: 0.05 });
        anillo(c, W, H, { x: 0.5, y: 0.26, r: 0.2, color: LILA, grosor: 0.014 });
        enCaja(c, W, H, 'EL', [0.4, 0.1, 0.6, 0.18], { font: 'Bodoni Moda', weight: 700, italic: true, color: LILA });
        enCaja(c, W, H, 'BENDITO', [0.12, 0.19, 0.88, 0.35], { color: BLANCO });
      },
      muslo: (c, W, H) => { cruzGotica(c, 0.5 * W, 0.28 * H, Math.min(W, H) * 0.18, LILA); },
      espinillera: (c, W, H) => enCajaVertical(c, W, H, 'BLESSD', [0.26, 0.12, 0.74, 0.88], { color: LILA }),
    },
    glow: {},
  },
  {
    // verde y blanco de la bandera de Medellín; verde manda, hueso de segundo, oro solo en filetes.
    nombre: 'HECHO EN MEDELLÍN', acento: VERDE, visor: HUESO,
    idea: 'Su primer álbum (2021) hecho camiseta de barrio: el verde y blanco de la bandera de Medellín con MEDELLÍN en el pecho. En la espalda, bajo una franja de la bandera, MEDALLO: el éxito que lo puso en el mapa con Ovy On The Drums.',
    paleta: [VERDE, VERDE_O, HUESO, ORO],
    z: {
      casco: [VERDE, 'gloss'], coronilla: [HUESO, 'gloss'], pecho: [VERDE, 'satin'], pecho_inf: [HUESO, 'satin'],
      mochila: [VERDE, 'satin'], hombro: [HUESO, 'gloss'], brazo: [VERDE, 'satin'], antebrazo: [HUESO, 'gloss'],
      cadera: [VERDE_O, 'matte'], muslo: [VERDE, 'satin'], rodilla: [ORO, 'gold'], espinillera: [HUESO, 'gloss'], bota: [VERDE_O, 'matte'],
    },
    p: {
      pecho: (c, W, H) => {
        enCaja(c, W, H, 'HECHO EN', [0.3, 0.11, 0.7, 0.2], { font: 'JetBrains Mono', weight: 800, color: HUESO, track: 0.3 });
        enCaja(c, W, H, 'MEDELLÍN', [0.13, 0.21, 0.87, 0.38], { color: HUESO });
        filete(c, W, H, ORO, 0.41, 0.01, 0.3, 0.7);
      },
      mochila: (c, W, H) => {
        // franja de la bandera (blanco sobre verde) en lo alto; MEDALLO debajo, todo antes del puerto (y≈0,47)
        c.save(); c.fillStyle = HUESO; c.fillRect(0.1 * W, 0.12 * H, 0.8 * W, 0.06 * H); c.restore();
        filete(c, W, H, ORO, 0.195, 0.008, 0.1, 0.9);
        enCaja(c, W, H, 'MEDALLO', [0.12, 0.24, 0.88, 0.42], { color: HUESO });
      },
      muslo: (c, W, H) => enCaja(c, W, H, '2021', [0.24, 0.16, 0.76, 0.4], { color: HUESO }),
      espinillera: (c, W, H) => enCajaVertical(c, W, H, 'ITAGÜÍ', [0.26, 0.12, 0.74, 0.88], { color: VERDE }),
    },
    glow: {},
  },
  {
    // marfil manda (casi todo el cuerpo), oro de segundo en rótulas/hombros/rosario, vino como sombra puntual.
    nombre: 'TRINIDAD BENDITA', acento: ORO_V, visor: '#FFF4D6',
    idea: 'El Blessd católico de su disco de 2025: marfil y oro, con un rosario vino de crucifijo dorado en el pecho y tres cruces góticas sobre su nombre en la espalda. BENDITO a lo largo de la espinillera, como lo lleva tatuado en los dedos.',
    paleta: [MARFIL, ORO_V, VINO, NEGRO],
    z: {
      casco: [MARFIL, 'pearl'], coronilla: [ORO_V, 'gold'], pecho: [MARFIL, 'pearl'], pecho_inf: [MARFIL, 'satin'],
      mochila: [MARFIL, 'pearl'], hombro: [ORO_V, 'gold'], brazo: [MARFIL, 'satin'], antebrazo: [MARFIL, 'pearl'],
      cadera: [VINO, 'satin'], muslo: [MARFIL, 'pearl'], rodilla: [ORO_V, 'gold'], espinillera: [MARFIL, 'gloss'], bota: [VINO, 'gloss'],
    },
    p: {
      pecho: (c, W, H) => {
        rosario(c, W, H, { color: VINO, x0: 0.16, x1: 0.84, y0: 0.2, fondo: 0.3, cuentas: 17, cruz: false, r: 0.03, hilo: 0.008 });
        const x = W / 2, y = H * 0.3, s = H * 0.04; // crucifijo dorado colgando del centro, termina en y≈0.44
        c.save(); c.fillStyle = ORO_V; c.strokeStyle = VINO; c.lineWidth = s * 0.12;
        for (const [rx, ry, rw, rh] of [[x - s * 0.22, y + s * 0.4, s * 0.44, s * 3.1], [x - s * 0.95, y + s * 1.1, s * 1.9, s * 0.42]]) { c.fillRect(rx, ry, rw, rh); c.strokeRect(rx, ry, rw, rh); }
        c.restore();
      },
      mochila: (c, W, H) => {
        const s = Math.min(W, H);
        // todo por encima del puerto central (y≈0,47): la cruz vino al centro, las de oro a los lados, el nombre debajo
        cruzGotica(c, 0.25 * W, 0.24 * H, s * 0.075, ORO_V);
        cruzGotica(c, 0.5 * W, 0.22 * H, s * 0.105, VINO);
        cruzGotica(c, 0.75 * W, 0.24 * H, s * 0.075, ORO_V);
        enCaja(c, W, H, 'Trinidad Bendita', [0.14, 0.34, 0.86, 0.44], { font: 'Pirata One', weight: 400, color: NEGRO });
      },
      muslo: (c, W, H) => { cruzGotica(c, 0.5 * W, 0.28 * H, Math.min(W, H) * 0.18, ORO_V); },
      espinillera: (c, W, H) => enCajaVertical(c, W, H, 'BENDITO', [0.27, 0.12, 0.73, 0.88], { font: 'Pirata One', weight: 400, color: VINO }),
    },
    glow: {},
  },
];
