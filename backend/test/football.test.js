'use strict';

/**
 * Offline tests for the football module (no API key, no MongoDB needed).
 * Run: node --test test/football.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.API_FOOTBALL_KEY = 'test-key';
process.env.ADMIN_API_KEY = 'secret-admin';
process.env.DAILY_REQUEST_BUDGET = '10';

const { normalizeFixture, shouldPollLive, mergeMatches, statusFrom } = require('../src/football/normalize');
const matchesService = require('../src/football/matchesService');
const watch = require('../src/football/watchService');

// --- fixtures -----------------------------------------------------------------
const NOW = Date.parse('2026-10-19T15:00:00Z');
const ts = (iso) => Math.floor(Date.parse(iso) / 1000);

function rawFixture({ id, leagueId = 39, short = 'NS', elapsed = null, kickoff = '2026-10-19T14:00:00Z', home = 'Arsenal', away = 'Chelsea', goals = [null, null], events } = {}) {
  return {
    fixture: { id, date: kickoff, timestamp: ts(kickoff), venue: { name: 'Some Stadium' }, status: { short, long: short, elapsed } },
    league: { id: leagueId, name: 'League', logo: 'l.png', country: 'England', round: 'Round 1' },
    teams: { home: { id: 1, name: home, logo: 'h.png' }, away: { id: 2, name: away, logo: 'a.png' } },
    goals: { home: goals[0], away: goals[1] },
    events,
  };
}

function stubClient({ day = [], live = [], byId = {}, fail = {} } = {}) {
  const calls = { day: 0, live: 0, byId: 0 };
  return {
    calls,
    budgetStatus: () => ({ used: 0, budget: 10, remaining: 10 }),
    async getFixturesByDate() { calls.day += 1; if (fail.day) throw fail.day; return day; },
    async getLiveFixtures() { calls.live += 1; if (fail.live) throw fail.live; return live; },
    async getFixtureById(id) { calls.byId += 1; return byId[id] ? [byId[id]] : []; },
  };
}

test.beforeEach(() => matchesService.resetCache());

// --- normalize ----------------------------------------------------------------
test('normalizeFixture maps a covered live match', () => {
  const m = normalizeFixture(rawFixture({ id: 100, short: '2H', elapsed: 63, goals: [2, 1], events: [{ time: { elapsed: 12 }, team: { id: 1, name: 'Arsenal' }, player: { name: 'Saka' }, assist: { name: null }, type: 'Goal', detail: 'Normal Goal' }] }));
  assert.equal(m.id, '100');
  assert.equal(m.competition, 'EPL');
  assert.equal(m.phase, 'live');
  assert.equal(m.isLive, true);
  assert.equal(m.status.minute, 63);
  assert.deepEqual(m.score, { home: 2, away: 1 });
  assert.equal(m.events[0].type, 'goal');
});

test('normalizeFixture ignores competitions we do not cover', () => {
  assert.equal(normalizeFixture(rawFixture({ id: 1, leagueId: 9999 })), null);
});

test('statusFrom groups provider codes', () => {
  assert.equal(statusFrom('HT').phase, 'live');
  assert.equal(statusFrom('AET').phase, 'finished');
  assert.equal(statusFrom('PST').phase, 'postponed');
  assert.equal(statusFrom('NS').phase, 'upcoming');
});

test('shouldPollLive only when a match is on or about to start', () => {
  const upcomingFar = normalizeFixture(rawFixture({ id: 1, kickoff: '2026-10-19T20:00:00Z' }));
  const upcomingSoon = normalizeFixture(rawFixture({ id: 2, kickoff: '2026-10-19T15:05:00Z' }));
  const liveNow = normalizeFixture(rawFixture({ id: 3, short: '1H', elapsed: 10 }));
  const finished = normalizeFixture(rawFixture({ id: 4, short: 'FT', kickoff: '2026-10-19T11:00:00Z' }));
  assert.equal(shouldPollLive([upcomingFar, finished], NOW), false);
  assert.equal(shouldPollLive([upcomingSoon], NOW), true);
  assert.equal(shouldPollLive([liveNow], NOW), true);
});

test('mergeMatches lets live data win and sorts by kickoff', () => {
  const dayA = normalizeFixture(rawFixture({ id: 1, kickoff: '2026-10-19T18:00:00Z' }));
  const dayB = normalizeFixture(rawFixture({ id: 2, kickoff: '2026-10-19T14:00:00Z' }));
  const liveB = normalizeFixture(rawFixture({ id: 2, kickoff: '2026-10-19T14:00:00Z', short: '2H', elapsed: 70, goals: [1, 0] }));
  const merged = mergeMatches([dayA, dayB], [liveB]);
  assert.deepEqual(merged.map((m) => m.id), ['2', '1']);
  assert.equal(merged[0].status.minute, 70);
});

// --- matches service ------------------------------------------------------------
test('listMatches does not call the live endpoint when nothing is on', async () => {
  const client = stubClient({ day: [rawFixture({ id: 1, kickoff: '2026-10-19T20:00:00Z' }), rawFixture({ id: 2, leagueId: 9999 })] });
  matchesService.setClient(client);
  const out = await matchesService.listMatches({ now: NOW });
  assert.equal(out.matches.length, 1);
  assert.equal(client.calls.live, 0);
  assert.equal('events' in out.matches[0], false);
});

test('listMatches overlays live scores and reuses the cache', async () => {
  const client = stubClient({
    day: [rawFixture({ id: 5, kickoff: '2026-10-19T14:00:00Z', short: '1H', elapsed: 20 })],
    live: [rawFixture({ id: 5, kickoff: '2026-10-19T14:00:00Z', short: '2H', elapsed: 60, goals: [3, 0] })],
  });
  matchesService.setClient(client);
  const first = await matchesService.listMatches({ now: NOW });
  const second = await matchesService.listMatches({ now: NOW + 5000 });
  assert.equal(first.matches[0].status.minute, 60);
  assert.deepEqual(second.matches[0].score, { home: 3, away: 0 });
  assert.equal(client.calls.day, 1);
  assert.equal(client.calls.live, 1);
});

test('listMatches serves stale data when the provider fails', async () => {
  const good = stubClient({ day: [rawFixture({ id: 7, kickoff: '2026-10-19T20:00:00Z' })] });
  matchesService.setClient(good);
  await matchesService.listMatches({ now: NOW });
  const bad = stubClient({ fail: { day: Object.assign(new Error('down'), { status: 502, code: 'UPSTREAM_UNREACHABLE' }) } });
  matchesService.setClient(bad);
  const out = await matchesService.listMatches({ now: NOW + 2 * 60 * 60 * 1000 });
  assert.equal(out.stale, true);
  assert.equal(out.matches.length, 1);
});

test('getMatchById falls back to one provider call and caches it', async () => {
  const client = stubClient({ byId: { 42: rawFixture({ id: 42, short: 'FT', goals: [1, 1] }) } });
  matchesService.setClient(client);
  const a = await matchesService.getMatchById('42', NOW);
  const b = await matchesService.getMatchById('42', NOW + 1000);
  assert.equal(a.id, '42');
  assert.equal(b.id, '42');
  assert.equal(client.calls.byId, 1);
  assert.equal(await matchesService.getMatchById('43', NOW), null);
});

// --- watch service ----------------------------------------------------------------
test('detectCountry prefers the visitor choice, then headers', () => {
  const req = (query, headers = {}) => ({ query, get: (n) => headers[n.toLowerCase()] });
  assert.equal(watch.detectCountry(req({ country: 'rw' }, { 'x-vercel-ip-country': 'US' })), 'RW');
  assert.equal(watch.detectCountry(req({}, { 'x-vercel-ip-country': 'ke' })), 'KE');
  assert.equal(watch.detectCountry(req({}, { 'cf-ipcountry': 'XX' })), null);
  assert.equal(watch.detectCountry(req({ country: 'ZZZ' })), null);
});

test('publicProvider drops unsafe links', () => {
  const p = watch.publicProvider({ name: 'X', type: 'weird', url: 'http://insecure.example', embedUrl: 'https://evil.example/embed', requiresSubscription: false });
  assert.equal(p.url, null);
  assert.equal(p.embedUrl, null);
  assert.equal(p.type, 'tv');
  assert.equal(p.requiresSubscription, false);
  const ok = watch.publicProvider({ name: 'Y', url: 'https://broadcaster.example/live', embedUrl: 'https://www.youtube.com/embed/abc' });
  assert.equal(ok.url, 'https://broadcaster.example/live');
  assert.equal(ok.embedUrl, 'https://www.youtube.com/embed/abc');
});

test('validateProviders rejects bad admin input', () => {
  assert.ok(watch.validateProviders('nope').error);
  assert.ok(watch.validateProviders([{ name: '' }]).error);
  assert.ok(watch.validateProviders([{ name: 'A', url: 'http://x.example' }]).error);
  assert.ok(watch.validateProviders([{ name: 'A', embedUrl: 'https://vimeo.com/1' }]).error);
  assert.deepEqual(watch.validateProviders([{ name: 'A', url: 'https://a.example' }]).value[0].url, 'https://a.example/');
});

function memoryRepo(rows = []) {
  const rights = [...rows];
  return {
    available: () => true,
    async find(c, k) { return rights.find((r) => r.competition === c && r.countryCode === k) || null; },
    async countriesFor(c) { return rights.filter((r) => r.competition === c).map((r) => r.countryCode); },
    async list(filter) { return rights.filter((r) => Object.entries(filter).every(([k, v]) => r[k] === v)); },
    async upsert(competition, countryCode, providers, verifiedBy) {
      const row = { competition, countryCode, providers, verifiedBy, lastVerifiedAt: new Date('2026-10-01') };
      const i = rights.findIndex((r) => r.competition === competition && r.countryCode === countryCode);
      if (i >= 0) rights[i] = row; else rights.push(row);
      return row;
    },
    async remove(c, k) { const i = rights.findIndex((r) => r.competition === c && r.countryCode === k); if (i >= 0) rights.splice(i, 1); },
  };
}

test('resolveWatchOptions reports found / not found and available countries', async () => {
  watch.setRepository(memoryRepo([{ competition: 'EPL', countryCode: 'RW', providers: [{ name: 'Canal+', type: 'tv', url: 'https://example.com/' }], lastVerifiedAt: new Date('2026-10-01') }]));
  const hit = await watch.resolveWatchOptions({ competition: 'EPL', countryCode: 'rw' });
  assert.equal(hit.found, true);
  assert.equal(hit.providers[0].name, 'Canal+');
  const miss = await watch.resolveWatchOptions({ competition: 'EPL', countryCode: 'KE' });
  assert.equal(miss.found, false);
  assert.deepEqual(miss.availableCountries, ['KE', 'RW']);
  const none = await watch.resolveWatchOptions({ competition: 'EPL', countryCode: null });
  assert.equal(none.country, null);
});

// --- HTTP routes ---------------------------------------------------------------------
async function withServer(fn) {
  const express = require('express');
  const app = express();
  app.use('/api', require('../src/football/routes'));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  try { await fn(base); } finally { await new Promise((r) => server.close(r)); }
}

test('GET /matches, /matches/:id/watch and error shapes', async () => {
  matchesService.setClient(stubClient({ day: [rawFixture({ id: 11, kickoff: '2026-10-19T20:00:00Z' })], byId: { 11: rawFixture({ id: 11, kickoff: '2026-10-19T20:00:00Z' }) } }));
  watch.setRepository(memoryRepo([{ competition: 'EPL', countryCode: 'RW', providers: [{ name: 'Canal+', url: 'https://example.com/' }], lastVerifiedAt: new Date('2026-10-01') }]));

  await withServer(async (base) => {
    // 'now' is real time here, so only check shape, not live logic
    const list = await (await fetch(`${base}/matches`)).json();
    assert.equal(list.success, true);
    assert.ok(Array.isArray(list.matches));

    const w = await (await fetch(`${base}/matches/11/watch?country=RW`)).json();
    assert.equal(w.success, true);
    assert.equal(w.country, 'RW');
    assert.equal(w.found, true);
    assert.equal(w.match.competition, 'EPL');

    const bad = await fetch(`${base}/matches/abc/watch`);
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error.code, 'BAD_ID');

    const badCountry = await fetch(`${base}/matches/11/watch?country=ZZZ`);
    assert.equal(badCountry.status, 400);

    const missing = await fetch(`${base}/matches/999/watch`);
    assert.equal(missing.status, 404);
  });
});

test('admin routes require the key and validate input', async () => {
  watch.setRepository(memoryRepo());
  await withServer(async (base) => {
    assert.equal((await fetch(`${base}/admin/broadcast-rights`)).status, 401);
    const headers = { 'x-admin-key': 'secret-admin', 'content-type': 'application/json' };

    const bad = await fetch(`${base}/admin/broadcast-rights`, { method: 'PUT', headers, body: JSON.stringify({ competition: 'NOPE', countryCode: 'RW', providers: [] }) });
    assert.equal(bad.status, 400);

    const ok = await fetch(`${base}/admin/broadcast-rights`, { method: 'PUT', headers, body: JSON.stringify({ competition: 'UCL', countryCode: 'rw', providers: [{ name: 'Canal+', url: 'https://example.com' }], verifiedBy: 'sam' }) });
    assert.equal(ok.status, 200);

    const list = await (await fetch(`${base}/admin/broadcast-rights?competition=UCL`, { headers })).json();
    assert.equal(list.count, 1);

    const del = await fetch(`${base}/admin/broadcast-rights/UCL/RW`, { method: 'DELETE', headers });
    assert.equal(del.status, 200);
  });
});

// --- provider client (global fetch stubbed) -------------------------------------------
function fakeResponse(body, { status = 200, headers = {} } = {}) {
  return { status, ok: status >= 200 && status < 300, headers: { get: (n) => headers[n.toLowerCase()] ?? null }, json: async () => body };
}

test('provider client sends the key, reads the budget header and maps errors', async () => {
  const client = require('../src/football/apiFootballClient');
  const realFetch = global.fetch;
  const seen = [];
  try {
    client.resetForTests();
    global.fetch = async (url, opts) => { seen.push({ url: String(url), headers: opts.headers }); return fakeResponse({ errors: [], response: [{ ok: 1 }] }, { headers: { 'x-ratelimit-requests-remaining': '7' } }); };
    const rows = await client.getLiveFixtures();
    assert.equal(rows.length, 1);
    assert.equal(seen[0].headers['x-apisports-key'], 'test-key');
    assert.match(seen[0].url, /live=39-140-135-78-61-2/);
    assert.equal(client.budgetStatus().remaining, 7);

    global.fetch = async () => fakeResponse({ errors: { token: 'Error/Missing application key' }, response: [] });
    await assert.rejects(client.getFixturesByDate('2026-10-19'), (e) => e.code === 'UPSTREAM_AUTH' && e.status === 401 && !/key/i.test(e.message));

    global.fetch = async () => fakeResponse({ errors: { requests: 'limit reached' }, response: [] });
    await assert.rejects(client.getFixtureById('1'), (e) => e.code === 'RATE_LIMITED');

    global.fetch = async () => { throw new Error('network'); };
    await assert.rejects(client.getFixtureById('1'), (e) => e.code === 'UPSTREAM_UNREACHABLE');
  } finally {
    global.fetch = realFetch;
    client.resetForTests();
  }
});

test('provider client stops when the daily budget is used up', async () => {
  const client = require('../src/football/apiFootballClient');
  const realFetch = global.fetch;
  let calls = 0;
  try {
    client.resetForTests();
    global.fetch = async () => { calls += 1; return fakeResponse({ errors: [], response: [] }); };
    for (let i = 0; i < 10; i += 1) await client.getFixtureById('1'); // budget is 10
    await assert.rejects(client.getFixtureById('1'), (e) => e.code === 'BUDGET_EXHAUSTED');
    assert.equal(calls, 10);
  } finally {
    global.fetch = realFetch;
    client.resetForTests();
  }
});
