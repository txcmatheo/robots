// Segunda piel
// Westcol y Blessd sobre el EngineAI T800 Max.
import './fuentes.js';
import './styles.css';
import './diagramas.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { crearEstudio } from './estudio.js';
import { mostrarCierre, ocultarCierre } from './cierre.js';
import { ARTISTAS, CANCION, FABRICA, IMPRESOS_FABRICA, MODELO, WESTCOL_DISENOS, ZONAS } from './datos.js';

const N = ARTISTAS.length;
const BASE = import.meta.env.BASE_URL;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const isNarrow = () => innerWidth / innerHeight < 0.9;
const REDUCIDO = matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.ticker.lagSmoothing(500, 33);

// ================= SONIDO =================
const sfx = (() => {
  let ac = null, master = null, on = true, drone = null;
  function init() {
    if (ac) return; ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0.85; master.connect(ac.destination);
    const g = ac.createGain(); g.gain.value = 0; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180;
    [55, 55.4, 82.4].forEach(fr => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(); });
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.07; const lg = ac.createGain(); lg.gain.value = 90; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    f.connect(g); g.connect(master); g.gain.linearRampToValueAtTime(0.05, ac.currentTime + 4); drone = g;
  }
  function tone(freq, dur = 0.08, type = 'square', vol = 0.06, slide = 0) {
    if (!ac || !on) return; const t = ac.currentTime; const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur = 0.6, from = 400, to = 4000, vol = 0.08) {
    if (!ac || !on) return; const t = ac.currentTime; const len = ac.sampleRate * dur; const b = ac.createBuffer(1, len, ac.sampleRate); const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  // audio real del estudio, descargado en paralelo tras el primer clic
  const buf = {};
  async function cargar() {
    try {
      const man = await (await fetch(BASE + 'audio/manifest.json')).json();
      await Promise.all(Object.entries(man).filter(([k]) => !k.startsWith('_')).map(async ([k, f]) => {
        const ab = await (await fetch(`${BASE}audio/${f}?v=${man._v || 0}`)).arrayBuffer(); buf[k] = await ac.decodeAudioData(ab);
      }));
      if (buf.musica && drone) drone.gain.linearRampToValueAtTime(0, ac.currentTime + 1.5);
      musica(pedida || 'musica');
    } catch (e) { console.warn('audio', e); }
  }
  let actual = null, pedida = null;
  function fuera(o, t, d) { o.g.gain.cancelScheduledValues(t); o.g.gain.setValueAtTime(o.g.gain.value, t); o.g.gain.linearRampToValueAtTime(0, t + d); setTimeout(() => { try { o.s.stop(); } catch { } }, d * 1000 + 200); }
  function musica(k) {
    pedida = k; if (!ac || !buf.musica) return;
    if (k === '__silencio') { if (actual) { fuera(actual, ac.currentTime, 1.2); actual = null; } return; }
    if (!buf[k]) k = 'musica';
    if (actual?.k === k) return;
    const t = ac.currentTime; if (actual) fuera(actual, t, 1.6);
    const s = ac.createBufferSource(); s.buffer = buf[k]; s.loop = true; const g = ac.createGain(); g.gain.value = 0; s.connect(g); g.connect(master); s.start();
    g.gain.linearRampToValueAtTime(0.95, t + 1.8); actual = { k, s, g };
  }
  function play(k, vol = 1) { if (!ac || !on || !buf[k]) return false; const s = ac.createBufferSource(); s.buffer = buf[k]; const g = ac.createGain(); g.gain.value = vol; s.connect(g); g.connect(master); s.start(); return true; }
  let duck = false;
  const nivel = () => { if (master) master.gain.value = on && !duck ? 0.85 : 0; };
  return {
    init() { init(); cargar(); }, musica, get on() { return on; },
    toggle() { on = !on; nivel(); return on; },
    duck(v) { duck = v; nivel(); },
    hover: () => play('clic', 0.4) || tone(1400, 0.03, 'square', 0.02),
    blip: () => play('clic', 0.8) || tone(880, 0.06, 'square', 0.04),
    select: () => play('clic', 1) || (tone(440, 0.08, 'square', 0.05), setTimeout(() => tone(880, 0.12, 'square', 0.05), 70)),
    scan: (d = 1.6) => play('escaneo', 0.9) || (noise(d, 300, 5000, 0.06), tone(120, d, 'sawtooth', 0.03, 4)),
    whoosh: () => play('transicion', 0.8) || noise(0.5, 2000, 200, 0.08),
    boom: () => play('golpe', 1) || (tone(70, 0.6, 'sine', 0.25, 0.4), noise(0.4, 800, 100, 0.1)),
    explode: (inv) => play('despiece', 0.9) || (inv ? tone(300, 0.3, 'triangle', 0.05, 2) : tone(600, 0.3, 'triangle', 0.05, 0.5)),
  };
})();

// ================= RENDER =================
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
const MOVIL = matchMedia('(pointer:coarse)').matches || Math.min(innerWidth, innerHeight) < 700;
const DPR_MAX = MOVIL ? Math.min(devicePixelRatio, 1.3) : Math.min(devicePixelRatio, 1.5);
let dpr = DPR_MAX;
renderer.setPixelRatio(dpr);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#070708', 0.05);

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.05, 80);
camera.position.set(0, 1.4, 9);
const look = new THREE.Vector3(0, 1, 0);
const controls = new OrbitControls(camera, canvas);
controls.enabled = false; controls.enableDamping = true; controls.enablePan = false;
controls.minDistance = 1.3; controls.maxDistance = 6; controls.maxPolarAngle = Math.PI * 0.62; controls.autoRotateSpeed = 1.6;

const rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { samples: MOVIL ? 2 : 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(dpr);
composer.addPass(new RenderPass(scene, camera));
// el bloom trabaja a media resolución: casi idéntico y 4 veces más barato
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.3, 0.35, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());

scene.add(new THREE.HemisphereLight('#9fb4ff', '#0a0a0a', 0.35));
const key = new THREE.DirectionalLight('#fff6ea', 1.4); key.position.set(2.5, 4, 4); scene.add(key);
const rim1 = new THREE.DirectionalLight('#7fb7ff', 2.2); rim1.position.set(-4, 3, -4); scene.add(rim1);
const rim2 = new THREE.DirectionalLight('#ffd9a8', 1.0); rim2.position.set(4, 2, -3); scene.add(rim2);

// ================= TEXTURAS =================
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t;
}
const carbonTex = canvasTex(128, 128, (c, W, H) => {
  c.fillStyle = '#101012'; c.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) {
    const g = c.createLinearGradient(x, y, x + 16, y + 16); const a = ((x + y) / 16) % 2 ? ['#2a2b30', '#0c0c0e'] : ['#0c0c0e', '#2a2b30'];
    g.addColorStop(0, a[0]); g.addColorStop(1, a[1]); c.fillStyle = g; c.fillRect(x + 1, y + 1, 14, 14);
  }
});
carbonTex.wrapS = carbonTex.wrapT = THREE.RepeatWrapping; carbonTex.repeat.set(3, 6);
const radialTex = canvasTex(256, 256, (c, W, H) => { const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.5, 'rgba(255,255,255,0.15)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); });
const ringTex = canvasTex(1024, 1024, (c, W) => {
  const cx = W / 2; c.strokeStyle = '#fff';
  [[0.48, 6], [0.44, 1.5], [0.36, 3], [0.3, 1]].forEach(([r, w]) => { c.lineWidth = w; c.beginPath(); c.arc(cx, cx, W * r, 0, Math.PI * 2); c.stroke(); });
  for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, r1 = W * 0.445, r2 = W * (i % 10 ? 0.465 : 0.48); c.lineWidth = i % 10 ? 1.5 : 4; c.beginPath(); c.moveTo(cx + Math.cos(a) * r1, cx + Math.sin(a) * r1); c.lineTo(cx + Math.cos(a) * r2, cx + Math.sin(a) * r2); c.stroke(); }
  c.lineWidth = 10; [0, 1, 2, 3].forEach(k => { c.beginPath(); c.arc(cx, cx, W * 0.4, k * Math.PI / 2 + 0.2, k * Math.PI / 2 + 0.9); c.stroke(); });
});

// ================= MATERIALES PPF =================
const holoMats = new Set();
function mat(color, fin) {
  const m = new THREE.MeshPhysicalMaterial({ color });
  const P = {
    factory: { roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.25 },
    factorym: { metalness: 0.55, roughness: 0.35, clearcoat: 0.3 },
    gloss: { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03 },
    pearl: { roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.04, sheen: 1, sheenColor: new THREE.Color('#bfe9ff'), sheenRoughness: 0.3, iridescence: 0.35, iridescenceIOR: 1.5 },
    satin: { roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.45 },
    matte: { roughness: 0.86, clearcoat: 0 },
    chrome: { metalness: 1, roughness: 0.05 },
    gold: { metalness: 1, roughness: 0.16 },
    shift: { metalness: 0.65, roughness: 0.16, clearcoat: 1, iridescence: 1, iridescenceIOR: 2.0, iridescenceThicknessRange: [250, 800] },
    holo: { metalness: 0.95, roughness: 0.1, iridescence: 1, iridescenceIOR: 2.2, iridescenceThicknessRange: [100, 1300] },
    carbon: { map: carbonTex, color: '#ffffff', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 },
  }[fin] || {};
  m.setValues(P); m.userData.fin = fin;
  if (fin === 'holo' || fin === 'shift') holoMats.add(m);
  return m;
}
const XRAY_ON = new THREE.MeshBasicMaterial({ color: '#57d8e8', wireframe: true, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
const XRAY_LIBRE = new THREE.MeshBasicMaterial({ color: '#ff2440', transparent: true, opacity: 0.9 });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const idle = (f) => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 1500 }) : setTimeout(f, 60));

