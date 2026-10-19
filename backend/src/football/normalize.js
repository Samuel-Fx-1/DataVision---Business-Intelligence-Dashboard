'use strict';

const { byApiFootballId } = require('./leagues');

/** Turn API-Football's status codes into our small, stable set. */
function statusFrom(short) {
  switch (short) {
    case 'NS':
    case 'TBD':
      return { code: 'NS', phase: 'upcoming' };
    case '1H':
    case '2H':
    case 'ET':
    case 'BT':
    case 'P':
    case 'LIVE':
      return { code: 'LIVE', phase: 'live' };
    case 'HT':
      return { code: 'HT', phase: 'live' };
    case 'INT':
    case 'SUSP':
      return { code: short, phase: 'live' };
    case 'FT':
    case 'AET':
    case 'PEN':
      return { code: 'FT', phase: 'finished' };
    case 'PST':
      return { code: 'PST', phase: 'postponed' };
    case 'CANC':
    case 'ABD':
    case 'AWD':
    case 'WO':
      return { code: 'CANC', phase: 'cancelled' };
    default:
      return { code: short || 'NS', phase: 'upcoming' };
  }
}

function team(t) {
  return { id: t && t.id != null ? t.id : null, name: (t && t.name) || '', logo: (t && t.logo) || null };
}

function normalizeEvents(events) {
  if (!Array.isArray(events)) return [];
  return events.map((e) => ({
    minute: e.time && e.time.elapsed != null ? e.time.elapsed : null,
    extra: e.time && e.time.extra != null ? e.time.extra : null,
    teamId: e.team && e.team.id != null ? e.team.id : null,
    team: (e.team && e.team.name) || '',
    player: (e.player && e.player.name) || '',
    assist: (e.assist && e.assist.name) || null,
    type: String(e.type || '').toLowerCase(), // goal | card | subst | var
    detail: e.detail || '',
  }));
}

/** One API-Football fixture -> our match shape. Returns null for competitions we don't cover. */
function normalizeFixture(raw) {
  const competition = byApiFootballId.get(raw && raw.league && raw.league.id);
  if (!competition) return null;

  const f = raw.fixture || {};
  const st = statusFrom(f.status && f.status.short);

  return {
    id: String(f.id),
    competition: competition.key,
    competitionName: competition.name,
    league: {
      id: raw.league.id,
      name: raw.league.name || competition.fullName,
      logo: raw.league.logo || null,
      country: raw.league.country || null,
      round: raw.league.round || null,
    },
    kickoff: f.date || null,
    timestamp: typeof f.timestamp === 'number' ? f.timestamp : f.date ? Math.floor(Date.parse(f.date) / 1000) : null,
    venue: (f.venue && f.venue.name) || null,
    status: {
      code: st.code,
      short: (f.status && f.status.short) || null,
      long: (f.status && f.status.long) || null,
      minute: f.status && f.status.elapsed != null ? f.status.elapsed : null,
      extra: f.status && f.status.extra != null ? f.status.extra : null,
    },
    phase: st.phase,
    isLive: st.phase === 'live',
    homeTeam: team(raw.teams && raw.teams.home),
    awayTeam: team(raw.teams && raw.teams.away),
    score: {
      home: raw.goals && raw.goals.home != null ? raw.goals.home : null,
      away: raw.goals && raw.goals.away != null ? raw.goals.away : null,
    },
    events: normalizeEvents(raw.events),
  };
}

/** Lists don't need events; drop them to keep responses small. */
function summaryOf(match) {
  const { events, ...rest } = match; // eslint-disable-line no-unused-vars
  return rest;
}

const MINUTE = 60 * 1000;

/**
 * Only ask the provider for live data when it can matter:
 * a match is in progress, or one kicks off within 10 minutes / started less than 3 hours ago.
 */
function shouldPollLive(matches, nowMs) {
  return matches.some((m) => {
    if (m.phase === 'live') return true;
    if (m.phase !== 'upcoming' || !m.timestamp) return false;
    const kickoffMs = m.timestamp * 1000;
    return nowMs >= kickoffMs - 10 * MINUTE && nowMs <= kickoffMs + 180 * MINUTE;
  });
}

/** Live data wins over the (older) day list. Sorted by kickoff, then id. */
function mergeMatches(dayMatches, liveMatches) {
  const byId = new Map(dayMatches.map((m) => [m.id, m]));
  for (const m of liveMatches) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0) || a.id.localeCompare(b.id));
}

module.exports = { statusFrom, normalizeFixture, normalizeEvents, summaryOf, shouldPollLive, mergeMatches };
