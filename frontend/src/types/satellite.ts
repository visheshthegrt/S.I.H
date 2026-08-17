export type SatelliteCategory = 
  | 'station' 
  | 'starlink' 
  | 'gps' 
  | 'science' 
  | 'geostationary' 
  | 'debris';

export type OrbitType = 'LEO' | 'MEO' | 'GEO' | 'HEO';

export interface TLEData {
  line1: string;
  line2: string;
}

export interface SatelliteRecord {
  id: string;
  noradId: number;
  name: string;
  category: SatelliteCategory;
  tle: TLEData;
  country: string;
  launchYear: number;
  orbitType: OrbitType;
  inclinationDeg: number;
  periodMinutes: number;
  apogeeKm: number;
  perigeeKm: number;
  description?: string;
}

export interface SatelliteTelemetry {
  id: string;
  lat: number;
  lng: number;
  altKm: number;
  velocityKms: number;
  velocityKmh: number;
  position3D: [number, number, number]; // scaled world coordinates (1 unit = 1,000 km)
}

export type CameraMode = 'global' | 'track' | 'orbit';
