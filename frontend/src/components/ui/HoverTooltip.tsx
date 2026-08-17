import React from 'react';
import { SatelliteRecord, SatelliteTelemetry } from '../../types/satellite';
import { getSatelliteTelemetry } from '../../services/orbitEngine';

interface HoverTooltipProps {
  satellite: SatelliteRecord;
  simulationDate: Date;
}

export const HoverTooltip: React.FC<HoverTooltipProps> = ({
  satellite,
  simulationDate
}) => {
  const telemetry = getSatelliteTelemetry(satellite, simulationDate);

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none glass-panel px-3 py-1.5 rounded-xl border border-cyan-400/40 shadow-glow-cyan animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2.5 font-mono text-xs">
      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
      <div>
        <span className="font-bold text-slate-100">{satellite.name}</span>
        <span className="text-slate-400 text-[10px] ml-2 font-normal">
          ALT: {telemetry.altKm} km | #{satellite.noradId}
        </span>
      </div>
    </div>
  );
};
