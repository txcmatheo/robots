// ring.js — Ring de boxeo de Stream Fighters 5 (todo procedural, sin texturas externas).
// Lona azul noche con el sello del evento, cuerdas rojo/blanco/azul/violeta, esquina roja (Westcol)
// y esquina azul (Blessd), faldón con LED, torre de luces con haces, pantallas al fondo y público en penumbra.
// Misma interfaz que el estudio anterior: setAcento(color, k), update(t), resize(w, h), sombras(obj).
import * as THREE from 'three';

export const SF = {
  bg: '#05060d', surface: '#0b0d1a', surface2: '#111427', surface3: '#181c35',
  ink: '#f4f5fb', brand: '#5b7cff', brand2: '#9a6bff', cyan: '#8ef1ff', red: '#ff3d50', redStrong: '#d42638', green: '#53fc18',
};
const PANT = [[-6.4, 'WESTCOL', SF.red], [0, 'VS', SF.brand2], [6.4, 'BLESSD', SF.brand]];
export const RING = { mitad: 3.0, alto: 1.05 }; // medio lado entre cuerdas y altura de la plataforma

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 8; return t;
}

function entorno(renderer) {
  // entorno de reflejos: arena oscura, torre de luces arriba y brillos azul/violeta a los lados
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.012, 0.014, 0.03), side: THREE.BackSide }));
  room.position.y = 5; s.add(room);
  const panel = (w, h, col, k, pos, rx = 0, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.copy(pos); m.rotation.set(rx, ry, 0); s.add(m); };
  panel(6, 6, '#ffffff', 7, new THREE.Vector3(0, 6.5, 0), Math.PI / 2);
  panel(10, 2, SF.brand, 2.2, new THREE.Vector3(-9, 2, 0), 0, Math.PI / 2);
  panel(10, 2, SF.brand2, 2.2, new THREE.Vector3(9, 2, 0), 0, -Math.PI / 2);
  panel(14, 1.5, '#ffffff', 1.2, new THREE.Vector3(0, 2.5, 10));
  panel(14, 3, SF.brand, 1.0, new THREE.Vector3(0, 3, -12));
  const pm = new THREE.PMREMGenerator(renderer); const rt = pm.fromScene(s, 0.04); pm.dispose();
  return rt.texture;
}

function texLona() {
  return canvasTex(2048, 2048, (c, W) => {
    const C = W / 2;
    c.fillStyle = SF.surface2; c.fillRect(0, 0, W, W);
    // grano de la lona
    const id = c.getImageData(0, 0, W, W); for (let i = 0; i < id.data.length; i += 4) { const v = (Math.random() - 0.5) * 7; id.data[i] += v; id.data[i + 1] += v; id.data[i + 2] += v; } c.putImageData(id, 0, 0);
    // borde interior y triángulos de esquina (roja: Westcol, azul: Blessd)
    const m = W * 0.035; c.strokeStyle = 'rgba(244,245,251,.18)'; c.lineWidth = W * 0.004; c.strokeRect(m, m, W - 2 * m, W - 2 * m);
    const tri = (x, y, sx, sy, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.lineTo(x + sx * W * 0.13, y); c.lineTo(x, y + sy * W * 0.13); c.closePath(); c.fill(); };
    c.globalAlpha = 0.9; tri(m, m, 1, 1, SF.red); tri(W - m, m, -1, 1, SF.brand); c.globalAlpha = 0.35; tri(m, W - m, 1, -1, SF.ink); tri(W - m, W - m, -1, -1, SF.ink); c.globalAlpha = 1;
    // sello central: aro con degradado de marca, texto del evento
    const g = c.createLinearGradient(C - W * 0.3, 0, C + W * 0.3, 0); g.addColorStop(0, SF.brand); g.addColorStop(1, SF.brand2);
    c.strokeStyle = g; c.lineWidth = W * 0.018; c.beginPath(); c.arc(C, C, W * 0.27, 0, Math.PI * 2); c.stroke();
    c.lineWidth = W * 0.004; c.beginPath(); c.arc(C, C, W * 0.3, 0, Math.PI * 2); c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `italic 700 ${W * 0.07}px "Chakra Petch"`; c.fillStyle = 'rgba(244,245,251,.9)'; c.fillText('STREAM FIGHTERS', C, C - W * 0.035);
    c.font = `italic 700 ${W * 0.16}px "Chakra Petch"`; c.fillStyle = g; c.fillText('5', C, C + W * 0.09);
    // franjas laterales con los colores de cada esquina
    c.fillStyle = 'rgba(255,61,80,.35)'; c.fillRect(m * 1.6, W * 0.42, W * 0.012, W * 0.16);
    c.fillStyle = 'rgba(91,124,255,.45)'; c.fillRect(W - m * 1.6 - W * 0.012, W * 0.42, W * 0.012, W * 0.16);
  });
}

