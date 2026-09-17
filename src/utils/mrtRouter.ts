import { MRT_LINES, MRT_STATIONS } from '../data/mrtData';
import { JourneyResult, JourneyStep, MRTLineId, MRTStation } from '../types';

interface GraphEdge {
  toStationName: string;
  line: MRTLineId;
  durationMinutes: number;
}

// Build adjacency graph of Singapore MRT network
const MRT_GRAPH: Record<string, GraphEdge[]> = {};

function addEdge(u: string, v: string, line: MRTLineId, duration = 2.5) {
  if (!MRT_GRAPH[u]) MRT_GRAPH[u] = [];
  if (!MRT_GRAPH[v]) MRT_GRAPH[v] = [];
  MRT_GRAPH[u].push({ toStationName: v, line, durationMinutes: duration });
  MRT_GRAPH[v].push({ toStationName: u, line, durationMinutes: duration });
}

// Inter-station connections along lines
// NSL
addEdge('Jurong East', 'Choa Chu Kang', 'NSL', 5);
addEdge('Choa Chu Kang', 'Woodlands', 'NSL', 13);
addEdge('Woodlands', 'Ang Mo Kio', 'NSL', 16);
addEdge('Ang Mo Kio', 'Bishan', 'NSL', 4);
addEdge('Bishan', 'Toa Payoh', 'NSL', 4);
addEdge('Toa Payoh', 'Newton', 'NSL', 5);
addEdge('Newton', 'Orchard', 'NSL', 3);
addEdge('Orchard', 'Somerset', 'NSL', 2);
addEdge('Somerset', 'Dhoby Ghaut', 'NSL', 2);
addEdge('Dhoby Ghaut', 'City Hall', 'NSL', 2.5);
addEdge('City Hall', 'Raffles Place', 'NSL', 2);
addEdge('Raffles Place', 'Marina Bay', 'NSL', 2.5);

// EWL
addEdge('Tuas Link', 'Jurong East', 'EWL', 16);
addEdge('Jurong East', 'Clementi', 'EWL', 4);
addEdge('Clementi', 'Buona Vista', 'EWL', 4);
addEdge('Buona Vista', 'Outram Park', 'EWL', 11);
addEdge('Outram Park', 'Raffles Place', 'EWL', 3);
addEdge('Raffles Place', 'City Hall', 'EWL', 2);
addEdge('City Hall', 'Bugis', 'EWL', 2.5);
addEdge('Bugis', 'Paya Lebar', 'EWL', 8);
addEdge('Paya Lebar', 'Bedok', 'EWL', 7);
addEdge('Bedok', 'Tampines', 'EWL', 5);
addEdge('Tampines', 'Changi Airport', 'EWL', 9);

// NEL
addEdge('HarbourFront', 'Outram Park', 'NEL', 4);
addEdge('Outram Park', 'Chinatown', 'NEL', 2);
addEdge('Chinatown', 'Dhoby Ghaut', 'NEL', 4);
addEdge('Dhoby Ghaut', 'Serangoon', 'NEL', 8);
addEdge('Serangoon', 'Sengkang', 'NEL', 8);
addEdge('Sengkang', 'Punggol', 'NEL', 3);

// CCL
addEdge('Dhoby Ghaut', 'Bayfront', 'CCL', 6);
addEdge('Bayfront', 'Marina Bay', 'CCL', 3);
addEdge('Dhoby Ghaut', 'Paya Lebar', 'CCL', 12);
addEdge('Paya Lebar', 'Serangoon', 'CCL', 10);
addEdge('Serangoon', 'Bishan', 'CCL', 4);
addEdge('Bishan', 'Buona Vista', 'CCL', 14);
addEdge('Buona Vista', 'HarbourFront', 'CCL', 12);

// DTL
addEdge('Bukit Panjang', 'Newton', 'DTL', 14);
addEdge('Newton', 'Bugis', 'DTL', 6);
addEdge('Bugis', 'Bayfront', 'DTL', 4);
addEdge('Bayfront', 'Chinatown', 'DTL', 5);
addEdge('Chinatown', 'Tampines', 'DTL', 22);

// TEL
addEdge('Woodlands', 'Orchard', 'TEL', 24);
addEdge('Orchard', 'Outram Park', 'TEL', 6);
addEdge('Outram Park', 'Marina Bay', 'TEL', 5);

// ==========================================
// BUKIT PANJANG LRT (BPLRT)
// ==========================================
addEdge('Choa Chu Kang', 'South View', 'BPLRT', 1.5);
addEdge('South View', 'Keat Hong', 'BPLRT', 1.5);
addEdge('Keat Hong', 'Teck Whye', 'BPLRT', 1.5);
addEdge('Teck Whye', 'Phoenix', 'BPLRT', 1.5);
addEdge('Phoenix', 'Bukit Panjang', 'BPLRT', 1.5);
addEdge('Bukit Panjang', 'Petir', 'BPLRT', 1.5);
addEdge('Petir', 'Pending', 'BPLRT', 1.5);
addEdge('Pending', 'Bangkit', 'BPLRT', 1.5);
addEdge('Bangkit', 'Fajar', 'BPLRT', 1.5);
addEdge('Fajar', 'Segar', 'BPLRT', 1.5);
addEdge('Segar', 'Jelapang', 'BPLRT', 1.5);
addEdge('Jelapang', 'Senja', 'BPLRT', 1.5);
addEdge('Senja', 'Bukit Panjang', 'BPLRT', 1.5);

