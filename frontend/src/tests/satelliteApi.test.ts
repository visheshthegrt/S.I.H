import { describe, it, expect } from 'vitest';
import { fetchSatellitesFromDatabase } from '../services/satelliteApi';
import { FULL_SATELLITE_CATALOG, generateStarlinkConstellation } from '../services/tleDatabase';

describe('Satellite API & Catalog Services', () => {
  it('should load full satellite catalog with ISS, Hubble, GPS, and Starlink entries', () => {
    expect(FULL_SATELLITE_CATALOG.length).toBeGreaterThan(50);

    const iss = FULL_SATELLITE_CATALOG.find(s => s.id === '25544');
    expect(iss).toBeDefined();
    expect(iss?.name).toContain('ISS');
    expect(iss?.category).toBe('station');
    expect(iss?.tle.line1).toBeDefined();
    expect(iss?.tle.line2).toBeDefined();
  });

  it('should generate Starlink constellation satellites with valid TLE structures', () => {
    const starlinks = generateStarlinkConstellation();
    expect(starlinks.length).toBeGreaterThan(30);

    starlinks.forEach(sat => {
      expect(sat.category).toBe('starlink');
      expect(sat.tle.line1).toContain('1 ');
      expect(sat.tle.line2).toContain('2 ');
      expect(sat.apogeeKm).toBeGreaterThan(500);
      expect(sat.perigeeKm).toBeGreaterThan(500);
    });
  });

  it('should fetch satellites from database service (local fallback mode)', async () => {
    const result = await fetchSatellitesFromDatabase();

    expect(result.satellites).toBeDefined();
    expect(result.satellites.length).toBe(FULL_SATELLITE_CATALOG.length);
    expect(result.status.mode).toBe('local_catalog');
  });
});
