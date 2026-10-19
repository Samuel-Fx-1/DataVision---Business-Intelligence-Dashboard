'use strict';

const config = require('./config');
const realClient = require('./apiFootballClient');
const { normalizeFixture, summaryOf, shouldPollLive, mergeMatches } = require('./normalize');

let client = realClient; // swapped in tests
const cache = {
  day: null, // { date, data, at, liveMismatch }
  live: null, // { data, at }
  byId: new Map(), // id -> { match, at }
};

const MINUTE = 60 * 1000;
const MISMATCH_REFRESH_MS = 5 * MINUTE;

function setClient(c) {
  client = c || realClient;
}

function resetCache() {
  cache.day = null;
  cache.live = null;
  cache.byId.clear();
}

/** Live data is reused longer as the daily budget shrinks. */
function liveTtlMs() {
  const base = config.liveTtlSeconds * 1000;
  const { remaining, budget } = client.budgetStatus();
  const ratio = budget > 0 ? remaining / budget : 0;
  if (ratio < 0.1) return base * 10;
  if (ratio < 0.3) return base * 3;
  return base;
}

function dayTtlMs(entry) {
  return entry.liveMismatch ? MISMATCH_REFRESH_MS : config.fixturesTtlSeconds * 1000;
}

async function getDayMatches(now) {
  const date = new Date(now).toISOString().slice(0, 10);
  const entry = cache.day && cache.day.date === date ? cache.day : null;

  if (entry && now - entry.at < dayTtlMs(entry)) {
    return { matches: entry.data, source: 'cache', stale: false };
  }
  try {
    const raw = await client.getFixturesByDate(date);
    const data = raw.map(normalizeFixture).filter(Boolean);
    cache.day = { date, data, at: now, liveMismatch: false };
    return { matches: data, source: 'api', stale: false };
  } catch (err) {
    if (entry) return { matches: entry.data, source: 'stale-cache', stale: true };
    throw err;
  }
}

async function getLiveMatches(now) {
  const entry = cache.live;
  if (entry && now - entry.at < liveTtlMs()) {
    return { matches: entry.data, source: 'cache', stale: false };
  }
  try {
    const raw = await client.getLiveFixtures();
    const data = raw.map(normalizeFixture).filter(Boolean);
    cache.live = { data, at: now };
    return { matches: data, source: 'api', stale: false };
  } catch (err) {
    if (entry) return { matches: entry.data, source: 'stale-cache', stale: true };
    return { matches: [], source: 'none', stale: true, error: err };
  }
}

/**
 * Today's matches in our six competitions, with live scores layered on top
 * only when a match is on (or about to start).
 */
async function listMatches({ competition = null, now = Date.now() } = {}) {
  const day = await getDayMatches(now);
  let live = { matches: [], source: day.source, stale: false };

  if (shouldPollLive(day.matches, now)) {
    live = await getLiveMatches(now);

    // The day list says "live" but the provider no longer does: the match probably ended.
    // Refresh the day list sooner than usual.
    if (live.source !== 'none' && cache.day) {
      const liveIds = new Set(live.matches.map((m) => m.id));
      if (day.matches.some((m) => m.phase === 'live' && !liveIds.has(m.id))) cache.day.liveMismatch = true;
    }
  }

  let matches = mergeMatches(day.matches, live.matches);
  if (competition) matches = matches.filter((m) => m.competition === competition);

  const source = day.source === 'api' || live.source === 'api' ? 'api' : day.source === 'stale-cache' ? 'stale-cache' : 'cache';
  return {
    matches: matches.map(summaryOf),
    source,
    stale: Boolean(day.stale || live.stale),
  };
}

/** One match with events. Uses caches first, then one provider call. */
async function getMatchById(id, now = Date.now()) {
  const wanted = String(id);

  const hit = cache.byId.get(wanted);
  if (hit) {
    const ttl = hit.match.phase === 'finished' ? 60 * MINUTE : 2 * MINUTE;
    if (now - hit.at < ttl) return hit.match;
  }

  const fromLive = cache.live && cache.live.data.find((m) => m.id === wanted);
  if (fromLive && now - cache.live.at < liveTtlMs()) return fromLive;

  try {
    const raw = await client.getFixtureById(wanted);
    const match = raw.map(normalizeFixture).filter(Boolean)[0];
    if (!match) return null;
    cache.byId.set(wanted, { match, at: now });
    return match;
  } catch (err) {
    // Fall back to whatever we already know about this match.
    const known =
      (hit && hit.match) ||
      fromLive ||
      (cache.day && cache.day.data.find((m) => m.id === wanted)) ||
      null;
    if (known) return known;
    throw err;
  }
}

module.exports = { listMatches, getMatchById, setClient, resetCache };
