import React, { useState } from 'react';
import {
  SatelliteRecord,
  SatelliteTelemetry
} from '../../types/satellite';
import {
  X,
  Compass,
  Zap,
  Gauge,
  Info,
  Copy,
  Check,
  Navigation,
  Globe2,
  Calendar
} from 'lucide-react';

interface SatelliteInfoPanelProps {
  satellite: SatelliteRecord;
  telemetry: SatelliteTelemetry;
  onClose: () => void;
  onFocusCamera: () => void;
}

export const SatelliteInfoPanel: React.FC<SatelliteInfoPanelProps> = ({
  satellite,
  telemetry,
  onClose,
  onFocusCamera
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'tle'>('telemetry');
  const [copied, setCopied] = useState(false);

  const handleCopyTLE = () => {
    const text = `${satellite.tle.line1}\n${satellite.tle.line2}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-20 right-4 z-20 w-96 max-w-[calc(100vw-2rem)] glass-panel-accent rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-cyan-500/30 animate-in fade-in slide-in-from-right duration-300">
      {/* Header Title & Close Button */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              {satellite.category}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              NORAD #{satellite.noradId}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight glow-text-cyan">
            {satellite.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'telemetry'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          TELEMETRY & ORBIT
        </button>
        <button
          onClick={() => setActiveTab('tle')}
          className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'tle'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          RAW TLE DATA
        </button>
      </div>

      {activeTab === 'telemetry' ? (
        <div className="flex flex-col gap-3 font-mono text-xs">
          {/* Live Gauges Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Altitude Card */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                ALTITUDE
              </div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.altKm.toLocaleString()} <span className="text-xs text-slate-500 font-normal">km</span>
              </div>
            </div>

            {/* Velocity Card */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                VELOCITY
              </div>
              <div className="text-base font-bold text-amber-300">
                {telemetry.velocityKms} <span className="text-xs text-slate-500 font-normal">km/s</span>
              </div>
            </div>

            {/* Latitude Card */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                LATITUDE
              </div>
              <div className="text-sm font-bold text-slate-200">
                {telemetry.lat.toFixed(2)}° {telemetry.lat >= 0 ? 'N' : 'S'}
              </div>
            </div>

            {/* Longitude Card */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                LONGITUDE
              </div>
              <div className="text-sm font-bold text-slate-200">
                {telemetry.lng.toFixed(2)}° {telemetry.lng >= 0 ? 'E' : 'W'}
              </div>
            </div>
          </div>

          {/* Orbital Parameters List */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="text-[10px] text-slate-400 font-bold border-b border-slate-800/80 pb-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-cyan-400" />
              KEPLERIAN ORBITAL PARAMETERS
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
              <div className="text-slate-400">Orbit Class:</div>
              <div className="text-slate-200 font-bold text-right">{satellite.orbitType}</div>

              <div className="text-slate-400">Inclination:</div>
              <div className="text-slate-200 font-bold text-right">{satellite.inclinationDeg}°</div>

              <div className="text-slate-400">Orbital Period:</div>
              <div className="text-slate-200 font-bold text-right">{satellite.periodMinutes} min</div>

              <div className="text-slate-400">Apogee / Perigee:</div>
              <div className="text-slate-200 font-bold text-right">{satellite.apogeeKm} / {satellite.perigeeKm} km</div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg">
            <div className="flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              {satellite.country}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Launch {satellite.launchYear}
            </div>
          </div>
        </div>
      ) : (
        /* Raw TLE Inspector */
        <div className="flex flex-col gap-3 font-mono text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-cyan-300 break-all select-all font-mono">
            <div>{satellite.tle.line1}</div>
            <div className="mt-2">{satellite.tle.line2}</div>
          </div>

          <button
            onClick={handleCopyTLE}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>COPY TLE DATA</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Target Camera Action Button */}
      <button
        onClick={onFocusCamera}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs tracking-wider uppercase shadow-glow-cyan transition-all flex items-center justify-center gap-2"
      >
        <Compass className="w-4 h-4" />
        FOCUS CAMERA ON SATELLITE
      </button>
    </div>
  );
};
