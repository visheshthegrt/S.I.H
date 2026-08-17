import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { generateCloudTexture } from '../../services/textureGenerator';
import { EARTH_RADIUS_UNITS } from '../../services/orbitEngine';

export const CloudsLayer: React.FC = () => {
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cloudTexture = useMemo(() => generateCloudTexture(), []);

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[EARTH_RADIUS_UNITS + 0.05, 64, 64]} />
      <meshStandardMaterial
        map={cloudTexture}
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};