// pieles
function pielDe(art, modo) {
  if (modo === 'fabrica' || !art.conceptos[modo]) return { z: FABRICA, p: IMPRESOS_FABRICA, visor: '#9fd8ff', glow: {}, holo: {} };
  const c = art.conceptos[modo]; return { z: c.z, p: c.mats ? {} : c.p, visor: c.visor, glow: c.glow || {}, holo: {}, mats: c.mats, calcos: c.calcos };
}
function vestirParte(robot, m, piel, modo) {
  const z = m.userData.zona; if (m.userData.fixed) return;
  const dm = matDe(piel.mats, m); if (dm) { m.material = dm; return; }
  if (modo === 'fabrica' || piel.z[z]?.[1] === 'factory') { m.material = m.userData.factoryMat; return; }
  const spec = piel.z[z]; if (!spec) return;
  const k = spec.join('|');
  robot.userData.matCache ??= new Map();
  let mm = robot.userData.matCache.get(k); if (!mm) { mm = mat(spec[0], spec[1]); robot.userData.matCache.set(k, mm); }
  m.material = mm;
}
function vestir(robot, modo, anim = false) {
  const art = robot.userData.art; if (modo !== 'fabrica' && !art.conceptos[modo]) modo = 'fabrica'; const piel = pielDe(art, modo); robot.userData.modo = modo;
  if (robot.userData.xray) setXray(robot, false);
  if (!anim || REDUCIDO) {
    robot.userData.parts.forEach(m => vestirParte(robot, m, piel, modo));
    // los impresos (proyección de calcos) son lo más caro: van en tiempo ocioso para no bloquear el hilo
    aplicarDecals(robot, { p: {} }, 'fabrica'); const tk = robot.userData.dTk = (robot.userData.dTk || 0) + 1;
    idle(() => { if (robot.userData.dTk === tk && robot.userData.modo === modo) aplicarDecals(robot, piel, modo); });
    return Promise.resolve();
  }
  aplicarDecals(robot, { p: {} }, 'fabrica');
  return new Promise(res => {
    const done = new Set(); const st = { y: -0.05 };
    scanFx.show(robot, art.acento); sfx.scan(1.5);
    if (S.mode === 'garage' || S.mode === 'intro') { const b = $('#barrido'); b.style.setProperty('--bc', piel.visor || art.acento); gsap.fromTo(b, { yPercent: 0, opacity: 0 }, { yPercent: -100, opacity: 1, duration: 1.5, ease: 'power2.inOut', onComplete: () => gsap.to(b, { opacity: 0, duration: 0.3 }) }); }
    gsap.to(st, {
      y: 1.95, duration: 1.5, ease: 'power2.inOut',
      onUpdate: () => {
        scanFx.set(st.y, robot);
        for (const m of robot.userData.parts) {
          if (done.has(m)) continue;
          if (m.userData.wy < st.y) { done.add(m); vestirParte(robot, m, piel, modo); flash(m, art.acento); }
        }
      },
      onComplete: () => { scanFx.hide(); aplicarDecals(robot, piel, modo); res(); if (S.mode === 'garage' && robot === robots[S.idx] && modo !== 'fabrica') anotar(); },
    });
  });
}
function flash(m, color) {
  if (m.userData.fixed || !m.material.emissive) return;
  const mm = m.material; mm.emissive.set(color); mm.emissiveIntensity = 1.4;
  gsap.to(mm, { emissiveIntensity: 0, duration: 0.7, ease: 'power2.out' });
}
function setXray(robot, on) {
  robot.userData.xray = on;
  for (const m of robot.userData.parts) {
    if (m.userData.isFill) { m.visible = !on && m.userData.activo !== false; continue; }
    if (on) { m.userData.prevMat = m.material; m.material = m.userData.libre ? XRAY_LIBRE : XRAY_ON; }
    else if (m.userData.prevMat) m.material = m.userData.prevMat;
  }
  for (const arr of robot.userData.dcache?.values() || []) arr.forEach(d => d.visible = !on && !!d.userData.activo);
}

// ================= ESCENARIO =================
const estudio = crearEstudio(scene, renderer);
function backdrop(color, k) { estudio.setAcento(color, Math.min(1, k * 2.5)); gsap.to(particles.material.color, { ...new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35), duration: 1.2 }); }
// gobo: el logo de cada dueño proyectado en la pared del estudio
const gobo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
gobo.position.set(0, 3.3, -10.2); gobo.visible = false; scene.add(gobo);
const goboTex = {};
function goboDe(a) {
  if (goboTex[a.id]) return goboTex[a.id];
  let t;
  if (a.id === 'westcol' && a.logo) { t = new THREE.TextureLoader().load(a.logo); t.colorSpace = THREE.SRGBColorSpace; t.userData = { asp: 1 }; }
  else {
    t = canvasTex(2048, 1024, (c, w, h) => { c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `400 ${h * 0.55}px "Pirata One"`; c.fillText(a.id === 'blessd' ? 'Blessd' : a.nombre, w / 2, h / 2); });
    t.userData = { asp: 2 };
  }
  goboTex[a.id] = t; return t;
}
function goboShow(a, color) {
  const t = goboDe(a); const asp = t.userData.asp || 1; const hgt = asp > 1.5 ? 3.4 : 5.2;
  gsap.to(gobo.material, { opacity: 0, duration: 0.35, onComplete: () => {
    gobo.material.map = t; gobo.material.needsUpdate = true; gobo.scale.set(hgt * asp, hgt, 1); gobo.visible = true;
    gobo.material.color.set(color).lerp(new THREE.Color('#ffffff'), 0.25);
    gsap.to(gobo.material, { opacity: 0.055, duration: 1.6, ease: 'power2.out' });
  } });
}
function goboHide() { gsap.to(gobo.material, { opacity: 0, duration: 0.6, onComplete: () => { gobo.visible = false; } }); }

