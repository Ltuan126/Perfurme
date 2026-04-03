const Order = require('../models/Order');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const paymentService = require('../services/paymentService');

// --- Helpers ---

function calcEarnedPoints(amount) {
    return Math.floor((amount || 0) / 10);
}

function nextTier(points) {
    if (points >= 2000) return 'VIP';
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'None';
}

function isMini(productName = '') {
    return /mini/i.test(productName);
}

// @desc    Tạo đơn hàng COD (cộng điểm + bundle discount)
// @route   POST /api/orders
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
    const body = req.body || {};
    const cart = Array.isArray(body.cart) ? body.cart : [];
    const paymentMethod = body.paymentMethod || 'cod';

    if (cart.length === 0) {
        throw new AppError('Giỏ hàng không được rỗng', 400);
    }

    let subtotal = cart.reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
        0
    );

    // Bundle discount: 3+ mini bottles → 10% off minis
    const miniCount = cart.reduce(
        (n, i) => n + (isMini(i.name) ? (Number(i.quantity) || 1) : 0),
        0
    );
    let discount = 0;
    if (miniCount >= 3) {
        const minisTotal = cart
            .filter(i => isMini(i.name))
            .reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
        discount += Math.round(minisTotal * 0.10 * 100) / 100;
    }
    const total = Math.max(0, subtotal - discount);

    const order = await Order.create({
        name: body.name,
        address: body.address,
        phone: body.phone,
        cart,
        subtotal,
        discount,
        total,
        username: body.username,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
    });

    // Award loyalty points immediately for COD only
    if (body.username && paymentMethod === 'cod') {
        const user = await User.findOne({ username: body.username });
        if (user) {
            const earned = calcEarnedPoints(total);
            const newPoints = (user.points || 0) + earned;
            user.points = newPoints;
            user.tier = nextTier(newPoints);
            await user.save();
        }
    }

    res.status(201).json({ success: true, data: order });
});

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
// @access  Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id
// @access  Admin
const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!order) {
        throw new AppError('Không tìm thấy đơn hàng', 404);
    }
    res.json({ success: true, data: order });
});

module.exports = {
    createOrder,
    getOrders,
    updateOrder
};
