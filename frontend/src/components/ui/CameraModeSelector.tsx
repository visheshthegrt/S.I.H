import React from 'react';
import { Globe, Video, Maximize2 } from 'lucide-react';
import { CameraMode } from '../../types/satellite';

interface CameraModeSelectorProps {
  cameraMode: CameraMode;
  onChangeMode: (mode: CameraMode) => void;
  onResetCamera: () => void;
}

export const CameraModeSelector: React.FC<CameraModeSelectorProps> = ({
  cameraMode,
  onChangeMode,
  onResetCamera
}) => {
  return (
    <div className="absolute bottom-6 right-6 z-20 glass-panel p-2 rounded-xl flex items-center gap-1.5 font-mono text-xs border border-cyan-500/20">
      <button
        onClick={onResetCamera}
        className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
        <span>GLOBAL VIEW</span>
      </button>

      <button
        onClick={() => onChangeMode('track')}
        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
          cameraMode === 'track'
            ? 'bg-cyan-500 text-slate-950 font-bold'
            : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
        }`}
      >
        <Video className="w-3.5 h-3.5" />
        <span>TRACK MODE</span>
      </button>

      <button
        onClick={onResetCamera}
        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
        title="Reset Camera Zoom"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};
