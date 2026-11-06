// Optimiza los assets originales (raw/) y los deja listos en public/.
//   npm run assets
// - GLB: simplificación suave (error 0,1 %), geometría cuantizada + EXT_meshopt_compression, texturas a
//   WebP de 512 px. Nombres y jerarquía intactos (la app mapea zonas y materiales por nombre de malla).
// - Logos: WebP de 256 px de alto (en pantalla nunca pasan de 96 px css). Solo el de Westcol conserva
//   PNG (lo usa el gobo 3D), con paleta. La galería de renders ya no existe: no se generan.
// - Vídeo: H.264 720p con faststart y póster.
// - SF: cristal del botón ENTRAR y cartel del ring (textura 3D, 1024 px).
// - Audio: música a 96 kbps estéreo; efectos a 64 kbps mono.
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, reorder, quantize, meshopt, textureCompress, weld, simplify } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, copyFileSync, existsSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'raw');
const OUT = join(ROOT, 'public');
const solo = process.argv[2]; // opcional: glb | img | video | sf | audio
// Solo Westcol y Blessd sobre el EngineAI T800 Max
const USAR = /^(fabrica_t800)/;
const FUERA = /^(krisr|diomedes|tema_krisr|tema_diomedes|westcol_majin)/;
const kb = (f) => (statSync(f).size / 1024).toFixed(0) + ' KB';
const md = (d) => mkdirSync(d, { recursive: true });
const log = (a, b) => console.log(`  ${basename(a).padEnd(34)} ${kb(a).padStart(9)} -> ${kb(b).padStart(9)}`);

// UV con error de redondeo (-0.0000001 / 1.0000001) impiden cuantizarlas: se recortan a [0,1]
const recortarUV = () => (doc) => {
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
    const a = p.getAttribute('TEXCOORD_0'); if (!a) continue;
    const arr = a.getArray(); for (let i = 0; i < arr.length; i++) arr[i] = Math.min(1, Math.max(0, arr[i]));
  }
};
async function glb() {
  console.log('GLB');
  await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  md(join(OUT, 'modelos'));
  for (const f of readdirSync(join(RAW, 'modelos')).filter((f) => f.endsWith('.glb') && USAR.test(f))) {
    const src = join(RAW, 'modelos', f), dst = join(OUT, 'modelos', f);
    const doc = await io.read(src);
    await doc.transform(
      dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.TEXTURE] }),
      prune({ keepLeaves: true, keepAttributes: true, propertyTypes: [PropertyType.ACCESSOR, PropertyType.TEXTURE, PropertyType.BUFFER] }),
      recortarUV(),
      weld({}),
      simplify({ simplifier: MeshoptSimplifier, ratio: 0, error: 0.001, lockBorder: true }),
      reorder({ encoder: MeshoptEncoder, target: 'performance' }),
      quantize({ quantizePosition: 13, quantizeNormal: 8, quantizeTexcoord: 11 }),
      textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 82, resize: [512, 512] }),
      meshopt({ encoder: MeshoptEncoder, level: 'high' }),
    );
    await io.write(dst, doc);
    log(src, dst);
  }
  const mm = JSON.parse(readFileSync(join(RAW, 'modelos', 'manifest.json'), 'utf8'));
  for (const k of Object.keys(mm)) if (!k.startsWith('_') && !USAR.test(mm[k])) delete mm[k];
  writeFileSync(join(OUT, 'modelos', 'manifest.json'), JSON.stringify(mm, null, 1));
}

