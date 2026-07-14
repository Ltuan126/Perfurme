/*
  Backfill stock=20 for existing products that don't have stock set yet.
  Usage:
    node scripts/backfillStock.js
*/

const mongoose = require('../src/db');
const Product = require('../src/models/Product');

(async () => {
  try {
    await mongoose.connection.asPromise();
    const res = await Product.updateMany(
      { $or: [{ stock: { $exists: false } }, { stock: 0 }] },
      { $set: { stock: 20 } }
    );
    console.log('Backfilled stock for products:', res.modifiedCount);
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
