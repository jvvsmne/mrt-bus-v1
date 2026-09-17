import { BusArrivalInfo, BusStop } from '../types';

export const BUS_STOPS: BusStop[] = [
  {
    id: '04111',
    name: 'Dhoby Ghaut Stn Exit B',
    road: 'Orchard Rd',
    region: 'Central',
    lat: 1.2995,
    lng: 103.8458,
    services: ['7', '14', '16', '36', '65', '106', '111', '124', '174', '190', '857'],
  },
  {
    id: '03211',
    name: 'Somerset Stn Exit A',
    road: 'Orchard Rd',
    region: 'Central',
    lat: 1.3009,
    lng: 103.8398,
    services: ['7', '14', '16', '65', '106', '111', '123', '143', '175', '502'],
  },
  {
    id: '09048',
    name: 'Orchard Stn / Lucky Plaza',
    road: 'Orchard Rd',
    region: 'Central',
    lat: 1.3045,
    lng: 103.8335,
    services: ['14', '65', '106', '111', '123', '143', '175', '190', '502', '960'],
  },
  {
    id: '04168',
    name: 'City Hall Stn Exit B',
    road: 'North Bridge Rd',
    region: 'Central',
    lat: 1.2936,
    lng: 103.8519,
    services: ['61', '124', '145', '166', '174', '197', '851', '961'],
  },
  {
    id: '03019',
    name: 'Raffles Place Stn Exit F',
    road: 'Collyer Quay',
    region: 'Central',
    lat: 1.2842,
    lng: 103.8524,
    services: ['10', '57', '70', '100', '107', '130', '131', '167', '196'],
  },
  {
    id: '01112',
    name: 'Bugis Stn Exit D',
    road: 'Victoria St',
    region: 'Central',
    lat: 1.3008,
    lng: 103.8558,
    services: ['2', '12', '33', '130', '133', '851', '960', '980'],
  },
  {
    id: '05049',
    name: 'Chinatown Stn Exit E',
    road: 'Eu Tong Sen St',
    region: 'Central',
    lat: 1.2852,
    lng: 103.8443,
    services: ['2', '12', '33', '54', '61', '143', '147', '190', '851', '970'],
  },
  {
    id: '14141',
    name: 'HarbourFront Stn / Vivocity',
    road: 'Telok Blangah Rd',
    region: 'Central',
    lat: 1.2655,
    lng: 103.8228,
    services: ['10', '30', '57', '61', '97', '100', '131', '143', '166', '188'],
  },
  {
    id: '28009',
    name: 'Jurong East Bus Interchange',
    road: 'Jurong Gateway Rd',
    region: 'West',
    lat: 1.3338,
    lng: 103.7426,
    services: ['51', '52', '66', '78', '79', '97', '98', '105', '143', '183', '333', '334', '335'],
  },
  {
    id: '17171',
    name: 'Clementi Stn Exit A',
    road: 'Commonwealth Ave West',
    region: 'West',
    lat: 1.3155,
    lng: 103.7656,
    services: ['52', '96', '99', '147', '156', '165', '166', '175', '196', '285'],
  },
  {
    id: '43009',
    name: 'Woodlands Temp Interchange',
    road: 'Woodlands Sq',
    region: 'North',
    lat: 1.4372,
    lng: 103.7868,
    services: ['161', '168', '178', '187', '856', '900', '901', '903', '911', '912', '913', '960', '961', '969'],
  },
  {
    id: '53009',
    name: 'Bishan Bus Interchange',
    road: 'Bishan St 13',
    region: 'Central',
    lat: 1.3505,
    lng: 103.8492,
    services: ['50', '52', '53', '54', '55', '56', '57', '58', '59', '410G', '410W'],
  },
  {
    id: '54009',
    name: 'Ang Mo Kio Bus Interchange',
    road: 'Ang Mo Kio Ave 8',
    region: 'North-East',
    lat: 1.3695,
    lng: 103.8490,
    services: ['22', '24', '25', '73', '86', '130', '133', '135', '136', '138', '166', '261', '269'],
  },
  {
    id: '66009',
    name: 'Serangoon Bus Interchange',
    road: 'Serangoon Ave 2',
    region: 'North-East',
    lat: 1.3499,
    lng: 103.8732,
    services: ['100', '101', '103', '105', '109', '158', '315', '317'],
  },
  {
    id: '75009',
    name: 'Tampines Concourse Interchange',
    road: 'Tampines Concourse',
    region: 'East',
    lat: 1.3540,
    lng: 103.9458,
    services: ['8', '10', '18', '19', '28', '29', '37', '38', '65', '67', '72', '81', '291', '292', '293'],
  },
  {
    id: '84009',
    name: 'Bedok Bus Interchange',
    road: 'Bedok North Dr',
    region: 'East',
    lat: 1.3242,
    lng: 103.9298,
    services: ['7', '9', '14', '16', '17', '18', '25', '26', '30', '32', '33', '35', '40', '60', '66', '69'],
  },
  {
    id: '67009',
    name: 'Sengkang Community Hub',
    road: 'Compassvale Rd',
    region: 'North-East',
    lat: 1.3920,
    lng: 103.8962,
    services: ['80', '83', '85', '86', '87', '156', '159', '163', '371', '372'],
  },
  {
    id: '65009',
    name: 'Punggol Temp Interchange',
    road: 'Punggol Pl',
    region: 'North-East',
    lat: 1.4048,
    lng: 103.9025,
    services: ['3', '34', '43', '62', '82', '83', '84', '85', '118', '136', '381', '382G'],
  },
  {
    id: '03509',
    name: 'Marina Bay Sands Hotel',
    road: 'Bayfront Ave',
    region: 'Central',
    lat: 1.2831,
    lng: 103.8598,
    services: ['97', '106', '133', '502', '518'],
  },
];

