import React, { useState } from 'react';
import { Search, X, Filter, Radio } from 'lucide-react';
import { SatelliteCategory, SatelliteRecord } from '../../types/satellite';

interface SearchAndFilterProps {
  satellites: SatelliteRecord[];
  searchQuery: string;
  selectedCategory: SatelliteCategory | 'all';
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: SatelliteCategory | 'all') => void;
  onSelectSatellite: (sat: SatelliteRecord) => void;
}

const CATEGORIES: { id: SatelliteCategory | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'ALL', color: 'bg-slate-700/50 text-slate-200' },
  { id: 'station', label: 'STATIONS', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'starlink', label: 'STARLINK', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 'gps', label: 'GPS / NAV', color: 'bg-lime-500/20 text-lime-300 border-lime-500/40' },
  { id: 'science', label: 'SCIENCE', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'geostationary', label: 'GEO', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { id: 'debris', label: 'DEBRIS', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' }
];

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  satellites,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onSelectSatellite
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = searchQuery.trim()
    ? satellites.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.includes(searchQuery) ||
        s.country.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div className="absolute top-20 left-4 z-20 w-80 max-w-[calc(100vw-2rem)] flex flex-col gap-3">
      {/* Search Bar Input */}
      <div className="glass-panel p-2.5 rounded-xl flex items-center gap-2 relative">
        <Search className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search satellite name, NORAD ID..."
          className="bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none w-full font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Live Search Auto-complete Dropdown */}
        {isFocused && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel-accent rounded-xl overflow-hidden shadow-2xl flex flex-col divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
            {searchResults.map(sat => (
              <button
                key={sat.id}
                onClick={() => {
                  onSelectSatellite(sat);
                  setIsFocused(false);
                }}
                className="p-2.5 text-left hover:bg-cyan-500/10 flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 font-mono">
                    {sat.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    NORAD: #{sat.noradId} | {sat.country}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20">
                  {sat.orbitType}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Constellation Pills */}
      <div className="glass-panel p-2.5 rounded-xl flex flex-wrap gap-1.5">
        <div className="w-full text-[10px] font-mono text-slate-400 flex items-center gap-1 mb-1 px-1">
          <Filter className="w-3 h-3 text-cyan-400" />
          CONSTELLATION FILTER:
        </div>
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan'
                  : `bg-slate-900/60 text-slate-300 border-slate-700/60 hover:border-cyan-500/40`
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
