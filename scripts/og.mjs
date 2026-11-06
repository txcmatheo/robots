// Genera public/media/og.jpg (1200×630) con los renders de Westcol y Blessd, sin marcas.
import sharp from 'sharp';
const R = (f) => sharp('raw/disenos/' + f).resize({ height: 440, width: 352, fit: 'cover' }).toBuffer();
const [w, b] = await Promise.all([R('westcol_w-sound-24.jpg'), R('blessd_el-peor.jpg')]);
const txt = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<text x="64" y="300" font-family="Bodoni Moda, Didot, Georgia, serif" font-size="96" fill="#f1ede6">Segunda</text>
<text x="64" y="400" font-family="Bodoni Moda, Didot, Georgia, serif" font-style="italic" font-size="96" fill="#e8c27a">piel.</text>
<text x="66" y="458" font-family="Consolas, monospace" font-size="19" letter-spacing="3" fill="#f1ede6" fill-opacity=".75">WESTCOL · BLESSD</text><text x="66" y="486" font-family="Consolas, monospace" font-size="19" letter-spacing="3" fill="#f1ede6" fill-opacity=".75">ENGINEAI T800 MAX</text>
<rect x="66" y="514" width="120" height="3" fill="#FF0700"/><rect x="190" y="514" width="120" height="3" fill="#2651B5"/></svg>`;
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#070708' } })
  .composite([{ input: Buffer.from(txt), top: 0, left: 0 }, { input: w, top: 95, left: 440 }, { input: b, top: 95, left: 808 }])
  .jpeg({ quality: 84, mozjpeg: true }).toFile('public/media/og.jpg');
console.log('og.jpg listo');
