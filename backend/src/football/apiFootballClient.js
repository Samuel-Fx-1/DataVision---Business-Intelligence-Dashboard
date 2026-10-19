'use strict';

const config = require('./config');
const { apiFootballIds } = require('./leagues');

/** Error with a stable code + HTTP status. Messages are safe to show to clients. */
class UpstreamError extends Error {
  constructor(code, message, status = 502, extra = {}) {
    super(message);
    this.name = 'UpstreamError';
    this.code = code;
    this.status = status;
    Object.assign(this, extra);
  }
}

// --- request budget (per UTC day) -------------------------------------------
const usage = { day: null, count: 0, remainingHeader: null };

function rollDay() {
  const today = new Date().toISOString().slice(0, 10);
  if (usage.day !== today) {
    usage.day = today;
    usage.count = 0;
    usage.remainingHeader = null;
  }
}

/** How many provider calls are left today (the smaller of our own budget and the provider's own counter). */
function budgetStatus() {
  rollDay();
  const budget = config.dailyBudget;
  const byCount = budget - usage.count;
  const remaining = usage.remainingHeader === null ? byCount : Math.min(byCount, usage.remainingHeader);
  return { used: usage.count, budget, remaining: Math.max(0, remaining) };
}

function resetForTests() {
  usage.day = null;
  usage.count = 0;
  usage.remainingHeader = null;
}

// --- low-level request -------------------------------------------------------
function hasErrors(errors) {
  if (Array.isArray(errors)) return errors.length > 0;
  return Boolean(errors) && typeof errors === 'object' && Object.keys(errors).length > 0;
}

function mapProviderErrors(errors) {
  const keys = Array.isArray(errors) ? [] : Object.keys(errors || {});
  if (keys.includes('token') || keys.includes('access')) {
    return new UpstreamError('UPSTREAM_AUTH', 'The football data provider rejected our credentials.', 401);
  }
  if (keys.includes('requests') || keys.includes('rateLimit')) {
    return new UpstreamError('RATE_LIMITED', 'The football data provider limit was reached. Try again later.', 429);
  }
  return new UpstreamError('UPSTREAM_REJECTED', 'The football data provider could not serve this request.', 502);
}

async function request(path, params = {}) {
  if (!config.apiKey) {
    throw new UpstreamError('NO_API_KEY', 'API_FOOTBALL_KEY is not configured on the server.', 500);
  }
  if (budgetStatus().remaining <= 0) {
    throw new UpstreamError('BUDGET_EXHAUSTED', 'Today\'s request budget is used up. Showing saved data.', 429);
  }

  const url = new URL(config.baseUrl + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  let res;
  try {
    usage.count += 1; // count the attempt: providers bill requests even when they fail
    res = await fetch(url, {
      headers: { 'x-apisports-key': config.apiKey, Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (_err) {
    throw new UpstreamError('UPSTREAM_UNREACHABLE', 'Could not reach the football data provider.', 502);
  } finally {
    clearTimeout(timer);
  }

  const remaining = res.headers.get('x-ratelimit-requests-remaining');
  if (remaining !== null && remaining !== '' && Number.isFinite(Number(remaining))) {
    usage.remainingHeader = Number(remaining);
  }

  if (res.status === 429) {
    throw new UpstreamError('RATE_LIMITED', 'The football data provider limit was reached. Try again later.', 429);
  }
  if (!res.ok) {
    throw new UpstreamError('UPSTREAM_ERROR', `The football data provider answered with status ${res.status}.`, 502);
  }

  let body;
  try {
    body = await res.json();
  } catch (_err) {
    throw new UpstreamError('BAD_RESPONSE', 'The football data provider sent an unreadable response.', 502);
  }

  // API-Football can answer HTTP 200 and still report problems in `errors`.
  if (hasErrors(body && body.errors)) {
    // Log only the error keys (never the key, never the full body).
    const errKeys = Array.isArray(body.errors) ? 'array' : Object.keys(body.errors).join(',');
    console.warn(`[football] provider reported errors: ${errKeys}`);
    throw mapProviderErrors(body.errors);
  }

  return Array.isArray(body && body.response) ? body.response : [];
}

// --- endpoints ---------------------------------------------------------------

/** Every live fixture in our six competitions (one call). */
function getLiveFixtures() {
  return request('/fixtures', { live: apiFootballIds.join('-') });
}

/** All fixtures on a UTC date (one call, all leagues; we filter afterwards). */
function getFixturesByDate(date) {
  return request('/fixtures', { date, timezone: 'UTC' });
}

/** One fixture with events (one call). */
function getFixtureById(id) {
  return request('/fixtures', { id });
}

module.exports = {
  UpstreamError,
  budgetStatus,
  getLiveFixtures,
  getFixturesByDate,
  getFixtureById,
  resetForTests,
};
