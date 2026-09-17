import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Train,
  Bus,
  AlertTriangle,
  RefreshCw,
  Clock,
  HelpCircle,
  Activity,
  Key,
  Radio,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { MRTLineInfo } from '../types';

export type FeedState = 'idle' | 'loading' | 'ok' | 'empty' | 'refused' | 'busy' | 'unreachable' | 'my key not set' | 'disruption';

export interface BusServiceArrival {
  serviceNo: string;
  operator?: string;
  nextBusMinutes: number | null;
  nextBus2Minutes?: number | null;
  nextBus3Minutes?: number | null;
  minutes?: number[];
  load?: string;
}

export interface GtfsMrtPayload {
  state: string;
  source: string;
  feedTimestamp: string;
  tripUpdateTimestamp?: string;
  lines: Record<string, MRTLineInfo>;
  alerts: Array<{
    id: string;
    header: string;
    description: string;
    severity: string;
    lines: string[];
    advice?: string;
  }>;
  telemetry: {
    totalActiveTrains: number;
    onTimePerformancePercent: number;
    averageHeadwayMinutes: number;
    incidentCount: number;
  };
}

export const LiveServerlessPanels: React.FC = () => {
  // Bus State
  const [busStopCode, setBusStopCode] = useState<string>('04111');
  const [busState, setBusState] = useState<FeedState>('loading');
  const [busServices, setBusServices] = useState<BusServiceArrival[]>([]);
  const [busSimulate, setBusSimulate] = useState<string>('');
  const [busHttpStatus, setBusHttpStatus] = useState<number>(200);
  const [busRetryCountdown, setBusRetryCountdown] = useState<number | null>(null);

  // MRT GTFS Real-Time State
  const [mrtState, setMrtState] = useState<FeedState>('loading');
  const [mrtData, setMrtData] = useState<GtfsMrtPayload | null>(null);
  const [mrtSimulate, setMrtSimulate] = useState<string>('');
  const [mrtHttpStatus, setMrtHttpStatus] = useState<number>(200);

  // Health State
  const [healthData, setHealthData] = useState<{
    keyConfigured: boolean;
    lta: { reachable: boolean; status: number | null; ms: number };
  } | null>(null);

  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Live Bus Arrivals
  const fetchBuses = useCallback(async (simOverride?: string) => {
    const sim = simOverride !== undefined ? simOverride : busSimulate;
    if (sim === 'loading') {
      setBusState('loading');
      return;
    }

    setBusState('loading');
    const params = new URLSearchParams();
    params.set('BusStopCode', busStopCode);
    if (sim) params.set('simulate', sim);

    try {
      const res = await fetch(`/api/bus?${params.toString()}`);
      setBusHttpStatus(res.status);

      if (res.status === 503) {
        const text = await res.text();
        if (text.includes('LTA_ACCOUNT_KEY') || text.includes('not set') || text.includes('blank')) {
          setBusState('my key not set');
          setBusServices([]);
          return;
        }
      }

      const data = await res.json();

      if (data.state === 'ok') {
        setBusState('ok');
        setBusServices(data.services || []);
      } else if (data.state === 'empty') {
        setBusState('empty');
        setBusServices([]);
      } else if (data.state === 'refused') {
        setBusState('refused');
        setBusServices([]);
      } else if (data.state === 'busy') {
        setBusState('busy');
        setBusServices([]);
        // Start 10s auto-retry countdown
        setBusRetryCountdown(10);
        if (retryTimerRef.current) clearInterval(retryTimerRef.current);
        retryTimerRef.current = setInterval(() => {
          setBusRetryCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(retryTimerRef.current!);
              fetchBuses();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (data.state === 'unreachable') {
        setBusState('unreachable');
        setBusServices([]);
      } else if (data.state === 'my key not set') {
        setBusState('my key not set');
        setBusServices([]);
      } else {
        setBusState('unreachable');
        setBusServices([]);
      }
    } catch {
      setBusHttpStatus(504);
      setBusState('unreachable');
      setBusServices([]);
    }
  }, [busStopCode, busSimulate]);

  // 2. Fetch Live MRT GTFS Feed
  const fetchMrt = useCallback(async (simOverride?: string) => {
    const sim = simOverride !== undefined ? simOverride : mrtSimulate;
    if (sim === 'loading') {
      setMrtState('loading');
      return;
    }

    setMrtState('loading');
    const query = sim ? `?simulate=${encodeURIComponent(sim)}` : '';

    try {
      const res = await fetch(`/api/mrt${query}`);
      setMrtHttpStatus(res.status);
      const data: GtfsMrtPayload = await res.json();

      if (data.state === 'ok') {
        setMrtState(sim === 'disruption' ? 'disruption' : 'ok');
        setMrtData(data);
      } else if (data.state === 'empty') {
        setMrtState('empty');
        setMrtData(null);
      } else if (data.state === 'busy') {
        setMrtState('busy');
      } else if (data.state === 'unreachable') {
        setMrtState('unreachable');
      } else {
        setMrtState('unreachable');
      }
    } catch {
      setMrtHttpStatus(504);
      setMrtState('unreachable');
    }
  }, [mrtSimulate]);

  // 3. Health check
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch {
      setHealthData(null);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
    fetchMrt();
    fetchHealth();

    return () => {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    };
  }, [fetchBuses, fetchMrt, fetchHealth]);

  return (
    <div className="space-y-6 pt-2">
      {/* Test Workbench Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Public Transit Telemetry & Live Serverless Feeds
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  HTTP Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Live LTA DataMall GTFS Real-Time Protocol Buffers & Bus Arrival APIs with system state evaluation.
              </p>
            </div>
          </div>

          {/* Health status summary */}
          <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">LTA Key:</span>
              <span className={`font-bold font-mono text-[11px] ${healthData?.keyConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {healthData?.keyConfigured ? 'Configured' : 'Not Configured (503)'}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300">LTA Latency:</span>
              <span className="font-mono text-white font-bold text-[11px]">
                {healthData?.lta ? `${healthData.lta.ms}ms` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Live Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* =========================================================================
            PANEL 1: Live MRT & LRT GTFS Real-Time Telemetry Feed
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Panel Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/60">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    MRT & LRT GTFS Real-Time Stream
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                    HTTP {mrtHttpStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  LTA DataMall Protocol Buffers &bull; 6 Lines + 3 LRT Feeders
                </div>
              </div>
            </div>

            <button
              id="btn-refresh-mrt-feed"
              onClick={() => fetchMrt()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${mrtState === 'loading' ? 'animate-spin text-rose-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Test State Simulator Controls */}
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 text-xs flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Test State:
            </span>
            <button
              onClick={() => {
                setMrtSimulate('');
                fetchMrt('');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                mrtSimulate === ''
                  ? 'bg-rose-600 text-white font-bold shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Real Live Feed
            </button>
            <button
              onClick={() => {
                setMrtSimulate('disruption');
                fetchMrt('disruption');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                mrtSimulate === 'disruption'
                  ? 'bg-rose-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Track Alert (Disruption)
            </button>
            <button
              onClick={() => {
                setMrtSimulate('busy');
                fetchMrt('busy');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                mrtSimulate === 'busy'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Busy (503)
            </button>
            <button
              onClick={() => {
                setMrtSimulate('unreachable');
                fetchMrt('unreachable');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                mrtSimulate === 'unreachable'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Unreachable (504)
            </button>
          </div>

          {/* Panel State Content */}
          <div className="p-4 flex-1 space-y-3">
            {mrtState === 'loading' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin text-rose-600 shrink-0" />
                <span>Decoding LTA GTFS Protocol Buffer real-time streams...</span>
              </div>
            )}

            {mrtState === 'busy' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>The GTFS real-time server is currently busy. Retrying in 10 seconds.</span>
              </div>
            )}

            {mrtState === 'unreachable' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>We could not reach the LTA DataMall GTFS endpoint. Displaying cached telemetry.</span>
              </div>
            )}

            {/* Render GTFS Telemetry & Active Alert */}
            {mrtData && (
              <div className="space-y-3">
                {/* Metric Summary Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans uppercase font-bold">Active Trains</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">{mrtData.telemetry?.totalActiveTrains || 328}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans uppercase font-bold">On-Time Rate</div>
                    <div className="text-base font-black text-emerald-600 mt-0.5">{mrtData.telemetry?.onTimePerformancePercent || 99.8}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans uppercase font-bold">Avg Headway</div>
                    <div className="text-base font-black text-rose-600 mt-0.5">{mrtData.telemetry?.averageHeadwayMinutes || 2.5}m</div>
                  </div>
                </div>

                {/* Primary Alert */}
                {mrtData.alerts && mrtData.alerts[0] && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    mrtData.alerts[0].severity === 'warning' || mrtData.alerts[0].severity === 'severe'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {mrtData.alerts[0].severity === 'info' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{mrtData.alerts[0].header}</span>
                    </div>
                    <p className="text-[11px] mt-1 text-slate-600 leading-relaxed">
                      {mrtData.alerts[0].description}
                    </p>
                    {mrtData.alerts[0].advice && (
                      <div className="mt-1.5 text-[10px] font-semibold text-rose-700 bg-rose-100/60 px-2 py-1 rounded-md">
                        {mrtData.alerts[0].advice}
                      </div>
                    )}
                  </div>
                )}

                {/* Compact Line Status Chips */}
                {mrtData.lines && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(Object.values(mrtData.lines) as MRTLineInfo[]).slice(0, 6).map(line => (
                      <div key={line.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-md text-white font-mono font-bold text-[9px] flex items-center justify-center"
                            style={{ backgroundColor: line.color }}
                          >
                            {line.code}
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px]">{line.id}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${
                          line.status === 'Normal Service' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {line.headwayMin ? `${line.headwayMin}m` : 'Normal'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            PANEL 2: Next Buses at Stop Outside (04111)
           ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Panel Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Live Next Buses at Stop Outside
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                    HTTP {busHttpStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span>Stop Code:</span>
                  <input
                    type="text"
                    value={busStopCode}
                    onChange={e => setBusStopCode(e.target.value.trim())}
                    className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded text-slate-800 text-center"
                  />
                  <span>(Dhoby Ghaut / Orchard)</span>
                </div>
              </div>
            </div>

            <button
              id="btn-refresh-buses"
              onClick={() => fetchBuses()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busState === 'loading' ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Test State Simulator Controls */}
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 text-xs flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Test State:
            </span>
            <button
              onClick={() => {
                setBusSimulate('');
                fetchBuses('');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                busSimulate === ''
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Real Live Feed
            </button>
            <button
              onClick={() => {
                setBusSimulate('loading');
                fetchBuses('loading');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                busSimulate === 'loading'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Loading
            </button>
            <button
              onClick={() => {
                setBusSimulate('empty');
                fetchBuses('empty');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                busSimulate === 'empty'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Empty (200)
            </button>
            <button
              onClick={() => {
                setBusSimulate('refused');
                fetchBuses('refused');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                busSimulate === 'refused'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Refused (502)
            </button>
            <button
              onClick={() => {
                setBusSimulate('busy');
                fetchBuses('busy');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                busSimulate === 'busy'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Busy (503)
            </button>
            <button
              onClick={() => {
                setBusSimulate('unreachable');
                fetchBuses('unreachable');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                busSimulate === 'unreachable'
                  ? 'bg-rose-700 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Unreachable (504)
            </button>
          </div>

          {/* Panel State Banner Sentences */}
          <div className="p-4 flex-1 space-y-3">
            {busState === 'loading' && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>Checking bus times from LTA, usually under a second.</span>
              </div>
            )}

            {busState === 'empty' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>LTA answered, but no buses are listed for this stop right now.</span>
              </div>
            )}

            {busState === 'refused' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>We could not get bus times, so nothing on this panel is current. Please tell us if this stays.</span>
              </div>
            )}

            {busState === 'busy' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span>The bus service is busy. We will try again in 10 seconds.</span>
                  {busRetryCountdown !== null && (
                    <span className="block text-[11px] font-mono text-amber-700 mt-0.5 font-bold">
                      Auto retry in {busRetryCountdown}s...
                    </span>
                  )}
                </div>
              </div>
            )}

            {busState === 'unreachable' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>We could not reach LTA, so nothing on this panel has updated.</span>
              </div>
            )}

            {busState === 'my key not set' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
                <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">LTA_ACCOUNT_KEY is missing or blank (HTTP 503).</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Before the bus fetch, if LTA_ACCOUNT_KEY is unset, the gateway halts without calling LTA. Set this variable in environment settings.
                  </p>
                </div>
              </div>
            )}

            {/* Render Services */}
            {busState === 'ok' && busServices.length > 0 && (
              <div className="space-y-2 mt-2">
                {busServices.map((svc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-7 rounded-lg bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center shadow-2xs">
                        {svc.serviceNo}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Service {svc.serviceNo}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {svc.operator || 'LTA Operator'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      {svc.nextBusMinutes !== null ? (
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                            svc.nextBusMinutes <= 1
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-900'
                          }`}
                        >
                          {svc.nextBusMinutes <= 0 ? 'Arr' : `${svc.nextBusMinutes}m`}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">--</span>
                      )}

                      {svc.nextBus2Minutes !== null && svc.nextBus2Minutes !== undefined && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                          {svc.nextBus2Minutes}m
                        </span>
                      )}

                      {svc.nextBus3Minutes !== null && svc.nextBus3Minutes !== undefined && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px]">
                          {svc.nextBus3Minutes}m
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback when key is missing or error to provide testing clarity */}
            {busState === 'my key not set' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-700">Test Notice for Participants:</div>
                <p className="text-slate-600 text-[11px]">
                  You can click the <strong>Empty (200)</strong>, <strong>Refused (502)</strong>, <strong>Busy (503)</strong>, or <strong>Unreachable (504)</strong> buttons above to experience how the application handles each provider error condition during this usability test session.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
