import * as satellite from 'satellite.js';

export const SCENE_SCALE_KM_PER_UNIT = 1000;
export const EARTH_RADIUS_KM = 6371;

interface TleItem {
  id: string;
  line1: string;
  line2: string;
}

interface InitMessage {
  type: 'init';
  satellites: TleItem[];
}

interface TickMessage {
  type: 'tick';
  timestamp: number;
}

type WorkerIncomingMessage = InitMessage | TickMessage;

let satRecords: { id: string; satrec: satellite.SatRec }[] = [];

self.onmessage = (e: MessageEvent<WorkerIncomingMessage>) => {
  const data = e.data;

  if (data.type === 'init') {
    satRecords = data.satellites.map(s => ({
      id: s.id,
      satrec: satellite.twoline2satrec(s.line1, s.line2)
    }));
    return;
  }

  if (data.type === 'tick') {
    const date = new Date(data.timestamp);
    const gmst = satellite.gstime(date);
    const count = satRecords.length;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const item = satRecords[i];
      const posVel = satellite.propagate(item.satrec, date);

      if (posVel.position && typeof posVel.position !== 'boolean') {
        const eciPos = posVel.position as { x: number; y: number; z: number };
        const geodetic = satellite.eciToGeodetic(eciPos, gmst);
        const lat = satellite.degreesLat(geodetic.latitude);
        const lng = satellite.degreesLong(geodetic.longitude);
        const altKm = geodetic.height;

        const rUnits = (EARTH_RADIUS_KM + altKm) / SCENE_SCALE_KM_PER_UNIT;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        positions[i * 3] = -rUnits * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = rUnits * Math.cos(phi);
        positions[i * 3 + 2] = rUnits * Math.sin(phi) * Math.sin(theta);
      } else {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
      }
    }

    // Transfer the Float32Array buffer back with zero-copy
    self.postMessage(
      {
        type: 'positions',
        timestamp: data.timestamp,
        buffer: positions.buffer
      },
      // Transferable array
      [positions.buffer] as any
    );
  }
};
