const mongoose = require('../db');

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  longevity: { type: Number, min: 1, max: 5 }, // Độ lưu hương
  sillage: { type: Number, min: 1, max: 5 },   // Độ tỏa hương
  experience: { type: String },                // Trải nghiệm dịp dùng
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
