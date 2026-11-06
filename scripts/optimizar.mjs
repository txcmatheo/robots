// Optimiza los assets originales (raw/) y los deja listos en public/.
//   npm run assets
// - GLB: geometría cuantizada + EXT_meshopt_compression, texturas a WebP. Nombres y jerarquía intactos
//   (la app mapea zonas y materiales por nombre de malla).
// - Imágenes: WebP a tamaño completo + miniaturas para la galería.
// - Vídeo: H.264 re-codificado con faststart (+ versión 720p para móvil) y póster.
// - Audio: MP3 a 128 kbps.
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, reorder, quantize, meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, copyFileSync, existsSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'raw');
const OUT = join(ROOT, 'public');
const solo = process.argv[2]; // opcional: glb | img | video | audio
// Solo Westcol y Blessd sobre el EngineAI T800 Max
const USAR = /^(fabrica_t800|blessd)/;
const FUERA = /^(krisr|diomedes|tema_krisr|tema_diomedes|westcol_majin)/;
const kb = (f) => (statSync(f).size / 1024).toFixed(0) + ' KB';
const md = (d) => mkdirSync(d, { recursive: true });
const log = (a, b) => console.log(`  ${basename(a).padEnd(34)} ${kb(a).padStart(9)} -> ${kb(b).padStart(9)}`);

async function glb() {
  console.log('GLB');
  await MeshoptEncoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  md(join(OUT, 'modelos'));
  for (const f of readdirSync(join(RAW, 'modelos')).filter((f) => f.endsWith('.glb') && USAR.test(f))) {
    const src = join(RAW, 'modelos', f), dst = join(OUT, 'modelos', f);
    const doc = await io.read(src);
    await doc.transform(
      dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.TEXTURE] }),
      prune({ keepLeaves: true, keepAttributes: true, propertyTypes: [PropertyType.ACCESSOR, PropertyType.TEXTURE, PropertyType.BUFFER] }),
      reorder({ encoder: MeshoptEncoder, target: 'performance' }),
      quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }),
      textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 86 }),
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
  md(join(OUT, 'disenos/thumb')); md(join(OUT, 'media'));
  for (const f of readdirSync(join(RAW, 'disenos')).filter((f) => !FUERA.test(f))) {
    const src = join(RAW, 'disenos', f), ext = extname(f), name = basename(f, ext);
    if (ext === '.json') { copyFileSync(src, join(OUT, 'disenos', f)); continue; }
    if (ext === '.jpg') {
      const dst = join(OUT, 'disenos', name + '.webp');
      await sharp(src).webp({ quality: 82, effort: 6 }).toFile(dst); log(src, dst);
      await sharp(src).resize({ width: 480 }).webp({ quality: 74, effort: 6 }).toFile(join(OUT, 'disenos/thumb', name + '.webp'));
    } else if (ext === '.png') {
      const dst = join(OUT, 'disenos', name + '.webp');
      await sharp(src).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 90, effort: 6 }).toFile(dst); log(src, dst);
      copyFileSync(src, join(OUT, 'disenos', f)); // el gobo 3D usa el PNG (textura con alfa limpio)
    }
  }
  // manifiesto de diseños apuntando a WebP
  const man = JSON.parse(readFileSync(join(RAW, 'disenos/manifest.json'), 'utf8'));
  delete man.krisr; delete man.diomedes;
  for (const [k, v] of Object.entries(man)) {
    if (k.startsWith('_')) continue;
    if (v.logo) v.logoWebp = v.logo.replace('.png', '.webp');
    for (const r of Object.keys(v.renders)) v.renders[r] = v.renders[r].replace('.jpg', '.webp');
  }
  writeFileSync(join(OUT, 'disenos/manifest.json'), JSON.stringify(man, null, 1));
}

function ff(args) { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); }
function video() {
  console.log('Vídeo');
  md(join(OUT, 'media'));
  const de = join(RAW, 'media/t800_despiece.mp4');
  const H264 = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
  ff(['-i', de, ...H264, '-crf', '27', '-vf', 'scale=720:-2', '-an', join(OUT, 'media/t800_despiece.mp4')]); log(de, join(OUT, 'media/t800_despiece.mp4'));
  ff(['-ss', '0', '-i', de, '-frames:v', '1', '-vf', 'scale=720:-2', '-q:v', '4', join(OUT, 'media/despiece-poster.jpg')]);
}

function audio() {
  console.log('Audio');
  md(join(OUT, 'audio'));
  for (const f of readdirSync(join(RAW, 'audio')).filter((f) => !FUERA.test(f))) {
    const src = join(RAW, 'audio', f), dst = join(OUT, 'audio', f);
    if (f.endsWith('.json')) { const a = JSON.parse(readFileSync(src, 'utf8')); delete a.tema_krisr; delete a.tema_diomedes; writeFileSync(dst, JSON.stringify(a, null, 1)); continue; }
    if (f.startsWith('sfx_')) { copyFileSync(src, dst); continue; } // efectos: ya son mínimos
    ff(['-i', src, '-c:a', 'libmp3lame', '-b:a', '128k', dst]); log(src, dst);
  }
}

if (!existsSync(RAW)) { console.error('Falta la carpeta raw/ con los originales'); process.exit(1); }
if (!solo || solo === 'glb') await glb();
if (!solo || solo === 'img') await img();
if (!solo || solo === 'video') video();
if (!solo || solo === 'audio') audio();
console.log('Listo.');
