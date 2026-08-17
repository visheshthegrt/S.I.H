import React from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface TimeControlsProps {
  isPlaying: boolean;
  timeMultiplier: number;
  onTogglePlay: () => void;
  onChangeMultiplier: (m: number) => void;
  onResetTime: () => void;
}

const MULTIPLIERS = [1, 10, 60, 300];

export const TimeControls: React.FC<TimeControlsProps> = ({
  isPlaying,
  timeMultiplier,
  onTogglePlay,
  onChangeMultiplier,
  onResetTime
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 glass-panel px-5 py-3 rounded-2xl flex items-center gap-4 border border-cyan-500/30 font-mono text-xs shadow-2xl">
      {/* Play/Pause Button */}
      <button
        onClick={onTogglePlay}
        className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-glow-cyan transition-transform active:scale-95"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      {/* Speed Multiplier Pills */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <FastForward className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-0.5" />
        {MULTIPLIERS.map(m => (
          <button
            key={m}
            onClick={() => onChangeMultiplier(m)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              timeMultiplier === m
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m}x
          </button>
        ))}
      </div>

      <div className="h-4 w-[1px] bg-slate-800" />

      {/* Reset Realtime Sync Button */}
      <button
        onClick={onResetTime}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors border border-slate-700"
      >
        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
        <span>SYNC LIVE</span>
      </button>
    </div>
  );
};
