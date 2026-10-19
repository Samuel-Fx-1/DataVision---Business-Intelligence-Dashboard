'use strict';

/**
 * The six competitions PitchCast covers, with their API-Football league ids.
 * `key` is what we store in MongoDB and send to the frontend; `name` matches the filter pills.
 */
const COMPETITIONS = [
  { key: 'EPL', name: 'EPL', fullName: 'English Premier League', apiFootballId: 39 },
  { key: 'LALIGA', name: 'La Liga', fullName: 'La Liga', apiFootballId: 140 },
  { key: 'SERIEA', name: 'Serie A', fullName: 'Serie A', apiFootballId: 135 },
  { key: 'BUNDESLIGA', name: 'Bundesliga', fullName: 'Bundesliga', apiFootballId: 78 },
  { key: 'LIGUE1', name: 'Ligue 1', fullName: 'Ligue 1', apiFootballId: 61 },
  { key: 'UCL', name: 'UCL', fullName: 'UEFA Champions League', apiFootballId: 2 },
];

const byApiFootballId = new Map(COMPETITIONS.map((c) => [c.apiFootballId, c]));
const keys = COMPETITIONS.map((c) => c.key);
const apiFootballIds = COMPETITIONS.map((c) => c.apiFootballId);

module.exports = { COMPETITIONS, byApiFootballId, keys, apiFootballIds };