// ==========================================
// SENGKANG LRT (SKLRT)
// ==========================================
addEdge('Sengkang', 'Compassvale', 'SKLRT', 1.5);
addEdge('Compassvale', 'Rumbia', 'SKLRT', 1.5);
addEdge('Rumbia', 'Bakau', 'SKLRT', 1.5);
addEdge('Bakau', 'Kangkar', 'SKLRT', 1.5);
addEdge('Kangkar', 'Ranggung', 'SKLRT', 1.5);
addEdge('Ranggung', 'Sengkang', 'SKLRT', 1.5);
addEdge('Sengkang', 'Renjong', 'SKLRT', 1.5);
addEdge('Renjong', 'Tongkang', 'SKLRT', 1.5);
addEdge('Tongkang', 'Layar', 'SKLRT', 1.5);
addEdge('Layar', 'Fernvale', 'SKLRT', 1.5);
addEdge('Fernvale', 'Thanggam', 'SKLRT', 1.5);
addEdge('Thanggam', 'Sengkang', 'SKLRT', 2);

// ==========================================
// PUNGGOL LRT (PGLRT)
// ==========================================
addEdge('Punggol', 'Cove', 'PGLRT', 1.5);
addEdge('Cove', 'Meridian', 'PGLRT', 1.5);
addEdge('Meridian', 'Coral Edge', 'PGLRT', 1.5);
addEdge('Coral Edge', 'Riviera', 'PGLRT', 1.5);
addEdge('Riviera', 'Kadaloor', 'PGLRT', 1.5);
addEdge('Kadaloor', 'Oasis', 'PGLRT', 1.5);
addEdge('Oasis', 'Damai', 'PGLRT', 1.5);
addEdge('Damai', 'Punggol', 'PGLRT', 1.5);
addEdge('Punggol', 'Sam Kee', 'PGLRT', 1.5);
addEdge('Sam Kee', 'Punggol Point', 'PGLRT', 1.5);
addEdge('Punggol Point', 'Samudera', 'PGLRT', 1.5);
addEdge('Samudera', 'Nibong', 'PGLRT', 1.5);
addEdge('Nibong', 'Sumang', 'PGLRT', 1.5);
addEdge('Sumang', 'Soo Teck', 'PGLRT', 1.5);
addEdge('Soo Teck', 'Punggol', 'PGLRT', 1.5);

interface RouteNode {
  station: string;
  line: MRTLineId | null;
  totalTime: number;
  transfers: number;
  path: { station: string; line: MRTLineId; duration: number }[];
}