function beamMat(color) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { c: { value: new THREE.Color(color) }, k: { value: 0.18 } },
    vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 c; uniform float k; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float h = smoothstep(-2.6, 2.4, vY); float f = pow(abs(dot(vN, vV)), 1.6); gl_FragColor = vec4(c, (1.0-h)*f*k); }`,
  });
}

const robots = []; const stands = [];
const POS = [-0.85, 0.85];
const particles = (() => {
  const n = 500, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 14; p[i * 3 + 1] = Math.random() * 5; p[i * 3 + 2] = (Math.random() - 0.5) * 10; }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ size: 0.014, map: radialTex, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, color: '#f1e3c4' });
  const pts = new THREE.Points(g, m); scene.add(pts); return pts;
})();

const scanFx = (() => {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.005, 8, 96), new THREE.MeshBasicMaterial({ color: '#fff', toneMapped: false, transparent: true, blending: THREE.AdditiveBlending }));
  ring.rotation.x = Math.PI / 2;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.6, 64), new THREE.MeshBasicMaterial({ map: radialTex, color: '#fff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  disc.rotation.x = -Math.PI / 2;
  g.add(ring, disc); g.visible = false; scene.add(g);
  return {
    show(robot, color) { ring.material.color.set(color).multiplyScalar(3); disc.material.color.set(color); g.visible = true; g.position.x = robot.position.x; g.position.z = robot.position.z; },
    set(y, robot) { g.position.y = y + robot.position.y; g.position.x = robot.position.x; ring.scale.setScalar(1 + Math.sin(y * 9) * 0.06); },
    hide() { g.visible = false; },
  };
})();

// ================= CARGA (diseños + modelo oficial) =================
const FIN = { brillante: 'gloss', satinado: 'satin', mate: 'matte', cromo: 'chrome', oro: 'gold', color_shift: 'shift', 'color shift': 'shift', holografico: 'holo', 'holográfico': 'holo', perla: 'pearl', carbono: 'carbon', fabrica: 'factory', 'fábrica': 'factory', impreso: 'gloss' };
async function getJSON(u) { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch { return null; } }
function conceptoDesdeJSON(j, art) {
  const z = {};
  for (const [k, v] of Object.entries(j.zonas || {})) {
    const f = FIN[String(v.acabado || '').toLowerCase().trim()] || 'gloss';
    z[k] = f === 'factory' ? (FABRICA[k] || [v.hex || '#cccccc', 'factory']) : [v.hex || '#cccccc', f];
  }
  for (const k of Object.keys(FABRICA)) if (!z[k]) z[k] = FABRICA[k];
  return { id: 'A', nombre: String(j.concepto || '').toUpperCase(), paleta: (j.paleta || []).map(x => x.hex), visor: j.visor || j.acento || art.acento, acento: j.acento || art.acento, idea: j.frase || '', z, p: {} };
}
const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const progreso = { glb: 0 };
async function cargarEntregas() {
  const glbP = gltf.loadAsync(BASE + 'modelos/fabrica_t800.glb', e => { if (e.total) progreso.glb = e.loaded / e.total; }).then(g => g.scene).catch(e => { console.error('GLB no cargó', e); return null; });
  const dm = await getJSON(BASE + 'disenos/manifest.json');
  const d = (f) => `${BASE}disenos/${f}?v=${dm?._v || 0}`;
  await Promise.all(ARTISTAS.map(async art => {
    const files = dm?.[art.id]; if (!files?.json) return;
    const j = await getJSON(d(files.json)); if (!j) return;
    const conceptos = [conceptoDesdeJSON(j, art)];
    for (const v of j.variantes || []) {
      const c = conceptoDesdeJSON({ ...j, ...v, zonas: { ...(j.zonas || {}), ...(v.zonas || {}) } }, art);
      c.id = String.fromCharCode(65 + conceptos.length); conceptos.push(c);
    }
    // Westcol usa su colección propia (W Sound, Kid W, En vivo); el resto, la del JSON
    art.conceptos = art.id === 'westcol' ? WESTCOL_DISENOS.map((x, k) => ({ ...x, z: { ...FABRICA, ...x.z }, id: String.fromCharCode(65 + k) })) : conceptos;
    if (files.logo) art.logo = d(files.logo);
    if (files.logoWebp) art.logoWebp = d(files.logoWebp);
    art.renders = Object.fromEntries(Object.entries(files.renders || {}).map(([k, f]) => [k, d(f)]));
    if (j.acento) art.acento = j.acento;
  }));
  return glbP;
}
// modelos con el diseño texturizado (materiales por pieza): se piden en paralelo con el modelo base,
// porque la fusión de mallas necesita saber qué material lleva cada pieza en cada diseño.
async function cargarDisenos3D() {
  const mm = await getJSON(BASE + 'modelos/manifest.json'); if (!mm) return [];
  return Promise.all(Object.entries(mm).filter(([k]) => /_[A-C]$/.test(k) && !k.startsWith('westcol')).map(async ([k, f]) => {
    try {
      const g = (await gltf.loadAsync(BASE + 'modelos/' + f + '?v=' + (mm._v || 0))).scene; const [id, letra] = k.split('_');
      const mats = new Map(), calcos = []; g.updateMatrixWorld(true);
      g.traverse(o => { if (!o.isMesh) return; if (/^decal/i.test(o.name)) calcos.push(o); else mats.set(o.name, Array.isArray(o.material) ? o.material[0] : o.material); });
      return { id, ci: 'ABC'.indexOf(letra), mats, calcos };
    } catch (e) { console.warn('diseño 3D', k, e); return null; }
  }));
}
const ZKEYS = Object.keys(ZONAS).sort((a, b) => b.length - a.length);
function zonaDe(name) { const n = (name || '').toLowerCase(); return ZKEYS.find(k => n.startsWith(k) || n.includes('_' + k + '_') || n.endsWith('_' + k) || n.includes(k + '_')) || null; }
// El GLB oficial trae ~270 mallas. Se fusionan por (zona, lado, material, atributos): pasa de ~270 a
// unas decenas de draw calls por robot y por pasada (escena, reflejo y sombra). La plantilla se arma
// una vez y los dos robots comparten las geometrías.
function aFloat(geo, mat4) {
  const out = new THREE.BufferGeometry();
  for (const k of ['position', 'normal', 'uv']) {
    const at = geo.attributes[k]; if (!at) continue;
    const n = at.itemSize, arr = new Float32Array(at.count * n);
    for (let i = 0; i < at.count; i++) { arr[i * n] = at.getX(i); if (n > 1) arr[i * n + 1] = at.getY(i); if (n > 2) arr[i * n + 2] = at.getZ(i); }
    out.setAttribute(k, new THREE.BufferAttribute(arr, n));
  }
  out.setIndex(geo.index ? Array.from(geo.index.array) : [...Array(geo.attributes.position.count).keys()]);
  out.applyMatrix4(mat4); return out;
}
function plantilla(src, mapas = []) {
  let PLANTILLA;
  const g = src.clone(true); g.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(g);
  g.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2); g.updateMatrixWorld(true);
  const grupos = new Map(); const tmpB = new THREE.Box3(), wc = new THREE.Vector3();
  g.traverse(m => {
    if (!m.isMesh) return;
    if (Array.isArray(m.material)) m.material = m.material[0];
    tmpB.setFromObject(m).getCenter(wc);
    const z = zonaDe(m.name) || zonaDe(m.parent?.name) || zonaDe(m.name + ' ' + (m.parent?.name || '')) || 'articulacion';
    const side = Math.abs(wc.x) < 0.04 ? 0 : Math.sign(wc.x);
    const k = [z, side, m.material.uuid, Object.keys(m.geometry.attributes).sort().join(), ...mapas.map(mp => mp.get(m.name)?.uuid || '-')].join('|');
    let gr = grupos.get(k); if (!gr) grupos.set(k, gr = { zona: z, side, mat: m.material, geos: [], nombres: [] });
    gr.geos.push(aFloat(m.geometry, m.matrixWorld)); gr.nombres.push(m.name);
  });
  PLANTILLA = { H: box.max.y - box.min.y, off: g.position.clone(), grupos: [...grupos.values()].map(gr => {
    const geo = mergeGeometries(gr.geos, false); gr.geos.forEach(x => x.dispose());
    geo.computeBoundingBox(); const c = geo.boundingBox.getCenter(new THREE.Vector3());
    geo.translate(-c.x, -c.y, -c.z); geo.computeBoundingSphere();
    return { ...gr, geo, c };
  }) };
  return PLANTILLA;
}
// material de un diseño para una malla fusionada: el más repetido entre sus piezas originales
function matDe(mats, m) {
  if (!mats) return null; const cnt = new Map(); let best = null, bn = 0;
  for (const n of m.userData.nombres || [m.name]) { const x = mats.get(n); if (!x) continue; const c = (cnt.get(x) || 0) + 1; cnt.set(x, c); if (c > bn) { bn = c; best = x; } }
  return best;
}
function robotDesdeGLB(art, src) {
  const mapas = art.conceptos.map(c => c.mats).filter(Boolean);
  const root = new THREE.Group(); root.name = art.id; const body = new THREE.Group(); root.add(body);
  const T = plantilla(src, mapas); const C = V(0, T.H * 0.58, 0); const parts = [];
  for (const gr of T.grupos) {
    const m = new THREE.Mesh(gr.geo, gr.mat); m.name = gr.nombres[0]; m.position.copy(gr.c); body.add(m);
    const zona = gr.zona; const libre = !!ZONAS[zona]?.libre; const wc = gr.c;
    m.userData = { zona, libre, nombres: gr.nombres, factoryMat: gr.mat, fixed: libre ? gr.mat : null, side: gr.side || 1 };
    const d = wc.clone().sub(C); d.y *= 0.55; if (Math.abs(wc.x) > 0.18) d.x *= 1.8;
    if (zona === 'mochila') d.z -= 0.5; if (zona === 'pecho' || zona === 'emblema') d.z += 0.3; if (zona === 'coronilla') d.y += 0.3;
    const L = d.length() || 1; d.normalize().multiplyScalar(0.1 + L * 0.5); if (d.y < 0) d.y *= 0.25;
    m.userData.base = m.position.clone(); m.userData.dir = d; m.userData.seed = Math.random() * 10; m.userData.wy = wc.y;
    m.castShadow = true; m.matrixAutoUpdate = false; m.updateMatrix();
    parts.push(m);
  }
  root.userData = { art, parts, body, explode: 0, xray: false, modo: null, off: T.off };
  return root;
}
// impresos proyectados sobre los paneles reales
function decalsZona(robot, piel, modo, zona) {
  const cache = robot.userData.dcache ??= new Map(); const k = modo + '|' + zona;
  if (cache.has(k)) return cache.get(k);
  const draw = piel.p?.[zona]; const ms = robot.userData.parts.filter(m => m.userData.zona === zona && !m.userData.isFill);
  const out = []; if (!draw || !ms.length) { cache.set(k, out); return out; }
  const lateral = ['brazo', 'antebrazo', 'bota'].includes(zona), back = zona === 'mochila';
  const doble = ['brazo', 'antebrazo', 'muslo', 'espinillera', 'bota', 'hombro', 'rodilla'].includes(zona);
  const grupos = doble ? [ms.filter(m => m.userData.side < 0), ms.filter(m => m.userData.side > 0)] : [ms];
  for (const grp of grupos) {
    if (!grp.length) continue;
    const b = new THREE.Box3(); grp.forEach(m => b.expandByObject(m)); const c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
    let rotY = back ? Math.PI : 0, w = s.x, h = s.y, depth = s.z * 1.6;
    if (lateral) { rotY = grp[0].userData.side * Math.PI / 2; w = s.z; depth = s.x * 1.6; }
    const Wd = w * 0.86, Hd = h * 0.86; const ppm = 2200;
    const tex = canvasTex(Math.min(2048, Math.max(64, Math.round(Wd * ppm))), Math.min(2048, Math.max(64, Math.round(Hd * ppm))), (cx, W, H) => draw(cx, W, H));
    const matD = new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, polygonOffset: true, polygonOffsetFactor: -4, depthWrite: false });
    if (piel.glow?.[zona]) { matD.emissiveMap = tex; matD.emissive.set('#ffffff'); matD.emissiveIntensity = 1.4; }
    const out3 = new THREE.Vector3(Math.sin(rotY), 0, Math.cos(rotY));
    for (const m of grp) {
      let geo = new DecalGeometry(m, c, new THREE.Euler(0, rotY, 0), new THREE.Vector3(Wd, Hd, depth));
      const P = geo.attributes.position, Nn = geo.attributes.normal, U = geo.attributes.uv; if (!P || !P.count) continue;
      const kp = [], kn = [], ku = [];
      for (let t = 0; t < P.count; t += 3) {
        const nx = Nn.getX(t) + Nn.getX(t + 1) + Nn.getX(t + 2), ny = Nn.getY(t) + Nn.getY(t + 1) + Nn.getY(t + 2), nz = Nn.getZ(t) + Nn.getZ(t + 1) + Nn.getZ(t + 2);
        if ((nx * out3.x + ny * out3.y + nz * out3.z) / (Math.hypot(nx, ny, nz) || 1) < 0.15) continue;
        for (let q = 0; q < 3; q++) { kp.push(P.getX(t + q), P.getY(t + q), P.getZ(t + q)); kn.push(Nn.getX(t + q), Nn.getY(t + q), Nn.getZ(t + q)); ku.push(U.getX(t + q), U.getY(t + q)); }
      }
      geo.dispose();
      if (!kp.length) continue;
      geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(kp, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(kn, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(ku, 2));
      geo.applyMatrix4(m.matrixWorld.clone().invert());
      const dm = new THREE.Mesh(geo, matD); dm.renderOrder = 2; dm.userData.isFill = true; dm.visible = false; m.add(dm); out.push(dm);
    }
  }
  cache.set(k, out); return out;
}
function aplicarDecals(robot, piel, modo) {
  const u = robot.userData;
  for (const arr of u.dcache?.values() || []) arr.forEach(d => { d.visible = false; d.userData.activo = false; });
  // calcomanías del modelo de diseño (mallas decal_*)
  u.calcos ??= new Map();
  for (const [k, grp] of u.calcos) grp.forEach(m => { m.userData.activo = k === modo; m.visible = k === modo && !u.xray; });
  if (modo !== 'fabrica' && piel.calcos?.length && !u.calcos.has(modo)) {
    const arr = piel.calcos.map(src => {
      const m = src.clone(); m.applyMatrix4(src.matrixWorld); m.position.add(u.off || V(0, 0, 0)); u.body.add(m);
      const n = m.name.toLowerCase(); const zona = n.includes('pecho') ? 'pecho' : n.includes('espalda') ? 'mochila' : n.includes('pierna') ? 'muslo' : 'pecho';
      m.geometry.computeBoundingBox(); const wc = m.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(m.matrix);
      const ref = u.parts.find(p => p.userData.zona === zona && (zona !== 'muslo' || Math.sign(p.userData.dir.x) === Math.sign(wc.x)));
      m.userData = { zona, libre: false, fixed: m.material, isFill: true, activo: true, base: m.position.clone(), dir: ref ? ref.userData.dir.clone() : V(0, 0, 0.3), seed: 0, wy: wc.y };
      u.parts.push(m); return m;
    });
    u.calcos.set(modo, arr);
  }
  if (!piel.p || !Object.keys(piel.p).length) return;
  // las proyecciones se calculan con el robot en reposo y en el origen
  const save = { p: robot.position.clone(), r: robot.rotation.y, br: u.body.rotation.y, by: u.body.position.y };
  robot.position.set(0, 0, 0); robot.rotation.y = 0; u.body.rotation.y = 0; u.body.position.y = 0;
  u.parts.forEach(m => { m.position.copy(m.userData.base); if (!m.matrixAutoUpdate) m.updateMatrix(); }); robot.updateMatrixWorld(true);
  for (const zona of Object.keys(piel.p)) decalsZona(robot, piel, modo, zona).forEach(d => { d.visible = !u.xray; d.userData.activo = true; });
  robot.position.copy(save.p); robot.rotation.y = save.r; u.body.rotation.y = save.br; u.body.position.y = save.by; robot.updateMatrixWorld(true);
}

// ================= ESTADO =================
const S = { mode: 'boot', idx: 0, ch: -1, concept: ARTISTAS.map(() => 0), explode: 0, auto: true, mx: 0, my: 0, modoT: 0 };

async function construir() {
  const [src, disenos] = await Promise.all([cargarEntregas(), cargarDisenos3D()]);
  for (const d of disenos) { if (!d) continue; const c = ARTISTAS.find(x => x.id === d.id)?.conceptos[d.ci]; if (c) { c.mats = d.mats; c.calcos = d.calcos; } }
  if (!src) throw new Error('No se pudo cargar el modelo oficial del T800 Max');
  ARTISTAS.forEach((art, i) => {
    const r = robotDesdeGLB(art, src);
    r.position.set(POS[i], 0, 0); r.rotation.y = -POS[i] * 0.15; scene.add(r); robots.push(r);
    const st = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.CircleGeometry(0.75, 64), new THREE.MeshBasicMaterial({ map: ringTex, color: new THREE.Color(art.acento).multiplyScalar(1.6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.004; ring.visible = false;
    const glow = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), new THREE.MeshBasicMaterial({ map: radialTex, color: '#fff3dc', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = 0.003;
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.95, 5, 48, 1, true), beamMat(art.acento)); beam.position.y = 2.5; beam.rotation.x = Math.PI; beam.visible = false;
    const spot = new THREE.SpotLight(art.acento, 9, 9, 0.42, 0.7, 1.2); spot.position.set(0, 4.6, 1.4); spot.target = r;
    st.add(ring, glow, beam, spot); st.position.x = POS[i]; scene.add(st);
    stands.push({ g: st, ring, glow, beam, spot });
    vestir(r, art.recomendado);
    S.concept[i] = art.recomendado;
  });
}

// ================= CÁMARA =================
function camTo(pos, tgt, dur = 1.6, ease = 'power3.inOut') {
  gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: dur, ease });
  gsap.to(look, { x: tgt.x, y: tgt.y, z: tgt.z, duration: dur, ease });
}
function camSelect() { const n = isNarrow(), z = 5.4 + Math.max(0, 1.7 - innerWidth / innerHeight) * 2.4; const zn = 6.4 + Math.max(0, 0.9 - innerWidth / innerHeight) * 7; camTo(n ? V(0, 0.95, zn) : V(-0.55, 1.15, z), n ? V(0, 0.62, 0) : V(-0.55, 0.86, 0), 2.2); }
function camGarage() { const n = isNarrow(); camTo(V(0.4, n ? 0.95 : 1.15, n ? 6.2 : 3.9), V(n ? 0 : -0.45, n ? 0.45 : 0.92, 0), 1.9); }

// ================= CAPÍTULOS =================
const CH = [{ k: 'select', n: 'Los dos' }, ...ARTISTAS.map((a, i) => ({ k: 'garage', i, n: a.nombre })), { k: 'piel', n: 'La piel' }, { k: 'cierre', n: 'Cierre' }];
function acentoActual() { const a = ARTISTAS[S.idx]; return a.conceptos[S.concept[S.idx]]?.acento || a.acento; }
function setAcc(c) { document.documentElement.style.setProperty('--acc', c); }
function goCh(i, inst = false) {
  i = Math.max(0, Math.min(CH.length - 1, i)); if (i === S.ch && !inst) return;
  const c = CH[i]; S.ch = i; if (c.k === 'garage') S.idx = c.i;
  $$('#chapters a').forEach((a, k) => { a.classList.toggle('on', k === i); a.toggleAttribute('aria-current', k === i); });
  const run = () => setMode(c.k);
  const col = c.k === 'garage' ? acentoActual() : '#e8c27a';
  const nombre = c.k === 'garage' ? titulo(ARTISTAS[c.i].conceptos[S.concept[c.i]]?.nombre || ARTISTAS[c.i].nombre) : c.n;
  sfx.whoosh(); inst || REDUCIDO ? run() : transition(run, col, [String(i + 1).padStart(2, '0'), nombre]);
}
function setMode(mode) {
  if (tourTL) { tourTL.kill(); tourTL = null; gsap.to('#tour-cap', { opacity: 0, duration: 0.3 }); $('#b-tour').classList.remove('on'); document.body.classList.remove('touring'); }
  if (S.mode === 'cierre' && mode !== 'cierre') ocultarCierre($('#cierre'));
  if (mode !== 'garage') cancionStop();
  S.mode = mode; S.modoT = performance.now(); document.body.dataset.mode = mode;
  controls.enabled = mode === 'garage'; controls.autoRotate = false; hideInfo();
  robots.forEach(r => { if (r.userData.xray) setXray(r, false); });
  S.explode = 0; robots.forEach(r => setExplode(r, 0)); syncDock(); $('#xray-legend').classList.remove('show');
  if (mode === 'select') {
    robots.forEach((r, i) => { r.visible = true; gsap.to(r.position, { x: POS[i], y: 0, duration: 1.4, ease: 'power3.inOut' }); gsap.to(r.rotation, { y: -POS[i] * 0.15, duration: 1.4 }); gsap.to(stands[i].g.position, { x: POS[i], duration: 1.4, ease: 'power3.inOut' }); });
    camSelect(); setAcc('#e8c27a'); backdrop('#e8c27a', 0.22); highlight(S.idx); sfx.musica('musica'); goboHide();
    robots.forEach((r, i) => { if (r.userData.modo !== S.concept[i]) setTimeout(() => vestir(r, S.concept[i], true), 300 + i * 250); });
  }
  if (mode === 'garage') {
    robots.forEach((r, i) => {
      if (i === S.idx) { r.visible = true; gsap.to(r.position, { x: 0, y: 0, duration: 1.4, ease: 'power3.inOut' }); gsap.to(stands[i].g.position, { x: 0, duration: 1.4, ease: 'power3.inOut' }); gsap.to(r.rotation, { y: 0, duration: 1.4 }); }
      // el que no está en escena baja y deja de dibujarse
      else { gsap.to(r.position, { y: -2.6, duration: 1.0, ease: 'power3.in', onComplete: () => { if (S.mode === 'garage' && S.idx !== i) r.visible = false; } }); gsap.to(stands[i].g.position, { x: (i < S.idx ? -1 : 1) * 7, duration: 1.2 }); }
    });
    stands.forEach((s, i) => gsap.to(s.spot, { intensity: i === S.idx ? 5 : 0, duration: 1 }));
    camGarage(); fillGarage(); cancion(ARTISTAS[S.idx].id); goboShow(ARTISTAS[S.idx], acentoActual());
    setTimeout(() => { if (S.mode === 'garage' && !tourTL) { controls.target.copy(look); controls.autoRotate = S.auto; } }, 1950);
    const sel = robots[S.idx]; setTimeout(() => vestir(sel, S.concept[S.idx], true), 700);
  }
  if (mode === 'cierre') {
    goboHide(); sfx.musica('musica'); sfx.boom();
    mostrarCierre($('#cierre'), { acentos: ARTISTAS.map(x => x.conceptos[0]?.acento || x.acento), nombres: ARTISTAS.map(x => x.nombre), sub: MODELO.nombre + ' · PPF' });
  }
  if (mode === 'piel') { goboHide(); camTo(V(0, 2.2, 10), V(0, 1.1, 0), 2.2); backdrop('#e8c27a', 0.2); openPiel(); sfx.musica('musica'); }
}
function highlight(i) {
  stands.forEach((s, k) => { gsap.to(s.glow.material, { opacity: k === i ? 0.4 : 0.08, duration: 0.6 }); gsap.to(s.spot, { intensity: k === i ? 6 : 2, duration: 0.6 }); });
  tagEls.forEach((t, k) => t.classList.toggle('on', k === i));
  if (S.mode === 'select' || S.mode === 'intro') { const ar = ARTISTAS[i]; tarjeta($('#sel-card'), ar, ar.conceptos[S.concept[i]]); }
  if (isNarrow() && S.mode === 'select') camSelect();
}
function setExplode(r, v) { gsap.to(r.userData, { explode: v, duration: 1.3, ease: 'expo.inOut' }); }

// ================= CAPÍTULO DE CADA ROBOT =================
const FN = { gloss: 'Brillante', satin: 'Satinado', matte: 'Mate', chrome: 'Cromo espejo', gold: 'Cromo oro', shift: 'Color shift', holo: 'Holográfico', pearl: 'Perla', carbon: 'Carbono', factory: 'De fábrica', factorym: 'De fábrica' };
const titulo = s => String(s).split(' ').map(w => w.length === 1 || /\d/.test(w) ? w.toUpperCase() : w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function logoHTML(a, cls = '') {
  const src = a.logoWebp || a.logo;
  return src ? `<img class="logo-img lg-${a.id} ${cls}" src="${src}" alt="${esc(a.nombre)}" decoding="async">` : `<span class="lg-text">${esc(a.nombre)}</span>`;
}
function palabras(el, text) {
  el.innerHTML = text.split(' ').map(w => `<span class="w"><span>${esc(w)}</span></span>`).join(' ');
  gsap.fromTo(el.querySelectorAll('.w>span'), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.25 });
}
function fillGarage() {
  const a = ARTISTAS[S.idx], ci = S.concept[S.idx], c = a.conceptos[ci];
  setAcc(acentoActual()); backdrop(acentoActual(), 0.3);
  $('#g-unit').textContent = `${String(S.ch + 1).padStart(2, '0')} · ${MODELO.corto}`;
  $('#g-logo').innerHTML = logoHTML(a);
  gsap.fromTo('#g-logo', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.9, ease: 'expo.out' });
  palabras($('#g-concept'), c ? titulo(c.nombre) + '.' : 'En diseño.');
  $('#g-idea').textContent = c ? c.idea : 'Su piel está en diseño.';
  $('#g-concepts').innerHTML = a.conceptos.map((k, j) => `<button class="tab ${j === ci ? 'on' : ''}" data-c="${j}" aria-pressed="${j === ci}"><b>${k.id} · ${esc(k.nombre)}</b><span class="sw">${k.paleta.slice(0, 5).map(p => `<i style="background:${p}"></i>`).join('')}</span><small>${j === 0 ? 'PRINCIPAL' : 'VARIANTE'}</small></button>`).join('');
  $$('#g-concepts .tab').forEach(b => b.onclick = () => pickConcept(+b.dataset.c));
  $('#g-concepts .tab.on')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  const fins = c ? [...new Set(Object.values(c.z).map(z => z[1] === 'factorym' ? 'factory' : z[1]))] : [];
  $('#g-fins').innerHTML = fins.map(f => `<li><i class="fin fin-${f}"></i>${FN[f] || f}</li>`).join('');
  gsap.fromTo(['#g-idea', '#g-concepts', '#g-fins'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 0.45, ease: 'expo.out' });
  $$('#g-mode button').forEach(b => b.classList.toggle('on', b.dataset.v === 'ppf'));
  tarjeta($('#g-render'), a, c);
  const nx = CH[S.ch + 1]; $('#g-next').innerHTML = `<small>SIGUIENTE</small><b>${nx ? (nx.k === 'garage' ? ARTISTAS[nx.i].nombre : nx.n) : ''} →</b>`; $('#g-next').style.display = nx ? '' : 'none';
}
function pickConcept(j) {
  const a = ARTISTAS[S.idx]; if (!a.conceptos[j] || (S.concept[S.idx] === j && robots[S.idx].userData.modo === j)) return;
  S.concept[S.idx] = j; sfx.select(); fillGarage(); vestir(robots[S.idx], j, true); goboShow(a, acentoActual());
}

// recorrido de cámara por el robot
let tourTL = null;
function recorrido() {
  if (S.mode !== 'garage') return;
  if (tourTL) { tourTL.kill(); tourTL = null; finTour(); return; }
  const a = ARTISTAS[S.idx], r = robots[S.idx];
  const piel = pielDe(a, r.userData.modo); const cap = $('#tour-cap');
  controls.enabled = false; controls.autoRotate = false; $('#b-tour').classList.add('on'); hideInfo(); document.body.classList.add('touring');
  const planos = [
    { z: 'casco', p: V(0.45, 1.78, 0.95), t: V(0, 1.66, 0) },
    { z: 'pecho', p: V(-0.55, 1.42, 1.05), t: V(0, 1.3, 0) },
    { z: 'mochila', p: V(0.4, 1.45, -1.15), t: V(0, 1.3, 0) },
    { z: 'brazo', p: V(1.05, 1.25, 0.55), t: V(0.25, 1.15, 0) },
    { z: 'muslo', p: V(-0.75, 0.75, 1.0), t: V(0, 0.68, 0) },
    { z: 'bota', p: V(0.55, 0.3, 0.9), t: V(0, 0.12, 0) },
  ];
  tourTL = gsap.timeline({ onComplete: () => { tourTL = null; finTour(); } });
  planos.forEach((pl, k) => {
    const t0 = k * 2.4; const sp = piel.z[pl.z]; const info = ZONAS[pl.z];
    tourTL.to(camera.position, { x: pl.p.x, y: pl.p.y, z: pl.p.z, duration: 1.3, ease: 'expo.inOut' }, t0)
      .to(look, { x: pl.t.x, y: pl.t.y, z: pl.t.z, duration: 1.3, ease: 'expo.inOut' }, t0)
      .to(camera.position, { x: '+=0.12', duration: 1.1, ease: 'none' }, t0 + 1.3)
      .add(() => {
        cap.innerHTML = `<span class="k">${String(k + 1).padStart(2, '0')} / ${planos.length}</span><b>${info.nombre}</b><span class="f">${sp ? `<i style="background:${sp[0]}"></i>${FN[sp[1]] || sp[1]}` : ''} · ${info.trato}</span>`;
        gsap.fromTo(cap, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }); sfx.whoosh();
      }, t0 + 0.5);
  });
}
function finTour() {
  gsap.to('#tour-cap', { opacity: 0, duration: 0.4 }); $('#b-tour').classList.remove('on'); document.body.classList.remove('touring');
  if (S.mode !== 'garage') return;
  camGarage(); setTimeout(() => { if (S.mode === 'garage' && !tourTL) { controls.target.copy(look); controls.enabled = true; controls.autoRotate = S.auto; } }, 1950);
}

// visor de imágenes (frente y espalda de cada diseño)
let LB = { list: [], i: 0 };
const thumb = src => src.replace('/disenos/', '/disenos/thumb/');
function imagenesDe(a) {
  const out = [];
  a.conceptos.forEach(c => { const s = slug(c.nombre); if (a.renders?.[s]) out.push({ src: a.renders[s], cap: `${a.nombre} · ${titulo(c.nombre)} · frente` }); if (a.renders?.[s + '_espalda']) out.push({ src: a.renders[s + '_espalda'], cap: `${a.nombre} · ${titulo(c.nombre)} · espalda` }); });
  return out;
}
let lbFoco = null;
function abrirLB(list, i = 0) {
  if (!list.length) return; LB = { list, i }; lbFoco = document.activeElement; const el = $('#lightbox'); el.classList.add('show'); el.setAttribute('aria-hidden', 'false'); pintarLB(); sfx.blip(); $('#lightbox .lb-x').focus();
}
function pintarLB() {
  const it = LB.list[LB.i]; const img = $('#lightbox img');
  gsap.fromTo(img, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }); img.src = it.src; img.alt = it.cap;
  $('#lb-cap').textContent = `${it.cap}  ·  ${LB.i + 1} / ${LB.list.length}`; $('#lb-open').href = it.src;
  const nx = LB.list[(LB.i + 1) % LB.list.length]; if (nx) new Image().src = nx.src; // precarga la siguiente
}
function moverLB(d) { LB.i = (LB.i + d + LB.list.length) % LB.list.length; pintarLB(); sfx.hover(); }
function cerrarLB() { const el = $('#lightbox'); el.classList.remove('show'); el.setAttribute('aria-hidden', 'true'); lbFoco?.focus?.(); }
function armarGaleria() {
  $('#galeria').innerHTML = ARTISTAS.map((a, i) => {
    const ims = imagenesDe(a); const c = a.conceptos[0]?.acento || a.acento;
    return ims.length ? `<div class="gal-a"><div class="gal-h" style="--c:${c}">${logoHTML(a)}<span>${a.nombre}</span></div><div class="gal-g">${ims.map((m, k) => `<button data-a="${i}" data-k="${k}" style="--c:${c}" aria-label="Ver ${esc(m.cap)}"><img loading="lazy" decoding="async" width="480" height="600" src="${thumb(m.src)}" alt="${esc(m.cap)}"><small>${esc(m.cap.split(' · ').slice(1).join(' · '))}</small></button>`).join('')}</div></div>` : '';
  }).join('');
  $$('#galeria button').forEach(b => b.onclick = () => abrirLB(imagenesDe(ARTISTAS[+b.dataset.a]), +b.dataset.k));
}


// canción oficial: la API de YouTube solo se carga al entrar al primer capítulo
let YT_P = null, YT_LISTO = false, YT_PEND = null, ytCargando = false;
function cargarYT() {
  if (ytCargando) return; ytCargando = true;
  window.onYouTubeIframeAPIReady = () => {
    YT_P = new YT.Player('yt-player', { width: 256, height: 144, host: 'https://www.youtube-nocookie.com', playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, controls: 1 },
      events: { onReady: () => { YT_LISTO = true; if (YT_PEND) { const p = YT_PEND; YT_PEND = null; cancion(p); } } } });
  };
  const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.async = true; document.head.appendChild(s);
}
function cancion(artId) {
  const c = CANCION[artId]; const box = $('#yt-mini');
  if (!c) { cancionStop(); sfx.musica('tema_' + artId); return; }
  $('#yt-t').textContent = c.t; $('#yt-c').textContent = c.c;
  box.classList.add('show');
  if (!YT_LISTO) { YT_PEND = artId; cargarYT(); return; }
  try { YT_P.loadVideoById({ videoId: c.id }); YT_P.unMute(); YT_P.setVolume(80); YT_P.playVideo(); } catch { }
  sfx.musica('__silencio');
}
function cancionStop() {
  $('#yt-mini')?.classList.remove('show'); YT_PEND = null;
  try { YT_P?.pauseVideo(); } catch { }
}

// info de pieza
const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
function pick(ev, list) {
  ptr.x = (ev.clientX / innerWidth) * 2 - 1; ptr.y = -(ev.clientY / innerHeight) * 2 + 1; ray.setFromCamera(ptr, camera);
  return ray.intersectObjects(list.filter(r => r.visible), true).find(x => x.object.isMesh && !x.object.userData.isFill && x.object.visible);
}
function showInfo(m, ev) {
  const z = m.userData.zona; const info = ZONAS[z] || ZONAS.articulacion; const a = ARTISTAS[S.idx];
  const piel = pielDe(a, robots[S.idx].userData.modo); const spec = piel.z[z];
  const el = $('#info');
  el.innerHTML = `<div class="i-k">${info.libre ? 'ZONA PROTEGIDA' : 'PANEL FORRABLE'}</div><div class="i-n">${info.nombre}</div>
    <div class="i-t ${info.libre ? 'libre' : ''}">${info.trato}</div><p>${info.nota}</p>
    ${spec && !info.libre ? `<div class="i-s"><i style="background:${spec[0]}"></i>${FN[spec[1]] || spec[1]}</div>` : ''}`;
  el.classList.add('show');
  el.style.left = Math.min(ev.clientX + 18, innerWidth - 270) + 'px'; el.style.top = Math.min(ev.clientY + 18, innerHeight - 200) + 'px';
  if (m.material.emissive && !m.userData.libre) { const mm = m.material; mm.emissive.set(acentoActual()); mm.emissiveIntensity = 0.8; gsap.to(mm, { emissiveIntensity: 0, duration: 0.9 }); }
  sfx.blip();
}
function hideInfo() { $('#info')?.classList.remove('show'); }

// etiquetas del despiece
const LBL_Z = ['casco', 'visor', 'pecho', 'mochila', 'hombro', 'brazo', 'antebrazo', 'mano', 'cadera', 'muslo', 'rodilla', 'espinillera', 'bota'];
const lblEls = {}; const svg = $('#leaders');
const zonaParts = new Map(); // caché: zona -> mallas del robot activo
function buildLabels() {
  const box = $('#labels');
  LBL_Z.forEach(z => { const d = document.createElement('div'); d.className = 'lbl' + (ZONAS[z].libre ? ' libre' : ''); d.innerHTML = `<b>${ZONAS[z].nombre}</b><span>${ZONAS[z].trato}</span>`; box.appendChild(d); lblEls[z] = d; });
}
const tmpV = new THREE.Vector3();
function centroMundo(m) { if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere(); return tmpV.copy(m.geometry.boundingSphere.center).applyMatrix4(m.matrixWorld); }
const ANOT_Z = ['casco', 'pecho', 'brazo', 'muslo', 'bota'];
function anotar() {
  const a = ARTISTAS[S.idx], r = robots[S.idx]; const piel = pielDe(a, r.userData.modo);
  ANOT_Z.forEach(z => { const sp = piel.z[z]; const el = lblEls[z]; if (el && sp) el.querySelector('span').innerHTML = `<i class="dot" style="background:${sp[0]}"></i>${FN[sp[1]] || sp[1]}`; });
  gsap.killTweensOf(S, 'anotA'); S.anotA = 0;
  gsap.timeline().to(S, { anotA: 1, duration: 0.7, ease: 'expo.out' }).to(S, { anotA: 0, duration: 0.8, ease: 'power2.in', onComplete: () => ANOT_Z.forEach(z => { if (lblEls[z]) lblEls[z].querySelector('span').textContent = ZONAS[z].trato; }) }, 4.2);
}
let labelsOn = false;
function updateLabels() {
  const r = robots[S.idx]; const e0 = r ? r.userData.explode : 0; const anot = S.mode === 'garage' && e0 <= 0.3 && (S.anotA || 0) > 0.01 && !tourTL;
  const e = anot ? 0.3 + S.anotA / 3 : e0; const show = S.mode === 'garage' && (e0 > 0.3 || anot);
  if (!show) { if (labelsOn) { labelsOn = false; svg.innerHTML = ''; svg.style.opacity = 0; for (const z of LBL_Z) lblEls[z].style.opacity = 0; } return; }
  labelsOn = true;
  if (zonaParts.robot !== r) { zonaParts.clear(); zonaParts.robot = r; for (const z of LBL_Z) zonaParts.set(z, r.userData.parts.filter(m => m.userData.zona === z && !m.userData.isFill)); }
  let paths = ''; const pts = [];
  for (const z of LBL_Z) {
    const el = lblEls[z];
    const cands = zonaParts.get(z);
    if ((anot && !ANOT_Z.includes(z)) || !cands.length) { el.style.opacity = 0; continue; }
    let best = null, bx = -1e9;
    for (const m of cands) { centroMundo(m); tmpV.project(camera); if (tmpV.x > bx) { bx = tmpV.x; best = tmpV.clone(); } }
    pts.push({ el, sx: (best.x * 0.5 + 0.5) * innerWidth, sy: (-best.y * 0.5 + 0.5) * innerHeight });
  }
  if (pts.length) {
    pts.sort((p, q) => p.sy - q.sy);
    const colX = Math.min(Math.max(...pts.map(p => p.sx)) + 70, innerWidth - 196); let prev = 64; const maxY = innerHeight - 150; const op = Math.min(1, (e - 0.3) * 3);
    for (const p of pts) {
      const ly = Math.min(Math.max(p.sy, prev + 38), maxY); prev = ly;
      p.el.style.opacity = op; p.el.style.transform = `translate(${colX}px, ${ly - 12}px)`;
      paths += `<path d="M${p.sx | 0},${p.sy | 0} L${(colX - 24) | 0},${ly | 0} L${colX | 0},${ly | 0}" /><circle cx="${p.sx | 0}" cy="${p.sy | 0}" r="2.5"/>`;
    }
  }
  svg.innerHTML = paths; svg.style.opacity = Math.min(1, (e - 0.3) * 3);
}

// etiquetas de los dos (capítulo 01)
const tagEls = []; let tagH = 0;
function buildTags() {
  const box = $('#tags');
  ARTISTAS.forEach((a, i) => {
    const d = document.createElement('button'); d.className = 'tag'; d.type = 'button'; d.style.setProperty('--c', a.conceptos[0]?.acento || a.acento);
    d.setAttribute('aria-label', `Abrir el robot de ${a.nombre}`);
    d.innerHTML = `<div class="lg">${logoHTML(a)}</div><span class="cn">${esc(a.conceptos[0]?.nombre || 'EN DISEÑO')}</span><span class="ow">${MODELO.corto}</span><span class="go">ABRIR →</span>`;
    d.onmouseenter = d.onfocus = () => { if (S.mode === 'select' && S.idx !== i) { S.idx = i; highlight(i); sfx.hover(); } };
    d.onclick = () => goCh(1 + i);
    box.appendChild(d); tagEls.push(d);
  });
}
function updateTags() {
  if (S.mode !== 'select') return;
  robots.forEach((r, i) => { tmpV.set(r.position.x, -0.02, 0.35).project(camera); const x = (tmpV.x * 0.5 + 0.5) * innerWidth, y = Math.min((-tmpV.y * 0.5 + 0.5) * innerHeight, innerHeight - (tagH ||= tagEls[i].offsetHeight || 150) - 84); tagEls[i].style.transform = `translate(${x | 0}px, ${y | 0}px)`; });
}

// ================= CONTROLES =================
function syncDock() {
  $('#d-explode').value = S.explode * 100;
  $('#b-xray').classList.toggle('on', !!robots[S.idx]?.userData.xray);
  $('#b-rot').classList.toggle('on', S.auto);
  $('#b-xray').setAttribute('aria-pressed', !!robots[S.idx]?.userData.xray); $('#b-rot').setAttribute('aria-pressed', S.auto);
}
function toggleExplode() { const r = robots[S.idx]; S.explode = S.explode > 0.5 ? 0 : 1; setExplode(r, S.explode); sfx.explode(!S.explode); sfx.whoosh(); gsap.to($('#d-explode'), { value: S.explode * 100, duration: 1.2 }); }
function wireUI() {
  $('#d-explode').addEventListener('input', e => { S.explode = e.target.value / 100; gsap.killTweensOf(robots[S.idx].userData); robots[S.idx].userData.explode = S.explode; });
  $('#d-explode').addEventListener('change', () => sfx.explode(S.explode < 0.5));
  $('#b-xray').onclick = () => { const r = robots[S.idx]; setXray(r, !r.userData.xray); sfx.scan(0.4); syncDock(); $('#xray-legend').classList.toggle('show', r.userData.xray); };
  $('#b-rot').onclick = () => { S.auto = !S.auto; controls.autoRotate = S.auto; sfx.blip(); syncDock(); };
  $('#g-next').onclick = () => goCh(S.ch + 1); $('#g-prev').onclick = () => goCh(S.ch - 1);
  $('#b-tour').onclick = () => recorrido();
  $$('#g-mode button').forEach(b => b.onclick = async () => {
    const r = robots[S.idx]; if (!ARTISTAS[S.idx].conceptos.length) return;
    const toFab = b.dataset.v === 'fab'; if ((r.userData.modo === 'fabrica') === toFab) return;
    $$('#g-mode button').forEach(x => x.classList.toggle('on', x === b));
    await vestir(r, toFab ? 'fabrica' : S.concept[S.idx], true);
  });
  $('#snd').onclick = () => { const on = sfx.toggle(); $('#snd').classList.toggle('off', !on); $('#snd').setAttribute('aria-pressed', on); };
  $('#chapters').innerHTML = CH.map((c, i) => `<a href="#" role="button" data-i="${i}" style="--c:${c.k === 'garage' ? (ARTISTAS[c.i].conceptos[0]?.acento || ARTISTAS[c.i].acento) : '#e8c27a'}"><b>${String(i + 1).padStart(2, '0')}</b>${c.n}</a>`).join('');
  $$('#chapters a').forEach(a => a.onclick = e => { e.preventDefault(); goCh(+a.dataset.i); });
  $('#jump').innerHTML = ARTISTAS.map(a => `<button style="--c:${a.conceptos[0]?.acento || a.acento}">${a.nombre} →</button>`).join('');
  $$('#jump button').forEach((b, i) => b.onclick = () => goCh(1 + i));
  const tk = ['SEGUNDA PIEL', ...ARTISTAS.map(a => `${a.nombre} — ${a.conceptos[0]?.nombre || 'EN DISEÑO'}`), MODELO.nombre, 'PELÍCULA DE PROTECCIÓN, PANEL POR PANEL', 'NUNCA SE TAPA UN SENSOR', 'DISEÑO SOBRE EL MODELO OFICIAL'].join('  ·  ') + '  ·  ';
  $('#ticker-in').textContent = tk + tk + tk;

  let down = null, pend = null;
  canvas.addEventListener('pointermove', ev => {
    if (S.mode !== 'select' || pend) return; pend = ev;
    requestAnimationFrame(() => { // un raycast por frame como mucho
      const e = pend; pend = null;
      const h = pick(e, robots); const i = h ? robots.indexOf(rootOf(h.object)) : -1;
      if (i >= 0 && i !== S.idx) { S.idx = i; highlight(i); sfx.hover(); }
      canvas.style.cursor = i >= 0 ? 'pointer' : 'default';
    });
  });
  canvas.addEventListener('pointerdown', ev => down = { x: ev.clientX, y: ev.clientY });
  canvas.addEventListener('pointerup', ev => {
    if (down && S.mode === 'select' && Math.abs(ev.clientX - down.x) > 50 && Math.abs(ev.clientX - down.x) > Math.abs(ev.clientY - down.y)) {
      S.idx = (S.idx + (ev.clientX < down.x ? 1 : N - 1)) % N; highlight(S.idx); sfx.blip(); down = null; return;
    }
    if (!down || Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 6) return;
    if (S.mode === 'select') { const h = pick(ev, robots); if (h) goCh(1 + robots.indexOf(rootOf(h.object))); }
    else if (S.mode === 'garage') { const h = pick(ev, [robots[S.idx]]); if (h) showInfo(h.object, ev); else hideInfo(); }
  });
  addEventListener('keydown', e => {
    if (e.target.closest?.('input,textarea')) return;
    const k = e.key.toLowerCase();
    if ($('#lightbox').classList.contains('show')) { if (e.key === 'Escape') cerrarLB(); if (e.key === 'ArrowRight') moverLB(1); if (e.key === 'ArrowLeft') moverLB(-1); return; }
    if (k === 'f') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); return; }
    if (k === 'm') { $('#snd').click(); return; }
    if (S.mode === 'boot') { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') start(); return; }
    if (S.mode === 'intro') { if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'ArrowRight') introTL?.progress(1); return; }
    if (S.mode === 'piel' && (e.key === 'PageDown' || e.key === 'PageUp')) return; // scroll nativo
    if (e.key === 'ArrowRight' || e.key === 'PageDown') goCh(S.ch + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') goCh(S.ch - 1);
    if (S.mode === 'garage') {
      if (/^[1-9]$/.test(e.key)) pickConcept(+e.key - 1);
      if (k === 'e') toggleExplode();
      if (k === 'x') $('#b-xray').click();
      if (k === 'r') recorrido();
    }
  });
}
function rootOf(o) { while (o && !robots.includes(o)) o = o.parent; return o; }

// transición de cine sobre el 3D en vivo
function transition(mid, color = '#e8c27a', label = null) {
  const w = $('#wipe'); w.style.setProperty('--wc', color);
  const stk = $('#wp-stk'); stk.innerHTML = Array.from({ length: 14 }, () => `<i style="top:${6 + Math.random() * 88}%;height:${1 + Math.random() * 3}px;width:${20 + Math.random() * 50}vw"></i>`).join('');
  $('#wp-n').textContent = label ? label[0] : '';
  $('#wp-name').innerHTML = label ? [...label[1]].map(ch => `<span class="ch">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('') : '';
  const tl = gsap.timeline();
  if (label) document.body.classList.add('titulando');
  // el desenfoque CSS sobre un canvas a pantalla completa es caro: en móvil solo se oscurece
  const fx0 = MOVIL ? 'brightness(1)' : 'blur(0px) brightness(1) saturate(1)', fx1 = MOVIL ? 'brightness(1.6)' : 'blur(14px) brightness(1.5) saturate(1.4)';
  tl.set(w, { display: 'block' })
    .fromTo(canvas, { filter: fx0 }, { filter: fx1, duration: 0.38, ease: 'power3.in' }, 0)
    .fromTo('#wp-b', { opacity: 0, scale: 0.6 }, { opacity: 0.85, scale: 1.4, duration: 0.42, ease: 'power2.in' }, 0)
    .fromTo('#wp-stk i', { xPercent: -120, opacity: 0 }, { xPercent: 420, opacity: 1, duration: 0.7, stagger: { each: 0.025, from: 'random' }, ease: 'power3.inOut' }, 0.02)
    .add(() => mid(), 0.4)
    .to('#wp-b', { opacity: 0, scale: 2.2, duration: 0.8, ease: 'expo.out' }, 0.42)
    .to(canvas, { filter: fx0, duration: 0.9, ease: 'expo.out' }, 0.42);
  if (label) {
    tl.fromTo('#wp-n', { opacity: 0, y: 20, letterSpacing: '1.4em' }, { opacity: 1, y: 0, letterSpacing: '.45em', duration: 0.8, ease: 'expo.out' }, 0.35)
      .fromTo('#wp-name .ch', { opacity: 0, yPercent: 60, rotateX: -90, filter: 'blur(12px)', scale: 1.3 }, { opacity: 1, yPercent: 0, rotateX: 0, filter: 'blur(0px)', scale: 1, duration: 0.7, stagger: 0.035, ease: 'expo.out' }, 0.4)
      .fromTo('#wp-line', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.45)
      .to('#wp-name .ch', { opacity: 0, yPercent: -40, filter: 'blur(10px)', duration: 0.45, stagger: 0.02, ease: 'power2.in' }, 1.45)
      .to(['#wp-n', '#wp-line'], { opacity: 0, duration: 0.4 }, 1.5);
  }
  tl.add(() => document.body.classList.remove('titulando'), label ? 1.75 : 0.5);
  tl.set(w, { display: 'none' }).set(['#wp-n', '#wp-line'], { opacity: 1 }).set(canvas, { filter: 'none' });
}

