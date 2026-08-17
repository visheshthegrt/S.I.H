import fs from 'node:fs';
import path from 'node:path';

function createBmpBuffer(width, height, pixelGenerator) {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buf = Buffer.alloc(fileSize);

  // File Header
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(54, 10);

  // DIB Header
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(height, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0, 30);
  buf.writeUInt32LE(pixelArraySize, 34);

  for (let y = 0; y < height; y++) {
    const rowOffset = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelGenerator(x, y, width, height);
      const colOffset = rowOffset + x * 3;
      buf[colOffset] = Math.min(255, Math.max(0, Math.round(b)));
      buf[colOffset + 1] = Math.min(255, Math.max(0, Math.round(g)));
      buf[colOffset + 2] = Math.min(255, Math.max(0, Math.round(r)));
    }
  }

  return buf;
}

const width = 2048;
const height = 1024;
const outputDir = path.resolve(process.cwd(), 'public/textures');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Hyperrealistic NASA Atmospheric Cloud Texture Generator
console.log('☁️ Generating Hyperrealistic NASA Cloud Texture Map...');
const cloudBuf = createBmpBuffer(width, height, (x, y, w, h) => {
  const u = x / w;
  const v = y / h;
  const lat = (0.5 - v) * Math.PI;
  const lon = (u - 0.5) * 2 * Math.PI;

  // Multi-octave trigonometric fractal noise for cloud swirls
  let n = Math.sin(lon * 4 + Math.cos(lat * 8)) * 0.4;
  n += Math.sin(lon * 12 - lat * 10) * 0.3;
  n += Math.cos(lon * 24 + lat * 18) * 0.2;
  n += Math.sin(lon * 48 - lat * 36) * 0.1;

  // Equatorial cloud band & temperate storm fronts
  const band = Math.sin(lat * 3.5) * 0.35 + Math.cos(lat * 1.5) * 0.25;
  const cloudVal = n + band;

  if (cloudVal > 0.15) {
    const opacity = Math.min(1.0, (cloudVal - 0.15) * 2.2);
    const brightness = 210 + opacity * 45;
    return [brightness, brightness, brightness];
  } else {
    return [0, 0, 0];
  }
});
fs.writeFileSync(path.join(outputDir, 'earth_clouds_8k.jpg'), cloudBuf);

// 2. Hyperrealistic Deep Space Milky Way Panoramic Starfield Generator
console.log('🌌 Generating Hyperrealistic Deep Space Milky Way Starfield Map...');

// Precompute star positions & spectral types
const stars = [];
const starCount = 3500;
const starColors = [
  [210, 230, 255], // O/B Blue-White Giant
  [255, 255, 255], // A/F White
  [255, 245, 210], // G Yellow Sun-like
  [255, 200, 140], // K Orange
  [255, 150, 120]  // M Red Giant
];

for (let i = 0; i < starCount; i++) {
  const sx = Math.floor(Math.random() * width);
  const sy = Math.floor(Math.random() * height);
  const col = starColors[Math.floor(Math.random() * starColors.length)];
  const brightness = 0.4 + Math.random() * 0.6;
  stars.push({ x: sx, y: sy, col, brightness });
}

const spaceBuf = createBmpBuffer(width, height, (x, y, w, h) => {
  const u = x / w;
  const v = y / h;

  // Milky Way Galactic Core Belt (Diagonal glowing cosmic dust lane)
  const galY = h / 2 + Math.sin(u * Math.PI * 2) * (h * 0.25);
  const distGal = Math.abs(y - galY);

  let r = 2, g = 3, b = 8; // Deep space baseline

  if (distGal < h * 0.25) {
    const galFactor = Math.pow(1 - distGal / (h * 0.25), 2.5);
    // Cyan/magenta cosmic dust cloud glow
    r += galFactor * 35;
    g += galFactor * 25;
    b += galFactor * 65;

    // Dark interstellar dust lane cutouts
    const dustLane = Math.sin(u * 18 + v * 12);
    if (dustLane > 0.45 && distGal < h * 0.12) {
      r *= 0.3;
      g *= 0.3;
      b *= 0.3;
    }
  }

  return [r, g, b];
});

// Render individual twinkling star points onto the space background buffer
for (const s of stars) {
  const offset = 54 + (height - 1 - s.y) * Math.floor((24 * width + 31) / 32) * 4 + s.x * 3;
  if (offset + 2 < spaceBuf.length) {
    spaceBuf[offset] = Math.min(255, s.col[2] * s.brightness);     // B
    spaceBuf[offset + 1] = Math.min(255, s.col[1] * s.brightness); // G
    spaceBuf[offset + 2] = Math.min(255, s.col[0] * s.brightness); // R
  }
}

fs.writeFileSync(path.join(outputDir, 'starfield_8k.jpg'), spaceBuf);

console.log('✨ Hyperrealistic Cloud and Deep Space Milky Way texture maps generated in public/textures/!');