export function calculateMRTRoute(
  fromName: string,
  toName: string,
  applyPeakFactor = true,
  simulateIncidentLine?: MRTLineId
): JourneyResult | null {
  const fromStation = MRT_STATIONS.find(s => s.name === fromName);
  const toStation = MRT_STATIONS.find(s => s.name === toName);

  if (!fromStation || !toStation) return null;

  if (fromName === toName) {
    return {
      fromStation,
      toStation,
      totalDurationMinutes: 0,
      baseDurationMinutes: 0,
      trafficDelayMinutes: 0,
      transfersCount: 0,
      fare: '$0.00',
      steps: [
        {
          type: 'board',
          station: fromStation,
          durationMinutes: 0,
          description: 'You are already at your destination station.',
        },
      ],
    };
  }

  // BFS / Dijkstra for shortest time with transfer penalties
  const queue: RouteNode[] = [
    { station: fromName, line: null, totalTime: 0, transfers: 0, path: [] },
  ];
  const visited = new Map<string, number>();

  let bestRoute: RouteNode | null = null;

  while (queue.length > 0) {
    // Pick smallest time node
    queue.sort((a, b) => a.totalTime - b.totalTime);
    const curr = queue.shift()!;

    const visitKey = `${curr.station}-${curr.line || 'none'}`;
    if (visited.has(visitKey) && visited.get(visitKey)! <= curr.totalTime) {
      continue;
    }
    visited.set(visitKey, curr.totalTime);

    if (curr.station === toName) {
      if (!bestRoute || curr.totalTime < bestRoute.totalTime) {
        bestRoute = curr;
        break; // found optimal
      }
    }

    const neighbors = MRT_GRAPH[curr.station] || [];
    for (const neighbor of neighbors) {
      const isTransfer = curr.line !== null && curr.line !== neighbor.line;
      const transferPenalty = isTransfer ? 4.5 : 0; // 4.5 mins interchange walking
      const transferInc = isTransfer ? 1 : 0;

      let edgeDuration = neighbor.durationMinutes;

      // Real life line status delay
      if (neighbor.line === 'CCL') {
        edgeDuration += 1.5; // active CCL advisory
      }
      if (simulateIncidentLine && neighbor.line === simulateIncidentLine) {
        edgeDuration += 5; // simulated line issue
      }

      queue.push({
        station: neighbor.toStationName,
        line: neighbor.line,
        totalTime: curr.totalTime + edgeDuration + transferPenalty,
        transfers: curr.transfers + transferInc,
        path: [
          ...curr.path,
          { station: neighbor.toStationName, line: neighbor.line, duration: edgeDuration },
        ],
      });
    }
  }

  if (!bestRoute) return null;

  // Build steps
  const steps: JourneyStep[] = [];
  let currentLine: MRTLineId | null = null;
  let legStations: string[] = [];
  let legDuration = 0;
  let prevStationName = fromName;

  for (let i = 0; i < bestRoute.path.length; i++) {
    const p = bestRoute.path[i];
    const isLineChange = currentLine !== null && currentLine !== p.line;

    if (isLineChange && currentLine) {
      // Record completed ride leg
      const interchangeStation = MRT_STATIONS.find(s => s.name === prevStationName)!;
      steps.push({
        type: 'ride',
        station: interchangeStation,
        line: currentLine,
        durationMinutes: Math.round(legDuration),
        description: `Ride ${legStations.length} stop${legStations.length > 1 ? 's' : ''} on ${MRT_LINES[currentLine].name} to ${interchangeStation.name}`,
        stationsCount: legStations.length,
        intermediateStations: [...legStations],
      });

      // Add transfer step
      steps.push({
        type: 'transfer',
        station: interchangeStation,
        line: p.line,
        durationMinutes: 4,
        description: `Transfer to ${MRT_LINES[p.line].name} (${MRT_LINES[p.line].code}) - Follow platform signs (~4 min walk)`,
      });

      legStations = [];
      legDuration = 0;
    }

    if (currentLine === null) {
      // First board
      const startStn = MRT_STATIONS.find(s => s.name === fromName)!;
      const initialArrival = startStn.platformArrivals?.find(a => a.line === p.line);
      const countdownNote = initialArrival
        ? ` (Next train in ${initialArrival.nextTrainMinutes} min${initialArrival.nextTrainMinutes > 1 ? 's' : ''})`
        : '';

      steps.push({
        type: 'board',
        station: startStn,
        line: p.line,
        durationMinutes: 2,
        description: `Board ${MRT_LINES[p.line].name} (${MRT_LINES[p.line].code}) at ${fromName}${countdownNote}`,
      });
    }

    currentLine = p.line;
    legStations.push(p.station);
    legDuration += p.duration;
    prevStationName = p.station;
  }

  // Final leg
  if (currentLine && legStations.length > 0) {
    const finalStn = MRT_STATIONS.find(s => s.name === toName)!;
    steps.push({
      type: 'ride',
      station: finalStn,
      line: currentLine,
      durationMinutes: Math.round(legDuration),
      description: `Ride ${legStations.length} stop${legStations.length > 1 ? 's' : ''} on ${MRT_LINES[currentLine].name} to ${toName}`,
      stationsCount: legStations.length,
      intermediateStations: [...legStations],
    });
  }

  // Alight step
  steps.push({
    type: 'alight',
    station: toStation,
    durationMinutes: 1,
    description: `Alight at ${toName}. Follow signs to exit gantry.`,
  });

  const baseMinutes = Math.round(bestRoute.totalTime);
  let trafficDelay = 0;
  let notice: string | undefined;

  // Real-life peak traffic delay calculation
  if (applyPeakFactor) {
    trafficDelay += 3; // dwell time due to crowd boarding at platforms
  }
  if (bestRoute.path.some(p => p.line === 'CCL')) {
    trafficDelay += 2;
    notice = 'Notice: Circle Line experiencing higher crowd dwell times (+2 mins accounted).';
  }
  if (simulateIncidentLine && bestRoute.path.some(p => p.line === simulateIncidentLine)) {
    trafficDelay += 6;
    notice = `Alert: Track maintenance / speed restriction on ${MRT_LINES[simulateIncidentLine].name} added +6 mins.`;
  }

  const totalMinutes = baseMinutes + trafficDelay;

  // Realistic SimplyGo / EZ-link fare calculation ($1.09 base + $0.09 per station)
  const totalStops = bestRoute.path.length;
  const calculatedFare = Math.min(2.37, 1.09 + totalStops * 0.11);

  return {
    fromStation,
    toStation,
    totalDurationMinutes: totalMinutes,
    baseDurationMinutes: baseMinutes,
    trafficDelayMinutes: trafficDelay,
    transfersCount: bestRoute.transfers,
    fare: `$${calculatedFare.toFixed(2)}`,
    steps,
    realTimeNotice: notice,
  };
}
