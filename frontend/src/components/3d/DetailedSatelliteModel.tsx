import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SatelliteTelemetry } from '../../types/satellite';

interface DetailedSatelliteModelProps {
  telemetry: SatelliteTelemetry;
  name: string;
}

export const DetailedSatelliteModel: React.FC<DetailedSatelliteModelProps> = ({
  telemetry,
  name
}) => {
  const [x, y, z] = telemetry.position3D;

  // Gold foil body material
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.25,
      bumpScale: 0.05
    });
  }, []);

  // Solar Panel Grid Material (Deep Blue Metallic with Grid Lines)
  const solarPanelMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#081c38';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 128; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(128, i);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.8,
      roughness: 0.3
    });
  }, []);

  // Dish Antenna Material
  const dishMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.6,
      roughness: 0.4
    });
  }, []);

  return (
    <group position={[x, y, z]} scale={[0.15, 0.15, 0.15]}>
      {/* Central Satellite Body (Octagonal Bus) */}
      <mesh material={bodyMaterial}>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 8]} />
      </mesh>

      {/* Main Communications Dish */}
      <group position={[0, 0.7, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <mesh material={dishMaterial}>
          <cylinderGeometry args={[0.6, 0.05, 0.15, 16]} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Left Solar Array Panel Wing */}
      <group position={[-1.8, 0, 0]}>
        <mesh material={solarPanelMaterial}>
          <boxGeometry args={[2.2, 0.04, 0.8]} />
        </mesh>
        <mesh position={[1.1, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
      </group>

      {/* Right Solar Array Panel Wing */}
      <group position={[1.8, 0, 0]}>
        <mesh material={solarPanelMaterial}>
          <boxGeometry args={[2.2, 0.04, 0.8]} />
        </mesh>
        <mesh position={[-1.1, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
      </group>

      {/* Status Beacon LED Light */}
      <mesh position={[0, -0.65, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      <pointLight position={[0, -0.65, 0]} color="#00f0ff" intensity={2} distance={3} />
    </group>
  );
};
