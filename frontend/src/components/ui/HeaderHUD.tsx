import React from 'react';
import { Globe, Satellite, Clock, Activity, Database } from 'lucide-react';
import { DatabaseStatus } from '../../services/satelliteApi';
import { getSunPosition, getMoonPosition } from '../../services/astronomy';

interface HeaderHUDProps {
  totalSatellites: number;
  filteredCount: number;
  simulationDate: Date;
  isRealtime: boolean;
  dbStatus: DatabaseStatus;
  onResetTime: () => void;
  onRunAnalysis: () => void;
  onRunDemo: () => void;
  onResetLive: () => void;
  isAnalyzing: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  totalSatellites,
  filteredCount,
  simulationDate,
  isRealtime,
  dbStatus,
  onResetTime,
  onRunAnalysis,
  onRunDemo,
  onResetLive,
  isAnalyzing
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
      {/* App Logo & Title */}
      <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-xl pointer-events-auto border-cyan-500/30">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
          <Globe className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
            Orbital Eye 3D
          </h1>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-ping" />
            Earth Satellite Tracking System
          </p>
        </div>
      </div>

      {/* Center Telemetry Counter & Real-Time Database Indicator */}
      <div className="hidden md:flex items-center gap-6 glass-panel px-6 py-2 rounded-xl pointer-events-auto font-mono text-xs">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">TRACKING:</span>
          <span className="font-bold text-cyan-300">
            {filteredCount} <span className="text-slate-500">/ {totalSatellites}</span>
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-700/60" />

        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">PROPAGATION:</span>
          <span className="font-bold text-emerald-400">SGP4 ACTIVE</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-700/60" />

        {/* Real-time Astronomical Sun & Moon Sync */}
        {(() => {
          const sun = getSunPosition(simulationDate);
          const moon = getMoonPosition(simulationDate);
          return (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-400">SUN:</span>
                <span className="font-bold text-amber-300">
                  {sun.subsolarLat > 0 ? `${sun.subsolarLat}°N` : `${Math.abs(sun.subsolarLat)}°S`},{' '}
                  {sun.subsolarLng > 0 ? `${sun.subsolarLng}°E` : `${Math.abs(sun.subsolarLng)}°W`}
                </span>
              </div>

              <div className="h-4 w-[1px] bg-slate-700/60" />

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-slate-400">MOON:</span>
                <span className="font-bold text-slate-200">
                  {moon.phaseName} ({moon.phasePercent}%)
                </span>
              </div>
            </>
          );
        })()}
      </div>

      {/* Right Time Display & Sync */}
      <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-xl pointer-events-auto font-mono text-xs">
        <Clock className="w-4 h-4 text-cyan-400" />
        <span className="text-slate-200">
          {simulationDate.toISOString().replace('T', ' ').substring(0, 19)} UTC
        </span>
        {isRealtime ? (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
            LIVE
          </span>
        ) : (
          <button
            onClick={onResetTime}
            className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-[10px] font-bold border border-cyan-500/30 transition-colors"
          >
            SYNC LIVE
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="ml-4 flex gap-2 pointer-events-auto">
        {dbStatus.mode === 'database' ? (
          <button
            onClick={onResetLive}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-all shadow-lg ${
              isAnalyzing 
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-not-allowed'
              : 'bg-blue-600/80 hover:bg-blue-500 text-white border-blue-400/50 hover:shadow-glow-blue'
            }`}
          >
            RETURN TO LIVE DATA
          </button>
        ) : (
          <button
            onClick={onRunDemo}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-all shadow-lg ${
              isAnalyzing 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 cursor-not-allowed'
              : 'bg-amber-600/80 hover:bg-amber-500 text-white border-amber-400/50 hover:shadow-glow-amber'
            }`}
          >
            SIMULATE CRASH
          </button>
        )}

        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-all shadow-lg ${
            isAnalyzing 
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 cursor-not-allowed animate-pulse'
            : 'bg-rose-600/80 hover:bg-rose-500 text-white border-rose-400/50 hover:shadow-glow-rose'
          }`}
        >
          <Activity className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'ANALYZING...' : 'RUN AI COLLISION ANALYSIS'}
        </button>
      </div>
    </header>
  );
};
