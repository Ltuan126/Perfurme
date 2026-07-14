const express = require('express');
const router = express.Router();
const QA = require('../models/QA');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Lấy Q&A theo productId, phân trang
router.get('/:productId', async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const qas = await QA.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const count = await QA.countDocuments({ productId: req.params.productId });
    res.json({ qas, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Khách đặt câu hỏi
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const qa = new QA({ ...req.body, userId: req.user.sub });
    await qa.save();
    res.status(201).json(qa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin trả lời
router.put('/:id/answer', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const qa = await QA.findByIdAndUpdate(
      req.params.id,
      { answer: req.body.answer, adminId: req.user.sub, answeredAt: new Date() },
      { new: true }
    );
    if (!qa) return res.status(404).json({ error: 'Q&A not found' });
    res.json(qa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
