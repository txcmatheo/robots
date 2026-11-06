// estudio.js - Estudio de presentación fotorrealista (Three.js r169, todo procedural)
// Ciclorama circular con coving, piso pulido con reflejo borroso, softbox cenital,
// tiras de luz en pedestal, acento de color configurable, bruma sutil y polvo.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

// ---------------------------------------------------------------- utilidades
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function canvasTex(w, h, draw, srgb = false) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}
const PISO_TEX = 1024;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

// ruido suave multi-escala en canvas (nubes) - base de concreto pulido
function nubes(ctx, w, h, rnd, { base, amp, escalas, speckle }) {
  ctx.fillStyle = `rgb(${base},${base},${base})`;
  ctx.fillRect(0, 0, w, h);
  escalas.forEach(([n, a]) => {
    const s = document.createElement('canvas'); s.width = s.height = n;
    const sc = s.getContext('2d'); const id = sc.createImageData(n, n);
    for (let i = 0; i < n * n; i++) { const v = rnd() * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    sc.putImageData(id, 0, 0);
    ctx.globalAlpha = a * amp; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    // tileable: se dibuja 3x3 desplazado para que no se noten las costuras
    ctx.drawImage(s, 0, 0, w, h);
  });
  ctx.globalAlpha = 1;
  if (speckle) {
    const id = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) { const v = (rnd() - 0.5) * speckle; id.data[i * 4] += v; id.data[i * 4 + 1] += v; id.data[i * 4 + 2] += v; }
    ctx.putImageData(id, 0, 0);
  }
}

function glowTex(size = 64) {
  return canvasTex(size, size, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
  }, true);
}

// ------------------------------------------------------------- shaders
const REFLEJO_VS = /* glsl */`
uniform mat4 textureMatrix;
varying vec4 vUv;
varying vec3 vW;
void main(){
  vUv = textureMatrix * vec4(position, 1.0);
  vW = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const REFLEJO_FS = /* glsl */`
