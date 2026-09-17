import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BusTracker } from './components/BusTracker';
import { MrtPlanner } from './components/MrtPlanner';
import { CarparkTracker } from './components/CarparkTracker';
import { InteractiveMap } from './components/InteractiveMap';
import { QuickStatsBar } from './components/QuickStatsBar';
import { BUS_STOPS } from './data/busData';
import { MRT_STATIONS } from './data/mrtData';
import { CARPARKS_DATA } from './data/carparkData';
import { BusStop, CarparkInfo, MRTStation, SingaporeRegion, TransportMode } from './types';
import { Map, Layers, RefreshCw, Info, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TransportMode>('all');
  const [selectedRegion, setSelectedRegion] = useState<SingaporeRegion>('All');

  const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null);
  const [selectedStation, setSelectedStation] = useState<MRTStation | null>(null);
  const [selectedCarpark, setSelectedCarpark] = useState<CarparkInfo | null>(null);

  const [activeMapLayer, setActiveMapLayer] = useState<'all' | 'bus' | 'mrt' | 'carpark'>('all');
  const [refreshSeed, setRefreshSeed] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [showMapInTabs, setShowMapInTabs] = useState<boolean>(true);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshSeed(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, []);

  // Auto-refresh interval every 15 seconds
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      setRefreshSeed(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  // Selection handlers
  const handleSelectBusStop = (stop: BusStop) => {
    setSelectedBusStop(stop);
    setSelectedStation(null);
    setSelectedCarpark(null);
  };

  const handleSelectStation = (station: MRTStation) => {
    setSelectedStation(station);
    setSelectedBusStop(null);
    setSelectedCarpark(null);
  };

  const handleSelectCarpark = (carpark: CarparkInfo) => {
    setSelectedCarpark(carpark);
    setSelectedBusStop(null);
    setSelectedStation(null);
  };

  const handleClearSelection = () => {
    setSelectedBusStop(null);
    setSelectedStation(null);
    setSelectedCarpark(null);
  };

  // Switch tab and set active map layer accordingly
  const handleTabChange = (tab: TransportMode) => {
    setActiveTab(tab);
    if (tab === 'bus') setActiveMapLayer('bus');
    else if (tab === 'mrt') setActiveMapLayer('mrt');
    else if (tab === 'carpark') setActiveMapLayer('carpark');
    else setActiveMapLayer('all');
  };

  const totalLotsAvailable = CARPARKS_DATA.reduce((acc, c) => acc + c.availableLots, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={() => setAutoRefreshEnabled(prev => !prev)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* If Overview Tab: Show Quick Stats, Interactive Map, and Previews */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            <QuickStatsBar
              totalBusesMonitored={48}
              totalBusStops={BUS_STOPS.length}
              totalCarparks={CARPARKS_DATA.length}
              totalLotsAvailable={totalLotsAvailable}
              onQuickNavigate={handleTabChange}
              selectedBusStop={selectedBusStop}
              selectedStation={selectedStation}
              selectedCarpark={selectedCarpark}
              onClearSelection={handleClearSelection}
            />

            {/* Main Interactive Map Section */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Interactive Singapore Transit & Carpark Map
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Click any marker to inspect timings & vacancies
                </span>
              </div>

              <div className="h-[460px] w-full">
                <InteractiveMap
                  busStops={BUS_STOPS}
                  mrtStations={MRT_STATIONS}
                  carparks={CARPARKS_DATA}
                  selectedRegion={selectedRegion}
                  selectedBusStopId={selectedBusStop?.id || null}
                  selectedStationCode={selectedStation?.code || null}
                  selectedCarparkId={selectedCarpark?.id || null}
                  onSelectBusStop={handleSelectBusStop}
                  onSelectStation={handleSelectStation}
                  onSelectCarpark={handleSelectCarpark}
                  activeLayer={activeMapLayer}
                  onChangeActiveLayer={setActiveMapLayer}
                />
              </div>
            </div>

            {/* Quick-Glance Two-Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Quick Bus Arrivals at central hub */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Live Bus Timing Snapshot (Dhoby Ghaut / Orchard)
                  </h3>
                  <button
                    onClick={() => handleTabChange('bus')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    View All Stops →
                  </button>
                </div>
                <BusTracker
                  busStops={BUS_STOPS.slice(0, 4)}
                  selectedRegion={selectedRegion}
                  selectedBusStop={selectedBusStop || BUS_STOPS[0]}
                  onSelectBusStop={handleSelectBusStop}
                  refreshSeed={refreshSeed}
                />
              </div>

              {/* Right: Real-Time Carpark Highlights */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Carparks Vacancy Status (Orchard, CBD & Malls)
                  </h3>
                  <button
                    onClick={() => handleTabChange('carpark')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    View All Carparks →
                  </button>
                </div>
                <CarparkTracker
                  carparks={CARPARKS_DATA.slice(0, 6)}
                  selectedRegion={selectedRegion}
                  selectedCarpark={selectedCarpark}
                  onSelectCarpark={handleSelectCarpark}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Bus Waiting Times */}
        {activeTab === 'bus' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Singapore Bus Waiting Times
                </h2>
                <p className="text-xs text-slate-500">
                  Live arrival countdowns for SBS Transit, SMRT, Tower Transit & Go-Ahead Singapore
                </p>
              </div>

              <button
                onClick={() => setShowMapInTabs(prev => !prev)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Map className="w-3.5 h-3.5 text-amber-500" />
                <span>{showMapInTabs ? 'Hide Map' : 'Show Map'}</span>
              </button>
            </div>

            {showMapInTabs && (
              <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                <InteractiveMap
                  busStops={BUS_STOPS}
                  mrtStations={MRT_STATIONS}
                  carparks={CARPARKS_DATA}
                  selectedRegion={selectedRegion}
                  selectedBusStopId={selectedBusStop?.id || null}
                  selectedStationCode={selectedStation?.code || null}
                  selectedCarparkId={selectedCarpark?.id || null}
                  onSelectBusStop={handleSelectBusStop}
                  onSelectStation={handleSelectStation}
                  onSelectCarpark={handleSelectCarpark}
                  activeLayer="bus"
                  onChangeActiveLayer={setActiveMapLayer}
                />
              </div>
            )}

            <BusTracker
              busStops={BUS_STOPS}
              selectedRegion={selectedRegion}
              selectedBusStop={selectedBusStop}
              onSelectBusStop={handleSelectBusStop}
              onViewOnMap={stop => {
                setShowMapInTabs(true);
                handleSelectBusStop(stop);
              }}
              refreshSeed={refreshSeed}
            />
          </div>
        )}

        {/* Tab: MRT Live Tracking & Travel Time */}
        {activeTab === 'mrt' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  MRT Live Tracking & Travel Time Calculator
                </h2>
                <p className="text-xs text-slate-500">
                  Dynamic routing with real-life traffic factors, dwell delays, and interchange transfers
                </p>
              </div>

              <button
                onClick={() => setShowMapInTabs(prev => !prev)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Map className="w-3.5 h-3.5 text-rose-600" />
                <span>{showMapInTabs ? 'Hide Map' : 'Show Map'}</span>
              </button>
            </div>

            {showMapInTabs && (
              <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                <InteractiveMap
                  busStops={BUS_STOPS}
                  mrtStations={MRT_STATIONS}
                  carparks={CARPARKS_DATA}
                  selectedRegion={selectedRegion}
                  selectedBusStopId={selectedBusStop?.id || null}
                  selectedStationCode={selectedStation?.code || null}
                  selectedCarparkId={selectedCarpark?.id || null}
                  onSelectBusStop={handleSelectBusStop}
                  onSelectStation={handleSelectStation}
                  onSelectCarpark={handleSelectCarpark}
                  activeLayer="mrt"
                  onChangeActiveLayer={setActiveMapLayer}
                />
              </div>
            )}

            <MrtPlanner
              selectedStation={selectedStation}
              onSelectStation={handleSelectStation}
              onViewOnMap={stn => {
                setShowMapInTabs(true);
                handleSelectStation(stn);
              }}
            />
          </div>
        )}

        {/* Tab: Parking Lots Occupancy */}
        {activeTab === 'carpark' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Singapore Carpark Occupancy Updates
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time lot availability across HDB estates, URA bays, shopping malls & Changi Airport
                </p>
              </div>

              <button
                onClick={() => setShowMapInTabs(prev => !prev)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Map className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showMapInTabs ? 'Hide Map' : 'Show Map'}</span>
              </button>
            </div>

            {showMapInTabs && (
              <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                <InteractiveMap
                  busStops={BUS_STOPS}
                  mrtStations={MRT_STATIONS}
                  carparks={CARPARKS_DATA}
                  selectedRegion={selectedRegion}
                  selectedBusStopId={selectedBusStop?.id || null}
                  selectedStationCode={selectedStation?.code || null}
                  selectedCarparkId={selectedCarpark?.id || null}
                  onSelectBusStop={handleSelectBusStop}
                  onSelectStation={handleSelectStation}
                  onSelectCarpark={handleSelectCarpark}
                  activeLayer="carpark"
                  onChangeActiveLayer={setActiveMapLayer}
                />
              </div>
            )}

            <CarparkTracker
              carparks={CARPARKS_DATA}
              selectedRegion={selectedRegion}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={handleSelectCarpark}
              onViewOnMap={cp => {
                setShowMapInTabs(true);
                handleSelectCarpark(cp);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SG Transport & Parking Hub</span>
            <span>•</span>
            <span>All public transport & parking data consolidated</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Data format standard: LTA DataMall v2</span>
            <span>•</span>
            <span>SMRT / SBS Transit / Tower Transit / Go-Ahead / URA / HDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
