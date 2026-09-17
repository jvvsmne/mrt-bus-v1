import React, { useState, useMemo } from 'react';
import { Train, ArrowUpDown, Clock, Navigation, AlertTriangle, ShieldCheck, DollarSign, CheckCircle2 } from 'lucide-react';
import { MRT_LINES, MRT_STATIONS } from '../data/mrtData';
import { JourneyResult, MRTLineId, MRTStation } from '../types';
import { calculateMRTRoute } from '../utils/mrtRouter';

interface MrtPlannerProps {
  selectedStation: MRTStation | null;
  onSelectStation: (station: MRTStation) => void;
  onViewOnMap?: (station: MRTStation) => void;
}

export const MrtPlanner: React.FC<MrtPlannerProps> = ({
  selectedStation,
  onSelectStation,
  onViewOnMap,
}) => {
  const [fromStationName, setFromStationName] = useState<string>(
    selectedStation ? selectedStation.name : 'Jurong East'
  );
  const [toStationName, setToStationName] = useState<string>('Marina Bay');
  const [applyPeakFactor, setApplyPeakFactor] = useState<boolean>(true);
  const [simulateIncident, setSimulateIncident] = useState<MRTLineId | ''>('');

  // When user clicks a station on map or list
  const activeStation = useMemo(() => {
    return MRT_STATIONS.find(s => s.name === fromStationName) || MRT_STATIONS[0];
  }, [fromStationName]);

  const handleSwap = () => {
    const temp = fromStationName;
    setFromStationName(toStationName);
    setToStationName(temp);
  };

  // Compute calculated journey with real-life traffic delay
  const journey: JourneyResult | null = useMemo(() => {
    return calculateMRTRoute(
      fromStationName,
      toStationName,
      applyPeakFactor,
      simulateIncident ? simulateIncident : undefined
    );
  }, [fromStationName, toStationName, applyPeakFactor, simulateIncident]);

  return (
    <div className="space-y-6">
      {/* MRT Lines Live Network Status Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Singapore Rail Transit Network Live Status
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Real-time feed active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.values(MRT_LINES).map(line => {
            const hasSimulatedIncident = simulateIncident === line.id;
            const status = hasSimulatedIncident
              ? 'Track Maintenance'
              : line.status;
            const isNormal = status === 'Normal Service';

            return (
              <div
                key={line.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isNormal
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: line.color }}
                  >
                    {line.code}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isNormal ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                </div>
                <div className="text-xs font-bold text-slate-800 truncate">{line.name}</div>
                <div
                  className={`text-[10px] font-medium mt-0.5 ${
                    isNormal ? 'text-emerald-700' : 'text-amber-800 font-bold'
                  }`}
                >
                  {status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Journey Planner & Platform Live Arrivals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Journey Input & Settings (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-rose-600" />
                <span>Plan MRT Route & Travel Time</span>
              </h3>
            </div>

            {/* Origin station selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Origin Station (Start)
                </label>
                <select
                  id="select-mrt-origin"
                  value={fromStationName}
                  onChange={e => {
                    setFromStationName(e.target.value);
                    const found = MRT_STATIONS.find(s => s.name === e.target.value);
                    if (found) onSelectStation(found);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {MRT_STATIONS.map(stn => (
                    <option key={stn.code} value={stn.name}>
                      {stn.name} ({stn.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap button */}
              <div className="flex justify-center -my-1">
                <button
                  id="btn-swap-mrt"
                  onClick={handleSwap}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200 shadow-2xs"
                  title="Swap start and destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination station selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Destination Station (End)
                </label>
                <select
                  id="select-mrt-destination"
                  value={toStationName}
                  onChange={e => setToStationName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {MRT_STATIONS.map(stn => (
                    <option key={stn.code} value={stn.name}>
                      {stn.name} ({stn.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Real-life traffic adjustment toggles */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">
                  Include Real-Life Peak Hour Delay
                </span>
                <input
                  id="toggle-peak-hour"
                  type="checkbox"
                  checked={applyPeakFactor}
                  onChange={e => setApplyPeakFactor(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Simulate Incident / Speed Restriction:
                </label>
                <select
                  id="select-incident-sim"
                  value={simulateIncident}
                  onChange={e => setSimulateIncident(e.target.value as MRTLineId)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                >
                  <option value="">None (Normal real-time conditions)</option>
                  <option value="NSL">North-South Line (+6m track signal check)</option>
                  <option value="EWL">East-West Line (+6m platform crowd control)</option>
                  <option value="NEL">North-East Line (+6m maintenance)</option>
                  <option value="CCL">Circle Line (+6m heavy volume)</option>
                  <option value="DTL">Downtown Line (+6m speed limit)</option>
                  <option value="TEL">Thomson-East Coast Line (+6m)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Station Live Platform Arrival Timings (Origin Station) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Platform Arrivals
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {activeStation.name} ({activeStation.code})
                </h4>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  activeStation.crowdLevel === 'High'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {activeStation.crowdLevel || 'Moderate'} Crowd
              </span>
            </div>

            <div className="space-y-2">
              {activeStation.platformArrivals?.map((platform, idx) => {
                const lineInfo = MRT_LINES[platform.line];
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ backgroundColor: lineInfo?.color }}
                      >
                        {lineInfo?.code}
                      </span>
                      <div>
                        <div className="font-bold text-slate-800 leading-tight">
                          {platform.platform}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Towards {platform.destination}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-xs">
                        {platform.nextTrainMinutes === 0 ? 'Arr' : `${platform.nextTrainMinutes}m`}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {platform.subsequentTrainMinutes}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Calculated Route & Step-by-Step Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {journey ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Summary Header */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">Estimated Duration:</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {journey.totalDurationMinutes} mins
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{journey.fare}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                      <span>{journey.transfersCount} transfer{journey.transfersCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </div>

                {/* Delay indicator */}
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span>Base ride: {journey.baseDurationMinutes}m</span>
                  {journey.trafficDelayMinutes > 0 && (
                    <span className="text-amber-400 font-semibold">
                      +{journey.trafficDelayMinutes}m real-life delay & interchange walk
                    </span>
                  )}
                </div>

                {journey.realTimeNotice && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{journey.realTimeNotice}</span>
                  </div>
                )}
              </div>

              {/* Step by Step Breakdown */}
              <div className="p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Journey Route & Station Guidance
                </h4>

                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                  {journey.steps.map((step, idx) => {
                    const isLast = idx === journey.steps.length - 1;
                    const lineInfo = step.line ? MRT_LINES[step.line] : null;

                    return (
                      <div key={idx} className="relative">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                            step.type === 'board'
                              ? 'bg-emerald-500 ring-2 ring-emerald-200'
                              : isLast
                              ? 'bg-rose-600 ring-2 ring-rose-200'
                              : step.type === 'transfer'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {step.description}
                            </span>
                            {lineInfo && (
                              <span
                                className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: lineInfo.color }}
                              >
                                {lineInfo.code}
                              </span>
                            )}
                          </div>

                          {step.intermediateStations && step.intermediateStations.length > 0 && (
                            <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="font-semibold text-slate-700">Stations passed: </span>
                              {step.intermediateStations.join(' → ')}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 mt-1">
                            Approx. {step.durationMinutes} min{step.durationMinutes > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              Select origin and destination to compute live route.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
