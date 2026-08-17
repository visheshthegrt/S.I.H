import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SatelliteCategory, SatelliteRecord } from '../../types/satellite';
import { getSatelliteTelemetry } from '../../services/orbitEngine';

interface SatellitesLODProps {
  satellites: SatelliteRecord[];
  simulationDate: Date;
  selectedSatId: string | null;
  hoveredSatId: string | null;
  onSelectSatellite: (sat: SatelliteRecord) => void;
  onHoverSatellite: (sat: SatelliteRecord | null) => void;
}

const CATEGORY_COLORS: Record<SatelliteCategory, THREE.Color> = {
  station: new THREE.Color('#ffd700'),     // Bright Gold
  starlink: new THREE.Color('#00f0ff'),    // Cyan
  gps: new THREE.Color('#39ff14'),         // Lime Green
  science: new THREE.Color('#b5179e'),     // Electric Purple
  geostationary: new THREE.Color('#ff9e00'),// Amber
  debris: new THREE.Color('#ff0055')       // Coral Red
};

export const SatellitesLOD: React.FC<SatellitesLODProps> = ({
  satellites,
  simulationDate,
  selectedSatId,
  hoveredSatId,
  onSelectSatellite,
  onHoverSatellite
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Create point circle sprite texture
  const spriteTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Compute buffers for THREE.BufferGeometry
  const { positions, colors, sizes } = useMemo(() => {
    const posArr = new Float32Array(satellites.length * 3);
    const colArr = new Float32Array(satellites.length * 3);
    const sizeArr = new Float32Array(satellites.length);

    satellites.forEach((sat, i) => {
      const telemetry = getSatelliteTelemetry(sat, simulationDate);
      posArr[i * 3] = telemetry.position3D[0];
      posArr[i * 3 + 1] = telemetry.position3D[1];
      posArr[i * 3 + 2] = telemetry.position3D[2];

      const baseColor = CATEGORY_COLORS[sat.category] || CATEGORY_COLORS.starlink;
      colArr[i * 3] = baseColor.r;
      colArr[i * 3 + 1] = baseColor.g;
      colArr[i * 3 + 2] = baseColor.b;

      // Make ISS and station points larger
      let pSize = sat.category === 'station' ? 14 : 9;
      if (sat.id === selectedSatId) pSize = 20;
      else if (sat.id === hoveredSatId) pSize = 16;
      sizeArr[i] = pSize;
    });

    return { positions: posArr, colors: colArr, sizes: sizeArr };
  }, [satellites, simulationDate, selectedSatId, hoveredSatId]);

  // Update geometry position buffer in real time
  useEffect(() => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;

    if (posAttr && posAttr.array.length === positions.length) {
      posAttr.array.set(positions);
      posAttr.needsUpdate = true;
    }
  }, [positions]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        vertexColors
        map={spriteTexture}
        transparent
        alphaTest={0.01}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};
