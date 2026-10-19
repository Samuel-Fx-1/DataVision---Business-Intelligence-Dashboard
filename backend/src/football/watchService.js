'use strict';

/**
 * "Where to watch" lookup.
 * Reads broadcaster data that an admin entered by hand (BroadcastRight) and returns only
 * official https links. It never fetches, proxies, or restreams video.
 */

const PROVIDER_TYPES = ['tv', 'streaming', 'free-to-air', 'official-youtube'];
const EMBED_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com']);

// --- helpers (pure) ----------------------------------------------------------
function normalizeCountry(value) {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) && code !== 'XX' ? code : null;
}

/** Country priority: ?country= (the visitor's own choice), then hosting/CDN headers, then DEFAULT_COUNTRY. */
function detectCountry(req) {
  const header = (name) => (typeof req.get === 'function' ? req.get(name) : undefined);
  return (
    normalizeCountry(req.query && req.query.country) ||
    normalizeCountry(header('x-vercel-ip-country')) ||
    normalizeCountry(header('cf-ipcountry')) ||
    normalizeCountry(process.env.DEFAULT_COUNTRY) ||
    null
  );
}

function safeHttpsUrl(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch (_err) {
    return null;
  }
}

function safeEmbedUrl(value) {
  const url = safeHttpsUrl(value);
  if (!url) return null;
  return EMBED_HOSTS.has(new URL(url).hostname.toLowerCase()) ? url : null;
}

/** Clean one stored provider entry for the browser. */
function publicProvider(p) {
  return {
    name: String(p.name || '').slice(0, 80),
    type: PROVIDER_TYPES.includes(p.type) ? p.type : 'tv',
    url: safeHttpsUrl(p.url),
    embedUrl: safeEmbedUrl(p.embedUrl),
    requiresSubscription: p.requiresSubscription !== false,
    notes: String(p.notes || '').slice(0, 200),
  };
}

/** Validate admin input; returns { value } or { error }. */
function validateProviders(list) {
  if (!Array.isArray(list) || list.length > 10) return { error: 'providers must be an array of at most 10 items' };
  const out = [];
  for (const [i, p] of list.entries()) {
    if (!p || typeof p !== 'object') return { error: `providers[${i}] must be an object` };
    if (typeof p.name !== 'string' || !p.name.trim() || p.name.length > 80) return { error: `providers[${i}].name is required (max 80 characters)` };
    if (p.type !== undefined && !PROVIDER_TYPES.includes(p.type)) return { error: `providers[${i}].type must be one of ${PROVIDER_TYPES.join(', ')}` };
    if (p.url && !safeHttpsUrl(p.url)) return { error: `providers[${i}].url must be a valid https URL` };
    if (p.embedUrl && !safeEmbedUrl(p.embedUrl)) return { error: `providers[${i}].embedUrl must be an https YouTube URL` };
    out.push({
      name: p.name.trim(),
      type: p.type || 'tv',
      url: p.url ? safeHttpsUrl(p.url) : null,
      embedUrl: p.embedUrl ? safeEmbedUrl(p.embedUrl) : null,
      requiresSubscription: p.requiresSubscription !== false,
      notes: typeof p.notes === 'string' ? p.notes.slice(0, 200) : '',
    });
  }
  return { value: out };
}

// --- storage (MongoDB, swappable in tests) -----------------------------------
let repo = null;

function defaultRepo() {
  const mongoose = require('mongoose');
  const Model = require('./broadcastRight.model');
  const ready = () => mongoose.connection.readyState === 1;
  return {
    available: ready,
    async find(competition, countryCode) {
      if (!ready()) return null;
      return Model.findOne({ competition, countryCode }).maxTimeMS(3000).lean();
    },
    async countriesFor(competition) {
      if (!ready()) return [];
      return Model.find({ competition }).maxTimeMS(3000).distinct('countryCode');
    },
    async list(filter) {
      return Model.find(filter).sort({ competition: 1, countryCode: 1 }).maxTimeMS(3000).lean();
    },
    async upsert(competition, countryCode, providers, verifiedBy) {
      return Model.findOneAndUpdate(
        { competition, countryCode },
        { $set: { providers, verifiedBy: verifiedBy || '', lastVerifiedAt: new Date() } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      ).lean();
    },
    async remove(competition, countryCode) {
      return Model.deleteOne({ competition, countryCode });
    },
  };
}

function getRepo() {
  if (!repo) repo = defaultRepo();
  return repo;
}

function setRepository(r) {
  repo = r;
}

// --- main lookup --------------------------------------------------------------
async function resolveWatchOptions({ competition, countryCode }) {
  const r = getRepo();
  const country = normalizeCountry(countryCode);
  const [right, available] = await Promise.all([
    country ? r.find(competition, country) : null,
    r.countriesFor(competition),
  ]);

  const providers = right && Array.isArray(right.providers) ? right.providers.map(publicProvider) : [];
  return {
    competition,
    country,
    found: providers.length > 0,
    providers,
    lastVerifiedAt: right && right.lastVerifiedAt ? new Date(right.lastVerifiedAt).toISOString() : null,
    availableCountries: [...new Set([...(available || []), ...(country ? [country] : [])])].sort(),
  };
}

module.exports = {
  PROVIDER_TYPES,
  normalizeCountry,
  detectCountry,
  safeHttpsUrl,
  safeEmbedUrl,
  publicProvider,
  validateProviders,
  resolveWatchOptions,
  getRepo,
  setRepository,
};
