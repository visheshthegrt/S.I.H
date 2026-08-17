import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { SatelliteRecord, SatelliteCategory, CameraMode } from '../../types/satellite';
import { CollisionWarning } from '../../api/collisionApi';
import { EARTH_RADIUS_UNITS, getSatelliteTelemetry, getOrbitTrajectoryPath } from '../../services/orbitEngine';
import {
  generateEarthDiffuseTexture,
  generateEarthNightTexture,
  generateEarthSpecularTexture,
  generateCloudTexture,
  generateStarfieldTexture,
  loadHighResEarthTextures
} from '../../services/textureGenerator';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AtmosphereShader } from './AtmosphereShader';
import { getSunPosition, getMoonPosition } from '../../services/astronomy';

interface CanvasContainerProps {
  satellites: SatelliteRecord[];
  simulationDate: Date;
  selectedSatellite: SatelliteRecord | null;
  hoveredSatellite: SatelliteRecord | null;
  cameraMode: CameraMode;
  onSelectSatellite: (sat: SatelliteRecord | null) => void;
  onHoverSatellite: (sat: SatelliteRecord | null) => void;
  collisionWarnings?: CollisionWarning[];
}

const CATEGORY_COLORS: Record<SatelliteCategory, THREE.Color> = {
  station: new THREE.Color('#ffd700'),      // Bright Gold
  starlink: new THREE.Color('#00f0ff'),     // Cyan
  gps: new THREE.Color('#39ff14'),          // Lime Green
  science: new THREE.Color('#b5179e'),      // Electric Purple
  geostationary: new THREE.Color('#ff9e00'), // Amber
  debris: new THREE.Color('#ff0055')        // Coral Red
};

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  satellites,
  simulationDate,
  selectedSatellite,
  hoveredSatellite,
  cameraMode,
  onSelectSatellite,
  onHoverSatellite,
  collisionWarnings
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to key Three.js elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const detailedModelRef = useRef<THREE.Group | null>(null);
  const orbitLineRef = useRef<THREE.Line | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const atmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const sunSpriteRef = useRef<THREE.Sprite | null>(null);
  const warningsGroupRef = useRef<THREE.Group | null>(null);

  // Mouse interaction state & Smooth Camera Damping
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraRadius = useRef<number>(22);
  const cameraTheta = useRef<number>(0);
  const cameraPhi = useRef<number>(Math.PI / 3);

  const targetCameraRadius = useRef<number>(22);
  const targetCameraTheta = useRef<number>(0);
  const targetCameraPhi = useRef<number>(Math.PI / 3);

  // Store latest props in refs for render loop access
  const satellitesRef = useRef(satellites);
  satellitesRef.current = satellites;

  const dateRef = useRef(simulationDate);
  dateRef.current = simulationDate;

  const selectedSatRef = useRef(selectedSatellite);
  selectedSatRef.current = selectedSatellite;

  const hoveredSatRef = useRef(hoveredSatellite);
  hoveredSatRef.current = hoveredSatellite;

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  // Update Camera position based on spherical coordinates with smooth lerp damping
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;

    // Smooth exponential damping lerp (fluid camera motion)
    cameraRadius.current += (targetCameraRadius.current - cameraRadius.current) * 0.12;
    cameraTheta.current += (targetCameraTheta.current - cameraTheta.current) * 0.12;
    cameraPhi.current += (targetCameraPhi.current - cameraPhi.current) * 0.12;

    const camera = cameraRef.current;
    const r = cameraRadius.current;
    const t = cameraTheta.current;
    const p = cameraPhi.current;

    const x = targetRef.current.x + r * Math.sin(p) * Math.cos(t);
    const y = targetRef.current.y + r * Math.cos(p);
    const z = targetRef.current.z + r * Math.sin(p) * Math.sin(t);

    camera.position.set(x, y, z);
    camera.lookAt(targetRef.current);
  };

  // Helper to create point circle texture for satellites
  const createPointSpriteTexture = (): THREE.CanvasTexture => {
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
  };

  // Helper to create Detailed Satellite 3D Model Group
  const createDetailedSatelliteModel = (): THREE.Group => {
    const group = new THREE.Group();
    group.scale.set(0.15, 0.15, 0.15);

    // Body (Octagonal Cylinder Bus)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.25
    });
    const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 8), bodyMat);
    group.add(bodyMesh);

    // Dish Antenna
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.4 });
    const dishGroup = new THREE.Group();
    dishGroup.position.set(0, 0.7, 0);
    dishGroup.rotation.x = Math.PI / 4;
    const dishMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.05, 0.15, 16), dishMat);
    const dishFeed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    dishFeed.position.set(0, 0.2, 0);
    dishGroup.add(dishMesh, dishFeed);
    group.add(dishGroup);

    // Solar Panels Grid Canvas Texture
    const panelCanvas = document.createElement('canvas');
    panelCanvas.width = 128;
    panelCanvas.height = 128;
    const pctx = panelCanvas.getContext('2d')!;
    pctx.fillStyle = '#081c38';
    pctx.fillRect(0, 0, 128, 128);
    pctx.strokeStyle = '#00f0ff';
    pctx.lineWidth = 2;
    for (let i = 0; i <= 128; i += 16) {
      pctx.beginPath(); pctx.moveTo(i, 0); pctx.lineTo(i, 128); pctx.stroke();
      pctx.beginPath(); pctx.moveTo(0, i); pctx.lineTo(128, i); pctx.stroke();
    }
    const solarMat = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(panelCanvas),
      metalness: 0.8,
      roughness: 0.3
    });

    // Left Solar Wing
    const leftWing = new THREE.Group();
    leftWing.position.set(-1.8, 0, 0);
    leftWing.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.8), solarMat));
    group.add(leftWing);

    // Right Solar Wing
    const rightWing = new THREE.Group();
    rightWing.position.set(1.8, 0, 0);
    rightWing.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.8), solarMat));
    group.add(rightWing);

    // Status Beacon LED Light
    const beaconMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    beaconMesh.position.set(0, -0.65, 0);
    const beaconLight = new THREE.PointLight(0x00f0ff, 2, 3);
    beaconLight.position.set(0, -0.65, 0);
    group.add(beaconMesh, beaconLight);

    // GLTF / GLB High-Detail Satellite Mesh Loader
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/iss.glb',
      (gltf) => {
        const gltfScene = gltf.scene;
        gltfScene.scale.set(0.2, 0.2, 0.2);
        group.add(gltfScene);
      },
      undefined,
      (err) => {
        console.warn('GLTF satellite model load fallback to bus geometry:', err);
      }
    );

    group.visible = false;
    return group;
  };

  // Initialize Three.js Renderer, Scene, Camera, & Materials
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 22);
    camera.lookAt(targetRef.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Hyperrealistic Sun & Deep Space Ambient Lighting
    const dirLight = new THREE.DirectionalLight(0xfff8ea, 3.2);
    dirLight.position.set(18, 10, 18);
    dirLightRef.current = dirLight;
    const ambLight = new THREE.AmbientLight(0x334155, 0.25);
    scene.add(dirLight, ambLight);

    // 1. Authentic Milky Way Deep Space 6-Face CubeTexture Environment
    const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath('/textures/milkyway/');
    const spaceCubeMap = cubeTextureLoader.load([
      'px.jpg', 'nx.jpg',
      'py.jpg', 'ny.jpg',
      'pz.jpg', 'nz.jpg'
    ]);
    spaceCubeMap.colorSpace = THREE.SRGBColorSpace;
    scene.background = spaceCubeMap;

    // Solar Corona Lens Flare Flare Sprite
    const sunSpriteMat = new THREE.SpriteMaterial({
      map: textureLoader.load('/textures/lensflare0.png'),
      color: 0xfff0c4,
      blending: THREE.AdditiveBlending
    });
    const sunSprite = new THREE.Sprite(sunSpriteMat);
    sunSprite.scale.set(45, 45, 1);
    sunSpriteRef.current = sunSprite;
    scene.add(sunSprite);

    // 2. Hyperrealistic Earth Sphere with Authentic NASA Textures
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS_UNITS, 128, 128);
    const earthMat = new THREE.MeshStandardMaterial({
      roughness: 0.45,
      metalness: 0.1,
      emissive: new THREE.Color(0xffb74d),
      emissiveIntensity: 1.3
    });

    const highResTextures = loadHighResEarthTextures(
      undefined,
      (loadedTextures) => {
        if (loadedTextures.dayMap) loadedTextures.dayMap.colorSpace = THREE.SRGBColorSpace;
        if (loadedTextures.nightMap) loadedTextures.nightMap.colorSpace = THREE.SRGBColorSpace;
        earthMat.map = loadedTextures.dayMap;
        earthMat.emissiveMap = loadedTextures.nightMap;
        earthMat.roughnessMap = loadedTextures.specularMap;
        if (loadedTextures.normalMap) {
          earthMat.normalMap = loadedTextures.normalMap;
          earthMat.normalScale = new THREE.Vector2(1.2, 1.2);
        }
        earthMat.needsUpdate = true;
      }
    );

    if (highResTextures.dayMap) highResTextures.dayMap.colorSpace = THREE.SRGBColorSpace;
    if (highResTextures.nightMap) highResTextures.nightMap.colorSpace = THREE.SRGBColorSpace;
    earthMat.map = highResTextures.dayMap;
    earthMat.emissiveMap = highResTextures.nightMap;
    earthMat.roughnessMap = highResTextures.specularMap;

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMeshRef.current = earthMesh;
    scene.add(earthMesh);

    // 3. Atmosphere Rayleigh Glow Layer
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      uniforms: {
        sunDirection: { value: new THREE.Vector3(18, 10, 18).normalize() },
        atmosphereColor: { value: new THREE.Color(0x00d0ff) },
        glowIntensity: { value: 1.15 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    atmosphereMatRef.current = atmosphereMat;
    const atmosphereMesh = new THREE.Mesh(earthGeo, atmosphereMat);
    atmosphereMesh.scale.set(1.06, 1.06, 1.06);
    scene.add(atmosphereMesh);

    // 4. Clouds Layer with Authentic NASA Cloud Cover Map
    const cloudsGeo = new THREE.SphereGeometry(EARTH_RADIUS_UNITS + 0.045, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: generateCloudTexture(),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    textureLoader.load('/textures/earth_clouds_8k.png', (tex) => {
      cloudsMat.map = tex;
      cloudsMat.needsUpdate = true;
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    cloudsMeshRef.current = cloudsMesh;
    scene.add(cloudsMesh);

    // 5. Real 3D Moon Object in Real-Time Orbit
    const moonGeo = new THREE.SphereGeometry(EARTH_RADIUS_UNITS * 0.27, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.1
    });
    textureLoader.load('/textures/moon_2048.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      moonMat.map = tex;
      moonMat.needsUpdate = true;
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMeshRef.current = moonMesh;
    scene.add(moonMesh);

    // 6. Satellite Points Cloud LOD (THREE.Points)
    const pointsGeo = new THREE.BufferGeometry();
    const pointsMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      map: createPointSpriteTexture(),
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
      sizeAttenuation: true
    });
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    pointsRef.current = pointsMesh;
    scene.add(pointsMesh);

    // 7. Detailed Satellite Model Group
    const detailedModel = createDetailedSatelliteModel();
    detailedModelRef.current = detailedModel;
    scene.add(detailedModel);

    // 8. Orbit Trajectory Line
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      linewidth: 2
    });
    const lineGeo = new THREE.BufferGeometry();
    const orbitLine = new THREE.Line(lineGeo, lineMat);
    orbitLine.visible = false;
    orbitLineRef.current = orbitLine;
    scene.add(orbitLine);

    // 9. Collision Warnings Group
    const warningsGroup = new THREE.Group();
    warningsGroupRef.current = warningsGroup;
    scene.add(warningsGroup);

    // Main Render Loop
    let animId: number;
    const renderLoop = () => {
      // Slow rotation for Earth & Clouds
      if (earthMeshRef.current) earthMeshRef.current.rotation.y += 0.0003;
      if (cloudsMeshRef.current) cloudsMeshRef.current.rotation.y += 0.0005;

      const curSats = satellitesRef.current;
      const curDate = dateRef.current;
      const curSelected = selectedSatRef.current;
      const curHovered = hoveredSatRef.current;
      const curCameraMode = cameraModeRef.current;

      // Real-Time Solar Vector & Lunar Orbit Calculation
      const sunPos = getSunPosition(curDate);
      const moonPos = getMoonPosition(curDate);

      // Update Sun Light Direction & Rayleigh Atmosphere Shader
      if (dirLightRef.current) {
        dirLightRef.current.position.copy(sunPos.direction.clone().multiplyScalar(40));
      }
      if (atmosphereMatRef.current) {
        atmosphereMatRef.current.uniforms.sunDirection.value.copy(sunPos.direction);
      }
      if (sunSpriteRef.current) {
        sunSpriteRef.current.position.copy(sunPos.direction.clone().multiplyScalar(150));
      }

      // Update 3D Moon Position in Real-Time Orbit
      if (moonMeshRef.current) {
        moonMeshRef.current.position.set(...moonPos.position3D);
        moonMeshRef.current.lookAt(0, 0, 0);
      }

      // Send tick message to Web Worker for offloaded position computation
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'tick', timestamp: curDate.getTime() });
      }

      // Update Points Buffer
      if (pointsRef.current && curSats.length > 0) {
        const count = curSats.length;
        const colArr = new Float32Array(count * 3);

        curSats.forEach((sat, i) => {
          const color = CATEGORY_COLORS[sat.category] || CATEGORY_COLORS.starlink;
          colArr[i * 3] = color.r;
          colArr[i * 3 + 1] = color.g;
          colArr[i * 3 + 2] = color.b;
        });

        const geo = pointsRef.current.geometry;
        geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
        geo.attributes.color.needsUpdate = true;

        if (!workerRef.current) {
          // Synchronous fallback calculation if Web Worker is not active
          const posArr = new Float32Array(count * 3);
          curSats.forEach((sat, i) => {
            const telemetry = getSatelliteTelemetry(sat, curDate);
            posArr[i * 3] = telemetry.position3D[0];
            posArr[i * 3 + 1] = telemetry.position3D[1];
            posArr[i * 3 + 2] = telemetry.position3D[2];
          });
          geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
          geo.attributes.position.needsUpdate = true;
        }
      }

      // Update Detailed Satellite Model position
      if (detailedModelRef.current) {
        if (curSelected) {
          const telemetry = getSatelliteTelemetry(curSelected, curDate);
          detailedModelRef.current.position.set(...telemetry.position3D);
          detailedModelRef.current.visible = true;

          // Camera live tracking mode
          if (curCameraMode === 'track') {
            targetRef.current.set(...telemetry.position3D);
          }
        } else {
          detailedModelRef.current.visible = false;
        }
      }

      // Continuous smooth damped camera interpolation
      updateCameraPosition();

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Web Worker setup for offloaded SGP4 propagation
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        const worker = new Worker(new URL('../../workers/orbitWorker.ts', import.meta.url), { type: 'module' });
        workerRef.current = worker;
        worker.postMessage({
          type: 'init',
          satellites: satellites.map(s => ({ id: s.id, line1: s.tle.line1, line2: s.tle.line2 }))
        });

        worker.onmessage = (e: MessageEvent<{ type: string; buffer: ArrayBuffer }>) => {
          if (e.data.type === 'positions' && pointsRef.current) {
            const posArr = new Float32Array(e.data.buffer);
            const geo = pointsRef.current.geometry;
            geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
            geo.attributes.position.needsUpdate = true;
          }
        };

        return () => {
          worker.terminate();
          workerRef.current = null;
        };
      } catch (err) {
        console.warn('Orbit worker init fallback:', err);
      }
    }
  }, [satellites]);

  // Update Orbit Line geometry when selected satellite changes
  useEffect(() => {
    if (!orbitLineRef.current) return;
    if (selectedSatellite) {
      const rawPoints = getOrbitTrajectoryPath(selectedSatellite, simulationDate, 120);
      const vecPoints = rawPoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      orbitLineRef.current.geometry.dispose();
      orbitLineRef.current.geometry = new THREE.BufferGeometry().setFromPoints(vecPoints);
      orbitLineRef.current.visible = true;
    } else {
      orbitLineRef.current.visible = false;
    }
  }, [selectedSatellite, simulationDate]);

  // Load category-tailored high-detail 3D GLTF satellite model
  useEffect(() => {
    if (!detailedModelRef.current) return;
    const group = detailedModelRef.current;
    
    // Remove previous model meshes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (selectedSatellite) {
      const gltfLoader = new GLTFLoader();
      let modelPath = '/models/iss.glb';
      if (selectedSatellite.category === 'starlink') modelPath = '/models/starlink.glb';
      else if (selectedSatellite.category === 'science' || selectedSatellite.name.includes('HUBBLE')) modelPath = '/models/hubble.glb';

      gltfLoader.load(
        modelPath,
        (gltf) => {
          const m = gltf.scene;
          m.scale.set(0.35, 0.35, 0.35);
          group.add(m);
        },
        undefined,
        () => {
          const proc = createDetailedSatelliteModel();
          group.add(proc);
        }
      );
    }
  }, [selectedSatellite]);

  // Dynamically Render Collision Warning Markers
  useEffect(() => {
    if (!warningsGroupRef.current) return;
    const group = warningsGroupRef.current;
    
    // Clear old markers
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (collisionWarnings && collisionWarnings.length > 0) {
      // Create a glowing red material
      const markerGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const markerMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0044, 
        transparent: true,
        opacity: 0.8,
        wireframe: false 
      });

      const wireframeMat = new THREE.LineBasicMaterial({ color: 0xffffff });

      collisionWarnings.forEach(warning => {
        // Backend outputs in km. Scale to Three.js units (1000km = 1 unit)
        // Note: Coordinates might be ECI vs ECEF, but for visual clustering this is sufficient.
        const x = warning.obj1_x / 1000;
        const y = warning.obj1_y / 1000;
        const z = warning.obj1_z / 1000;

        const mesh = new THREE.Mesh(markerGeo, markerMat);
        mesh.position.set(x, y, z);

        // Add wireframe box for cyber aesthetic
        const edges = new THREE.EdgesGeometry(markerGeo);
        const line = new THREE.LineSegments(edges, wireframeMat);
        mesh.add(line);

        // Add a pulsing point light to each collision site
        const light = new THREE.PointLight(0xff0044, 2, 5);
        mesh.add(light);

        group.add(mesh);
      });
    }
  }, [collisionWarnings]);

  // GSAP Camera zoom animation on satellite selection or reset
  useEffect(() => {
    if (selectedSatellite) {
      const telemetry = getSatelliteTelemetry(selectedSatellite, simulationDate);
      const satPos = new THREE.Vector3(...telemetry.position3D);

      // Animate focal target to satellite position
      gsap.to(targetRef.current, {
        x: satPos.x,
        y: satPos.y,
        z: satPos.z,
        duration: 1.4,
        ease: 'power3.out'
      });

      // Animate camera radius closer for detailed view
      gsap.to(targetCameraRadius, {
        current: Math.max(8.5, (telemetry.altKm + 6371) / 1000 + 1.8),
        duration: 1.4,
        ease: 'power3.out'
      });
    } else {
      // Reset to Global View
      gsap.to(targetRef.current, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.4,
        ease: 'power3.out'
      });

      gsap.to(targetCameraRadius, {
        current: 22,
        duration: 1.4,
        ease: 'power3.out'
      });
    }
  }, [selectedSatellite]);

  // Mouse Orbit Drag & Raycasting Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetCameraTheta.current -= deltaX * 0.004;
      targetCameraPhi.current = Math.max(0.05, Math.min(Math.PI - 0.05, targetCameraPhi.current - deltaY * 0.004));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Raycast hover detection over satellite points
    if (!mountRef.current || !cameraRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    let closestSat: SatelliteRecord | null = null;
    let minDistance = 0.5; // pixel threshold

    satellites.forEach(sat => {
      const telemetry = getSatelliteTelemetry(sat, simulationDate);
      const satPos = new THREE.Vector3(...telemetry.position3D);
      satPos.project(cameraRef.current!);

      const dx = satPos.x - mouseX;
      const dy = satPos.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance && satPos.z < 1) {
        minDistance = dist;
        closestSat = sat;
      }
    });

    onHoverSatellite(closestSat);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    targetCameraRadius.current = Math.max(7.2, Math.min(80, targetCameraRadius.current + e.deltaY * 0.012));
  };

  const handleClick = () => {
    if (hoveredSatellite) {
      onSelectSatellite(hoveredSatellite);
    }
  };

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    />
  );
};

