// scripts/compress-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TARGETS = [
  { dir: 'public/images', maxWidth: 1920 },
  { dir: 'public/images/demos', maxWidth: 1000 },   // fotos de perfil demo
  { dir: 'public/uploads', maxWidth: 1000 },         // avatares/fotos usuarios
  { dir: 'public/images/clubs', maxWidth: 1600 },
];

async function compressFile(fullPath, maxWidth) {
  const ext = path.extname(fullPath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  const before = fs.statSync(fullPath).size;
  const buffer = await sharp(fullPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ quality: 75, compressionLevel: 9 })  // si es png
    .toBuffer();

  // Solo sobrescribe si realmente reduce peso
  if (buffer.length < before) {
    fs.writeFileSync(fullPath, buffer);
    console.log(`${fullPath}: ${(before/1024/1024).toFixed(2)}MB -> ${(buffer.length/1024/1024).toFixed(2)}MB`);
  }
}

async function processDir(dir, maxWidth) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDir(fullPath, maxWidth);
    } else {
      await compressFile(fullPath, maxWidth);
    }
  }
}

(async () => {
  for (const { dir, maxWidth } of TARGETS) {
    await processDir(dir, maxWidth);
  }
})();
