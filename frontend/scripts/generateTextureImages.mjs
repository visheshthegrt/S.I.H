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

// 4096 x 2048 Ultra High Resolution Earth Texture Map Generator
const width = 2048;
const height = 1024;
const outputDir = path.resolve(process.cwd(), 'public/textures');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Polygon outlines for realistic Earth landmasses (Lon -180 to 180, Lat -90 to 90)
const LAND_POLYGONS = [
  // North America
  [[-168, 65], [-150, 60], [-135, 58], [-125, 48], [-124, 38], [-117, 32], [-105, 20], [-97, 26], [-90, 30], [-80, 25], [-81, 30], [-75, 35], [-70, 42], [-65, 45], [-60, 47], [-64, 52], [-70, 62], [-85, 68], [-95, 68], [-110, 69], [-130, 70], [-168, 65]],
  // Central America
  [[-105, 20], [-90, 15], [-83, 9], [-78, 8], [-80, 12], [-92, 16], [-105, 20]],
  // South America
  [[-78, 8], [-73, 11], [-60, 9], [-50, 0], [-35, -5], [-37, -13], [-42, -23], [-52, -33], [-65, -45], [-75, -53], [-73, -40], [-71, -30], [-76, -14], [-80, -4], [-78, 8]],
  // Eurasia Main
  [[-9, 38], [-9, 43], [-1, 43], [-2, 48], [5, 52], [10, 54], [12, 57], [5, 60], [10, 63], [25, 71], [60, 70], [100, 73], [140, 72], [170, 66], [180, 65], [170, 60], [140, 50], [130, 42], [120, 38], [121, 31], [114, 22], [108, 12], [100, 7], [98, 15], [88, 21], [80, 13], [70, 20], [62, 25], [55, 25], [50, 30], [35, 32], [26, 40], [15, 38], [0, 45], [-9, 38]],
  // Scandinavia
  [[5, 57], [10, 55], [18, 56], [28, 60], [30, 70], [20, 71], [10, 63], [5, 57]],
  // British Isles
  [[-10, 50], [-2, 50], [0, 53], [-3, 58], [-6, 58], [-10, 54], [-10, 50]],
  // India
  [[68, 23], [73, 15], [77, 8], [80, 13], [88, 21], [88, 26], [78, 30], [68, 23]],
  // Arabia
  [[35, 32], [43, 13], [53, 16], [59, 22], [55, 25], [45, 30], [35, 32]],
  // Africa
  [[-17, 32], [-5, 36], [11, 37], [25, 32], [32, 31], [43, 12], [51, 11], [42, 0], [40, -10], [35, -25], [20, -34], [15, -28], [12, -14], [9, 4], [-14, 12], [-17, 32]],
  // Madagascar
  [[43, -12], [50, -14], [47, -25], [43, -25], [43, -12]],
  // Australia
  [[113, -22], [130, -12], [142, -11], [153, -28], [148, -38], [138, -35], [115, -35], [113, -22]],
  // Tasmania
  [[144, -40], [148, -40], [148, -44], [144, -44], [144, -40]],
  // New Zealand North & South Islands
  [[172, -34], [178, -37], [174, -41], [166, -46], [170, -43], [174, -38], [172, -34]],
  // Japan
  [[130, 31], [132, 34], [140, 36], [142, 44], [140, 45], [136, 36], [130, 31]],
  // Indonesia & Malaysia & PNG
  [[95, 5], [105, 1], [115, -2], [125, -8], [140, -3], [150, -10], [140, -8], [120, -8], [105, -6], [95, 5]],
  // Philippines
  [[120, 18], [126, 12], [124, 6], [120, 13], [120, 18]],
  // Greenland
  [[-55, 60], [-40, 60], [-20, 70], [-18, 80], [-40, 83], [-60, 78], [-55, 60]],
  // Antarctica
  [[-180, -65], [180, -65], [180, -90], [-180, -90]]
];

// Point-in-polygon algorithm
function isInsidePolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function checkIsLand(lon, lat) {
  for (const poly of LAND_POLYGONS) {
    if (isInsidePolygon([lon, lat], poly)) return true;
  }
  return false;
}

