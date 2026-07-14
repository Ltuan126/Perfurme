const mongoose = require('../db');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Họ tên không vượt quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    trim: true,
    lowercase: true,
    maxlength: [120, 'Email không vượt quá 120 ký tự'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ']
  },
  message: {
    type: String,
    required: [true, 'Nội dung là bắt buộc'],
    trim: true,
    maxlength: [2000, 'Nội dung không vượt quá 2000 ký tự']
  },
  status: {
    type: String,
    enum: ['new', 'read'],
    default: 'new'
  }
}, {
  timestamps: true
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
