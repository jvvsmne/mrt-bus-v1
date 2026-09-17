/**
 * api/bus.js
 * 
 * Fetches real-time bus arrivals for a bus stop from LTA DataMall v3 API.
 * Uses process.env.LTA_ACCOUNT_KEY via AccountKey request header.
 * If key is missing or blank, returns 503 naming LTA_ACCOUNT_KEY and does not call LTA.
 */

import { fetchState } from '../lib/fetchState.js';

function parseMinutes(isoDateString) {
  if (!isoDateString || typeof isoDateString !== 'string') return null;
  const arrivalTime = new Date(isoDateString).getTime();
  if (isNaN(arrivalTime)) return null;
  const diffMs = arrivalTime - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  return Math.max(0, diffMins);
}

export default async function handler(req, res) {
  // Support usability testing simulation query
  const simulate = req.query?.simulate;
  if (simulate === 'empty') {
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    return res.status(200).json({
      state: 'empty',
      busStopCode: req.query?.BusStopCode || req.query?.busStopCode || '04111',
      services: [],
      timestamp: new Date().toISOString(),
    });
  }
  if (simulate === 'refused') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      state: 'refused',
      error: 'Upstream LTA DataMall refused request (Simulated)',
    });
  }
  if (simulate === 'busy') {
    res.setHeader('Retry-After', '10');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({
      state: 'busy',
      error: 'LTA service is busy (Simulated)',
    });
  }
  if (simulate === 'unreachable') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(504).json({
      state: 'unreachable',
      error: 'Could not reach LTA DataMall (Simulated)',
    });
  }

  // Check key before fetch
  const key = process.env.LTA_ACCOUNT_KEY;
  if (!key || key.trim() === '') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({
      state: 'my key not set',
      variable: 'LTA_ACCOUNT_KEY',
      error: 'LTA_ACCOUNT_KEY environment variable is missing or blank.',
    });
  }

  const busStopCode = (req.query?.BusStopCode || req.query?.busStopCode || req.query?.code || '04111').trim();
  const url = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;

  const pick = b => b.Services;
  const result = await fetchState(
    url,
    {
      headers: {
        AccountKey: key.trim(),
      },
    },
    pick
  );

  if (result.state === 'ok') {
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

    const serviceList = result.items || [];
    const formattedServices = serviceList.map(s => {
      const m1 = parseMinutes(s.NextBus?.EstimatedArrival);
      const m2 = parseMinutes(s.NextBus2?.EstimatedArrival);
      const m3 = parseMinutes(s.NextBus3?.EstimatedArrival);
      const minutes = [m1, m2, m3].filter(m => m !== null);

      return {
        serviceNo: s.ServiceNo,
        operator: s.Operator || '',
        nextBusMinutes: m1,
        nextBus2Minutes: m2,
        nextBus3Minutes: m3,
        minutes,
        load: s.NextBus?.Load || 'SEA',
        feature: s.NextBus?.Feature || '',
        type: s.NextBus?.Type || 'SD',
      };
    });

    return res.status(200).json({
      state: 'ok',
      busStopCode,
      services: formattedServices,
      timestamp: new Date().toISOString(),
    });
  }

  if (result.state === 'empty') {
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    return res.status(200).json({
      state: 'empty',
      busStopCode,
      services: [],
      timestamp: new Date().toISOString(),
    });
  }

  if (result.state === 'busy') {
    res.setHeader('Retry-After', '10');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({
      state: 'busy',
      error: 'The bus service is busy. We will try again in 10 seconds.',
    });
  }

  if (result.state === 'refused') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      state: 'refused',
      error: result.error || 'We could not get bus times, so nothing on this panel is current.',
    });
  }

  // unreachable
  res.setHeader('Cache-Control', 'no-store');
  return res.status(504).json({
    state: 'unreachable',
    error: result.error || 'We could not reach LTA, so nothing on this panel has updated.',
  });
}
