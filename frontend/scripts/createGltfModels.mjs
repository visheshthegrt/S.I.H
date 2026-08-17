import fs from 'node:fs';
import path from 'node:path';

function createGlbFile(name, colorHex) {
  const jsonContent = {
    asset: { version: '2.0', generator: 'EarthSatelliteViewer-AssetGenerator' },
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [
      {
        name,
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
            material: 0
          }
        ]
      }
    ],
    materials: [
      {
        name: `${name}_Mat`,
        pbrMetallicRoughness: {
          baseColorFactor: [
            ((colorHex >> 16) & 255) / 255,
            ((colorHex >> 8) & 255) / 255,
            (colorHex & 255) / 255,
            1.0
          ],
          metallicFactor: 0.9,
          roughnessFactor: 0.2
        }
      }
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: 8,
        type: 'VEC3',
        min: [-1, -0.5, -1],
        max: [1, 0.5, 1]
      },
      {
        bufferView: 1,
        componentType: 5126, // FLOAT
        count: 8,
        type: 'VEC3'
      },
      {
        bufferView: 2,
        componentType: 5123, // UNSIGNED_SHORT
        count: 36,
        type: 'SCALAR'
      }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 96 },
      { buffer: 0, byteOffset: 96, byteLength: 96 },
      { buffer: 0, byteOffset: 192, byteLength: 72 }
    ],
    buffers: [{ byteLength: 264 }]
  };

  const jsonString = JSON.stringify(jsonContent);
  let jsonBuffer = Buffer.from(jsonString, 'utf-8');
  // Pad JSON buffer to 4-byte boundary
  const remainder = jsonBuffer.length % 4;
  if (remainder !== 0) {
    const pad = 4 - remainder;
    jsonBuffer = Buffer.concat([jsonBuffer, Buffer.from(' '.repeat(pad), 'utf-8')]);
  }

  // Binary buffer data (Positions, Normals, Indices for a box)
  const posArr = new Float32Array([
    -1, -0.5,  1,   1, -0.5,  1,   1,  0.5,  1,  -1,  0.5,  1,
    -1, -0.5, -1,   1, -0.5, -1,   1,  0.5, -1,  -1,  0.5, -1
  ]);
  const normArr = new Float32Array([
    -0.577, -0.577,  0.577,   0.577, -0.577,  0.577,   0.577,  0.577,  0.577,  -0.577,  0.577,  0.577,
    -0.577, -0.577, -0.577,   0.577, -0.577, -0.577,   0.577,  0.577, -0.577,  -0.577,  0.577, -0.577
  ]);
  const indicesArr = new Uint16Array([
    0, 1, 2,  0, 2, 3, // Front
    1, 5, 6,  1, 6, 2, // Right
    5, 4, 7,  5, 7, 6, // Back
    4, 0, 3,  4, 3, 7, // Left
    3, 2, 6,  3, 6, 7, // Top
    4, 5, 1,  4, 1, 0  // Bottom
  ]);

  const binBuffer = Buffer.concat([
    Buffer.from(posArr.buffer),
    Buffer.from(normArr.buffer),
    Buffer.from(indicesArr.buffer)
  ]);

  // GLB Header (12 bytes)
  const totalLength = 12 + 8 + jsonBuffer.length + 8 + binBuffer.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46544C47, 0); // magic: 'glTF'
  header.writeUInt32LE(2, 4);          // version: 2
  header.writeUInt32LE(totalLength, 8); // total file length

  // JSON Chunk Header
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

  // BIN Chunk Header
  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBuffer.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN'

  const glbData = Buffer.concat([
    header,
    jsonChunkHeader,
    jsonBuffer,
    binChunkHeader,
    binBuffer
  ]);

  const targetPath = path.resolve(process.cwd(), `public/models/${name}.glb`);
  fs.writeFileSync(targetPath, glbData);
  console.log(`✅ Generated GLTF/GLB model: public/models/${name}.glb (${glbData.length} bytes)`);
}

createGlbFile('iss', 0xffd700);
createGlbFile('hubble', 0x00f0ff);
createGlbFile('starlink', 0x39ff14);
