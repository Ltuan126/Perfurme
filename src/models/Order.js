const mongoose = require('../db');

const orderItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên sản phẩm là bắt buộc'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Giá sản phẩm là bắt buộc'],
        min: [0, 'Giá không thể âm']
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'Số lượng tối thiểu là 1']
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên khách hàng là bắt buộc'],
        trim: true,
        maxlength: [100, 'Tên không vượt quá 100 ký tự']
    },
    address: {
        type: String,
        required: [true, 'Địa chỉ là bắt buộc'],
        trim: true,
        maxlength: [500, 'Địa chỉ không vượt quá 500 ký tự']
    },
    phone: {
        type: String,
        required: [true, 'Số điện thoại là bắt buộc'],
        trim: true,
        match: [/^[0-9+\-\s()]{7,20}$/, 'Số điện thoại không hợp lệ']
    },
    cart: {
        type: [orderItemSchema],
        validate: {
            validator: function (val) { return val && val.length > 0; },
            message: 'Giỏ hàng không được rỗng'
        }
    },
    subtotal: {
        type: Number,
        default: 0,
        min: [0, 'Subtotal không thể âm']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount không thể âm']
    },
    total: {
        type: Number,
        default: 0,
        min: [0, 'Tổng không thể âm']
    },
    username: {
        type: String,
        trim: true,
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
            message: 'Trạng thái "{VALUE}" không hợp lệ'
        },
        default: 'pending',
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'momo', 'vnpay'],
        default: 'cod',
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    paymentRef: {
        type: String,
        trim: true,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true  // auto createdAt + updatedAt
});

// Compound index for common queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ username: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, paymentMethod: 1 });
orderSchema.index({ paymentRef: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
