const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const paymentService = require('../services/paymentService');

// --- Helpers ---

function calcEarnedPoints(amount) {
    return Math.floor((amount || 0) / 10000);
}

function nextTier(points) {
    if (points >= 2000) return 'VIP';
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'None';
}

function isMini(item) {
    return item && (item.sizeLabel === '15ml' || /mini/i.test(item.name || ''));
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

    let subtotal = 0;
    const resolvedCart = [];

    for (const item of cart) {
        if (!item.name) {
            throw new AppError('Sản phẩm trong giỏ hàng thiếu tên', 400);
        }

        const dbProduct = await Product.findOne({ name: item.name });
        if (!dbProduct) {
            throw new AppError(`Không tìm thấy sản phẩm: ${item.name}`, 404);
        }

        let correctPrice = dbProduct.price;
        if (item.sizeLabel && Array.isArray(dbProduct.sizes) && dbProduct.sizes.length > 0) {
            const matchedSize = dbProduct.sizes.find(s => s.label === item.sizeLabel);
            if (matchedSize) {
                correctPrice = matchedSize.price;
            }
        }

        const qty = Math.max(1, Number(item.quantity) || 1);
        subtotal += correctPrice * qty;

        resolvedCart.push({
            name: item.name,
            price: correctPrice,
            quantity: qty,
            sizeLabel: item.sizeLabel || null
        });
    }

    // Bundle discount: 3+ mini bottles → 10% off minis
    const miniCount = resolvedCart.reduce(
        (n, i) => n + (isMini(i) ? i.quantity : 0),
        0
    );
    let discount = 0;
    if (miniCount >= 3) {
        const minisTotal = resolvedCart
            .filter(i => isMini(i))
            .reduce((s, i) => s + i.price * i.quantity, 0);
        discount += Math.round(minisTotal * 0.10);
    }
    const total = Math.max(0, subtotal - discount);

    const order = await Order.create({
        name: body.name,
        address: body.address,
        phone: body.phone,
        cart: resolvedCart,
        subtotal,
        discount,
        total,
        username: req.user?.username,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
    });

    // Award loyalty points immediately for COD only
    if (req.user?.username && paymentMethod === 'cod') {
        const user = await User.findOne({ username: req.user.username });
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