// tarjeta con la imagen fotorreal, con inclinación al mouse
function tarjeta(el, a, c) {
  const file = c && a.renders?.[slug(c.nombre)];
  clearInterval(el._t);
  if (!file) { el.classList.remove('show'); return; }
  const img = el.querySelector('img');
  if (img.dataset.src !== file) { gsap.fromTo(img, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }); img.src = file; img.dataset.src = file; img.alt = `${a.nombre} · ${titulo(c.nombre)}`; }
  const abrir = () => { const ims = imagenesDe(a); abrirLB(ims, Math.max(0, ims.findIndex(x => x.src === img.dataset.src))); };
  const cap = el.querySelector('figcaption'); if (cap) { cap.innerHTML = `<b>${esc(titulo(c.nombre))}</b><span>${a.nombre}</span><button class="lb-btn">⤢ Abrir imagen completa</button>`; cap.querySelector('.lb-btn').onclick = (e) => { e.stopPropagation(); abrir(); }; }
  el.querySelector('.tilt').onclick = abrir;
  el.style.setProperty('--c', c.acento || a.acento);
  el.classList.add('show');
  const back = a.renders?.[slug(c.nombre) + '_espalda'];
  if (back && !REDUCIDO) { new Image().src = back; let f = true; el._t = setInterval(() => { if (document.hidden) return; f = !f; const s = f ? file : back; gsap.to(img, { opacity: 0, duration: 0.4, onComplete: () => { img.src = s; img.dataset.src = s; gsap.to(img, { opacity: 1, duration: 0.6 }); } }); }, 4200); }
}
const tilts = $$('.tilt'); let tiltEv = null;
if (matchMedia('(pointer:fine)').matches && !REDUCIDO) addEventListener('pointermove', e => {
  if (tiltEv) { tiltEv = e; return; } tiltEv = e;
  requestAnimationFrame(() => {
    const ev = tiltEv; tiltEv = null;
    const rx = (ev.clientY / innerHeight - 0.5) * -10, ry = (ev.clientX / innerWidth - 0.5) * 14;
    for (const t of tilts) { if (!t.offsetParent) continue; t.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`; t.style.setProperty('--gx', (ev.clientX / innerWidth * 100) + '%'); }
  });
}, { passive: true });

// ================= LA PIEL =================
let pielIO = null;
function openPiel() {
  const p = $('#piel'); p.scrollTop = 0; p.focus({ preventScroll: true });
  pielIO ??= new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; e.target.classList.add('in');
    const v = e.target.querySelector('video[data-src]'); if (v) { v.src = v.dataset.src; v.removeAttribute('data-src'); v.play().catch(() => { }); }
  }), { root: p, threshold: 0.2 });
  $$('#piel .rv').forEach(x => { pielIO.unobserve(x); pielIO.observe(x); });
  setTimeout(() => $$('#piel .rv').forEach(x => { const b = x.getBoundingClientRect(); if (b.top < innerHeight * 0.9 && b.bottom > 0) x.classList.add('in'); }), 700);
}

// ================= PORTADA =================
const BOOT_LINES = ['CARGANDO MODELO OFICIAL ' + MODELO.nombre, 'PANELES Y ZONAS SIN FORRAR', 'PIELES DE WESTCOL · BLESSD', 'LISTO'];
async function boot() {
  $('.cover h1').innerHTML = [...'Segunda '].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('') + '<em>' + [...'piel.'].map(c => `<span class="ch">${c}</span>`).join('') + '</em>';
  gsap.fromTo('.cover h1 .ch', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.04, ease: 'expo.out', delay: 0.05 });
  gsap.fromTo(['.lockup > *', '.who'], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'expo.out', delay: 0.3 });
  const log = $('#boot-log'); const bar = $('#boot-bar i'); const pct = $('#boot-pct');
  const fontsP = Promise.race([Promise.all(['400 40px "Bodoni Moda"', 'italic 600 40px "Bodoni Moda"', '400 40px "Pirata One"', '900 40px Unbounded', '700 20px "JetBrains Mono"'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]).catch(() => { });
  let fake = 0, li = 0;
  const tick = setInterval(() => {
    fake = Math.min(fake + Math.random() * 3, 60);
    const p = Math.min(96, Math.max(fake, progreso.glb * 96));
    bar.style.transform = `scaleX(${p / 100})`; pct.textContent = String(Math.floor(p)).padStart(3, '0');
    if (li < BOOT_LINES.length - 1 && p > li * 30) { const d = document.createElement('div'); d.textContent = BOOT_LINES[li++]; log.appendChild(d); }
  }, 110);
  try { await fontsP; await construir(); }
  catch (e) { clearInterval(tick); log.innerHTML = '<div class="err">No se pudo cargar el modelo 3D. Revisa tu conexión y recarga la página.</div>'; console.error(e); return; }
  buildLabels(); buildTags(); wireUI(); armarGaleria();
  $('#lightbox .lb-x').onclick = cerrarLB; $('#lightbox .lb-p').onclick = () => moverLB(-1); $('#lightbox .lb-n').onclick = () => moverLB(1); $('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') cerrarLB(); });
  clearInterval(tick); const d = document.createElement('div'); d.textContent = BOOT_LINES[BOOT_LINES.length - 1]; log.appendChild(d);
  bar.style.transform = 'scaleX(1)'; pct.textContent = '100';
  // portada viva: el estudio en penumbra, los dos en silueta y la cámara que se acerca
  LUZ0 = { k: key.intensity, r: rim1.intensity, h: scene.environmentIntensity };
  key.intensity = 0.06; rim1.intensity = 0.8; scene.environmentIntensity = 0.16; backdrop('#e8c27a', 0.14);
  robots.forEach(r => vestir(r, 'fabrica')); stands.forEach(s => { s.spot.intensity = 0.7; });
  camera.position.set(0, 1.15, 9); look.set(0, 1.0, 0);
  gsap.to(camera.position, { z: 6.2, y: 0.75, duration: 26, ease: 'sine.inOut' });
  gsap.to('#boot', { '--bgA': 0.0, duration: 2.4, ease: 'power2.inOut' });
  $('#boot').classList.add('ready');
  gsap.fromTo(['#press', '.press-sub'], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, delay: 0.9, ease: 'expo.out' });
  $('#press').disabled = false; $('#press').onclick = start; $('#press').focus({ preventScroll: true });
}
let started = false, introTL = null, introT = [], LUZ0 = null;
function start() {
  if (started || !robots.length) return; started = true; sfx.init();
  gsap.to('#boot', { opacity: 0, duration: 0.8, ease: 'power2.inOut', onComplete: () => $('#boot').remove() });
  intro();
}
// INTRO: el estudio a oscuras; a cada robot le cae su luz, su logo y el escáner le pone la piel
function intro() {
  S.mode = 'intro'; document.body.dataset.mode = 'intro';
  robots.forEach((r, i) => { r.position.set(POS[i], 0, 0); r.rotation.y = -POS[i] * 0.15; vestir(r, 'fabrica'); stands[i].g.position.x = POS[i]; });
  stands.forEach(s => { s.spot.intensity = 0; s.glow.material.opacity = 0; });
  const k0 = LUZ0?.k ?? key.intensity, r0 = LUZ0?.r ?? rim1.intensity, h0 = LUZ0?.h ?? scene.environmentIntensity; gsap.killTweensOf(camera.position);
  key.intensity = 0.05; rim1.intensity = 0.5; scene.environmentIntensity = 0.12; backdrop('#e8c27a', 0.04);
  camera.position.set(0.5, 0.25, 8.5); look.set(0, 0.95, 0);
  gsap.set(['#top', '#bottom'], { opacity: 0 });
  gsap.fromTo('.io-bars i', { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: 'expo.out' });
  const tl = gsap.timeline({ onComplete: () => finIntro(k0, r0, h0) }); introTL = tl;
  tl.fromTo('#io-top', { opacity: 0, letterSpacing: '1.2em' }, { opacity: 1, letterSpacing: '.45em', duration: 2.2, ease: 'expo.out' }, 0.4)
    .to(camera.position, { x: 0, z: 6, y: 0.55, duration: 2.6, ease: 'power2.inOut' }, 0)
    .to('#io-top', { opacity: 0, duration: 0.5 }, 2.3);
  const T = 2.4, step = 3.0;
  ARTISTAS.forEach((art, i) => {
    const t0 = T + i * step;
    tl.add(() => golpe(i), t0)
      .to(camera.position, { x: POS[i] + 0.55, y: 1.05, z: 3.3, duration: 1.1, ease: 'expo.out' }, t0)
      .to(look, { x: POS[i] - 0.15, y: 0.95, z: 0, duration: 1.1, ease: 'expo.out' }, t0)
      .to(camera.position, { x: POS[i] - 0.35, duration: step - 1.1, ease: 'none' }, t0 + 1.1);
  });
  const tEnd = T + N * step;
  tl.add(() => {
    sfx.boom(); setAcc('#e8c27a'); backdrop('#e8c27a', 0.22);
    stands.forEach(s => gsap.to(s.spot, { intensity: 4, duration: 0.8 }));
    gsap.to(key, { intensity: k0, duration: 1.6 }); gsap.to(rim1, { intensity: r0, duration: 1.6 }); gsap.to(scene, { environmentIntensity: h0, duration: 1.6 });
    $('#io-logo').innerHTML = ''; palabras($('#io-name'), 'Segunda piel.'); $('#io-sub').textContent = 'WESTCOL × BLESSD · ' + MODELO.nombre;
    gsap.fromTo('.io-c', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' });
  }, tEnd)
    .to(camera.position, { x: -0.55, y: 1.15, z: 5.4, duration: 2.6, ease: 'power3.inOut' }, tEnd)
    .to(look, { x: -0.55, y: 0.86, z: 0, duration: 2.6, ease: 'power3.inOut' }, tEnd)
    .to('.io-c', { opacity: 0, duration: 0.6 }, tEnd + 2.1)
    .to({}, { duration: 0.1 }, tEnd + 2.7);
  $('#io-skip').onclick = () => tl.progress(1);
}
function golpe(i) {
  const a = ARTISTAS[i], c = a.conceptos[0], col = c?.acento || a.acento;
  sfx.boom(); setAcc(col); backdrop(col, 0.2);
  stands.forEach((s, k) => gsap.to(s.spot, { intensity: k === i ? 10 : (k < i ? 1.2 : 0), duration: k === i ? 0.12 : 0.6 }));
  gsap.fromTo(stands[i].glow.material, { opacity: 0.9 }, { opacity: 0.35, duration: 1.2 });
  $('#io-logo').innerHTML = logoHTML(a);
  palabras($('#io-name'), c ? titulo(c.nombre) + '.' : a.nombre);
  $('#io-sub').textContent = `${a.nombre} · ${MODELO.nombre}`;
  gsap.fromTo('.io-c', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
  gsap.to('.io-c', { opacity: 0, y: -10, duration: 0.4, delay: 2.4 });
  introT.push(setTimeout(() => { if (S.mode === 'intro') vestir(robots[i], S.concept[i], true); }, 380));
}
function finIntro(k0, r0, h0) {
  introT.forEach(clearTimeout); introT = [];
  key.intensity = k0; rim1.intensity = r0; scene.environmentIntensity = h0;
  gsap.to('.io-bars i', { scaleY: 0, duration: 1, ease: 'expo.inOut' }); gsap.to('.io-c', { opacity: 0, duration: 0.3 });
  goCh(0, true);
  gsap.to(['#top', '#bottom'], { opacity: 1, duration: 1.2, delay: 0.3 });
  gsap.fromTo('.sel-head > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out', delay: 0.4 });
}

// ================= LOOP =================
// No se dibuja el 3D cuando algo opaco lo tapa (cierre, tráiler, visor, scroll de La piel).
function tapado() {
  if ($('#lightbox').classList.contains('show')) return true;
  if (S.mode === 'cierre' && performance.now() - S.modoT > 1500) return true;
  if (S.mode === 'piel' && $('#piel').scrollTop > innerHeight * 0.5) return true;
  return false;
}
// resolución adaptativa: si el equipo no llega a ~45 fps baja el DPR; si va sobrado lo sube
const Q = { n: 0, acc: 0, last: 0 };
function calidad(now) {
  if (Q.last) { Q.acc += now - Q.last; Q.n++; } Q.last = now;
  if (Q.n < 60) return;
  const avg = Q.acc / Q.n; Q.n = Q.acc = 0;
  let nd = dpr;
  if (avg > 22 && dpr > 0.7) nd = Math.max(0.7, dpr - 0.15);
  else if (avg < 17.5 && dpr < DPR_MAX) nd = Math.min(DPR_MAX, dpr + 0.1);
  if (nd !== dpr) { dpr = nd; renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr); resize(); }
}
const clock = new THREE.Clock(); let frameN = 0;
renderer.shadowMap.autoUpdate = false;
function loop(now) {
  requestAnimationFrame(loop);
  if (tapado()) { Q.last = 0; return; }
  const t = clock.getElapsedTime();
  for (const m of holoMats) { m.iridescenceThicknessRange = [180 + Math.sin(t * 0.9) * 120, 900 + Math.cos(t * 0.6) * 380]; }
  robots.forEach((r, i) => {
    if (!r.visible) return;
    const u = r.userData; const e = u.explode;
    if (e > 0.0005 || u._e !== e) {
      for (const m of u.parts) {
        const b = m.userData.base; if (!b) continue;
        const bob = e * Math.sin(t * 1.3 + m.userData.seed) * 0.015;
        m.position.set(b.x + m.userData.dir.x * e, b.y + m.userData.dir.y * e + bob, b.z + m.userData.dir.z * e);
        if (!m.matrixAutoUpdate) m.updateMatrix();
      }
      u._e = e;
    }
    u.body.position.y = Math.sin(t * 1.4 + i) * 0.003 + e * 0.32;
    u.body.rotation.y = THREE.MathUtils.lerp(u.body.rotation.y, S.mode === 'select' ? S.mx * 0.6 : 0, 0.05);
  });
  particles.rotation.y = t * 0.008; estudio.update(t);
  if (S.mode === 'garage') {
    if (gsap.isTweening(look) || gsap.isTweening(camera.position)) { controls.target.copy(look); camera.lookAt(look); }
    else controls.update();
  } else camera.lookAt(look.x + S.mx * 0.3, look.y - S.my * 0.12, look.z);
  updateLabels(); updateTags();
  // la sombra de contacto apenas cambia: se recalcula cada 2 frames (cada frame durante el despiece)
  renderer.shadowMap.needsUpdate = (++frameN & 1) === 0 || robots.some(r => r.visible && r.userData.explode > 0.001 && r.userData.explode < 0.999);
  composer.render();
  if (S.mode !== 'boot') calidad(now);
}
addEventListener('pointermove', e => { S.mx = e.clientX / innerWidth - 0.5; S.my = e.clientY / innerHeight - 0.5; }, { passive: true });

function resize() {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); bloom.setSize(innerWidth / 2, innerHeight / 2); estudio.resize(innerWidth, innerHeight);
}
let rzT = 0; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(resize, 120); });

// cursor propio (solo con mouse)
if (matchMedia('(pointer:fine)').matches && !REDUCIDO) {
  const cur = document.createElement('div'); cur.id = 'cursor'; cur.innerHTML = '<i></i>'; cur.setAttribute('aria-hidden', 'true'); document.body.appendChild(cur);
  const cp = { x: innerWidth / 2, y: innerHeight / 2 }, tp = { ...cp };
  addEventListener('pointermove', e => { tp.x = e.clientX; tp.y = e.clientY; const it = e.target.closest('button,a,.tag,.tab,input,.tilt'); cur.classList.toggle('big', !!it || canvas.style.cursor === 'pointer'); }, { passive: true });
  gsap.ticker.add(() => { const dx = tp.x - cp.x, dy = tp.y - cp.y; if (Math.abs(dx) + Math.abs(dy) < 0.1) return; cp.x += dx * 0.2; cp.y += dy * 0.2; cur.style.transform = `translate(${cp.x}px, ${cp.y}px)`; });
  document.documentElement.classList.add('cur');
}
boot(); requestAnimationFrame(loop);
if (import.meta.env.DEV) window.__sp = { renderer, scene, robots, S, get dpr() { return dpr; } };