async function img() {
  console.log('Imágenes');
  md(join(OUT, 'disenos'));
  for (const f of readdirSync(join(RAW, 'disenos')).filter((f) => !FUERA.test(f))) {
    const src = join(RAW, 'disenos', f), ext = extname(f), name = basename(f, ext);
    if (ext === '.json') { copyFileSync(src, join(OUT, 'disenos', f)); continue; }
    // el logo vigente de Blessd (su caricatura, commit 9c203d0) no tiene original en raw/: su WebP se conserva tal cual
    if (f === 'blessd_logo.png') continue;
    if (ext === '.png') {
      const dst = join(OUT, 'disenos', name + '.webp');
      await sharp(src).resize({ height: 256, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 88, effort: 6 }).toFile(dst); log(src, dst);
      // el gobo 3D de Westcol usa el PNG (alfa limpio); el resto no lo necesita
      if (name.startsWith('westcol')) await sharp(src).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toFile(join(OUT, 'disenos', f));
    }
  }
  // manifiesto de diseños apuntando a WebP
  const man = JSON.parse(readFileSync(join(RAW, 'disenos/manifest.json'), 'utf8'));
  delete man.krisr; delete man.diomedes; man._v = Date.now();
  for (const [k, v] of Object.entries(man)) {
    if (k.startsWith('_')) continue;
    if (v.logo) v.logoWebp = v.logo.replace('.png', '.webp');
    if (k !== 'westcol') delete v.logo; // solo el gobo de Westcol pide el PNG
    v.renders = {};
  }
  writeFileSync(join(OUT, 'disenos/manifest.json'), JSON.stringify(man, null, 1));
}

function ff(args) { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); }
async function video() {
  console.log('Vídeo');
  md(join(OUT, 'media'));
  const de = join(RAW, 'media/t800_despiece.mp4');
  const H264 = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
  ff(['-i', de, ...H264.map((x) => (x === 'slow' ? 'veryslow' : x)), '-crf', '29', '-vf', 'scale=720:-2', '-an', join(OUT, 'media/t800_despiece.mp4')]); log(de, join(OUT, 'media/t800_despiece.mp4'));
  const tmp = join(OUT, 'media/_poster.png');
  ff(['-ss', '0', '-i', de, '-frames:v', '1', '-vf', 'scale=720:-2', tmp]);
  await sharp(tmp).jpeg({ quality: 72, mozjpeg: true }).toFile(join(OUT, 'media/despiece-poster.jpg')); unlinkSync(tmp);
}

async function sf() {
  console.log('SF');
  md(join(OUT, 'sf'));
  // cristal del botón ENTRAR: es el LCP de la portada
  const c = join(RAW, 'sf/cristal.webp');
  if (existsSync(c)) { await sharp(c).webp({ quality: 82, alphaQuality: 85, effort: 6 }).toFile(join(OUT, 'sf/cristal.webp')); log(c, join(OUT, 'sf/cristal.webp')); }
  // cartel de la pantalla del ring: es una textura 3D, con 1024 px sobra
  const k = join(OUT, 'sf/cartel.webp'), k0 = readFileSync(k);
  if ((await sharp(k0).metadata()).width > 1024) { await sharp(k0).resize({ width: 1024 }).webp({ quality: 74, effort: 6 }).toFile(k); console.log('  cartel.webp ->', kb(k)); }
}

function audio() {
  console.log('Audio');
  md(join(OUT, 'audio'));
  for (const f of readdirSync(join(RAW, 'audio')).filter((f) => !FUERA.test(f))) {
    const src = join(RAW, 'audio', f), dst = join(OUT, 'audio', f);
    if (f.endsWith('.json')) { const a = JSON.parse(readFileSync(src, 'utf8')); delete a.tema_krisr; delete a.tema_diomedes; a._v = Date.now(); writeFileSync(dst, JSON.stringify(a, null, 1)); continue; }
    if (f.startsWith('sfx_')) { ff(['-i', src, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', dst]); log(src, dst); continue; }
    ff(['-i', src, '-c:a', 'libmp3lame', '-b:a', '96k', dst]); log(src, dst);
  }
}

if (!existsSync(RAW)) { console.error('Falta la carpeta raw/ con los originales'); process.exit(1); }
if (!solo || solo === 'glb') await glb();
if (!solo || solo === 'img') await img();
if (!solo || solo === 'video') await video();
if (!solo || solo === 'sf') await sf();
if (!solo || solo === 'audio') audio();
console.log('Listo.');
