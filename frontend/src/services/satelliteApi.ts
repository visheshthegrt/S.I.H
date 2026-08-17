import { SatelliteRecord } from '../types/satellite';
import { FULL_SATELLITE_CATALOG } from './tleDatabase';

// Configurable API endpoint from environment variables
const API_BASE_URL = 'http://127.0.0.1:8000';

export interface DatabaseStatus {
  connected: boolean;
  lastUpdated: Date | null;
  mode: 'database' | 'local_catalog';
  sourceUrl: string;
}

/**
 * Fetches satellite TLE records from friend's database API endpoint,
 * falling back to built-in TLE catalog if endpoint is not specified or offline.
 */
export async function fetchSatellitesFromDatabase(): Promise<{
  satellites: SatelliteRecord[];
  status: DatabaseStatus;
}> {
  if (!API_BASE_URL) {
    return {
      satellites: FULL_SATELLITE_CATALOG,
      status: {
        connected: false,
        lastUpdated: new Date(),
        mode: 'local_catalog',
        sourceUrl: 'Built-in Celestrak TLE Catalog'
      }
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/satellites`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Database response HTTP ${response.status}`);
    }

    const data = await response.json();
    // Validate format (expects array of SatelliteRecord or Celestrak format)
    const remoteSatellites: SatelliteRecord[] = Array.isArray(data)
      ? data.map(item => normalizeSatelliteRecord(item))
      : FULL_SATELLITE_CATALOG;

    return {
      satellites: remoteSatellites,
      status: {
        connected: true,
        lastUpdated: new Date(),
        mode: 'database',
        sourceUrl: API_BASE_URL
      }
    };
  } catch (err) {
    console.warn('Real-time Satellite Database offline, falling back to local TLE catalog:', err);
    return {
      satellites: FULL_SATELLITE_CATALOG,
      status: {
        connected: false,
        lastUpdated: new Date(),
        mode: 'local_catalog',
        sourceUrl: `${API_BASE_URL} (Offline - using local backup)`
      }
    };
  }
}

/**
 * Subscribes to live WebSocket / Server-Sent Events updates from database
 */
export function subscribeToSatelliteUpdates(
  onUpdate: (satellites: SatelliteRecord[]) => void
): () => void {
  if (!API_BASE_URL) return () => {};

  try {
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/api/satellites/stream';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (Array.isArray(payload)) {
          onUpdate(payload.map(normalizeSatelliteRecord));
        }
      } catch (e) {
        console.error('Error parsing live satellite WS update:', e);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  } catch (err) {
    return () => {};
  }
}

/**
 * Helper to normalize raw JSON records from external database
 */
function normalizeSatelliteRecord(raw: any): SatelliteRecord {
  return {
    id: String(raw.id || raw.noradId || raw.NORAD_CAT_ID),
    noradId: Number(raw.noradId || raw.NORAD_CAT_ID || raw.id),
    name: String(raw.name || raw.OBJECT_NAME || 'UNKNOWN SATELLITE'),
    category: raw.category || 'starlink',
    country: raw.country || raw.COUNTRY_CODE || 'INTERNATIONAL',
    launchYear: Number(raw.launchYear || 2022),
    orbitType: raw.orbitType || 'LEO',
    inclinationDeg: Number(raw.inclinationDeg || raw.INCLINATION || 51.6),
    periodMinutes: Number(raw.periodMinutes || raw.PERIOD || 95.0),
    apogeeKm: Number(raw.apogeeKm || raw.APOGEE || 400),
    perigeeKm: Number(raw.perigeeKm || raw.PERIGEE || 400),
    description: raw.description,
    tle: {
      line1: raw.tle?.line1 || raw.TLE_LINE1 || '',
      line2: raw.tle?.line2 || raw.TLE_LINE2 || ''
    }
  };
}
