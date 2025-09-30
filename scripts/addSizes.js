/*
  Add three size variants to products and remove legacy "Mini" entries.
  - Sizes: 100ml (keep current price), 50ml = 172.73, 15ml = 74.38
  Usage:
    MONGODB_URI=mongodb://localhost:27017/perfume node scripts/addSizes.js
*/

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perfume';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  image: String,
  description: String,
  sizes: [{ label: String, price: Number }],
}, { collection: 'products', timestamps: true });

const Product = mongoose.model('Product', productSchema);

const PRICE_50 = 172.73;
const PRICE_15 = 74.38;

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const products = await Product.find({ name: { $not: /mini/i } }).lean();
    let updated = 0;
    for (const p of products) {
      const price100 = Number(p.price) || 0;
      const sizes = [
        { label: '100ml', price: price100 },
        { label: '50ml', price: PRICE_50 },
        { label: '15ml', price: PRICE_15 },
      ];
      const res = await Product.updateOne({ _id: p._id }, { $set: { sizes } });
      if (res.modifiedCount > 0) updated++;
    }
    console.log('Updated sizes for products:', updated, '/', products.length);

    const del = await Product.deleteMany({ name: /mini/i });
    console.log('Removed legacy Mini products:', del.deletedCount);
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
