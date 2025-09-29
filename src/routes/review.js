const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { isAuthenticated } = require('../middleware/auth');

// Lấy review theo productId, hỗ trợ phân trang
router.get('/:productId', async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const count = await Review.countDocuments({ productId: req.params.productId });
    res.json({ reviews, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm review
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const review = new Review({ ...req.body, userId: req.user._id });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa review
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await review.remove();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
