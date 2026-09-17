import React from 'react';
import { Bus, Train, Activity, ArrowRight } from 'lucide-react';
import { BusStop, MRTStation } from '../types';
import { MRT_LINES } from '../data/mrtData';

interface QuickStatsBarProps {
  totalBusesMonitored: number;
  totalBusStops: number;
  onQuickNavigate: (mode: 'bus' | 'mrt') => void;
  selectedBusStop: BusStop | null;
  selectedStation: MRTStation | null;
  onClearSelection: () => void;
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({
  totalBusesMonitored,
  totalBusStops,
  onQuickNavigate,
  selectedBusStop,
  selectedStation,
  onClearSelection,
}) => {
  return (
    <div className="space-y-4">
      {/* 3 Transit Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Buses */}
        <div
          onClick={() => onQuickNavigate('bus')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5" />
              <span>Public Buses</span>
            </span>
            <span className="text-slate-400 group-hover:text-amber-600 transition-colors text-xs font-semibold flex items-center gap-0.5">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-slate-900">
              {totalBusStops}
            </span>
            <span className="text-xs text-slate-500 font-medium">stops monitored</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time next 3 bus arrival times across SMRT, SBS Transit, Tower & Go-Ahead.
          </p>
        </div>

        {/* MRT */}
        <div
          onClick={() => onQuickNavigate('mrt')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5" />
              <span>MRT Heavy Rail</span>
            </span>
            <span className="text-slate-400 group-hover:text-rose-600 transition-colors text-xs font-semibold flex items-center gap-0.5">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-slate-900">
              6 Lines
            </span>
            <span className="text-xs text-emerald-600 font-bold">● Normal Service</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            NSL, EWL, NEL, CCL, DTL & TEL live platform arrivals, transfers & headway.
          </p>
        </div>

        {/* LRT & Feeder Network */}
        <div
          onClick={() => onQuickNavigate('mrt')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>LRT & GTFS Telemetry</span>
            </span>
            <span className="text-slate-400 group-hover:text-teal-600 transition-colors text-xs font-semibold flex items-center gap-0.5">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-teal-600">
              3 Feeders
            </span>
            <span className="text-xs text-emerald-600 font-bold">● 99.8% On-Time</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bukit Panjang, Sengkang & Punggol loops synchronized with LTA GTFS real-time streams.
          </p>
        </div>
      </div>

      {/* Selected Item Quick Inspector Drawer (if user clicked something on map) */}
      {(selectedBusStop || selectedStation) && (
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shrink-0">
              {selectedBusStop && <Bus className="w-5 h-5 text-amber-400" />}
              {selectedStation && <Train className="w-5 h-5 text-rose-400" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {selectedBusStop ? 'Selected Bus Stop' : 'Selected MRT Station'}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  {selectedBusStop?.id || selectedStation?.code}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedBusStop?.name || selectedStation?.name}
              </h3>

              <p className="text-xs text-slate-500">
                {selectedBusStop?.road || (selectedStation ? `Lines: ${selectedStation.lines.join(', ')}` : '')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedBusStop && (
              <button
                onClick={() => onQuickNavigate('bus')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Arrivals ({selectedBusStop.services.length} services)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {selectedStation && (
              <button
                onClick={() => onQuickNavigate('mrt')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Plan Route From Here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClearSelection}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close inspector"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