function texPantalla(texto, col) {
  return canvasTex(1024, 512, (c, W, H) => {
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0b0d1a'); g.addColorStop(1, '#111427'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = col; c.globalAlpha = 0.18; for (let y = 0; y < H; y += 6) c.fillRect(0, y, W, 2); c.globalAlpha = 1; // líneas de LED
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `italic 700 ${H * 0.3}px "Chakra Petch"`; c.fillStyle = SF.ink; c.fillText(texto, W / 2, H * 0.46);
    c.font = `italic 700 ${H * 0.09}px "Chakra Petch"`; c.fillStyle = col; c.fillText('STREAM FIGHTERS 5 · 14 NOV · BOGOTÁ', W / 2, H * 0.8);
  });
}

export function crearRing(scene, renderer) {
  const MOVIL = matchMedia('(pointer:coarse)').matches || Math.min(innerWidth, innerHeight) < 700;
  const grupo = new THREE.Group(); grupo.name = 'ring'; scene.add(grupo);
  const env = entorno(renderer);
  scene.environment = env; scene.environmentIntensity = 0.75;
  scene.background = new THREE.Color(SF.bg);
  scene.fog = new THREE.FogExp2(SF.bg, 0.045);

  const M = RING.mitad, A = RING.alto, L = M + 0.6; // L: borde exterior de la lona (con delantal)
  // plataforma y lona
  const lona = new THREE.Mesh(new THREE.PlaneGeometry(L * 2, L * 2), new THREE.MeshStandardMaterial({ map: texLona(), roughness: 0.85, metalness: 0, envMapIntensity: 0.4 }));
  // los textos del ring usan Bebas Neue: se redibujan en cuanto la fuente está lista
  let intentos = 0; const redibujar = () => { lona.material.map.dispose(); lona.material.map = texLona(); lona.material.needsUpdate = true; pantallas.forEach((p, i) => { if (p.userData.cartel) return; p.material.map.dispose(); p.material.map = texPantalla(...PANT[i].slice(1)); p.material.needsUpdate = true; }); };
  const esperaFuente = () => { if (document.fonts.check('italic 700 100px "Chakra Petch"')) return redibujar(); if (++intentos > 40) return; document.fonts.load('italic 700 100px "Chakra Petch"').finally(() => setTimeout(esperaFuente, 150)); };
  setTimeout(esperaFuente, 0);
  lona.rotation.x = -Math.PI / 2; lona.receiveShadow = true; grupo.add(lona);
  const faldon = new THREE.Mesh(new THREE.BoxGeometry(L * 2, A, L * 2), [0, 1, 2, 3, 4, 5].map(i => new THREE.MeshStandardMaterial({ color: i === 2 || i === 3 ? '#000' : SF.surface, roughness: 0.6, metalness: 0.2 })));
  faldon.position.y = -A / 2 - 0.005; grupo.add(faldon);
  // franja LED del faldón (toma el color de acento)
  const ledMat = new THREE.MeshBasicMaterial({ color: SF.brand, toneMapped: false });
  const led = new THREE.Mesh(new THREE.BoxGeometry(L * 2 + 0.02, 0.05, L * 2 + 0.02), ledMat); led.position.y = -0.12; grupo.add(led);
  // piso de la arena
  const piso = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: '#04050b', roughness: 0.4, metalness: 0.3 }));
  piso.rotation.x = -Math.PI / 2; piso.position.y = -A; piso.receiveShadow = true; grupo.add(piso);

  // postes y almohadillas de esquina
  const negro = new THREE.MeshStandardMaterial({ color: '#15171f', roughness: 0.35, metalness: 0.8 });
  const esquinas = [[-M, -M, SF.red], [M, -M, SF.brand], [-M, M, SF.ink], [M, M, SF.ink]];
  const postes = [];
  for (const [x, z, col] of esquinas) {
    const gp = new THREE.Group(); gp.userData.xz = [x, z]; grupo.add(gp); postes.push(gp);
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.75, 16), negro); poste.position.set(x, 0.875, z); gp.add(poste);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.25, 0.2), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }));
    pad.position.set(x - Math.sign(x) * 0.07, 0.95, z - Math.sign(z) * 0.07); pad.rotation.y = Math.PI / 4; gp.add(pad);
  }
  // cuerdas en tres lados (el frente se omite para no tapar la cámara)
  const COL_CUERDAS = [SF.red, SF.ink, SF.brand, SF.brand2];
  const ALTOS = [1.5, 1.12, 0.74, 0.36];
  const lados = [[[-M, -M], [M, -M]], [[-M, -M], [-M, M]], [[M, -M], [M, M]]];
  const cuerdas = lados.map((_, i) => { const g = new THREE.Group(); g.userData.lado = ['fondo', 'izq', 'der'][i]; grupo.add(g); return g; });
  ALTOS.forEach((y, i) => {
    const mat = new THREE.MeshStandardMaterial({ color: COL_CUERDAS[i], roughness: 0.4, emissive: COL_CUERDAS[i], emissiveIntensity: 0.12 });
    lados.forEach(([[x1, z1], [x2, z2]], li) => {
      const len = Math.hypot(x2 - x1, z2 - z1); const cu = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, len, 10), mat);
      cu.position.set((x1 + x2) / 2, y, (z1 + z2) / 2); cu.rotation.set(Math.PI / 2, 0, 0); cu.lookAt(x2, y, z2); cu.rotateX(Math.PI / 2); cu.castShadow = !MOVIL; cuerdas[li].add(cu);
    });
  });

  // torre de luces: marco cuadrado con focos y haces volumétricos
  const torre = new THREE.Group(); torre.position.y = 5.2; grupo.add(torre);
  const tm = new THREE.MeshStandardMaterial({ color: '#1a1d28', metalness: 0.9, roughness: 0.4 });
  for (const [x, z, w, d] of [[0, -M, M * 2 + 0.3, 0.12], [0, M, M * 2 + 0.3, 0.12], [-M, 0, 0.12, M * 2], [M, 0, 0.12, M * 2]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), tm); b.position.set(x, 0, z); torre.add(b); }
  const focoMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const haces = [];
  const hazMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { c: { value: new THREE.Color('#cfd8ff') }, k: { value: 0.07 } },
    vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; uniform float k; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float h = smoothstep(-2.6, 2.6, vY); float f = pow(abs(dot(vN, vV)), 1.5); gl_FragColor = vec4(c, h*f*k); }',
  });
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + Math.PI / 8, x = Math.cos(a) * M * 0.95, z = Math.sin(a) * M * 0.95;
    const foco = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.25, 16), focoMat); foco.position.set(x, -0.15, z); torre.add(foco);
    const haz = new THREE.Mesh(new THREE.ConeGeometry(1.1, 5.2, 32, 1, true), hazMat); haz.position.set(x * 0.6, -2.75, z * 0.6); haz.lookAt(x * 0.6 + x * 0.2, -5.2, z * 0.6 + z * 0.2); haz.rotateX(-Math.PI / 2); torre.add(haz); haces.push(haz);
  }
  // luz principal cenital con sombra
  const cenital = new THREE.SpotLight('#ffffff', 60, 14, 0.62, 0.55, 1.6);
  cenital.position.set(0, 6.5, 0.6); cenital.target.position.set(0, 0, 0);
  cenital.castShadow = true; cenital.shadow.mapSize.set(MOVIL ? 1024 : 2048, MOVIL ? 1024 : 2048); cenital.shadow.bias = -0.0004; cenital.shadow.normalBias = 0.03; cenital.shadow.radius = 5;
  cenital.shadow.camera.near = 3; cenital.shadow.camera.far = 9;
  grupo.add(cenital, cenital.target);
  renderer.shadowMap.enabled = !MOVIL; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // contraluces de esquina
  const luzRoja = new THREE.PointLight(SF.red, 6, 9, 2); luzRoja.position.set(-M, 2.2, -M); grupo.add(luzRoja);
  const luzAzul = new THREE.PointLight(SF.brand, 6, 9, 2); luzAzul.position.set(M, 2.2, -M); grupo.add(luzAzul);

  // pantallas LED al fondo
  const pantallas = [];
  for (const [x, txt, col] of PANT) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(x === 0 ? 6.0 : 4.0, x === 0 ? 3.15 : 2.0), new THREE.MeshBasicMaterial({ map: texPantalla(txt, col), toneMapped: false, fog: false }));
    p.position.set(x, 4.3, -12); p.material.color.setScalar(0.55); grupo.add(p); pantallas.push(p);
  }

  // la pantalla central muestra el cartel oficial de Stream Fighters 5
  new THREE.TextureLoader().load(import.meta.env.BASE_URL + 'sf/cartel.webp', t => { t.colorSpace = THREE.SRGBColorSpace; const p = pantallas[1]; p.material.map?.dispose(); p.material.map = t; p.material.color.setScalar(0.75); p.material.needsUpdate = true; p.userData.cartel = true; });
  // público en penumbra: siluetas tenues y luces de celulares que titilan
  const NP = MOVIL ? 900 : 2000; const pos = new Float32Array(NP * 3), fase = new Float32Array(NP);
  for (let i = 0; i < NP; i++) {
    const a = Math.random() * Math.PI * 2, r = 6.5 + Math.random() * 9, y = -A + 0.6 + (r - 6.5) * 0.45 + Math.random() * 0.4;
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(a) * r; fase[i] = Math.random() * 6.28;
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('fase', new THREE.BufferAttribute(fase, 1));
  const publico = new THREE.Points(pg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, c1: { value: new THREE.Color(SF.brand) }, c2: { value: new THREE.Color('#ffffff') } },
    vertexShader: 'attribute float fase; uniform float t; varying float vA; varying float vB; void main(){ vB = step(0.93, fract(fase*7.13)); vA = (0.25 + 0.75*vB) * (0.5 + 0.5*sin(t*(1.0+vB*2.0) + fase*3.0)); vec4 mv = modelViewMatrix*vec4(position,1.0); gl_PointSize = (vB > 0.5 ? 40.0 : 22.0) / -mv.z; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c1; uniform vec3 c2; varying float vA; varying float vB; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(mix(c1*0.35, c2, vB), vA*(1.0-d*2.0)); }',
  }));
  publico.frustumCulled = false; grupo.add(publico);

  // acento: el color del peleador activo tiñe el LED del faldón y los haces
  const colObj = new THREE.Color(SF.brand), colAct = colObj.clone(); let intObj = 0.5, intAct = 0.5, tPrev = null;
  return {
    environment: env, grupo, esquinas: { roja: new THREE.Vector3(-M, 0, -M), azul: new THREE.Vector3(M, 0, -M) },
    setAcento(hex, k = 0.6) { colObj.set(hex); intObj = THREE.MathUtils.clamp(k, 0, 1); },
    // lo que queda entre la cámara y el robot se oculta (como en una transmisión de boxeo)
    ocultar(cam) {
      for (const p of postes) { const [x, z] = p.userData.xz; p.visible = Math.hypot(cam.x - x, cam.z - z) > 1.6; }
      for (const g of cuerdas) { const l = g.userData.lado; g.visible = !((l === 'izq' && cam.x < -M + 0.2) || (l === 'der' && cam.x > M - 0.2) || (l === 'fondo' && cam.z < -M + 0.2)); }
    },
    update(t) {
      const dt = tPrev === null ? 0.016 : Math.min(0.1, Math.max(0, t - tPrev)); tPrev = t; const k = 1 - Math.exp(-dt * 3);
      colAct.lerp(colObj, k); intAct += (intObj - intAct) * k;
      ledMat.color.copy(colAct).multiplyScalar(0.6 + 1.4 * intAct);
      hazMat.uniforms.c.value.copy(colAct).lerp(new THREE.Color('#ffffff'), 0.6); hazMat.uniforms.k.value = 0.05 + 0.05 * intAct;
      publico.material.uniforms.t.value = t;
    },
    resize() { },
    sombras(obj) { obj.traverse(o => { if (o.isMesh) o.castShadow = true; }); },
  };
}
