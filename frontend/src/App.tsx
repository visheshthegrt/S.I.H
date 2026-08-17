import React, { useState, useEffect, useMemo } from 'react';
import { SatelliteCategory, SatelliteRecord, CameraMode } from './types/satellite';
import { FULL_SATELLITE_CATALOG } from './services/tleDatabase';
import { fetchSatellitesFromDatabase, subscribeToSatelliteUpdates, DatabaseStatus } from './services/satelliteApi';
import { getSatelliteTelemetry } from './services/orbitEngine';
import { CanvasContainer } from './components/3d/CanvasContainer';
import { HeaderHUD } from './components/ui/HeaderHUD';
import { SearchAndFilter } from './components/ui/SearchAndFilter';
import { SatelliteInfoPanel } from './components/ui/SatelliteInfoPanel';
import { TimeControls } from './components/ui/TimeControls';
import { CameraModeSelector } from './components/ui/CameraModeSelector';
import { HoverTooltip } from './components/ui/HoverTooltip';
import { getCollisionWarnings, runCollisionAnalysis, runDemoSimulation, CollisionWarning } from './api/collisionApi';

export function App() {
  const [satellites, setSatellites] = useState<SatelliteRecord[]>(FULL_SATELLITE_CATALOG);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    lastUpdated: new Date(),
    mode: 'local_catalog',
    sourceUrl: 'Built-in Celestrak TLE Catalog'
  });

  const [selectedCategory, setSelectedCategory] = useState<SatelliteCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSatId, setSelectedSatId] = useState<string | null>(null);
  const [hoveredSatId, setHoveredSatId] = useState<string | null>(null);

  // Time simulation state
  const [simulationDate, setSimulationDate] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeMultiplier, setTimeMultiplier] = useState<number>(1);
  const [cameraMode, setCameraMode] = useState<CameraMode>('global');

  // Collision state
  const [collisionWarnings, setCollisionWarnings] = useState<CollisionWarning[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Load satellite database & subscribe to updates
  useEffect(() => {
    fetchSatellitesFromDatabase().then(res => {
      setSatellites(res.satellites);
      setDbStatus(res.status);
    });

    const unsubscribe = subscribeToSatelliteUpdates((updatedList) => {
      setSatellites(updatedList);
      setDbStatus(prev => ({ ...prev, connected: true, lastUpdated: new Date() }));
    });

    return () => unsubscribe();
  }, []);

  // Poll for collision warnings
  useEffect(() => {
    const fetchWarnings = async () => {
      const warnings = await getCollisionWarnings();
      setCollisionWarnings(warnings);
    };
    
    fetchWarnings(); // initial load
    
    // Poll every 10 seconds in case an analysis finishes
    const interval = setInterval(fetchWarnings, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await runCollisionAnalysis();
      // It's running in background. Let's poll aggressively for the next 30s
      let polls = 0;
      const pollInterval = setInterval(async () => {
        polls++;
        const warnings = await getCollisionWarnings();
        setCollisionWarnings(warnings);
        if (polls > 10) {
          clearInterval(pollInterval);
          setIsAnalyzing(false);
        }
      }, 3000);
    } catch (e) {
      setIsAnalyzing(false);
    }
  };

  const handleRunDemo = async () => {
    setIsAnalyzing(true);
    try {
      await runDemoSimulation();
      // Fetch the updated catalog with ghost debris
      const res = await fetchSatellitesFromDatabase();
      setSatellites(res.satellites);
      setDbStatus(res.status);

      let polls = 0;
      const pollInterval = setInterval(async () => {
        polls++;
        const warnings = await getCollisionWarnings();
        setCollisionWarnings(warnings);
        if (polls > 10) {
          clearInterval(pollInterval);
          setIsAnalyzing(false);
        }
      }, 3000);
    } catch (e) {
      setIsAnalyzing(false);
    }
  };

  // Time tick loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimulationDate(prev => new Date(prev.getTime() + 1000 * timeMultiplier));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, timeMultiplier]);

  // Filtered Satellites
  const filteredSatellites = useMemo(() => {
    return satellites.filter(sat => {
      const matchesCat = selectedCategory === 'all' || sat.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() ||
        sat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sat.id.includes(searchQuery) ||
        sat.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [satellites, selectedCategory, searchQuery]);

  const selectedSatellite = useMemo(() => {
    if (!selectedSatId) return null;
    return satellites.find(s => s.id === selectedSatId) || null;
  }, [satellites, selectedSatId]);

  const hoveredSatellite = useMemo(() => {
    if (!hoveredSatId) return null;
    return satellites.find(s => s.id === hoveredSatId) || null;
  }, [satellites, hoveredSatId]);

  const selectedTelemetry = useMemo(() => {
    if (!selectedSatellite) return null;
    return getSatelliteTelemetry(selectedSatellite, simulationDate);
  }, [selectedSatellite, simulationDate]);

  const isRealtime = Math.abs(simulationDate.getTime() - Date.now()) < 5000 && timeMultiplier === 1;

  const handleResetTime = () => {
    setSimulationDate(new Date());
    setTimeMultiplier(1);
    setIsPlaying(true);
  };

  return (
    <main className="w-screen h-screen relative bg-[#04060e] overflow-hidden select-none scanline-bg">
      {/* Top Header Telemetry & DB Status HUD */}
      <HeaderHUD
        totalSatellites={satellites.length}
        filteredCount={filteredSatellites.length}
        simulationDate={simulationDate}
        isRealtime={isRealtime}
        dbStatus={dbStatus}
        onResetTime={handleResetTime}
        onRunAnalysis={handleRunAnalysis}
        onRunDemo={handleRunDemo}
        isAnalyzing={isAnalyzing}
      />

      {/* Left Search & Constellation Category Filter */}
      <SearchAndFilter
        satellites={satellites}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onSelectSatellite={(sat) => setSelectedSatId(sat.id)}
      />

      {/* Hover Tooltip */}
      {hoveredSatellite && !selectedSatellite && (
        <HoverTooltip
          satellite={hoveredSatellite}
          simulationDate={simulationDate}
        />
      )}

      {/* Right Selected Satellite Telemetry & Info Panel */}
      {selectedSatellite && selectedTelemetry && (
        <SatelliteInfoPanel
          satellite={selectedSatellite}
          telemetry={selectedTelemetry}
          onClose={() => setSelectedSatId(null)}
          onFocusCamera={() => setCameraMode('track')}
        />
      )}

      {/* Bottom Time Controls */}
      <TimeControls
        isPlaying={isPlaying}
        timeMultiplier={timeMultiplier}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onChangeMultiplier={setTimeMultiplier}
        onResetTime={handleResetTime}
      />

      {/* Camera Mode Selector */}
      <CameraModeSelector
        cameraMode={cameraMode}
        onChangeMode={setCameraMode}
        onResetCamera={() => {
          setSelectedSatId(null);
          setCameraMode('global');
        }}
      />

      {/* 3D WebGL Canvas Viewport */}
      <CanvasContainer
        satellites={filteredSatellites}
        simulationDate={simulationDate}
        selectedSatellite={selectedSatellite}
        hoveredSatellite={hoveredSatellite}
        cameraMode={cameraMode}
        onSelectSatellite={(sat) => setSelectedSatId(sat ? sat.id : null)}
        onHoverSatellite={(sat) => setHoveredSatId(sat ? sat.id : null)}
        collisionWarnings={collisionWarnings}
      />
    </main>
  );
}
export default App;
