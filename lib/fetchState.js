/**
 * lib/fetchState.js
 * 
 * Fetches data from providers with a strict 6-second timeout.
 * Never calls .json() directly; inspects status, headers, and text body,
 * delegating state classification to lib/classify.js.
 */

import { classify } from './classify.js';

export async function fetchState(url, options = {}, pick) {
  const timeoutMs = options.timeout || 6000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const fetchOptions = {
      ...options,
      signal: controller.signal,
    };
    delete fetchOptions.timeout;

    const res = await fetch(url, fetchOptions);
    clearTimeout(timer);

    const status = res.status;
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    return classify({ status, contentType, text, pick });
  } catch (err) {
    clearTimeout(timer);
    return classify({ error: err, status: 504, text: '', pick });
  }
}

export default fetchState;
