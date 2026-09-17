import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusStop, MRTStation, SingaporeRegion } from '../types';
import { MRT_LINES } from '../data/mrtData';

interface InteractiveMapProps {
  busStops: BusStop[];
  mrtStations: MRTStation[];
  selectedRegion: SingaporeRegion;
  selectedBusStopId: string | null;
  selectedStationCode: string | null;
  onSelectBusStop: (stop: BusStop) => void;
  onSelectStation: (station: MRTStation) => void;
  activeLayer: 'all' | 'bus' | 'mrt';
  onChangeActiveLayer: (layer: 'all' | 'bus' | 'mrt') => void;
}

const REGION_COORDINATES: Record<SingaporeRegion, [number, number, number]> = {
  All: [1.3521, 103.8198, 12], // lat, lng, zoom
  Central: [1.2980, 103.8450, 14],
  East: [1.3450, 103.9500, 13],
  North: [1.4300, 103.8000, 13],
  'North-East': [1.3700, 103.8800, 13],
  West: [1.3350, 103.7450, 13],
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  busStops,
  mrtStations,
  selectedRegion,
  selectedBusStopId,
  selectedStationCode,
  onSelectBusStop,
  onSelectStation,
  activeLayer,
  onChangeActiveLayer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap standard tiles with carto positron styling or standard OSM
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update view when region changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const [lat, lng, zoom] = REGION_COORDINATES[selectedRegion] || REGION_COORDINATES.All;
    mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1 });
  }, [selectedRegion]);

  // Center on selected item
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (selectedBusStopId) {
      const stop = busStops.find(s => s.id === selectedBusStopId);
      if (stop) mapInstanceRef.current.flyTo([stop.lat, stop.lng], 16, { duration: 0.8 });
    } else if (selectedStationCode) {
      const stn = mrtStations.find(s => s.code === selectedStationCode);
      if (stn) mapInstanceRef.current.flyTo([stn.lat, stn.lng], 16, { duration: 0.8 });
    }
  }, [selectedBusStopId, selectedStationCode, busStops, mrtStations]);

  // Render markers according to active layer and filters
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. MRT & LRT Stations Markers
    if (activeLayer === 'all' || activeLayer === 'mrt') {
      mrtStations.forEach(station => {
        const isSelected = selectedStationCode === station.code;
        const primaryLine = station.lines[0] || 'NSL';
        const lineInfo = MRT_LINES[primaryLine];
        const lineColor = lineInfo?.color || '#d42e12';
        const isLRT = station.isLRT || lineInfo?.type === 'LRT';
        const badgeLabel = station.lines.length > 1 ? 'INT' : isLRT ? 'LRT' : lineInfo?.code || 'MRT';

        const html = `
          <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            <div class="w-8 h-8 rounded-full shadow-md flex items-center justify-center font-bold text-[9px] text-white border-2 border-white"
                 style="background-color: ${lineColor};">
              ${badgeLabel}
            </div>
            ${
              isSelected
                ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></div>`
                : ''
            }
          </div>
        `;

        const icon = L.divIcon({
          html,
          className: 'custom-mrt-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([station.lat, station.lng], { icon });
        marker.on('click', () => onSelectStation(station));
        marker.bindTooltip(
          `<strong>${station.name} (${station.code})</strong><br><span style="color:#64748b; font-size:11px;">${isLRT ? 'LRT Feeder Line' : 'MRT Main Line'} &bull; ${station.lines.join(', ')}</span>`,
          { direction: 'top', offset: [0, -16] }
        );
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Bus Stops Markers
    if (activeLayer === 'all' || activeLayer === 'bus') {
      busStops.forEach(stop => {
        const isSelected = selectedBusStopId === stop.id;

        const html = `
          <div class="flex items-center justify-center cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            <div class="w-7 h-7 rounded-full bg-slate-800 text-amber-400 border-2 border-white shadow flex items-center justify-center text-[10px] font-bold">
              🚌
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html,
          className: 'custom-bus-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon });
        marker.on('click', () => onSelectBusStop(stop));
        marker.bindTooltip(
          `<strong>${stop.name} (${stop.id})</strong><br><span style="color:#64748b; font-size:11px;">${stop.services.length} services</span>`,
          { direction: 'top', offset: [0, -14] }
        );
        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [
    activeLayer,
    busStops,
    mrtStations,
    selectedBusStopId,
    selectedStationCode,
    onSelectBusStop,
    onSelectStation,
  ]);

  return (
    <div id="sg-transport-map-container" className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />

      {/* Layer Switcher Pill Floating on Map */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-1 text-xs font-semibold text-slate-700">
        <button
          id="btn-layer-all"
          onClick={() => onChangeActiveLayer('all')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            activeLayer === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          All Layers
        </button>
        <button
          id="btn-layer-bus"
          onClick={() => onChangeActiveLayer('bus')}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeLayer === 'bus'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <span>🚌</span> Buses
        </button>
        <button
          id="btn-layer-mrt"
          onClick={() => onChangeActiveLayer('mrt')}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeLayer === 'mrt'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <span>🚇</span> MRT & LRT
        </button>
      </div>

      {/* Map Legend Floating */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl text-[11px] text-slate-600 border border-slate-200 shadow-sm flex items-center gap-4 hidden sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Bus Stops</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
          <span>MRT Stations</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
          <span>LRT Feeders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-white inline-block"></span>
          <span>Active Selection</span>
        </div>
      </div>
    </div>
  );
};
