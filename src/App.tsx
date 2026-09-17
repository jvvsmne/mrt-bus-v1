import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BusTracker } from './components/BusTracker';
import { MrtPlanner } from './components/MrtPlanner';
import { InteractiveMap } from './components/InteractiveMap';
import { QuickStatsBar } from './components/QuickStatsBar';
import { LiveServerlessPanels } from './components/LiveServerlessPanels';
import { TalkToUs } from './components/TalkToUs';
import { BUS_STOPS } from './data/busData';
import { MRT_STATIONS } from './data/mrtData';
import { BusStop, MRTStation, SingaporeRegion, TransportMode } from './types';
import { Map } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TransportMode>('all');
  const [selectedRegion, setSelectedRegion] = useState<SingaporeRegion>('All');

  const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null);
  const [selectedStation, setSelectedStation] = useState<MRTStation | null>(null);

  const [activeMapLayer, setActiveMapLayer] = useState<'all' | 'bus' | 'mrt'>('all');
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
  };

  const handleSelectStation = (station: MRTStation) => {
    setSelectedStation(station);
    setSelectedBusStop(null);
  };

  const handleClearSelection = () => {
    setSelectedBusStop(null);
    setSelectedStation(null);
  };

  // Switch tab and set active map layer accordingly
  const handleTabChange = (tab: TransportMode) => {
    setActiveTab(tab);
    if (tab === 'bus') setActiveMapLayer('bus');
    else if (tab === 'mrt') setActiveMapLayer('mrt');
    else setActiveMapLayer('all');
  };

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
              onQuickNavigate={handleTabChange}
              selectedBusStop={selectedBusStop}
              selectedStation={selectedStation}
              onClearSelection={handleClearSelection}
            />

            {/* Main Interactive Map Section */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Interactive Singapore Transit Map (MRT, LRT & Bus Network)
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Click any station or stop to inspect live arrival timings & transfers
                </span>
              </div>

              <div className="h-[460px] w-full">
                <InteractiveMap
                  busStops={BUS_STOPS}
                  mrtStations={MRT_STATIONS}
                  selectedRegion={selectedRegion}
                  selectedBusStopId={selectedBusStop?.id || null}
                  selectedStationCode={selectedStation?.code || null}
                  onSelectBusStop={handleSelectBusStop}
                  onSelectStation={handleSelectStation}
                  activeLayer={activeMapLayer}
                  onChangeActiveLayer={setActiveMapLayer}
                />
              </div>
            </div>

            {/* Real-time Serverless Live Feeds (MRT/LRT GTFS & Bus Stop Outside) */}
            <LiveServerlessPanels />
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
                  selectedRegion={selectedRegion}
                  selectedBusStopId={selectedBusStop?.id || null}
                  selectedStationCode={selectedStation?.code || null}
                  onSelectBusStop={handleSelectBusStop}
                  onSelectStation={handleSelectStation}
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
                  GTFS real-time feeds, live platform countdowns, line disruptions & route calculation
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
                  selectedRegion={selectedRegion}
                  selectedBusStopId={selectedBusStop?.id || null}
                  selectedStationCode={selectedStation?.code || null}
                  onSelectBusStop={handleSelectBusStop}
                  onSelectStation={handleSelectStation}
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

        {/* Tab: Talk to Us (Disqus Discussion) */}
        {activeTab === 'talk' && <TalkToUs />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <span>SG Transport & Parking Hub</span>
              <span>•</span>
              <span className="font-normal text-slate-600">Singapore Public Transport & Rail Telemetry</span>
            </div>
            <div className="text-[11px] text-slate-500">
              SMRT / SBS Transit / Tower Transit / Go-Ahead / LTA DataMall
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center sm:text-left leading-relaxed">
            Contains information from LTA DataMall and data.gov.sg, accessed 17 September 2026, made available under the terms of the Singapore Open Data Licence version 1.0.
          </div>
        </div>
      </footer>
    </div>
  );
}
