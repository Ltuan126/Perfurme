const mongoose = require('../db');
const { FAMILIES, SEASONS, OCCASIONS, MOODS, INTENSITIES } = require('../constants/perfumeTaxonomy');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên sản phẩm không vượt quá 200 ký tự'],
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá không thể âm']
  },
  sizes: [
    {
      label: { type: String, trim: true },
      price: { type: Number, min: 0 }
    }
  ],
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Mô tả không vượt quá 2000 ký tự']
  },
  image: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    trim: true,
    index: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Tồn kho không thể âm']
  },
  // Quiz matching metadata — set by admin so newly added products can be
  // recommended by the fragrance quiz (previously hard-coded on the frontend).
  families: {
    type: [String],
    enum: { values: FAMILIES, message: 'Nhóm hương "{VALUE}" không hợp lệ' },
    default: []
  },
  seasons: {
    type: [String],
    enum: { values: SEASONS, message: 'Mùa "{VALUE}" không hợp lệ' },
    default: []
  },
  occasions: {
    type: [String],
    enum: { values: OCCASIONS, message: 'Dịp sử dụng "{VALUE}" không hợp lệ' },
    default: []
  },
  moods: {
    type: [String],
    enum: { values: MOODS, message: 'Mood "{VALUE}" không hợp lệ' },
    default: []
  },
  intensity: {
    type: String,
    enum: { values: [...INTENSITIES, ''], message: 'Độ lưu hương "{VALUE}" không hợp lệ' },
    default: ''
  }
}, {
  timestamps: true
});

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
