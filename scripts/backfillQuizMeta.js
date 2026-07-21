/*
  Backfill quiz metadata (families/seasons/occasions/moods/intensity) for the
  6 seed products that used to be hard-coded in src/data/productMeta.js on the
  frontend. Matches by exact product name; safe to re-run (upsert-style $set).
  Usage:
    node scripts/backfillQuizMeta.js
*/

const mongoose = require('../src/db');
const Product = require('../src/models/Product');

const META_BY_NAME = {
  'Another 13': {
    families: ['musky', 'woody', 'amber'],
    seasons: ['spring', 'summer', 'fall', 'winter'],
    occasions: ['everyday', 'office'],
    moods: ['calm-clean', 'modern-minimal'],
    intensity: 'moderate',
  },
  'Bergamote 22': {
    families: ['citrus', 'woody'],
    seasons: ['spring', 'summer'],
    occasions: ['everyday', 'office', 'casual'],
    moods: ['fresh-energizing'],
    intensity: 'light',
  },
  'Baie 19': {
    families: ['green', 'woody'],
    seasons: ['spring', 'fall'],
    occasions: ['everyday', 'casual'],
    moods: ['atmospheric', 'fresh-energizing'],
    intensity: 'moderate',
  },
  'Rose 31': {
    families: ['floral', 'spicy', 'woody'],
    seasons: ['fall', 'winter'],
    occasions: ['date-night', 'special'],
    moods: ['bold-confident', 'romantic'],
    intensity: 'strong',
  },
  'THÉ NOIR 29': {
    families: ['tea', 'woody', 'green'],
    seasons: ['fall', 'spring'],
    occasions: ['everyday', 'office', 'special'],
    moods: ['sophisticated'],
    intensity: 'moderate',
  },
  'NEROLI 36': {
    families: ['white-floral', 'citrus'],
    seasons: ['spring', 'summer'],
    occasions: ['everyday', 'casual'],
    moods: ['bright-happy'],
    intensity: 'light',
  },
};

(async () => {
  try {
    await mongoose.connection.asPromise();
    let matched = 0;
    for (const [name, meta] of Object.entries(META_BY_NAME)) {
      const res = await Product.updateOne({ name }, { $set: meta });
      if (res.matchedCount > 0) matched += 1;
      console.log(`${res.matchedCount > 0 ? '✓' : '·'} ${name}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
    }
    console.log(`Done. Backfilled metadata for ${matched}/${Object.keys(META_BY_NAME).length} products.`);
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
