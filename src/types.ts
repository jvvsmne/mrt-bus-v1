export type TransportMode = 'all' | 'bus' | 'mrt';

export type SingaporeRegion = 'All' | 'Central' | 'East' | 'North' | 'North-East' | 'West';

export type BusOperator = 'SBS Transit' | 'SMRT' | 'Tower Transit' | 'Go-Ahead';

export type BusLoad = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing
export type BusType = 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy

export interface BusArrivalInfo {
  busNumber: string;
  operator: BusOperator;
  destination: string;
  nextBus: {
    estimatedArrivalMinutes: number; // 0 = Arr, 1 = 1 min, etc.
    load: BusLoad;
    type: BusType;
    feature: 'WAB' | 'Standard'; // Wheelchair accessible
  };
  nextBus2?: {
    estimatedArrivalMinutes: number;
    load: BusLoad;
    type: BusType;
    feature: 'WAB' | 'Standard';
  };
  nextBus3?: {
    estimatedArrivalMinutes: number;
    load: BusLoad;
    type: BusType;
    feature: 'WAB' | 'Standard';
  };
}

export interface BusStop {
  id: string; // 5-digit code e.g. '04111'
  name: string; // e.g. 'Dhoby Ghaut Stn Exit B'
  road: string; // e.g. 'Orchard Rd'
  region: SingaporeRegion;
  lat: number;
  lng: number;
  services: string[]; // ['65', '143', '190', '14']
}

export type MRTLineId =
  | 'NSL'
  | 'EWL'
  | 'NEL'
  | 'CCL'
  | 'DTL'
  | 'TEL'
  | 'BPLRT'
  | 'SKLRT'
  | 'PGLRT';

export type RailType = 'MRT' | 'LRT';

export interface MRTLineInfo {
  id: MRTLineId;
  name: string;
  code: string;
  type: RailType;
  color: string;
  bgColor: string;
  textColor: string;
  operator?: 'SMRT' | 'SBS Transit';
  status: 'Normal Service' | 'Minor Delay' | 'Heavy Congestion' | 'Track Maintenance' | 'Service Advisory' | 'Disruption';
  statusDetails?: string;
  headwayMin?: number;
  headwayMax?: number;
  activeTrains?: number;
  onTimeRate?: number;
}

export interface MRTStation {
  code: string; // e.g. 'NS24/NE6/CC1', 'BP6/DT1', 'STC/NE16'
  name: string; // e.g. 'Dhoby Ghaut', 'Bukit Panjang', 'Sengkang'
  lines: MRTLineId[];
  lat: number;
  lng: number;
  region: SingaporeRegion;
  isInterchange: boolean;
  isLRT?: boolean;
  crowdLevel?: 'Low' | 'Moderate' | 'High';
  firstLastTrain?: {
    weekdayFirst: string;
    weekdayLast: string;
    weekendFirst: string;
    weekendLast: string;
  };
  platformArrivals?: {
    platform: string;
    destination: string;
    line: MRTLineId;
    nextTrainMinutes: number;
    subsequentTrainMinutes: number;
    carriages?: ('Low' | 'Moderate' | 'High')[];
  }[];
}

export interface BusRouteStop {
  stopId: string;
  stopName: string;
  road: string;
  sequence: number;
  currentBuses?: {
    busId: string;
    load: BusLoad;
    type: BusType;
  }[];
}

export interface BusServiceDetail {
  serviceNo: string;
  operator: BusOperator;
  origin: string;
  destination: string;
  frequencyMinutes: string;
  type: 'Trunk' | 'Feeder' | 'Express';
  stops: BusRouteStop[];
}

export interface JourneyStep {
  type: 'board' | 'ride' | 'transfer' | 'alight';
  station: MRTStation;
  line?: MRTLineId;
  durationMinutes: number;
  description: string;
  stationsCount?: number;
  intermediateStations?: string[];
}

export interface JourneyResult {
  fromStation: MRTStation;
  toStation: MRTStation;
  totalDurationMinutes: number;
  baseDurationMinutes: number;
  trafficDelayMinutes: number;
  transfersCount: number;
  fare: string;
  steps: JourneyStep[];
  realTimeNotice?: string;
}
