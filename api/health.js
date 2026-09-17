/**
 * api/health.js
 * 
 * Reports keyConfigured and, for LTA, reachable, status, and ms response latency.
 * NEVER prints the key.
 */

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const key = process.env.LTA_ACCOUNT_KEY;
  const keyConfigured = Boolean(key && key.trim() !== '');

  const start = Date.now();
  let reachable = false;
  let status = null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const headers = {};
    if (keyConfigured) {
      headers.AccountKey = key.trim();
    }

    // Ping LTA DataMall BusArrival endpoint
    const response = await fetch(
      'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04111',
      {
        headers,
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    reachable = true;
    status = response.status;
  } catch (err) {
    reachable = false;
    status = null;
  }

  const ms = Date.now() - start;

  return res.status(200).json({
    keyConfigured,
    lta: {
      reachable,
      status,
      ms,
    },
    reachable,
    status,
    ms,
  });
}
