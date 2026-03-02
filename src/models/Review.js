const mongoose = require('../db');

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: [true, 'Đánh giá là bắt buộc'] },
  comment: { type: String, maxlength: [1000, 'Bình luận tối đa 1000 ký tự'] },
  longevity: { type: Number, min: 1, max: 5 },
  sillage: { type: Number, min: 1, max: 5 },
  experience: { type: String, maxlength: [500, 'Trải nghiệm tối đa 500 ký tự'] }
}, {
  timestamps: true
});

// Compound index for fetching reviews by product, sorted by date
reviewSchema.index({ productId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
