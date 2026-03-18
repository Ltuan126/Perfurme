const mongoose = require('../db');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Tên đăng nhập là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên đăng nhập tối thiểu 3 ký tự'],
    maxlength: [50, 'Tên đăng nhập tối đa 50 ký tự']
  },
  passwordHash: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc']
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: [100, 'Họ tên tối đa 100 ký tự'],
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [120, 'Email tối đa 120 ký tự'],
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Số điện thoại tối đa 20 ký tự'],
    default: ''
  },
  address: {
    type: String,
    trim: true,
    maxlength: [300, 'Địa chỉ tối đa 300 ký tự'],
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role "{VALUE}" không hợp lệ'
    },
    default: 'user'
  },
  points: { type: Number, default: 0, min: 0 },
  tier: {
    type: String,
    enum: ['None', 'Silver', 'Gold', 'VIP'],
    default: 'None'
  }
}, {
  timestamps: true
});

// Index for fast lookups
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
