export type TransportMode = 'all' | 'bus' | 'mrt' | 'carpark';

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

export type MRTLineId = 'NSL' | 'EWL' | 'NEL' | 'CCL' | 'DTL' | 'TEL';

export interface MRTLineInfo {
  id: MRTLineId;
  name: string;
  code: string;
  color: string;
  bgColor: string;
  textColor: string;
  status: 'Normal Service' | 'Minor Delay' | 'Heavy Congestion' | 'Track Maintenance';
  statusDetails?: string;
}

export interface MRTStation {
  code: string; // e.g. 'NS24/NE6/CC1'
  name: string; // e.g. 'Dhoby Ghaut'
  lines: MRTLineId[];
  lat: number;
  lng: number;
  region: SingaporeRegion;
  isInterchange: boolean;
  crowdLevel?: 'Low' | 'Moderate' | 'High';
  platformArrivals?: {
    platform: string;
    destination: string;
    line: MRTLineId;
    nextTrainMinutes: number;
    subsequentTrainMinutes: number;
  }[];
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

export type CarparkType = 'HDB' | 'URA' | 'Shopping Mall' | 'Airport' | 'Commercial';
export type CarparkOccupancyStatus = 'Available' | 'Filling Fast' | 'Almost Full' | 'Full';

export interface CarparkInfo {
  id: string; // e.g. 'ACB', 'HDB-TP1'
  name: string;
  address: string;
  category: CarparkType;
  region: SingaporeRegion;
  availableLots: number;
  totalLots: number;
  vehicleType: 'Car' | 'Motorcycle' | 'Heavy Vehicle';
  rateSummary: string;
  lat: number;
  lng: number;
  lastUpdated: string;
}
