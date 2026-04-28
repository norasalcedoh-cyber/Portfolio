const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const BASE    = 'Assets/img';
const MAX_DIM = 1920;       // px máximo en cualquier dimensión
const SKIP_KB = 400;        // ignorar si ya pesa menos de esto

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(jpe?g|png)$/i.test(name)) out.push(full);
  }
  return out;
}

async function compress(file) {
  const before = fs.statSync(file).size;
  if (before < SKIP_KB * 1024) return null; // ya es pequeña

  const ext = path.extname(file).toLowerCase();
  try {
    let pipe = sharp(file, { failOn: 'none' });
    const { width, height } = await pipe.metadata();

    if (width > MAX_DIM || height > MAX_DIM)
      pipe = pipe.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true });

    let buf;
    if (ext === '.png') {
      buf = await pipe.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
    } else {
      buf = await pipe.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    }

    if (buf.length >= before) return null; // ya era óptima

    fs.writeFileSync(file, buf);
    return { file, before, after: buf.length };
  } catch (e) {
    console.error('Error:', path.basename(file), e.message);
    return null;
  }
}

(async () => {
  const images = walk(BASE);
  console.log(`\nComprimiendo ${images.length} imágenes...\n`);

  let saved = 0, count = 0;
  for (const img of images) {
    const r = await compress(img);
    if (!r) continue;
    count++;
    saved += r.before - r.after;
    const b = (r.before / 1024).toFixed(0).padStart(6);
    const a = (r.after  / 1024).toFixed(0).padStart(6);
    console.log(`${b} KB → ${a} KB   ${path.basename(r.file)}`);
  }

  console.log(`\n✓ ${count} imágenes comprimidas · ${(saved/1024/1024).toFixed(1)} MB ahorrados`);
})();