// Map bus number to default primary operator & destination in Singapore
export const BUS_METADATA: Record<string, { operator: 'SBS Transit' | 'SMRT' | 'Tower Transit' | 'Go-Ahead'; destination: string }> = {
  '2': { operator: 'SBS Transit', destination: 'Changi Village / Kampong Bahru' },
  '7': { operator: 'SBS Transit', destination: 'Bedok / Clementi' },
  '8': { operator: 'SBS Transit', destination: 'Toa Payoh / Tampines' },
  '10': { operator: 'SBS Transit', destination: 'Tampines / Kent Ridge' },
  '12': { operator: 'Go-Ahead', destination: 'Pasir Ris / Kampong Bahru' },
  '14': { operator: 'SBS Transit', destination: 'Bedok / Clementi' },
  '16': { operator: 'SBS Transit', destination: 'Bedok / Bukit Merah' },
  '30': { operator: 'SBS Transit', destination: 'Bedok / Boon Lay' },
  '36': { operator: 'Go-Ahead', destination: 'Changi Airport Loop' },
  '51': { operator: 'SBS Transit', destination: 'Hougang / Jurong East' },
  '52': { operator: 'SBS Transit', destination: 'Bishan / Jurong East' },
  '61': { operator: 'SMRT', destination: 'Bukit Batok / Eunos' },
  '65': { operator: 'SBS Transit', destination: 'Tampines / HarbourFront' },
  '66': { operator: 'Tower Transit', destination: 'Bedok / Jurong East' },
  '67': { operator: 'SMRT', destination: 'Choa Chu Kang / Tampines' },
  '70': { operator: 'SBS Transit', destination: 'Yio Chu Kang / Shenton Way' },
  '80': { operator: 'SBS Transit', destination: 'Sengkang / HarbourFront' },
  '97': { operator: 'Tower Transit', destination: 'Jurong East / Marina Centre' },
  '100': { operator: 'SBS Transit', destination: 'Serangoon / Ghim Moh' },
  '106': { operator: 'Tower Transit', destination: 'Bukit Batok / Shenton Way' },
  '111': { operator: 'SBS Transit', destination: 'Ghim Moh / Marina Centre' },
  '123': { operator: 'SBS Transit', destination: 'Bukit Merah / Sentosa Beach' },
  '124': { operator: 'SBS Transit', destination: 'St. Michael\'s / HarbourFront' },
  '130': { operator: 'SBS Transit', destination: 'Ang Mo Kio / Shenton Way' },
  '131': { operator: 'SBS Transit', destination: 'St. Michael\'s / Bukit Merah' },
  '133': { operator: 'SBS Transit', destination: 'Ang Mo Kio / Shenton Way' },
  '143': { operator: 'Tower Transit', destination: 'Toa Payoh / Jurong East' },
  '147': { operator: 'SBS Transit', destination: 'Hougang / Clementi' },
  '166': { operator: 'SBS Transit', destination: 'Ang Mo Kio / Clementi' },
  '167': { operator: 'Tower Transit', destination: 'Sembawang / Bukit Merah' },
  '174': { operator: 'SBS Transit', destination: 'Boon Lay / New Bridge Rd' },
  '175': { operator: 'SBS Transit', destination: 'Clementi / Geylang Lor 1' },
  '188': { operator: 'SMRT', destination: 'Choa Chu Kang / HarbourFront' },
  '190': { operator: 'SMRT', destination: 'Choa Chu Kang / Kampong Bahru' },
  '196': { operator: 'SBS Transit', destination: 'Bedok / Clementi' },
  '197': { operator: 'SBS Transit', destination: 'Bedok / Jurong East' },
  '502': { operator: 'SBS Transit', destination: 'Pioneer Rd North / Marina Centre' },
  '851': { operator: 'SMRT', destination: 'Yishun / Bukit Merah' },
  '856': { operator: 'SMRT', destination: 'Yishun / Woodlands' },
  '857': { operator: 'SMRT', destination: 'Yishun / Suntec City' },
  '960': { operator: 'SMRT', destination: 'Woodlands / Marina Centre' },
  '961': { operator: 'SMRT', destination: 'Woodlands / Lor 1 Geylang' },
  '970': { operator: 'SMRT', destination: 'Bukit Panjang / Shenton Way' },
  '980': { operator: 'SMRT', destination: 'Sembawang / Lor 1 Geylang' },
};

