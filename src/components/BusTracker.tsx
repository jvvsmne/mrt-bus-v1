import React, { useState, useMemo } from 'react';
import { Search, Bus, MapPin, Bookmark, BookmarkCheck, ArrowRight, Accessibility, AlertCircle, RefreshCw } from 'lucide-react';
import { BusStop, BusArrivalInfo, SingaporeRegion, BusOperator } from '../types';
import { getArrivalsForBusStop } from '../data/busData';

interface BusTrackerProps {
  busStops: BusStop[];
  selectedRegion: SingaporeRegion;
  selectedBusStop: BusStop | null;
  onSelectBusStop: (stop: BusStop) => void;
  onViewOnMap?: (stop: BusStop) => void;
  refreshSeed: number;
}

const OPERATOR_COLORS: Record<BusOperator, { bg: string; text: string; border: string }> = {
  'SBS Transit': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'SMRT': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Tower Transit': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Go-Ahead': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
};

export const BusTracker: React.FC<BusTrackerProps> = ({
  busStops,
  selectedRegion,
  selectedBusStop,
  onSelectBusStop,
  onViewOnMap,
  refreshSeed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<string>('All');
  const [favoriteStops, setFavoriteStops] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_fav_bus_stops');
      return saved ? JSON.parse(saved) : ['04111', '28009'];
    } catch {
      return ['04111', '28009'];
    }
  });

  const toggleFavorite = (stopId: string) => {
    setFavoriteStops(prev => {
      const updated = prev.includes(stopId) ? prev.filter(id => id !== stopId) : [...prev, stopId];
      try {
        localStorage.setItem('sg_fav_bus_stops', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Filter bus stops by search and region
  const filteredStops = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return busStops.filter(stop => {
      // Region filter
      if (selectedRegion !== 'All' && stop.region !== selectedRegion) {
        return false;
      }

      // If no query, pass
      if (!q) return true;

      // Check bus stop ID
      if (stop.id.toLowerCase().includes(q)) return true;
      // Check bus stop name or road
      if (stop.name.toLowerCase().includes(q) || stop.road.toLowerCase().includes(q)) return true;
      // Check if any bus service matches
      if (stop.services.some(svc => svc.toLowerCase().startsWith(q) || svc.toLowerCase() === q)) {
        return true;
      }

      return false;
    });
  }, [busStops, selectedRegion, searchQuery]);

  // Active bus stop is either selected or first filtered
  const activeStop = selectedBusStop || (filteredStops.length > 0 ? filteredStops[0] : null);

  // Live arrivals for active stop
  const arrivals: BusArrivalInfo[] = useMemo(() => {
    if (!activeStop) return [];
    let list = getArrivalsForBusStop(activeStop.id, refreshSeed);

    // Filter by bus number if search query looks like a bus number
    const q = searchQuery.trim();
    if (q && /^\d+[A-Za-z]?$/.test(q)) {
      list = list.filter(a => a.busNumber.toLowerCase().includes(q.toLowerCase()));
    }

    if (selectedOperator !== 'All') {
      list = list.filter(a => a.operator === selectedOperator);
    }

    return list;
  }, [activeStop, refreshSeed, searchQuery, selectedOperator]);

  const renderArrivalPill = (
    mins: number | undefined,
    load: string | undefined,
    type: string | undefined
  ) => {
    if (mins === undefined) return <span className="text-slate-300 text-xs">-</span>;

    const isArriving = mins === 0;
    const text = isArriving ? 'Arr' : `${mins}m`;

    const loadColor =
      load === 'SEA'
        ? 'bg-emerald-500' // Seats Available
        : load === 'SDA'
        ? 'bg-amber-500' // Standing Available
        : 'bg-rose-500'; // Limited Standing

    return (
      <div className="flex flex-col items-center">
        <div
          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 shadow-2xs ${
            isArriving
              ? 'bg-emerald-600 text-white animate-pulse'
              : mins <= 3
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800 text-white'
          }`}
        >
          <span>{text}</span>
          {type === 'DD' && (
            <span className="text-[9px] px-1 rounded bg-white/20 uppercase font-sans">DD</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className={`w-2 h-2 rounded-full ${loadColor}`} title={`Load: ${load}`} />
          <span className="text-[9px] text-slate-400 font-medium">
            {load === 'SEA' ? 'Seats' : load === 'SDA' ? 'Standing' : 'Crowded'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Search & Bus Stop Directory (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Search input */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="input-bus-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search bus # (e.g. 65, 143, 190) or bus stop..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Operator filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-medium text-slate-600">
            <span className="text-slate-400 whitespace-nowrap">Operator:</span>
            {['All', 'SBS Transit', 'SMRT', 'Tower Transit', 'Go-Ahead'].map(op => (
              <button
                key={op}
                onClick={() => setSelectedOperator(op)}
                className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedOperator === op
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Bus stops list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">
              Bus Stops ({filteredStops.length})
            </span>
            <span className="text-slate-400">Click to view arrivals</span>
          </div>

          <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100">
            {filteredStops.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No bus stops or services found matching &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredStops.map(stop => {
                const isSelected = activeStop?.id === stop.id;
                const isFav = favoriteStops.includes(stop.id);

                return (
                  <div
                    key={stop.id}
                    id={`bus-stop-row-${stop.id}`}
                    onClick={() => onSelectBusStop(stop)}
                    className={`p-3.5 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-4 border-amber-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold font-mono shadow-xs ${
                          isSelected
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {stop.id}
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                          {stop.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{stop.road}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {stop.region}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {stop.services.length} services
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(stop.id);
                      }}
                      className="text-slate-300 hover:text-amber-500 p-1 rounded transition-colors"
                      title="Bookmark stop"
                    >
                      {isFav ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Live Arrival Timings Board (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {activeStop ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header of Active Stop */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-500 text-slate-950 text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-md">
                    BUS STOP {activeStop.id}
                  </span>
                  <span className="text-xs text-slate-300">| {activeStop.region} Region</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {activeStop.name}
                </h2>
                <p className="text-xs text-slate-300">{activeStop.road}</p>
              </div>

              <div className="flex items-center gap-2">
                {onViewOnMap && (
                  <button
                    onClick={() => onViewOnMap(activeStop)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Map</span>
                  </button>
                )}
                <button
                  onClick={() => toggleFavorite(activeStop.id)}
                  className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1 font-semibold ${
                    favoriteStops.includes(activeStop.id)
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Load Legend Bar */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700">Load status:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Seats (SEA)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Standing (SDA)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Crowded (LSD)
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="px-1 rounded bg-slate-200 text-slate-700 font-mono text-[9px]">DD</span> Double Deck
                <Accessibility className="w-3.5 h-3.5 text-blue-500" title="Wheelchair Accessible" />
              </div>
            </div>

            {/* Live Service Cards */}
            <div className="divide-y divide-slate-100 p-2 sm:p-4 space-y-2">
              {arrivals.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No matching services for this operator/filter.
                </div>
              ) : (
                arrivals.map(service => {
                  const opStyle = OPERATOR_COLORS[service.operator];
                  return (
                    <div
                      key={service.busNumber}
                      id={`bus-service-card-${service.busNumber}`}
                      className="p-3 sm:p-4 rounded-xl hover:bg-slate-50/80 transition-colors border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Bus info */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-sm sm:text-base flex items-center justify-center font-mono shadow-xs shrink-0">
                          {service.busNumber}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${opStyle.bg} ${opStyle.text} ${opStyle.border}`}
                            >
                              {service.operator}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                              <Accessibility className="w-3 h-3" /> WAB
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
                            <span>To:</span>
                            <span className="text-slate-900">{service.destination}</span>
                          </p>
                        </div>
                      </div>

                      {/* 3 Arrival Timings */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-center">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Next Bus
                          </div>
                          {renderArrivalPill(
                            service.nextBus.estimatedArrivalMinutes,
                            service.nextBus.load,
                            service.nextBus.type
                          )}
                        </div>

                        <div className="w-px h-8 bg-slate-200 my-auto"></div>

                        <div className="text-center">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            2nd Bus
                          </div>
                          {renderArrivalPill(
                            service.nextBus2?.estimatedArrivalMinutes,
                            service.nextBus2?.load,
                            service.nextBus2?.type
                          )}
                        </div>

                        <div className="w-px h-8 bg-slate-200 my-auto"></div>

                        <div className="text-center">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            3rd Bus
                          </div>
                          {renderArrivalPill(
                            service.nextBus3?.estimatedArrivalMinutes,
                            service.nextBus3?.load,
                            service.nextBus3?.type
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            Select a bus stop on the left or map to view live arrival timings.
          </div>
        )}
      </div>
    </div>
  );
};
