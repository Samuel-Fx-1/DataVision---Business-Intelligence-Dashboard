'use strict';

const crypto = require('crypto');
const express = require('express');
const config = require('./config');
const { keys: COMPETITION_KEYS } = require('./leagues');
const matches = require('./matchesService');
const watch = require('./watchService');
const { summaryOf } = require('./normalize');

const router = express.Router();

/** Same error shape as the rest of PitchCast: { success:false, error:{ code, message } }. */
function sendError(res, err) {
  const status = Number.isInteger(err && err.status) ? err.status : 500;
  const code = (err && err.code) || 'INTERNAL_ERROR';
  const message = err && err.status ? err.message : 'Something went wrong on our side.';
  if (!err || !err.status) console.error('[football] unexpected error:', err && err.message);
  const body = { success: false, error: { code, message } };
  if (err && err.retryAfterMs) body.error.retryAfterMs = err.retryAfterMs;
  return res.status(status).json(body);
}

const httpError = (status, code, message) => Object.assign(new Error(message), { status, code });

const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => sendError(res, err));

// --- public: matches ----------------------------------------------------------
router.get(
  '/matches',
  wrap(async (req, res) => {
    const competition = req.query.competition ? String(req.query.competition).toUpperCase() : null;
    if (competition && !COMPETITION_KEYS.includes(competition)) {
      throw httpError(400, 'BAD_COMPETITION', `competition must be one of ${COMPETITION_KEYS.join(', ')}`);
    }
    const { matches: list, source, stale } = await matches.listMatches({ competition });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, count: list.length, source, stale, matches: list });
  }),
);

router.get(
  '/matches/:id',
  wrap(async (req, res) => {
    if (!/^\d{1,12}$/.test(req.params.id)) throw httpError(400, 'BAD_ID', 'Match id must be a number.');
    const match = await matches.getMatchById(req.params.id);
    if (!match) throw httpError(404, 'MATCH_NOT_FOUND', 'That match is not in the covered competitions.');
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, match });
  }),
);

// --- public: where to watch ----------------------------------------------------
router.get(
  '/matches/:id/watch',
  wrap(async (req, res) => {
    if (!/^\d{1,12}$/.test(req.params.id)) throw httpError(400, 'BAD_ID', 'Match id must be a number.');
    if (req.query.country && !watch.normalizeCountry(req.query.country)) {
      throw httpError(400, 'BAD_COUNTRY', 'country must be a 2-letter code such as RW.');
    }
    const match = await matches.getMatchById(req.params.id);
    if (!match) throw httpError(404, 'MATCH_NOT_FOUND', 'That match is not in the covered competitions.');

    const options = await watch.resolveWatchOptions({
      competition: match.competition,
      countryCode: watch.detectCountry(req),
    });

    res.set('Cache-Control', 'no-store');
    res.json({ success: true, match: summaryOf(match), ...options });
  }),
);

// --- admin: manage broadcaster data --------------------------------------------
function requireAdmin(req, res, next) {
  const expected = config.adminKey;
  if (!expected) return sendError(res, httpError(503, 'ADMIN_DISABLED', 'Admin access is not configured.'));
  const given = String(req.get('x-admin-key') || '');
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) return sendError(res, httpError(401, 'UNAUTHORIZED', 'Missing or wrong admin key.'));
  return next();
}

function requireDb(req, res, next) {
  const r = watch.getRepo();
  if (typeof r.available === 'function' && !r.available()) {
    return sendError(res, httpError(503, 'DB_UNAVAILABLE', 'The database is not connected.'));
  }
  return next();
}

router.use('/admin', express.json({ limit: '20kb' }), requireAdmin, requireDb);

function parseKeys(competitionRaw, countryRaw) {
  const competition = String(competitionRaw || '').toUpperCase();
  const countryCode = watch.normalizeCountry(countryRaw);
  if (!COMPETITION_KEYS.includes(competition)) throw httpError(400, 'BAD_COMPETITION', `competition must be one of ${COMPETITION_KEYS.join(', ')}`);
  if (!countryCode) throw httpError(400, 'BAD_COUNTRY', 'countryCode must be a 2-letter code such as RW.');
  return { competition, countryCode };
}

router.get(
  '/admin/broadcast-rights',
  wrap(async (req, res) => {
    const filter = {};
    if (req.query.competition) filter.competition = String(req.query.competition).toUpperCase();
    if (req.query.country) filter.countryCode = String(req.query.country).toUpperCase();
    const items = await watch.getRepo().list(filter);
    res.json({ success: true, count: items.length, items });
  }),
);

router.put(
  '/admin/broadcast-rights',
  wrap(async (req, res) => {
    const body = req.body || {};
    const { competition, countryCode } = parseKeys(body.competition, body.countryCode);
    const checked = watch.validateProviders(body.providers);
    if (checked.error) throw httpError(400, 'BAD_PROVIDERS', checked.error);
    const verifiedBy = typeof body.verifiedBy === 'string' ? body.verifiedBy.slice(0, 80) : '';
    const item = await watch.getRepo().upsert(competition, countryCode, checked.value, verifiedBy);
    res.json({ success: true, item });
  }),
);

router.delete(
  '/admin/broadcast-rights/:competition/:country',
  wrap(async (req, res) => {
    const { competition, countryCode } = parseKeys(req.params.competition, req.params.country);
    await watch.getRepo().remove(competition, countryCode);
    res.json({ success: true });
  }),
);

module.exports = router;