// Generates dynamic realistic arrivals for any given bus stop
export function getArrivalsForBusStop(busStopId: string, baseSeed: number = 0): BusArrivalInfo[] {
  const stop = BUS_STOPS.find(s => s.id === busStopId);
  if (!stop) return [];

  return stop.services.map((busNo, index) => {
    const meta = BUS_METADATA[busNo] || {
      operator: index % 2 === 0 ? 'SBS Transit' : 'SMRT',
      destination: 'Loop / City Centre',
    };

    // Deterministic pseudo-random variation based on stopId, busNo, and baseSeed
    const hash = (busStopId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) +
                  busNo.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) +
                  baseSeed) % 100;

    const wait1 = hash % 8; // 0 to 7 mins
    const wait2 = wait1 + 6 + (hash % 7); // wait1 + 6 to 12 mins
    const wait3 = wait2 + 7 + ((hash * 3) % 9); // wait2 + 7 to 15 mins

    const load1 = hash < 45 ? 'SEA' : hash < 85 ? 'SDA' : 'LSD';
    const load2 = (hash + 30) % 100 < 50 ? 'SEA' : (hash + 30) % 100 < 85 ? 'SDA' : 'LSD';
    const load3 = 'SEA';

    const type1 = ['65', '143', '14', '7', '190', '960', '857'].includes(busNo) ? 'DD' : 'SD';
    const type2 = hash % 3 === 0 ? 'DD' : 'SD';

    return {
      busNumber: busNo,
      operator: meta.operator,
      destination: meta.destination,
      nextBus: {
        estimatedArrivalMinutes: wait1,
        load: load1,
        type: type1,
        feature: 'WAB',
      },
      nextBus2: {
        estimatedArrivalMinutes: wait2,
        load: load2,
        type: type2,
        feature: 'WAB',
      },
      nextBus3: {
        estimatedArrivalMinutes: wait3,
        load: load3,
        type: 'SD',
        feature: 'WAB',
      },
    };
  });
}
