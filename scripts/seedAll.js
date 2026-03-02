/*
  Seed tất cả sản phẩm lên MongoDB Atlas (hoặc local).
  Usage: node scripts/seedAll.js
*/
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/perfume';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    description: { type: String },
    sizes: [{ label: String, price: Number }],
}, { collection: 'products', timestamps: true });

const Product = mongoose.model('Product', productSchema);

const products = [
    {
        name: "Another 13",
        price: 279.99,
        sizes: [
            { label: '100ml', price: 279.99 },
            { label: '50ml', price: 172.73 },
            { label: '15ml', price: 74.38 },
        ],
        image: "https://lelabo.ips.photos/lelabo-java/images/skus/100PA13100__PRODUCT_01--IMG_1200--ANOTHER13-247547490.jpg",
        description: "A timeless scent with floral top notes.",
    },
    {
        name: "Bergamote 22",
        price: 259.99,
        sizes: [
            { label: '100ml', price: 259.99 },
            { label: '50ml', price: 172.73 },
            { label: '15ml', price: 74.38 },
        ],
        image: "https://lelabo.ips.photos/lelabo-java/images/skus/100PB22100__PRODUCT_01--IMG_1200--BERGAMOTE22--1562685279.jpg",
        description: "Fresh citrus aroma for everyday wear.",
    },
    {
        name: "Baie 19",
        price: 243.80,
        sizes: [
            { label: '100ml', price: 243.80 },
            { label: '50ml', price: 172.73 },
            { label: '15ml', price: 74.38 },
        ],
        image: "https://lelabo.ips.photos/lelabo-java/images/skus/J2K401R000__PRODUCT_01--IMG_1200--BAIE19-1695466996.jpg",
        description: "This is what BAIE 19 is about: the dry juniper berry, the patchouli, the green leaves... all soaked by a beautiful, luminous, magnetic rain after a long drought.",
    },
    {
        name: "Rose 31",
        price: 243.80,
        sizes: [
            { label: '100ml', price: 243.80 },
            { label: '50ml', price: 172.73 },
            { label: '15ml', price: 74.38 },
        ],
        image: "https://lelabo.ips.photos/lelabo-java/images/skus/100PR31100__PRODUCT_01--IMG_1200--ROSE31--2101804434.jpg",
        description: "The perfume's aim is clear: to transform the famous Grasse rose into an assertively virile fragrance that can be worn by anyone.",
    },
    {
        name: "THÉ NOIR 29",
        price: 243.80,
        sizes: [
            { label: '100ml', price: 243.80 },
            { label: '50ml', price: 172.73 },
            { label: '15ml', price: 74.38 },
        ],
        image: "https://lelabo.ips.photos/lelabo-java/images/skus/100PT29100__PRODUCT_01--IMG_1200--THNOIR29--1804794449.jpg",
        description: "THÉ NOIR 29 combines depth and freshness, softness and strength through permanent oscillation between bergamot, fig, bay leaves and cedarwood, vetiver, musk.",
    },
    {
        name: "NEROLI 36",
        price: 243.80,
        sizes: [
            { label: '100ml', price: 243.80 },
            { label: '50ml', price: 172.73 },
            { label: '15ml', price: 74.38 },
        ],
        image: "https://lelabo.ips.photos/lelabo-java/images/skus/100PN36100__PRODUCT_01--IMG_1200--NEROLI36-678633412.jpg",
        description: "Neroli is another name for the essence of orange blossom. The unique quality is its sunny floral character with an extraordinarily warm, sensual base.",
    },
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
        console.log('Connecting to', MONGO_URI.includes('localhost') ? 'LOCAL' : 'CLOUD');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected!');

        for (const p of products) {
            const res = await Product.updateOne(
                { name: p.name },
                { $set: p },
                { upsert: true }
            );
            if (res.upsertedCount > 0) {
                console.log('  ➕ Inserted:', p.name);
            } else if (res.modifiedCount > 0) {
                console.log('  ✏️ Updated:', p.name);
            } else {
                console.log('  ✓ Exists:', p.name);
            }
        }

        const count = await Product.countDocuments();
        console.log(`\n🎉 Total products in database: ${count}`);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
})();
