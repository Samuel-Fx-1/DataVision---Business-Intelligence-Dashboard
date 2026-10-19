'use strict';

/**
 * Loads broadcaster data into MongoDB.
 *   1. Copy data/broadcast-rights.template.json to data/broadcast-rights.json
 *   2. Check every entry against the broadcaster's official site, add their https links
 *   3. Run: node scripts/seed-broadcast-rights.js   (or pass another file path)
 * Re-running updates existing entries (one per competition + country).
 */
try {
  require('dotenv').config();
} catch (_err) {
  /* dotenv is optional here */
}

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { COMPETITIONS } = require('../src/football/leagues');
const watch = require('../src/football/watchService');
const Model = require('../src/football/broadcastRight.model');

async function main() {
  const file = process.argv[2] || path.join(__dirname, '..', 'data', 'broadcast-rights.json');
  if (!fs.existsSync(file)) {
    throw new Error(`File not found: ${file}\nCopy data/broadcast-rights.template.json to data/broadcast-rights.json and fill it in first.`);
  }
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set in backend/.env');

  const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(entries)) throw new Error('The file must contain a JSON array.');

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const valid = new Set(COMPETITIONS.map((c) => c.key));
  let saved = 0;

  for (const [i, e] of entries.entries()) {
    const competition = String(e.competition || '').toUpperCase();
    const countryCode = watch.normalizeCountry(e.countryCode);
    if (!valid.has(competition) || !countryCode) {
      console.warn(`Skipping entry ${i}: needs a valid competition (${[...valid].join(', ')}) and 2-letter countryCode.`);
      continue;
    }
    const checked = watch.validateProviders(e.providers);
    if (checked.error) {
      console.warn(`Skipping entry ${i} (${competition}/${countryCode}): ${checked.error}`);
      continue;
    }
    await Model.findOneAndUpdate(
      { competition, countryCode },
      { $set: { providers: checked.value, verifiedBy: e.verifiedBy || '', lastVerifiedAt: new Date() } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    saved += 1;
    console.log(`Saved ${competition}/${countryCode} (${checked.value.length} providers)`);
  }
  console.log(`Done. ${saved} of ${entries.length} entries saved.`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
