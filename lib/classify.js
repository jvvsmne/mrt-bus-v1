/**
 * lib/classify.js
 * 
 * Classifies provider responses and network outcomes into standardized states:
 * ok (200) | empty (200) | refused (502) | busy (503) | unreachable (504)
 */

export function classify(arg1, arg2, arg3, arg4) {
  let status, contentType, text, pick, error;

  if (typeof arg1 === 'object' && arg1 !== null) {
    ({ status, contentType = '', text = '', pick, error } = arg1);
  } else {
    status = arg1;
    contentType = arg2 || '';
    text = arg3 || '';
    pick = arg4;
  }

  // Network failures, aborts, and timeouts
  if (error || status === 504) {
    return {
      state: 'unreachable',
      status: 504,
      error: error?.message || 'Network call timed out or failed',
      items: null,
      data: null,
    };
  }

  // Rate limited / Service busy
  if (status === 429 || status === 503) {
    return {
      state: 'busy',
      status: 503,
      retryAfter: 10,
      items: null,
      data: null,
    };
  }

  // Refused states: unauthorized (401), forbidden (403), not found (404), or provider error
  if (status < 200 || status >= 300) {
    return {
      state: 'refused',
      status: 502,
      error: text ? text.slice(0, 200) : `Provider refused with HTTP ${status}`,
      items: null,
      data: null,
    };
  }

  // HTTP 200 OK - Parse JSON safely without crashing
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch (err) {
    return {
      state: 'refused',
      status: 502,
      error: 'Provider answered 200 but body was not valid JSON',
      items: null,
      data: null,
    };
  }

  if (!parsed) {
    return {
      state: 'empty',
      status: 200,
      items: [],
      data: null,
    };
  }

  const items = typeof pick === 'function' ? pick(parsed) : parsed;

  if (!items || (Array.isArray(items) && items.length === 0)) {
    return {
      state: 'empty',
      status: 200,
      items: [],
      data: parsed,
    };
  }

  return {
    state: 'ok',
    status: 200,
    items,
    data: parsed,
  };
}

export default classify;
