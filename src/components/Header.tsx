import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Clock, ShieldCheck, Bus, Train, LayoutGrid } from 'lucide-react';
import { SingaporeRegion, TransportMode } from '../types';

interface HeaderProps {
  activeTab: TransportMode;
  onTabChange: (tab: TransportMode) => void;
  selectedRegion: SingaporeRegion;
  onRegionChange: (region: SingaporeRegion) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
}

const REGIONS: SingaporeRegion[] = ['All', 'Central', 'East', 'North', 'North-East', 'West'];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedRegion,
  onRegionChange,
  onRefresh,
  isRefreshing,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}) => {
  const [sgtTime, setSgtTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Singapore Time (Asia/Singapore, UTC+8)
      const formatted = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(now);
      setSgtTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top utility alert & Singapore Time bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SG Transit Live Feed: Connected</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            LTA DataMall & Smart Mobility Singapore Network
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-200">{sgtTime || 'SGT (UTC+8)'}</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={onToggleAutoRefresh}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="text-[11px]">Auto 15s</span>
          </label>

          <button
            id="btn-header-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh live arrival timings and lot counts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="text-[11px] hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Brand & Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                  SG Transport & Parking Hub
                </h1>
                <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                  PRO
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wider hidden sm:inline-block">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Consolidated live bus waiting times and MRT & LRT network tracking
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            id="tab-btn-all"
            onClick={() => onTabChange('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-slate-500" />
            <span>Overview & Map</span>
          </button>

          <button
            id="tab-btn-bus"
            onClick={() => onTabChange('bus')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'bus'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Bus Waiting Times</span>
          </button>

          <button
            id="tab-btn-mrt"
            onClick={() => onTabChange('mrt')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mrt'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>MRT & LRT Tracking</span>
          </button>
        </nav>
      </div>

      {/* Sub-bar: Region Quick Filter */}
      <div className="bg-slate-50/80 border-t border-slate-200/70 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 text-slate-500 whitespace-nowrap font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter by Singapore Region:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {REGIONS.map(reg => (
              <button
                key={reg}
                id={`region-pill-${reg}`}
                onClick={() => onRegionChange(reg)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
