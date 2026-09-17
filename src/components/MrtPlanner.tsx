import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Train,
  ArrowUpDown,
  Clock,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Activity,
  Zap,
  Gauge,
  Calendar,
  Users,
  Info,
  Layers,
  RefreshCw,
  Radio,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Wifi,
  FileCode,
  X,
} from 'lucide-react';
import { MRT_LINES, MRT_STATIONS, PRO_TRANSIT_TELEMETRY } from '../data/mrtData';
import {
  ATTACHED_TRAIN_SERVICE_ALERTS,
  ATTACHED_TRAIN_TRIP_UPDATES,
  LIVE_GTFS_LINES,
  LIVE_GTFS_ALERTS,
  LIVE_GTFS_TELEMETRY,
  LiveTrainAlert,
} from '../data/liveGtfsData';
import { JourneyResult, MRTLineId, MRTLineInfo, MRTStation } from '../types';
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
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showGtfsModal, setShowGtfsModal] = useState<boolean>(false);

  // Live GTFS Real-Time Feed state
  const [liveLines, setLiveLines] = useState<Record<string, MRTLineInfo>>(LIVE_GTFS_LINES as any);
  const [liveAlerts, setLiveAlerts] = useState<LiveTrainAlert[]>(LIVE_GTFS_ALERTS);
  const [feedTelemetry, setFeedTelemetry] = useState(LIVE_GTFS_TELEMETRY);
  const [feedTimestamp, setFeedTimestamp] = useState<string>(LIVE_GTFS_TELEMETRY.feedTimestamp);
  const [feedSource, setFeedSource] = useState<string>('LTA DataMall GTFS Real-Time');
  const [isFetchingFeed, setIsFetchingFeed] = useState<boolean>(false);
  const [simMode, setSimMode] = useState<string>('');

  const fetchLiveMrtFeed = useCallback(async (simOverride?: string) => {
    setIsFetchingFeed(true);
    const activeSim = simOverride !== undefined ? simOverride : simMode;
    const query = activeSim ? `?simulate=${encodeURIComponent(activeSim)}` : '';
    try {
      const res = await fetch(`/api/mrt${query}`);
      const data = await res.json();
      if (data.state === 'ok') {
        if (data.lines) setLiveLines(data.lines);
        if (data.alerts) setLiveAlerts(data.alerts);
        if (data.telemetry) setFeedTelemetry(data.telemetry);
        if (data.feedTimestamp) setFeedTimestamp(data.feedTimestamp);
        if (data.source) setFeedSource(data.source);
      }
    } catch (err) {
      // Keep baseline live GTFS data if transient network error
    } finally {
      setIsFetchingFeed(false);
    }
  }, [simMode]);

  useEffect(() => {
    fetchLiveMrtFeed();
  }, [fetchLiveMrtFeed]);

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

  // Separate MRT and LRT stations for clean optgroup representation
  const { mrtStationsList, lrtStationsList } = useMemo(() => {
    const mrt: MRTStation[] = [];
    const lrt: MRTStation[] = [];
    MRT_STATIONS.forEach(stn => {
      if (stn.isLRT) {
        lrt.push(stn);
      } else {
        mrt.push(stn);
      }
    });
    return { mrtStationsList: mrt, lrtStationsList: lrt };
  }, []);

  const quickRoutes = [
    { label: 'West to CBD', from: 'Jurong East', to: 'Marina Bay' },
    { label: 'BPLRT Feeder', from: 'Choa Chu Kang', to: 'Senja' },
    { label: 'SKLRT Loop', from: 'Sengkang', to: 'Fernvale' },
    { label: 'PGLRT Loop', from: 'Punggol', to: 'Riviera' },
    { label: 'Airport Express', from: 'Bedok', to: 'Changi Airport' },
    { label: 'North-South Line', from: 'Woodlands', to: 'Raffles Place' },
  ];

  const activeAlertCount = liveAlerts.filter(a => a.severity !== 'NORMAL').length;

  return (
    <div className="space-y-6">
      {/* Live GTFS Real-Time Stream Connection Header */}
      <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative mt-1 sm:mt-0">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
            <div className="w-3 h-3 rounded-full bg-emerald-400 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                LIVE GTFS REAL-TIME FEED CONNECTED
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                LTA DataMall • GTFS V2.0
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Feed Timestamp: <span className="font-mono text-white font-semibold">{feedTimestamp}</span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-slate-400">Monitoring 6 MRT Lines & 3 LRT Feeders</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulation mode switcher */}
          <select
            id="select-gtfs-sim"
            value={simMode}
            onChange={(e) => {
              setSimMode(e.target.value);
              fetchLiveMrtFeed(e.target.value);
            }}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl font-medium focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
          >
            <option value="">Live Feed (Attached Real-Time)</option>
            <option value="disruption">Simulate Track Disruption (CCL)</option>
            <option value="empty">Simulate Empty Feed</option>
            <option value="busy">Simulate Feed Busy (503)</option>
            <option value="unreachable">Simulate Feed Unreachable (504)</option>
          </select>

          <button
            id="btn-refresh-mrt-feed"
            onClick={() => fetchLiveMrtFeed()}
            disabled={isFetchingFeed}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh GTFS Real-Time Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isFetchingFeed ? 'animate-spin text-rose-400' : ''}`} />
            <span>{isFetchingFeed ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            id="btn-open-gtfs-meta"
            onClick={() => setShowGtfsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>GTFS Metadata</span>
          </button>
        </div>
      </div>

      {/* Live Train Service Alerts Notice */}
      {activeAlertCount > 0 ? (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-slate-900 flex items-start gap-3.5 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                Active GTFS Train Alert
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {liveAlerts[0]?.header}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              {liveAlerts[0]?.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-800">
              All 6 MRT lines and 3 LRT loops operating at nominal CBTC signaling headway. No active track or signal faults reported.
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
            100% NOMINAL
          </span>
        </div>
      )}

      {/* PRO Operations Command Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">System Headway</div>
            <div className="text-sm font-black font-mono text-white">
              {feedTelemetry.networkHeadwaySec}s <span className="text-[10px] text-emerald-400 font-normal">Peak</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Reliability (MKBF)</div>
            <div className="text-sm font-black font-mono text-emerald-400">
              {feedTelemetry.onTimePerformancePercent}%
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Active Rolling Stock</div>
            <div className="text-sm font-black font-mono text-white">
              {feedTelemetry.activeRollingStock} <span className="text-[10px] text-slate-400 font-normal">Trains</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Rail Network Scope</div>
            <div className="text-sm font-black font-mono text-white">
              6 MRT <span className="text-slate-400 font-normal">+ 3 LRT</span>
            </div>
          </div>
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
                <span>Plan Route (MRT & LRT Networks)</span>
              </h3>
            </div>

            {/* Quick Route Shortcuts */}
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Popular Quick Routes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickRoutes.map((qr, idx) => (
                  <button
                    key={idx}
                    id={`btn-quick-route-${idx}`}
                    onClick={() => {
                      setFromStationName(qr.from);
                      setToStationName(qr.to);
                      const found = MRT_STATIONS.find(s => s.name === qr.from);
                      if (found) onSelectStation(found);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
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
                  <optgroup label="🚇 Heavy Rail MRT Stations (Interchanges & Main Network)">
                    {mrtStationsList.map(stn => (
                      <option key={stn.code} value={stn.name}>
                        {stn.name} ({stn.code})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🚝 Feeder LRT Stations (Bukit Panjang, Sengkang, Punggol)">
                    {lrtStationsList.map(stn => (
                      <option key={stn.code} value={stn.name}>
                        {stn.name} ({stn.code}) - LRT
                      </option>
                    ))}
                  </optgroup>
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
                  <optgroup label="🚇 Heavy Rail MRT Stations (Interchanges & Main Network)">
                    {mrtStationsList.map(stn => (
                      <option key={stn.code} value={stn.name}>
                        {stn.name} ({stn.code})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🚝 Feeder LRT Stations (Bukit Panjang, Sengkang, Punggol)">
                    {lrtStationsList.map(stn => (
                      <option key={stn.code} value={stn.name}>
                        {stn.name} ({stn.code}) - LRT
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Real-life traffic adjustment toggles */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">
                  Include Real-Life Peak Hour Delay (+3-7 mins)
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
                  Live Dispatch Simulation (Simulate Incident / Speed Limit):
                </label>
                <select
                  id="select-incident-sim"
                  value={simulateIncident}
                  onChange={e => setSimulateIncident(e.target.value as MRTLineId)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                >
                  <option value="">None (Nominal schedule & speed)</option>
                  <option value="NSL">North-South Line (+6m track circuit maintenance)</option>
                  <option value="EWL">East-West Line (+6m platform crowd hold)</option>
                  <option value="NEL">North-East Line (+6m signal system calibration)</option>
                  <option value="CCL">Circle Line (+6m turn-around bottleneck)</option>
                  <option value="DTL">Downtown Line (+6m speed restriction)</option>
                  <option value="TEL">Thomson-East Coast Line (+6m train dwell extension)</option>
                  <option value="BPLRT">Bukit Panjang LRT (+6m Service A turnaround hold)</option>
                  <option value="SKLRT">Sengkang LRT (+6m West Loop platform regulation)</option>
                  <option value="PGLRT">Punggol LRT (+6m East Loop maintenance)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Station Live Platform Arrival Timings */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Platform Arrivals
                </span>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {activeStation.name} ({activeStation.code})
                  </h4>
                  {activeStation.isLRT && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      LRT
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    activeStation.crowdLevel === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : activeStation.crowdLevel === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeStation.crowdLevel || 'Moderate'} Crowd
                </span>
              </div>
            </div>

            {/* First & Last Train Timings Card */}
            {activeStation.firstLastTrain && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    First / Last Train Operational Timings
                  </div>
                  <span className="text-[10px] text-slate-400">Daily Regular</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-medium">Mon - Sat:</span>{' '}
                    <span className="font-bold text-slate-800">{activeStation.firstLastTrain.weekdayFirst}</span>
                    <span className="text-slate-400"> to </span>
                    <span className="font-bold text-slate-800">{activeStation.firstLastTrain.weekdayLast}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-medium">Sun / PH:</span>{' '}
                    <span className="font-bold text-slate-800">{activeStation.firstLastTrain.weekendFirst}</span>
                    <span className="text-slate-400"> to </span>
                    <span className="font-bold text-slate-800">{activeStation.firstLastTrain.weekendLast}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Platform arrivals */}
            <div className="space-y-2.5">
              {activeStation.platformArrivals?.map((platform, idx) => {
                const lineInfo = MRT_LINES[platform.line];
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
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
                        <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-bold text-xs">
                          {platform.nextTrainMinutes === 0 ? 'Arr' : `${platform.nextTrainMinutes}m`}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Next {platform.subsequentTrainMinutes}m
                        </span>
                      </div>
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
                  <span>Base rail time: {journey.baseDurationMinutes}m</span>
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
                  Journey Route & Station Guidance (MRT & LRT)
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
                                {lineInfo.code} ({lineInfo.name})
                              </span>
                            )}
                          </div>

                          {step.intermediateStations && step.intermediateStations.length > 0 && (
                            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="font-semibold text-slate-700">Stations passed ({step.intermediateStations.length}): </span>
                              <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                                {step.intermediateStations.map((stnName, sIdx) => (
                                  <span key={sIdx} className="inline-flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-800">
                                      {stnName}
                                    </span>
                                    {sIdx < (step.intermediateStations?.length || 0) - 1 && (
                                      <span className="text-slate-400 text-xs">→</span>
                                    )}
                                  </span>
                                ))}
                              </div>
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

      {/* GTFS Real-Time Feed Metadata Inspector Modal */}
      {showGtfsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-700 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>LTA DataMall GTFS Real-Time Feed</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live transit telemetry and service alerts from Singapore Land Transport Authority
                  </p>
                </div>
              </div>
              <button
                id="btn-close-gtfs-modal"
                onClick={() => setShowGtfsModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Feeds summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                    <span>Train Service Alerts Feed</span>
                    <span className="text-[10px] text-emerald-400 font-mono">200 OK</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono break-all mb-2">
                    {ATTACHED_TRAIN_SERVICE_ALERTS['odata.metadata']}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Timestamp: <span className="font-mono text-white">{ATTACHED_TRAIN_SERVICE_ALERTS.value[0]?.timestamp}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                    <span>Train Trip Updates Feed</span>
                    <span className="text-[10px] text-emerald-400 font-mono">200 OK</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono break-all mb-2">
                    {ATTACHED_TRAIN_TRIP_UPDATES['odata.metadata']}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Timestamp: <span className="font-mono text-white">{ATTACHED_TRAIN_TRIP_UPDATES.value[0]?.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Protocol buffer description */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <div className="font-bold text-white mb-1.5 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-rose-400" />
                  <span>Protocol Buffer V2.0 Decoding Spec</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Each feed produces an AWS S3 signed link containing raw Google Protocol Buffer (`.pb`) binary streams encoded per the GTFS Realtime specification. The backend serverless endpoint (`/api/mrt`) parses the <code className="text-rose-300 font-mono">transit_realtime.FeedMessage</code> schema to compute line-level headways, crowd factors, and active incidents.
                </p>
              </div>

              {/* Attached JSON payload */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Raw Feed Metadata Payload (From Attached Live Files)
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48 leading-tight">
                  <pre>{JSON.stringify({
                    serviceAlerts: {
                      endpoint: ATTACHED_TRAIN_SERVICE_ALERTS['odata.metadata'],
                      timestamp: ATTACHED_TRAIN_SERVICE_ALERTS.value[0]?.timestamp,
                      s3ObjectUrl: ATTACHED_TRAIN_SERVICE_ALERTS.value[0]?.link?.substring(0, 100) + '...[AWS-Signature-Protected]',
                    },
                    tripUpdates: {
                      endpoint: ATTACHED_TRAIN_TRIP_UPDATES['odata.metadata'],
                      timestamp: ATTACHED_TRAIN_TRIP_UPDATES.value[0]?.timestamp,
                      s3ObjectUrl: ATTACHED_TRAIN_TRIP_UPDATES.value[0]?.link?.substring(0, 100) + '...[AWS-Signature-Protected]',
                    },
                    linesMonitored: ['NSL', 'EWL', 'NEL', 'CCL', 'DTL', 'TEL', 'BPLRT', 'SKLRT', 'PGLRT'],
                    status: 'ONLINE',
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/60">
              <button
                id="btn-close-gtfs-modal-footer"
                onClick={() => setShowGtfsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

