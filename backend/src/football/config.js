'use strict';

/**
 * Settings for the football data module.
 * Values are read lazily (getters) so it works no matter when dotenv runs.
 * Nothing in this file is ever sent to the browser.
 */
const positive = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

module.exports = {
  get apiKey() {
    return process.env.API_FOOTBALL_KEY || '';
  },
  get baseUrl() {
    return (process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io').replace(/\/+$/, '');
  },
  // Hard ceiling on provider calls per UTC day. Free plans are small, so stay under the cap.
  get dailyBudget() {
    return positive(process.env.DAILY_REQUEST_BUDGET, 90);
  },
  // How long live data is reused before asking the provider again (it grows automatically when budget runs low).
  get liveTtlSeconds() {
    return positive(process.env.LIVE_CACHE_TTL_SECONDS, 60);
  },
  // How long today's fixture list is reused.
  get fixturesTtlSeconds() {
    return positive(process.env.FIXTURES_CACHE_TTL_SECONDS, 3600);
  },
  get requestTimeoutMs() {
    return positive(process.env.UPSTREAM_TIMEOUT_MS, 8000);
  },
  get adminKey() {
    return process.env.ADMIN_API_KEY || '';
  },
};
