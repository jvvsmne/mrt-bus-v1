import React from 'react';
import { Bus, Train, ParkingSquare, Sparkles, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { BusStop, CarparkInfo, MRTStation } from '../types';
import { getCarparkOccupancyStatus } from '../data/carparkData';
import { MRT_LINES } from '../data/mrtData';

interface QuickStatsBarProps {
  totalBusesMonitored: number;
  totalBusStops: number;
  totalCarparks: number;
  totalLotsAvailable: number;
  onQuickNavigate: (mode: 'bus' | 'mrt' | 'carpark') => void;
  selectedBusStop: BusStop | null;
  selectedStation: MRTStation | null;
  selectedCarpark: CarparkInfo | null;
  onClearSelection: () => void;
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({
  totalBusesMonitored,
  totalBusStops,
  totalCarparks,
  totalLotsAvailable,
  onQuickNavigate,
  selectedBusStop,
  selectedStation,
  selectedCarpark,
  onClearSelection,
}) => {
  return (
    <div className="space-y-4">
      {/* 3 Overview Stat Cards */}
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
              <span>Rail Transit (MRT)</span>
            </span>
            <span className="text-slate-400 group-hover:text-rose-600 transition-colors text-xs font-semibold flex items-center gap-0.5">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-slate-900">
              6 Lines
            </span>
            <span className="text-xs text-emerald-600 font-bold">● Operational</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live platform countdowns, congestion delays & real-life journey duration.
          </p>
        </div>

        {/* Parking */}
        <div
          onClick={() => onQuickNavigate('carpark')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1.5">
              <ParkingSquare className="w-3.5 h-3.5" />
              <span>Carpark Vacancies</span>
            </span>
            <span className="text-slate-400 group-hover:text-emerald-600 transition-colors text-xs font-semibold flex items-center gap-0.5">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-emerald-600">
              {totalLotsAvailable.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              vacant lots ({totalCarparks} carparks)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            HDB, URA, and major shopping mall occupancy percentages updated in real-time.
          </p>
        </div>
      </div>

      {/* Selected Item Quick Inspector Drawer (if user clicked something on map) */}
      {(selectedBusStop || selectedStation || selectedCarpark) && (
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shrink-0">
              {selectedBusStop && <Bus className="w-5 h-5 text-amber-400" />}
              {selectedStation && <Train className="w-5 h-5 text-rose-400" />}
              {selectedCarpark && <ParkingSquare className="w-5 h-5 text-emerald-400" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {selectedBusStop ? 'Selected Bus Stop' : selectedStation ? 'Selected MRT Station' : 'Selected Carpark'}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  {selectedBusStop?.id || selectedStation?.code || selectedCarpark?.id}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedBusStop?.name || selectedStation?.name || selectedCarpark?.name}
              </h3>

              <p className="text-xs text-slate-500">
                {selectedBusStop?.road ||
                  (selectedStation ? `Lines: ${selectedStation.lines.join(', ')}` : selectedCarpark?.address)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedBusStop && (
              <button
                onClick={() => onQuickNavigate('bus')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>View Arrivals ({selectedBusStop.services.length} services)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {selectedStation && (
              <button
                onClick={() => onQuickNavigate('mrt')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Plan Route From Here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {selectedCarpark && (
              <button
                onClick={() => onQuickNavigate('carpark')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>{selectedCarpark.availableLots} Lots Available</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClearSelection}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
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
