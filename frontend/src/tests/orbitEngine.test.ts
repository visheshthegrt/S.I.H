import { describe, it, expect } from 'vitest';
import { SATELLITE_CATALOG } from '../services/tleDatabase';
import {
  getSatelliteTelemetry,
  getOrbitTrajectoryPath,
  EARTH_RADIUS_KM,
  SCENE_SCALE_KM_PER_UNIT,
  EARTH_RADIUS_UNITS
} from '../services/orbitEngine';

describe('SGP4 Orbit Engine & Scale System', () => {
  it('should export standard SCENE_SCALE_KM_PER_UNIT of 1000', () => {
    expect(SCENE_SCALE_KM_PER_UNIT).toBe(1000);
    expect(EARTH_RADIUS_UNITS).toBeCloseTo(6.371, 3);
  });
  const issRecord = SATELLITE_CATALOG.find(s => s.id === '25544')!;

  it('should propagate ISS (25544) telemetry accurately', () => {
    const telemetry = getSatelliteTelemetry(issRecord, new Date());
    
    expect(telemetry.id).toBe('25544');
    expect(telemetry.altKm).toBeGreaterThan(300);
    expect(telemetry.altKm).toBeLessThan(500);
    expect(telemetry.velocityKms).toBeGreaterThan(7.0);
    expect(telemetry.velocityKms).toBeLessThan(8.2);
    expect(telemetry.lat).toBeGreaterThanOrEqual(-90);
    expect(telemetry.lat).toBeLessThanOrEqual(90);
    expect(telemetry.lng).toBeGreaterThanOrEqual(-180);
    expect(telemetry.lng).toBeLessThanOrEqual(180);
  });

  it('should generate a 3D orbit trajectory path with correct sample size', () => {
    const path = getOrbitTrajectoryPath(issRecord, new Date(), 50);
    expect(path.length).toBe(51);

    // Each point should be at altitude above Earth's surface
    path.forEach(([x, y, z]) => {
      const radiusUnits = Math.sqrt(x * x + y * y + z * z);
      const radiusKm = radiusUnits * 1000;
      expect(radiusKm).toBeGreaterThan(EARTH_RADIUS_KM);
    });
  });

  it('should handle geostationary satellites correctly (GOES 16)', () => {
    const goesRecord = SATELLITE_CATALOG.find(s => s.id === '41866')!;
    const telemetry = getSatelliteTelemetry(goesRecord, new Date());

    expect(telemetry.altKm).toBeGreaterThan(34000);
    expect(telemetry.altKm).toBeLessThan(37000);
    expect(telemetry.velocityKms).toBeLessThan(3.5);
  });
});
