/*
  Seed three "Mini" products into MongoDB.
  Usage:
    - Set env MONGODB_URI if needed (default mongodb://localhost:27017/perfume)
    - Run: node scripts/seedMinis.js
*/

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perfume';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  image: { type: String },
  description: { type: String },
}, { collection: 'products', timestamps: true });

const Product = mongoose.model('Product', productSchema);

const minis = [
  {
    name: 'Another 13 Mini',
    price: 59.99,
    image: 'https://lelabo.ips.photos/lelabo-java/images/skus/100PA13100__PRODUCT_01--IMG_1200--ANOTHER13-247547490.jpg',
    description: 'A mini-size of Another 13 for on-the-go.',
  },
  {
    name: 'Bergamote 22 Mini',
    price: 49.99,
    image: 'https://lelabo.ips.photos/lelabo-java/images/skus/100PB22100__PRODUCT_01--IMG_1200--BERGAMOTE22--1562685279.jpg',
    description: 'A mini-size of Bergamote 22 with bright citrus notes.',
  },
  {
    name: 'Baie 19 Mini',
    price: 39.99,
    image: 'https://lelabo.ips.photos/lelabo-java/images/skus/J2K401R000__PRODUCT_01--IMG_1200--BAIE19-1695466996.jpg',
    description: 'A mini-size of Baie 19 with green, rainy freshness.',
  },
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    for (const p of minis) {
      const res = await Product.updateOne(
        { name: p.name },
        { $set: p },
        { upsert: true }
      );
      if (res.upsertedCount > 0) {
        console.log('Inserted:', p.name);
      } else if (res.modifiedCount > 0) {
        console.log('Updated:', p.name);
      } else {
        console.log('Exists (no change):', p.name);
      }
    }

    const count = await Product.countDocuments({ name: /mini/i });
    console.log('Total MINI products now:', count);
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