uniform vec3 color;
uniform sampler2D tDiffuse;
uniform sampler2D tNoise;
uniform float uStrength;
uniform float uBlur;
uniform vec2 uFade;
varying vec4 vUv;
varying vec3 vW;
#include <common>
void main(){
  // microrrelieve del piso: distorsiona un poco el reflejo
  vec2 n1 = texture2D(tNoise, vW.xz * 0.23).rg - 0.5;
  vec2 n2 = texture2D(tNoise, vW.xz * 1.3 + 0.37).rg - 0.5;
  vec2 nn = n1 * 0.0035 + n2 * 0.0012;

  vec3 V = normalize(cameraPosition - vW);
  float cs = clamp(V.y, 0.0, 1.0);
  float F = 0.10 + 0.90 * pow(1.0 - cs, 3.0);

  // desenfoque anisotropico (el reflejo se estira en vertical, como en epoxico pulido)
  float dist = length(cameraPosition - vW);
  float b = uBlur * (0.8 + 0.5 * smoothstep(1.0, 9.0, dist));
  const int N = 12;
  vec2 P[12];
  P[0]=vec2(-0.326,-0.406); P[1]=vec2(-0.840,-0.074); P[2]=vec2(-0.696,0.457); P[3]=vec2(-0.203,0.621);
  P[4]=vec2(0.962,-0.195);  P[5]=vec2(0.473,-0.480);  P[6]=vec2(0.519,0.767);  P[7]=vec2(0.185,-0.893);
  P[8]=vec2(0.507,0.064);   P[9]=vec2(0.896,0.412);   P[10]=vec2(-0.322,-0.933);P[11]=vec2(-0.792,-0.598);
  vec3 acc = texture2DProj(tDiffuse, vUv + vec4(nn * vUv.w, 0.0, 0.0)).rgb * 0.5;
  for (int i = 0; i < N; i++) {
    vec2 o = P[i] * vec2(0.55, 1.9) * b;
    acc += texture2DProj(tDiffuse, vUv + vec4((nn + o) * vUv.w, 0.0, 0.0)).rgb;
  }
  acc /= (float(N) + 0.5);

  float r = length(vW.xz);
  float fade = 1.0 - smoothstep(uFade.x, uFade.y, r);
  vec3 col = acc * F * uStrength * fade;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const BRUMA_VS = /* glsl */`
varying vec3 vN; varying vec3 vV; varying float vH;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vH = uv.y;               // 1 arriba (softbox) -> 0 abajo (piso)
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const BRUMA_FS = /* glsl */`
uniform vec3 uColor; uniform float uI;
varying vec3 vN; varying vec3 vV; varying float vH;
void main(){
  float d = clamp(abs(dot(normalize(vN + 1e-5), normalize(vV + 1e-5))), 1e-4, 1.0);
  float edge = pow(d, 1.6);
  float along = pow(clamp(vH, 1e-4, 1.0), 1.4);
  gl_FragColor = vec4(uColor * uI * edge * along, 1.0);
}`;

const WASH_VS = /* glsl */`
varying vec3 vW;
void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const WASH_FS = /* glsl */`
uniform vec3 uColor; uniform float uI;
varying vec3 vW;
void main(){
  float h = max(vW.y, 0.0);
  float g = pow(1.0 - smoothstep(0.0, 4.2, h), 2.4);
  float az = atan(vW.x, vW.z);
  float lobo = 0.35 + 0.65 * (0.5 + 0.5 * cos(2.0 * (az - 3.14159265)));
  gl_FragColor = vec4(uColor * uI * g * lobo, 1.0);
}`;

// ----------------------------------------------------------- entorno (PMREM)
function construirEntorno(renderer, layout) {
  const s = new THREE.Scene();
  const c = (v) => new THREE.Color(v, v, v);
  const mats = [0.030, 0.030, 0.012, 0.050, 0.030, 0.030].map(v => new THREE.MeshBasicMaterial({ color: c(v), side: THREE.BackSide, toneMapped: false }));
  const room = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 26), mats);
  room.position.y = 4.1; s.add(room);
  const panel = (w, h, v, pos, look, tint) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: tint ? new THREE.Color(tint).multiplyScalar(v) : c(v), side: THREE.DoubleSide, toneMapped: false }));
    m.position.copy(pos); if (look) m.lookAt(look); s.add(m); return m;
  };
  const oy = -0.9; // el origen del entorno esta a la altura del pecho del robot
  panel(layout.top.w, layout.top.h, 9, new THREE.Vector3(0, layout.top.y + oy, 0.4), null).rotation.x = Math.PI / 2;
  layout.strips.forEach(st => panel(st.w, st.h, 14, new THREE.Vector3(st.x, st.y + oy, st.z), new THREE.Vector3(0, st.y + oy, 0)));
  // tarjeta de rebote frontal, suave y tenue (para que el blanco no muera por delante)
  panel(9, 3, 0.9, new THREE.Vector3(0, 1.0 + oy + 0.4, 8.5), new THREE.Vector3(0, 0.9 + oy, 0));
  // tira baja en el piso trasero: da un reflejo largo en las piezas bajas
  panel(10, 0.12, 4, new THREE.Vector3(0, 0.15 + oy, -9.5), new THREE.Vector3(0, 0.15 + oy, 0));
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.035);
  pm.dispose();
  s.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  return rt.texture;
}

