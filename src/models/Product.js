const mongoose = require('../db');

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
  }
}, {
  timestamps: true
});

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
