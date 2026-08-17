import * as satellite from 'satellite.js';
import { SatelliteRecord, SatelliteTelemetry } from '../types/satellite';

export const SCENE_SCALE_KM_PER_UNIT = 1000; // 1 Three.js unit = 1,000 km
export const EARTH_RADIUS_KM = 6371;
export const WORLD_SCALE_FACTOR = SCENE_SCALE_KM_PER_UNIT;
export const EARTH_RADIUS_UNITS = EARTH_RADIUS_KM / SCENE_SCALE_KM_PER_UNIT; // 6.371 units

/**
 * Propagates a satellite TLE to a given JS Date and computes ECF 3D world coordinates + geodetic telemetry.
 */
export function getSatelliteTelemetry(
  satRecord: SatelliteRecord,
  date: Date = new Date()
): SatelliteTelemetry {
  try {
    const satrec = satellite.twoline2satrec(satRecord.tle.line1, satRecord.tle.line2);
    const positionAndVelocity = satellite.propagate(satrec, date);
    
    if (
      !positionAndVelocity.position || 
      typeof positionAndVelocity.position === 'boolean' ||
      !positionAndVelocity.velocity ||
      typeof positionAndVelocity.velocity === 'boolean'
    ) {
      return getFallbackTelemetry(satRecord, date);
    }

    const gmst = satellite.gstime(date);
    const eciPos = positionAndVelocity.position as { x: number; y: number; z: number };
    const eciVel = positionAndVelocity.velocity as { x: number; y: number; z: number };

    // Convert ECI (Earth Centered Inertial) to Geodetic (Lat, Lng, Alt)
    const geodetic = satellite.eciToGeodetic(eciPos, gmst);
    const lat = satellite.degreesLat(geodetic.latitude);
    const lng = satellite.degreesLong(geodetic.longitude);
    const altKm = geodetic.height;

    // Calculate total magnitude velocity (km/s)
    const velocityKms = Math.sqrt(
      eciVel.x * eciVel.x + eciVel.y * eciVel.y + eciVel.z * eciVel.z
    );
    const velocityKmh = velocityKms * 3600;

    // Convert Lat / Lng / Alt to 3D Cartesian coordinates in Three.js frame
    // Three.js: +Y is North Pole, +X is 0 deg lat/lon (Prime Meridian), +Z is 90 deg East
    const rUnits = (EARTH_RADIUS_KM + altKm) / WORLD_SCALE_FACTOR;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -rUnits * Math.sin(phi) * Math.cos(theta);
    const z = rUnits * Math.sin(phi) * Math.sin(theta);
    const y = rUnits * Math.cos(phi);

    return {
      id: satRecord.id,
      lat,
      lng,
      altKm: Math.round(altKm),
      velocityKms: Number(velocityKms.toFixed(2)),
      velocityKmh: Math.round(velocityKmh),
      position3D: [x, y, z]
    };
  } catch (err) {
    return getFallbackTelemetry(satRecord, date);
  }
}

/**
 * Calculates orbital trajectory 3D points for one full revolution around Earth.
 */
export function getOrbitTrajectoryPath(
  satRecord: SatelliteRecord,
  baseDate: Date = new Date(),
  steps: number = 100
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const satrec = satellite.twoline2satrec(satRecord.tle.line1, satRecord.tle.line2);

  // Period in minutes (default ~95 mins if unavailable)
  const periodMinutes = satRecord.periodMinutes || 95;
  const stepMs = (periodMinutes * 60 * 1000) / steps;

  for (let i = 0; i <= steps; i++) {
    const sampleDate = new Date(baseDate.getTime() + i * stepMs);
    const gmst = satellite.gstime(sampleDate);
    const posVel = satellite.propagate(satrec, sampleDate);

    if (posVel.position && typeof posVel.position !== 'boolean') {
      const eciPos = posVel.position as { x: number; y: number; z: number };
      const geodetic = satellite.eciToGeodetic(eciPos, gmst);
      const lat = satellite.degreesLat(geodetic.latitude);
      const lng = satellite.degreesLong(geodetic.longitude);
      const altKm = geodetic.height;

      const rUnits = (EARTH_RADIUS_KM + altKm) / WORLD_SCALE_FACTOR;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);

      const x = -rUnits * Math.sin(phi) * Math.cos(theta);
      const z = rUnits * Math.sin(phi) * Math.sin(theta);
      const y = rUnits * Math.cos(phi);

      points.push([x, y, z]);
    }
  }

  return points;
}

/**
 * Fallback telemetry for robust rendering if propagation returns invalid state.
 */
function getFallbackTelemetry(
  satRecord: SatelliteRecord,
  date: Date
): SatelliteTelemetry {
  const time = date.getTime() / 1000;
  const speed = 7.66; // km/s average LEO speed
  const rUnits = (EARTH_RADIUS_KM + (satRecord.apogeeKm || 400)) / WORLD_SCALE_FACTOR;
  
  const incRad = (satRecord.inclinationDeg || 51.6) * (Math.PI / 180);
  const omega = (2 * Math.PI) / ((satRecord.periodMinutes || 90) * 60);
  const angle = time * omega;

  const lat = Math.sin(angle) * (satRecord.inclinationDeg || 51.6);
  const lng = ((angle * 180 / Math.PI) % 360) - 180;

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -rUnits * Math.sin(phi) * Math.cos(theta);
  const z = rUnits * Math.sin(phi) * Math.sin(theta);
  const y = rUnits * Math.cos(phi);

  return {
    id: satRecord.id,
    lat,
    lng,
    altKm: satRecord.apogeeKm || 400,
    velocityKms: speed,
    velocityKmh: Math.round(speed * 3600),
    position3D: [x, y, z]
  };
}