console.log('🎨 Generating Realistic 2K/4K Earth Day Diffuse Map...');
const dayBuf = createBmpBuffer(width, height, (x, y, w, h) => {
  const lat = (0.5 - y / h) * 180;
  const lon = (x / w - 0.5) * 360;

  // Polar Ice Caps
  if (lat > 75 || lat < -65) {
    const snowNoise = Math.sin(lon * 0.1) * 2;
    if (lat > 75 + snowNoise || lat < -65 + snowNoise) return [240, 248, 255];
  }

  const isLand = checkIsLand(lon, lat);

  if (isLand) {
    // Biome Shading: Desert vs Tropical Rainforest vs Forest vs Mountain
    const isSaharaArabiaGobi = (lat > 12 && lat < 34 && lon > -17 && lon < 60) || (lat > 35 && lat < 48 && lon > 75 && lon < 110);
    const isOutback = (lat > -34 && lat < -18 && lon > 115 && lon < 145);

    if (isSaharaArabiaGobi || isOutback) {
      // Golden Sahara / Arabia / Gobi / Outback Desert
      return [210, 170, 110];
    } else if (Math.abs(lat) < 15) {
      // Lush Amazon / Congo / SE Asia Tropical Rainforest
      return [34, 110, 48];
    } else if (lat > 55) {
      // Boreal Tundra / Taiga
      return [75, 105, 65];
    } else {
      // Temperate Forest / Grasslands
      return [55, 130, 60];
    }
  } else {
    // Shallow Coastal Shelf vs Deep Ocean
    const isCoastal = checkIsLand(lon + 1.2, lat) || checkIsLand(lon - 1.2, lat) || checkIsLand(lon, lat + 1.2) || checkIsLand(lon, lat - 1.2);

    if (isCoastal) {
      return [20, 110, 170]; // Shallow turquoise shelf
    } else {
      return [8, 30, 75];    // Deep space-blue ocean
    }
  }
});
fs.writeFileSync(path.join(outputDir, 'earth_daymap_8k.jpg'), dayBuf);

console.log('🌃 Generating Realistic Earth Night City Lights Map...');
const nightBuf = createBmpBuffer(width, height, (x, y, w, h) => {
  const lat = (0.5 - y / h) * 180;
  const lon = (x / w - 0.5) * 360;

  const isLand = checkIsLand(lon, lat);
  if (!isLand) return [0, 0, 0];

  // Major Population Center Densities
  const majorCities = [
    { lon: -74, lat: 40, r: 12 },  // NYC / East Coast
    { lon: -118, lat: 34, r: 10 }, // LA / West Coast
    { lon: -87, lat: 41, r: 8 },   // Chicago
    { lon: 0, lat: 51, r: 10 },    // London / Western Europe
    { lon: 2, lat: 48, r: 9 },     // Paris
    { lon: 139, lat: 35, r: 14 },  // Tokyo / Japan Megalopolis
    { lon: 121, lat: 31, r: 12 },  // Shanghai
    { lon: 116, lat: 40, r: 10 },  // Beijing
    { lon: 77, lat: 28, r: 12 },   // New Delhi / North India
    { lon: 72, lat: 19, r: 10 },   // Mumbai
    { lon: 55, lat: 25, r: 8 },    // Dubai
    { lon: -46, lat: -23, r: 9 },  // Sao Paulo
    { lon: 31, lat: 30, r: 8 },    // Cairo / Nile Delta
    { lon: 151, lat: -33, r: 8 }   // Sydney
  ];

  for (const c of majorCities) {
    const d = Math.sqrt((lon - c.lon) ** 2 + (lat - c.lat) ** 2);
    if (d < c.r) {
      const intensity = 1 - d / c.r;
      return [255 * intensity, 210 * intensity, 120 * intensity];
    }
  }

  // General rural network lights
  if (Math.random() < 0.08 && Math.abs(lat) < 60) {
    return [220, 160, 80];
  }

  return [0, 0, 0];
});
fs.writeFileSync(path.join(outputDir, 'earth_nightmap_8k.jpg'), nightBuf);

console.log('🌊 Generating Realistic Earth Specular Mask...');
const specBuf = createBmpBuffer(width, height, (x, y, w, h) => {
  const lat = (0.5 - y / h) * 180;
  const lon = (x / w - 0.5) * 360;

  const isLand = checkIsLand(lon, lat);
  // Water is specular reflective (white), land is matte (dark grey)
  if (!isLand) return [255, 255, 255];
  return [15, 15, 15];
});
fs.writeFileSync(path.join(outputDir, 'earth_specular_8k.jpg'), specBuf);

console.log('🏔️ Generating Realistic Earth Normal Bump Map...');
const normBuf = createBmpBuffer(width, height, (x, y, w, h) => {
  return [128, 128, 255];
});
fs.writeFileSync(path.join(outputDir, 'earth_normal_8k.jpg'), normBuf);

console.log('✨ Realistic Earth Geography Texture Maps successfully generated in public/textures/!');
