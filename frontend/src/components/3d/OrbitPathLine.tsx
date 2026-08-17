import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SatelliteRecord } from '../../types/satellite';
import { getOrbitTrajectoryPath } from '../../services/orbitEngine';

interface OrbitPathLineProps {
  satellite: SatelliteRecord;
  simulationDate: Date;
}

export const OrbitPathLine: React.FC<OrbitPathLineProps> = ({
  satellite,
  simulationDate
}) => {
  const points = useMemo(() => {
    const rawPoints = getOrbitTrajectoryPath(satellite, simulationDate, 120);
    return rawPoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  }, [satellite, simulationDate]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <group>
      {/* Outer Cyan Glow Line */}
      {React.createElement('line', { geometry }, 
        React.createElement('lineBasicMaterial', {
          color: "#00f0ff",
          transparent: true,
          opacity: 0.7,
          linewidth: 2
        })
      )}

      {/* Inner Bright Core Line */}
      {React.createElement('line', { geometry },
        React.createElement('lineBasicMaterial', {
          color: "#ffffff",
          transparent: true,
          opacity: 0.4,
          linewidth: 1
        })
      )}
    </group>
  );
};
