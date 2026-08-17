import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { SatelliteRecord, CameraMode } from '../../types/satellite';
import { EARTH_RADIUS_UNITS, getSatelliteTelemetry } from '../../services/orbitEngine';
import {
  generateEarthDiffuseTexture,
  generateEarthNightTexture,
  generateEarthSpecularTexture
} from '../../services/textureGenerator';
import { AtmosphereShader } from './AtmosphereShader';
import { CloudsLayer } from './CloudsLayer';
import { Starfield } from './Starfield';
import { SatellitesLOD } from './SatellitesLOD';
import { DetailedSatelliteModel } from './DetailedSatelliteModel';
import { OrbitPathLine } from './OrbitPathLine';

interface EarthSceneProps {
  satellites: SatelliteRecord[];
  simulationDate: Date;
  selectedSatellite: SatelliteRecord | null;
  hoveredSatellite: SatelliteRecord | null;
  cameraMode: CameraMode;
  onSelectSatellite: (sat: SatelliteRecord | null) => void;
  onHoverSatellite: (sat: SatelliteRecord | null) => void;
}

export const EarthScene: React.FC<EarthSceneProps> = ({
  satellites,
  simulationDate,
  selectedSatellite,
  hoveredSatellite,
  cameraMode,
  onSelectSatellite,
  onHoverSatellite
}) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Textures
  const diffuseTexture = useMemo(() => generateEarthDiffuseTexture(), []);
  const nightTexture = useMemo(() => generateEarthNightTexture(), []);
  const specularTexture = useMemo(() => generateEarthSpecularTexture(), []);

  // Sun Light Direction Vector
  const sunDirection = useMemo(() => new THREE.Vector3(15, 8, 15).normalize(), []);

  // Atmosphere Shader Material
  const atmosphereMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      uniforms: {
        sunDirection: { value: sunDirection },
        atmosphereColor: { value: new THREE.Color(0x00d0ff) },
        glowIntensity: { value: 0.95 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    return mat;
  }, [sunDirection]);

  // Selected Satellite Telemetry
  const selectedTelemetry = useMemo(() => {
    if (!selectedSatellite) return null;
    return getSatelliteTelemetry(selectedSatellite, simulationDate);
  }, [selectedSatellite, simulationDate]);

  // Slow Earth rotation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.0003;
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <group>
      {/* Sun Directional Lighting */}
      <directionalLight
        position={[15, 8, 15]}
        intensity={2.2}
        color="#ffffff"
      />
      <ambientLight intensity={0.18} color="#94a3b8" />

      {/* Cosmic Background */}
      <Starfield />

      {/* Earth Sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 64, 64]} />
        <meshStandardMaterial
          map={diffuseTexture}
          roughnessMap={specularTexture}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Rayleigh Atmosphere Layer */}
      <mesh ref={atmosphereRef} material={atmosphereMaterial} scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 64, 64]} />
      </mesh>

      {/* Clouds Layer */}
      <CloudsLayer />

      {/* Satellite Point Cloud LOD */}
      <SatellitesLOD
        satellites={satellites}
        simulationDate={simulationDate}
        selectedSatId={selectedSatellite?.id || null}
        hoveredSatId={hoveredSatellite?.id || null}
        onSelectSatellite={(sat) => onSelectSatellite(sat)}
        onHoverSatellite={(sat) => onHoverSatellite(sat)}
      />

      {/* Selected Satellite Detailed 3D Model & Orbit Trajectory */}
      {selectedSatellite && selectedTelemetry && (
        <group>
          <DetailedSatelliteModel
            telemetry={selectedTelemetry}
            name={selectedSatellite.name}
          />
          <OrbitPathLine
            satellite={selectedSatellite}
            simulationDate={simulationDate}
          />
        </group>
      )}
    </group>
  );
};
