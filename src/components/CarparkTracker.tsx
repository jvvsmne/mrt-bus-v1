import React, { useState, useMemo } from 'react';
import { Search, ParkingSquare, MapPin, DollarSign, Clock, ArrowUpDown, Filter, Car, AlertCircle } from 'lucide-react';
import { CarparkInfo, CarparkType, SingaporeRegion } from '../types';
import { getCarparkOccupancyStatus } from '../data/carparkData';

interface CarparkTrackerProps {
  carparks: CarparkInfo[];
  selectedRegion: SingaporeRegion;
  selectedCarpark: CarparkInfo | null;
  onSelectCarpark: (carpark: CarparkInfo) => void;
  onViewOnMap?: (carpark: CarparkInfo) => void;
}

export const CarparkTracker: React.FC<CarparkTrackerProps> = ({
  carparks,
  selectedRegion,
  selectedCarpark,
  onSelectCarpark,
  onViewOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'available' | 'occupancy' | 'name'>('available');

  const filteredCarparks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return carparks
      .filter(cp => {
        // Region filter
        if (selectedRegion !== 'All' && cp.region !== selectedRegion) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && cp.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (q) {
          return (
            cp.name.toLowerCase().includes(q) ||
            cp.address.toLowerCase().includes(q) ||
            cp.id.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'available') {
          return b.availableLots - a.availableLots;
        }
        if (sortBy === 'occupancy') {
          const ratioA = (a.totalLots - a.availableLots) / a.totalLots;
          const ratioB = (b.totalLots - b.availableLots) / b.totalLots;
          return ratioB - ratioA;
        }
        return a.name.localeCompare(b.name);
      });
  }, [carparks, selectedRegion, selectedCategory, searchQuery, sortBy]);

  // Aggregate stats for filtered carparks
  const totalAvailable = useMemo(() => {
    return filteredCarparks.reduce((acc, c) => acc + c.availableLots, 0);
  }, [filteredCarparks]);

  const totalCapacity = useMemo(() => {
    return filteredCarparks.reduce((acc, c) => acc + c.totalLots, 0);
  }, [filteredCarparks]);

  const overallOccupancy = totalCapacity > 0
    ? Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Available Parking Lots</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {totalAvailable.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Across {filteredCarparks.length} monitored facilities
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Average Occupancy Rate</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {overallOccupancy}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallOccupancy > 85 ? 'bg-rose-500' : overallOccupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${overallOccupancy}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Real-Time Data Feed</div>
          <div className="flex items-center gap-1.5 mt-1.5 text-sm font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>URA & HDB Smart Carpark Live</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Auto updates every 30 seconds</div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-carpark-search"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search carparks by mall, street, or HDB estate..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['All', 'Shopping Mall', 'HDB', 'URA', 'Airport'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer"
            >
              <option value="available">Most Lots Available</option>
              <option value="occupancy">Highest Occupancy %</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Carparks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCarparks.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            No carparks found matching your filters.
          </div>
        ) : (
          filteredCarparks.map(carpark => {
            const occ = getCarparkOccupancyStatus(carpark.availableLots, carpark.totalLots);
            const isSelected = selectedCarpark?.id === carpark.id;

            return (
              <div
                key={carpark.id}
                id={`carpark-card-${carpark.id}`}
                onClick={() => onSelectCarpark(carpark)}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar: Category & Occupancy Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {carpark.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${occ.badgeClass}`}
                    >
                      {occ.status} ({occ.percentage}% Full)
                    </span>
                  </div>

                  {/* Name & Address */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {carpark.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>{carpark.address}</span>
                  </p>

                  {/* Lots Counter & Progress Bar */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div>
                        <span className="text-2xl font-black font-mono text-slate-900">
                          {carpark.availableLots}
                        </span>
                        <span className="text-xs text-slate-500 font-medium ml-1">
                          / {carpark.totalLots} lots
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        {carpark.vehicleType}s
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occ.status === 'Full'
                            ? 'bg-rose-500'
                            : occ.status === 'Almost Full'
                            ? 'bg-amber-500'
                            : occ.status === 'Filling Fast'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occ.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Rate Summary */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{carpark.rateSummary}</span>
                  </div>
                </div>

                {/* Footer Action & Timestamp */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {carpark.lastUpdated}</span>
                  </span>

                  {onViewOnMap && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onViewOnMap(carpark);
                      }}
                      className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>View Map</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
