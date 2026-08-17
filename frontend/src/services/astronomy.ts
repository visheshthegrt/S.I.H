import * as THREE from 'three';
import * as satellite from 'satellite.js';

export interface SolarPosition {
  direction: THREE.Vector3;
  subsolarLat: number;
  subsolarLng: number;
}

export interface LunarPosition {
  position3D: [number, number, number];
  phasePercent: number; // 0 to 100%
  phaseName: string;
  distanceKm: number;
}

/**
 * Calculates the exact real-time 3D solar vector and subsolar point (Lat/Lng) for a given UTC Date.
 */
export function getSunPosition(date: Date = new Date()): SolarPosition {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  
  // Day of year
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Solar declination angle (approximate formula in radians)
  const declinationRad = 23.44 * (Math.PI / 180) * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
  const subsolarLat = declinationRad * (180 / Math.PI);

  // Greenwich Hour Angle (GHA)
  const ghaDeg = (utcHours - 12) * 15;
  let subsolarLng = -ghaDeg;
  subsolarLng = ((subsolarLng + 180) % 360) - 180;

  // Convert Subsolar Lat/Lng to 3D direction vector in Three.js coordinate system
  const phi = (90 - subsolarLat) * (Math.PI / 180);
  const theta = (subsolarLng + 180) * (Math.PI / 180);

  const x = -Math.sin(phi) * Math.cos(theta);
  const z = Math.sin(phi) * Math.sin(theta);
  const y = Math.cos(phi);

  const direction = new THREE.Vector3(x, y, z).normalize();

  return {
    direction,
    subsolarLat: Number(subsolarLat.toFixed(2)),
    subsolarLng: Number(subsolarLng.toFixed(2))
  };
}

/**
 * Calculates the real-time 3D Moon position vector & lunar phase for a given UTC Date.
 */
export function getMoonPosition(date: Date = new Date()): LunarPosition {
  const timeSec = date.getTime() / 1000;
  
  // Moon synodic period = 29.53059 days
  const synodicPeriodSec = 29.53059 * 86400;
  // Known new moon reference epoch (Jan 11, 2024 11:57 UTC)
  const refNewMoonSec = 1704974220;

  const cycleAgeSec = (timeSec - refNewMoonSec) % synodicPeriodSec;
  const phaseRatio = (cycleAgeSec < 0 ? cycleAgeSec + synodicPeriodSec : cycleAgeSec) / synodicPeriodSec;
  const phasePercent = Math.round(phaseRatio * 100);

  let phaseName = 'New Moon';
  if (phaseRatio > 0.03 && phaseRatio < 0.22) phaseName = 'Waxing Crescent';
  else if (phaseRatio >= 0.22 && phaseRatio <= 0.28) phaseName = 'First Quarter';
  else if (phaseRatio > 0.28 && phaseRatio < 0.47) phaseName = 'Waxing Gibbous';
  else if (phaseRatio >= 0.47 && phaseRatio <= 0.53) phaseName = 'Full Moon';
  else if (phaseRatio > 0.53 && phaseRatio < 0.72) phaseName = 'Waning Gibbous';
  else if (phaseRatio >= 0.72 && phaseRatio <= 0.78) phaseName = 'Third Quarter';
  else if (phaseRatio > 0.78 && phaseRatio < 0.97) phaseName = 'Waning Crescent';

  // Moon real distance ~384,400 km = ~38.4 units in scene scale (scaled down slightly for visual clarity to 38.4 units)
  const moonDistanceKm = 384400;
  const moonDistanceUnits = 38.4;

  // Moon orbital inclination = 5.14 degrees, sidereal period = 27.32 days
  const siderealPeriodSec = 27.32166 * 86400;
  const orbitAngle = ((timeSec % siderealPeriodSec) / siderealPeriodSec) * 2 * Math.PI;

  const incRad = 5.14 * (Math.PI / 180);

  const x = moonDistanceUnits * Math.cos(orbitAngle);
  const z = moonDistanceUnits * Math.sin(orbitAngle) * Math.cos(incRad);
  const y = moonDistanceUnits * Math.sin(orbitAngle) * Math.sin(incRad);

  return {
    position3D: [x, y, z],
    phasePercent,
    phaseName,
    distanceKm: moonDistanceKm
  };
}
