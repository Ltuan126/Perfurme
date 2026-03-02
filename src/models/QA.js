const mongoose = require('../db');

const qaSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  question: { type: String, required: [true, 'Câu hỏi là bắt buộc'], maxlength: [500, 'Câu hỏi tối đa 500 ký tự'] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answer: { type: String, maxlength: [1000, 'Câu trả lời tối đa 1000 ký tự'] },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answeredAt: { type: Date }
}, {
  timestamps: true
});

// Compound index for fetching Q&A by product
qaSchema.index({ productId: 1, createdAt: -1 });

const QA = mongoose.model('QA', qaSchema);

module.exports = QA;
