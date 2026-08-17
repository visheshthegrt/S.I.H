import * as THREE from 'three';

/**
 * Procedural Earth Diffuse Map (Land, Oceans, Mountains, Polar Ice)
 */
export function generateEarthDiffuseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep Ocean Base Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0f172a');
  oceanGrad.addColorStop(0.2, '#0c2440');
  oceanGrad.addColorStop(0.5, '#07162c');
  oceanGrad.addColorStop(0.8, '#0c2440');
  oceanGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shallow Coastal Water / Shelf Glow
  ctx.fillStyle = '#0e4166';
  ctx.globalAlpha = 0.4;
  drawContinentalOutlines(ctx, canvas.width, canvas.height, 18);
  ctx.globalAlpha = 1.0;

  // Continents Land Mass (Greenish Brown / Forest / Desert)
  ctx.fillStyle = '#2d4a27';
  drawContinentalOutlines(ctx, canvas.width, canvas.height, 0);

  // Sahara / Desert accents
  ctx.fillStyle = '#8b6938';
  ctx.globalAlpha = 0.7;
  drawDesertRegions(ctx, canvas.width, canvas.height);
  ctx.globalAlpha = 1.0;

  // Polar Ice Caps
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, canvas.width, 60); // Arctic
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80); // Antarctic

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Night Lights Map (Glowing Gold City Clusters)
 */