// ------------------------------------------------------------------ estudio
export function crearEstudio(scene, renderer) {
  RectAreaLightUniformsLib.init();

  const R1 = 9.0;       // el piso plano llega a este radio y empieza el coving
  const CV = 2.6;       // radio de la curva
  const R2 = R1 + CV;   // radio de la pared
  const HCEIL = 9.5;
  const grupo = new THREE.Group();
  grupo.name = 'estudio';
  scene.add(grupo);

  const rnd = mulberry(7);

  // ---- layout de luces (compartido con el entorno)
  const layout = {
    top: { w: 6.4, h: 3.2, y: 4.5 },
    strips: [],
  };
  const stripR = 5.6, stripH = 3.4, stripW = 0.32, stripY = 1.9;
  [[155, true], [-155, true], [62, false], [-62, false]].forEach(([deg, rear]) => {
    const a = THREE.MathUtils.degToRad(deg);
    layout.strips.push({ x: Math.sin(a) * stripR, z: Math.cos(a) * stripR, y: stripY, w: stripW, h: stripH, rear });
  });

  // ---- entorno de reflejos
  const environment = construirEntorno(renderer, layout);
  scene.environment = environment;
  scene.environmentIntensity = 0.7;
  scene.background = new THREE.Color(0x040405);

  // ---- texturas del piso
  const texColor = canvasTex(PISO_TEX, PISO_TEX, (ctx, w, h) => {
    nubes(ctx, w, h, rnd, { base: 168, amp: 0.55, escalas: [[5, 0.3], [12, 0.25], [36, 0.2], [110, 0.12]], speckle: 8 });
    // juntas de losa cada 3 m, muy tenues
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    for (let i = 1; i < 6; i++) { ctx.fillRect(i * w / 6 - 1, 0, 2, h); ctx.fillRect(0, i * h / 6 - 1, w, 2); }
  }, true);
  texColor.wrapS = texColor.wrapT = THREE.ClampToEdgeWrapping;
  const texRough = canvasTex(PISO_TEX, PISO_TEX, (ctx, w, h) => {
    nubes(ctx, w, h, rnd, { base: 122, amp: 0.6, escalas: [[5, 0.4], [14, 0.3], [48, 0.2]], speckle: 14 });
  });
  texRough.wrapS = texRough.wrapT = THREE.ClampToEdgeWrapping;
  const texNoise = canvasTex(256, 256, (ctx, w, h) => {
    const id = ctx.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { id.data[i * 4] = rnd() * 255; id.data[i * 4 + 1] = rnd() * 255; id.data[i * 4 + 2] = 128; id.data[i * 4 + 3] = 255; }
    // suavizado por escalado
    const t = document.createElement('canvas'); t.width = t.height = 32;
    const tc = t.getContext('2d'); const small = tc.createImageData(32, 32);
    for (let i = 0; i < 32 * 32; i++) { small.data[i * 4] = rnd() * 255; small.data[i * 4 + 1] = rnd() * 255; small.data[i * 4 + 2] = 128; small.data[i * 4 + 3] = 255; }
    tc.putImageData(small, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(t, 0, 0, w, h);
  });

  // ---- geometria: piso (lathe de afuera hacia el centro => normales hacia arriba)
  // caida de luz natural (radial + con la altura) inyectada al final del shader del material
  const caidaGLSL = 'float fr = mix(1.0, 0.05, smoothstep(1.5, 9.8, r)); float fy = mix(1.0, 0.12, smoothstep(0.3, 7.0, wp.y)); return fr * fy;';
  const conCaida = (mat) => {
    mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(position, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nfloat caidaEstudio(vec3 wp){ float r = length(wp.xz); ' + caidaGLSL + ' }')
        .replace('#include <opaque_fragment>', 'outgoingLight *= caidaEstudio(vWP);\n#include <opaque_fragment>');
    };
    return mat;
  };

  const pisoPts = [];
  for (let i = 0; i <= 90; i++) { const r = R1 * (1 - i / 90); pisoPts.push(new THREE.Vector2(Math.max(r, 0.0001), 0)); }
  const pisoGeo = new THREE.LatheGeometry(pisoPts, 128);
  { // uv planares para las texturas del piso
    const p = pisoGeo.attributes.position, uv = pisoGeo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (2 * R1) + 0.5, p.getZ(i) / (2 * R1) + 0.5);
  }
  const pisoMat = conCaida(new THREE.MeshStandardMaterial({
    color: 0x3a3c42, map: texColor, roughnessMap: texRough, roughness: 0.55, metalness: 0.0,
    envMap: environment, envMapIntensity: 0.5,
  }));
  const piso = new THREE.Mesh(pisoGeo, pisoMat);
  piso.receiveShadow = true;
  grupo.add(piso);

  // ---- ciclorama: pared + coving, de arriba hacia abajo (normales hacia adentro)
  const cycFull = [];
  for (let i = 0; i < 24; i++) cycFull.push(new THREE.Vector2(R2, HCEIL - (HCEIL - CV - 0.5) * (i / 24)));
  cycFull.push(new THREE.Vector2(R2, CV));
  for (let i = 1; i <= 48; i++) {
    const phi = (1 - i / 48) * Math.PI / 2;           // pi/2 (pared) -> 0 (piso)
    cycFull.push(new THREE.Vector2(R1 + CV * Math.sin(phi), CV - CV * Math.cos(phi)));
  }
  const cycGeo = new THREE.LatheGeometry(cycFull, 128);
  const cycMat = conCaida(new THREE.MeshStandardMaterial({
    color: 0x2b2d32, roughness: 0.86, metalness: 0.0,
    envMap: environment, envMapIntensity: 0.35,
  }));
  const cyc = new THREE.Mesh(cycGeo, cycMat);
  cyc.receiveShadow = true;
  grupo.add(cyc);

  // techo negro
  const techo = new THREE.Mesh(new THREE.CircleGeometry(R2 + 0.2, 64), new THREE.MeshBasicMaterial({ color: 0x010101 }));
  techo.rotation.x = Math.PI / 2; techo.position.y = HCEIL; grupo.add(techo);

  // ---- reflejo del piso (Reflector con shader propio: borroso, fresnel, desvanecido)
  const size = new THREE.Vector2(); renderer.getSize(size);
  const dpr = Math.min(renderer.getPixelRatio(), 2);
  const MOVIL = matchMedia('(pointer:coarse)').matches || Math.min(innerWidth, innerHeight) < 700;
  const REFL_ESCALA = MOVIL ? 0.35 : 0.5;
  const reflejo = new Reflector(new THREE.CircleGeometry(R1 - 0.2, 96), {
    textureWidth: Math.max(2, Math.floor(size.x * dpr * REFL_ESCALA)),
    textureHeight: Math.max(2, Math.floor(size.y * dpr * REFL_ESCALA)),
    clipBias: 0.003, multisample: MOVIL ? 0 : 4,
    shader: {
      name: 'ReflejoPiso',
      uniforms: {
        color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, tNoise: { value: null },
        uStrength: { value: 0.42 }, uBlur: { value: 0.0095 }, uFade: { value: new THREE.Vector2(3.2, 8.6) },
      },
      vertexShader: REFLEJO_VS, fragmentShader: REFLEJO_FS,
    },
  });
  reflejo.rotation.x = -Math.PI / 2;
  reflejo.position.y = 0.004;
  reflejo.material.uniforms.tNoise.value = texNoise;
  reflejo.material.transparent = true;
  reflejo.material.blending = THREE.AdditiveBlending;   // un reflejo SUMA luz sobre el piso oscuro
  reflejo.material.depthWrite = false;
  reflejo.renderOrder = 1;
  grupo.add(reflejo);

  // ---- iluminacion
  const negro = new THREE.MeshStandardMaterial({ color: 0x060607, roughness: 0.55, metalness: 0.35, envMap: environment, envMapIntensity: 0.4 });

  // softbox cenital
  const top = new THREE.Group();
  top.position.set(0, layout.top.y, 0.4);
  const rl = new THREE.RectAreaLight(0xfff6ec, 0.42, layout.top.w, layout.top.h);
  rl.rotation.x = -Math.PI / 2;    // emite hacia abajo
  top.add(rl);
  const panelTex = canvasTex(256, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w * 0.62);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#e9e9ea'); g.addColorStop(1, '#bdbdc0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // costillas de la tela difusora
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let x = 0; x < w; x += 16) ctx.fillRect(x, 0, 1, h);
  }, true);
  panelTex.wrapS = panelTex.wrapT = THREE.ClampToEdgeWrapping;
  const panelMat = new THREE.MeshBasicMaterial({ map: panelTex, toneMapped: false });
  panelMat.color.setScalar(1.35);
  const tpanel = new THREE.Mesh(new THREE.PlaneGeometry(layout.top.w, layout.top.h), panelMat);
  tpanel.rotation.x = Math.PI / 2;  // cara visible hacia abajo
  tpanel.position.y = -0.02;
  top.add(tpanel);
  // caja del softbox (marco + fondo)
  const caja = new THREE.Mesh(new THREE.BoxGeometry(layout.top.w + 0.28, 0.38, layout.top.h + 0.28), negro);
  caja.position.y = 0.18; top.add(caja);
  const borde = new THREE.Mesh(new THREE.BoxGeometry(layout.top.w + 0.12, 0.05, layout.top.h + 0.12), negro);
  borde.position.y = 0.0; top.add(borde); // el marco cubre el borde del panel
  // el panel queda 'hundido' en la caja: se tapa el borde con un marco hueco
  caja.geometry.dispose();
  top.remove(caja);
  const marco = new THREE.Group();
  const mk = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), negro); m.position.set(x, y, z); marco.add(m); };
  const W = layout.top.w, Hh = layout.top.h, t = 0.07, dp = 0.42;
  mk(W + 2 * t, dp, t, 0, dp / 2 - 0.02, Hh / 2 + t / 2); mk(W + 2 * t, dp, t, 0, dp / 2 - 0.02, -Hh / 2 - t / 2);
  mk(t, dp, Hh, W / 2 + t / 2, dp / 2 - 0.02, 0); mk(t, dp, Hh, -W / 2 - t / 2, dp / 2 - 0.02, 0);
  mk(W + 2 * t, 0.05, Hh + 2 * t, 0, dp - 0.02, 0);
  top.remove(borde); borde.geometry.dispose();
  top.add(marco);
  // cables de suspension
  const cabM = new THREE.MeshBasicMaterial({ color: 0x0a0a0b });
  [[-W / 2 + 0.3, -Hh / 2 + 0.2], [W / 2 - 0.3, -Hh / 2 + 0.2], [-W / 2 + 0.3, Hh / 2 - 0.2], [W / 2 - 0.3, Hh / 2 - 0.2]].forEach(([x, z]) => {
    const L = HCEIL - layout.top.y - dp;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, L, 6), cabM);
    c.position.set(x, dp + L / 2 - 0.02, z); top.add(c);
  });
  grupo.add(top);

  // tiras verticales en pedestal
  const tiras = [];
  const stripMatBase = new THREE.MeshBasicMaterial({ toneMapped: false });
  layout.strips.forEach((st) => {
    const g = new THREE.Group();
    g.position.set(st.x, st.y, st.z);
    g.lookAt(0, st.y, 0);                      // +Z del grupo mira al centro
    const luz = new THREE.RectAreaLight(0xf2f6ff, 3, st.w, st.h);
    luz.rotation.y = Math.PI;                  // la luz emite hacia el centro
    g.add(luz);
    const mat = stripMatBase.clone(); mat.color.setScalar(1.08);
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(st.w, st.h), mat);
    cara.position.z = 0.003; g.add(cara);       // cara visible hacia el centro
    // marco y respaldo (se ve desde atras como un panel negro)
    const caja = new THREE.Mesh(new THREE.BoxGeometry(st.w + 0.08, st.h + 0.08, 0.1), negro);
    caja.position.z = -0.055; g.add(caja);
    // pedestal
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, st.y - st.h / 2, 8), negro);
    poste.position.set(0, -(st.y + st.h / 2) / 2 + st.h / 2 * 0 - (st.y - st.h / 2) / 2 + (st.y - st.h / 2) / 2 - st.h / 2 + 0, -0.06);
    poste.position.y = -st.h / 2 - (st.y - st.h / 2) / 2;
    g.add(poste);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.04, 24), negro);
    base.position.set(0, -st.y + 0.02, -0.06); g.add(base);
    grupo.add(g);
    tiras.push({ luz, mat, rear: st.rear });
  });

  // pool de luz con sombra de contacto suave
  const foco = new THREE.SpotLight(0xfff1e0, 6, 18, 0.5, 0.95, 2);
  foco.position.set(0.8, 7.4, 3.2);
  foco.target.position.set(0, 0, 0);
  foco.castShadow = true;
  foco.shadow.mapSize.set(MOVIL ? 1024 : 2048, MOVIL ? 1024 : 2048);
  foco.shadow.bias = -0.0004; foco.shadow.normalBias = 0.03; foco.shadow.radius = 7;
  foco.shadow.camera.near = 3; foco.shadow.camera.far = 14;
  grupo.add(foco); grupo.add(foco.target);
  renderer.shadowMap.enabled = !MOVIL;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // luces de acento (rebote del LED sobre el piso y las piernas)
  const acPts = [new THREE.PointLight(0xffffff, 0, 7.5, 2), new THREE.PointLight(0xffffff, 0, 7.5, 2)];
  acPts[0].position.set(-3.4, 0.35, -3.4); acPts[1].position.set(3.4, 0.35, -3.4);
  acPts.forEach(l => grupo.add(l));

  // ---- acento: LED en el zocalo + lavado en el coving
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const led = new THREE.Mesh(new THREE.CylinderGeometry(R1 - 0.5, R1 - 0.5, 0.07, 192, 1, true), ledMat);
  ledMat.side = THREE.BackSide;
  led.position.y = 0.04; led.renderOrder = 2;
  grupo.add(led);

  const washPts = [];
  for (let i = 0; i <= 60; i++) {
    const phi = (1 - i / 60) * Math.PI / 2;
    washPts.push(new THREE.Vector2(R1 + (CV - 0.015) * Math.sin(phi) - 0.0, 0.015 + (CV - 0.015) - (CV - 0.015) * Math.cos(phi)));
  }
  // lo anterior ya cubre el coving; se extiende un tramo de pared
  const washFull = [];
  for (let i = 0; i < 20; i++) washFull.push(new THREE.Vector2(R2 - 0.02, 7.0 - (7.0 - CV) * (i / 20)));
  washFull.push(...washPts.slice(1).map(v => new THREE.Vector2(v.x - 0.005, v.y)));
  // se ajusta la altura inicial de la curva a CV para empalmar
  const washGeo = new THREE.LatheGeometry(washFull, 128);
  const washMat = new THREE.ShaderMaterial({
    vertexShader: WASH_VS, fragmentShader: WASH_FS,
    uniforms: { uColor: { value: new THREE.Color(0xffffff) }, uI: { value: 0 } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const wash = new THREE.Mesh(washGeo, washMat); wash.renderOrder = 3; grupo.add(wash);

  // ---- bruma volumetrica (muy sutil) bajo el softbox
  const brumaGeo = new THREE.CylinderGeometry(1.0, 1.0, layout.top.y - 0.05, 40, 1, true);
  brumaGeo.translate(0, (layout.top.y - 0.05) / 2, 0);
  const brumaMat = new THREE.ShaderMaterial({
    vertexShader: BRUMA_VS, fragmentShader: BRUMA_FS,
    uniforms: { uColor: { value: new THREE.Color(0.85, 0.9, 1.0) }, uI: { value: 0.04 } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  // el haz se ensancha hacia abajo: se deforma el cilindro
  { const p = brumaGeo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = mix(3.6, 2.2, y / (layout.top.y - 0.05)); p.setX(i, p.getX(i) * k * 1.0); p.setZ(i, p.getZ(i) * k * 0.62); }
    brumaGeo.computeVertexNormals(); }
  const bruma = new THREE.Mesh(brumaGeo, brumaMat);
  bruma.position.set(0, 0.0, 0.4); bruma.renderOrder = 4; grupo.add(bruma);

  // ---- polvo en suspension
  const NP = 140;
  const pPos = new Float32Array(NP * 3), pSeed = new Float32Array(NP * 4);
  for (let i = 0; i < NP; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 5.0;
    pPos[i * 3] = Math.cos(a) * r; pPos[i * 3 + 1] = 0.3 + rnd() * 4.2; pPos[i * 3 + 2] = Math.sin(a) * r;
    pSeed[i * 4] = rnd() * 6.28; pSeed[i * 4 + 1] = 0.05 + rnd() * 0.12; pSeed[i * 4 + 2] = rnd() * 6.28; pSeed[i * 4 + 3] = 0.02 + rnd() * 0.04;
  }
  const polvoGeo = new THREE.BufferGeometry();
  polvoGeo.setAttribute('position', new THREE.BufferAttribute(pPos.slice(), 3));
  const polvo = new THREE.Points(polvoGeo, new THREE.PointsMaterial({
    map: glowTex(), size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.2,
    blending: THREE.AdditiveBlending, depthWrite: false, color: 0xdfe6f5,
  }));
  polvo.frustumCulled = false;
  grupo.add(polvo);

  // ---- control del acento
  const colObj = new THREE.Color('#F4A3C4');
  const colAct = colObj.clone();
  let intObj = 0.6, intAct = 0.0;
  let tPrev = null;
  const tmp = new THREE.Color();

  function aplicarAcento() {
    // LED: HDR para que florezca (bloom threshold 1.0)
    ledMat.color.copy(colAct).multiplyScalar(0.12 + 1.7 * intAct);
    washMat.uniforms.uColor.value.copy(colAct);
    washMat.uniforms.uI.value = 0.045 * intAct;
    acPts.forEach(l => { l.color.copy(colAct); l.intensity = 2.2 * intAct; });
    tiras.forEach(s => { if (s.rear) { tmp.set(0xf2f6ff).lerp(colAct, 0.28 * intAct); s.luz.color.copy(tmp); s.mat.color.copy(tmp).multiplyScalar(1.6 / Math.max(tmp.r, tmp.g, tmp.b, 0.001) * 0.95); } });
    led.visible = wash.visible = intAct > 0.002;
  }
  aplicarAcento();

  const api = {
    environment,
    grupo,
    reflector: reflejo,
    setAcento(colorHex, intensidad = 0.6) {
      colObj.set(colorHex);
      intObj = THREE.MathUtils.clamp(intensidad, 0, 1);
    },
    update(t) {
      const dt = tPrev === null ? 0.016 : Math.min(0.1, Math.max(0, t - tPrev));
      tPrev = t;
      const k = 1 - Math.exp(-dt * 3.2);          // ~1 s para asentar
      colAct.lerp(colObj, k);
      intAct += (intObj - intAct) * k;
      aplicarAcento();
      // polvo
      const p = polvoGeo.attributes.position;
      for (let i = 0; i < NP; i++) {
        const s0 = pSeed[i * 4], sp = pSeed[i * 4 + 1], s2 = pSeed[i * 4 + 2], am = pSeed[i * 4 + 3];
        p.setXYZ(i,
          pPos[i * 3] + Math.sin(t * sp + s0) * am * 4,
          pPos[i * 3 + 1] + Math.sin(t * sp * 0.7 + s2) * am * 3,
          pPos[i * 3 + 2] + Math.cos(t * sp + s2) * am * 4);
      }
      p.needsUpdate = true;
    },
    resize(w, h) {
      const d = Math.min(renderer.getPixelRatio(), 2);
      reflejo.getRenderTarget().setSize(Math.max(2, Math.floor(w * d * REFL_ESCALA)), Math.max(2, Math.floor(h * d * REFL_ESCALA)));
    },
    // opcional: marca un robot (o grupo) para que proyecte sombra de contacto sobre el piso
    sombras(obj) { obj.traverse(o => { if (o.isMesh) { o.castShadow = true; } }); },
  };
  return api;
}
