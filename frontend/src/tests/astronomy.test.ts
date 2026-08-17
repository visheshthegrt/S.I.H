import { describe, it, expect } from 'vitest';
import { getSunPosition, getMoonPosition } from '../services/astronomy';

describe('Real-Time Astronomical Solar & Lunar Sync Engine', () => {
  it('should compute real-time subsolar position vector and coordinates', () => {
    const now = new Date('2026-08-12T12:00:00Z');
    const sun = getSunPosition(now);

    expect(sun.direction).toBeDefined();
    expect(sun.subsolarLat).toBeGreaterThan(10); // Northern hemisphere summer
    expect(sun.subsolarLat).toBeLessThan(24);
    expect(sun.subsolarLng).toBeCloseTo(0, 1); // 12:00 UTC subsolar longitude ~ 0 deg Prime Meridian
  });

  it('should compute real-time 3D Moon orbit position and lunar phase', () => {
    const now = new Date('2026-08-12T12:00:00Z');
    const moon = getMoonPosition(now);

    expect(moon.position3D.length).toBe(3);
    expect(moon.distanceKm).toBe(384400);
    expect(moon.phasePercent).toBeGreaterThanOrEqual(0);
    expect(moon.phasePercent).toBeLessThanOrEqual(100);
    expect(typeof moon.phaseName).toBe('string');
  });
});
