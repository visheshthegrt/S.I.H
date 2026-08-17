import React, { useMemo } from 'react';
import * as THREE from 'three';
import { generateStarfieldTexture } from '../../services/textureGenerator';

export const Starfield: React.FC = () => {
  const starTexture = useMemo(() => generateStarfieldTexture(), []);

  return (
    <mesh>
      <sphereGeometry args={[200, 64, 64]} />
      <meshBasicMaterial
        map={starTexture}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