export function generateEarthNightTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Pitch Black Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glowing Gold City Light Dots
  ctx.fillStyle = '#ffaa33';
  drawCityLightClusters(ctx, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Earth Specular Ocean Mask (White Oceans = Glossy reflections, Black Land = Matte)
 */
export function generateEarthSpecularTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Oceans = Bright Specular
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Land Mass = Matte (Black)
  ctx.fillStyle = '#111111';
  drawContinentalOutlines(ctx, canvas.width, canvas.height, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Cloud Sphere Texture (Wispy White Clouds with Translucency)
 */
export function generateCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Transparent Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Soft Cloud Swirls
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * canvas.width;
    const y = 100 + Math.random() * (canvas.height - 200);
    const rx = 40 + Math.random() * 180;
    const ry = 15 + Math.random() * 45;

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, 2 * Math.PI);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Starfield & Nebula Background Cube / Sphere
 */
export function generateStarfieldTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep Space Dark Gradient
  const spaceGrad = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 100,
    canvas.width / 2, canvas.height / 2, canvas.width / 1.5
  );
  spaceGrad.addColorStop(0, '#070b19');
  spaceGrad.addColorStop(0.5, '#03050d');
  spaceGrad.addColorStop(1, '#010206');
  ctx.fillStyle = spaceGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft Cyan/Purple Nebula Glows
  ctx.globalCompositeOperation = 'screen';
  for (let n = 0; n < 6; n++) {
    const nx = Math.random() * canvas.width;
    const ny = Math.random() * canvas.height;
    const nGrad = ctx.createRadialGradient(nx, ny, 10, nx, ny, 300);
    nGrad.addColorStop(0, n % 2 === 0 ? 'rgba(0, 240, 255, 0.08)' : 'rgba(157, 78, 221, 0.08)');
    nGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nGrad;
    ctx.beginPath();
    ctx.arc(nx, ny, 300, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Twinkling Stars
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 2000; i++) {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * canvas.height;
    const size = Math.random() < 0.9 ? Math.random() * 1.5 : Math.random() * 2.8;
    const alpha = 0.3 + Math.random() * 0.7;

    const colors = ['#ffffff', '#cce6ff', '#fff4cc', '#00f0ff'];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Helper drawing functions for realistic continent landmass approximations
function drawContinentalOutlines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number
) {
  const scaleX = w / 360;
  const scaleY = h / 180;

  const toCanvas = (lon: number, lat: number) => ({
    x: (lon + 180) * scaleX,
    y: (90 - lat) * scaleY
  });

  const polygons = [
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
    // New Zealand
    [[172, -34], [178, -37], [174, -41], [166, -46], [170, -43], [174, -38], [172, -34]],
    // Japan
    [[130, 31], [132, 34], [140, 36], [142, 44], [140, 45], [136, 36], [130, 31]],
    // Indonesia & Malaysia
    [[95, 5], [105, 1], [115, -2], [125, -8], [140, -3], [150, -10], [140, -8], [120, -8], [105, -6], [95, 5]],
    // Philippines
    [[120, 18], [126, 12], [124, 6], [120, 13], [120, 18]],
    // Greenland
    [[-55, 60], [-40, 60], [-20, 70], [-18, 80], [-40, 83], [-60, 78], [-55, 60]]
  ];

  for (const poly of polygons) {
    drawPoly(ctx, poly as [number, number][], toCanvas, offset);
  }
}

function drawDesertRegions(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const scaleX = w / 360;
  const scaleY = h / 180;
  const toCanvas = (lon: number, lat: number) => ({
    x: (lon + 180) * scaleX,
    y: (90 - lat) * scaleY
  });

  // Sahara & Arabian Peninsula
  drawPoly(ctx, [
    [-15, 30], [30, 30], [55, 25], [50, 15], [30, 15], [-10, 18]
  ], toCanvas, 0);

  // Gobi Desert
  drawPoly(ctx, [
    [80, 45], [110, 45], [115, 38], [85, 38]
  ], toCanvas, 0);

  // Australian Outback
  drawPoly(ctx, [
    [120, -20], [140, -22], [138, -30], [122, -28]
  ], toCanvas, 0);
}

function drawCityLightClusters(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const scaleX = w / 360;
  const scaleY = h / 180;

  const cities = [
    // North America East/West Coast
    { lon: -74, lat: 40, r: 8 }, { lon: -118, lat: 34, r: 7 }, { lon: -87, lat: 41, r: 6 },
    { lon: -95, lat: 29, r: 5 }, { lon: -122, lat: 37, r: 6 }, { lon: -75, lat: 45, r: 4 },
    // Europe
    { lon: 0, lat: 51, r: 8 }, { lon: 2, lat: 48, r: 7 }, { lon: 13, lat: 52, r: 5 },
    { lon: 12, lat: 41, r: 5 }, { lon: -3, lat: 40, r: 5 }, { lon: 37, lat: 55, r: 7 },
    // Asia
    { lon: 139, lat: 35, r: 10 }, { lon: 121, lat: 31, r: 9 }, { lon: 116, lat: 40, r: 8 },
    { lon: 114, lat: 22, r: 8 }, { lon: 77, lat: 28, r: 8 }, { lon: 72, lat: 19, r: 7 },
    { lon: 106, lat: -6, r: 6 }, { lon: 126, lat: 37, r: 7 }, { lon: 100, lat: 13, r: 6 },
    // Middle East & South America & Africa & Australia
    { lon: 55, lat: 25, r: 6 }, { lon: 46, lat: 24, r: 5 }, { lon: -46, lat: -23, r: 7 },
    { lon: -58, lat: -34, r: 6 }, { lon: 31, lat: 30, r: 6 }, { lon: 28, lat: -26, r: 5 },
    { lon: 151, lat: -33, r: 6 }
  ];

  for (const c of cities) {
    const cx = (c.lon + 180) * scaleX;
    const cy = (90 - c.lat) * scaleY;

    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.r * 2);
    radGrad.addColorStop(0, '#ffffff');
    radGrad.addColorStop(0.3, '#ffcc44');
    radGrad.addColorStop(0.7, 'rgba(255, 170, 0, 0.4)');
    radGrad.addColorStop(1, 'rgba(255, 170, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, c.r * 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Scattered rural highway lights
  ctx.fillStyle = '#ffaa33';
  for (let i = 0; i < 400; i++) {
    const lon = -120 + Math.random() * 260;
    const lat = 10 + Math.random() * 50;
    const x = (lon + 180) * scaleX;
    const y = (90 - lat) * scaleY;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}

function drawPoly(
  ctx: CanvasRenderingContext2D,
  coords: [number, number][],
  toCanvas: (lon: number, lat: number) => { x: number; y: number },
  offset: number
) {
  ctx.beginPath();
  for (let i = 0; i < coords.length; i++) {
    const p = toCanvas(coords[i][0], coords[i][1]);
    const px = p.x + offset;
    const py = p.y + offset;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/**
  * Progressive 8K NASA Texture Loader
  * Loads 8K Earth Day, Night, Specular, and Normal maps from public/textures/
  * Falls back seamlessly to procedural textures if files are missing or loading.
  */
export interface EarthTextureSet {
  dayMap: THREE.Texture;
  nightMap: THREE.Texture;
  specularMap: THREE.Texture;
  normalMap?: THREE.Texture;
}

export function loadHighResEarthTextures(
  onProgress?: (loaded: number, total: number) => void,
  onComplete?: (textures: EarthTextureSet) => void
): EarthTextureSet {
  const loader = new THREE.TextureLoader();

  // Instant procedural fallback maps
  const textures: EarthTextureSet = {
    dayMap: generateEarthDiffuseTexture(),
    nightMap: generateEarthNightTexture(),
    specularMap: generateEarthSpecularTexture()
  };

  const urls = {
    dayMap: '/textures/earth_daymap_8k.jpg',
    nightMap: '/textures/earth_nightmap_8k.jpg',
    specularMap: '/textures/earth_specular_8k.jpg',
    normalMap: '/textures/earth_normal_8k.jpg'
  };

  let loadedCount = 0;
  const total = 4;

  const checkProgress = () => {
    loadedCount++;
    if (onProgress) onProgress(loadedCount, total);
    if (loadedCount === total && onComplete) onComplete(textures);
  };

  // Attempt loading 8K maps from public/textures/
  loader.load(
    urls.dayMap,
    (tex) => { tex.colorSpace = THREE.SRGBColorSpace; textures.dayMap = tex; checkProgress(); },
    undefined,
    () => checkProgress()
  );

  loader.load(
    urls.nightMap,
    (tex) => { tex.colorSpace = THREE.SRGBColorSpace; textures.nightMap = tex; checkProgress(); },
    undefined,
    () => checkProgress()
  );

  loader.load(
    urls.specularMap,
    (tex) => { textures.specularMap = tex; checkProgress(); },
    undefined,
    () => checkProgress()
  );

  loader.load(
    urls.normalMap,
    (tex) => { textures.normalMap = tex; checkProgress(); },
    undefined,
    () => checkProgress()
  );

  return textures;
}

