const mongoose = require('../db');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { computeCartPricing } = require('../services/orderPricing');
const { calcEarnedPoints, nextTier } = require('../services/loyalty');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// --- Helpers ---

// Tìm sản phẩm theo productId (ưu tiên) rồi mới fallback theo tên —
// tên có thể đổi/trùng, còn ObjectId là bất biến.
async function resolveProduct(item) {
    const candidateId = item.productId || item._id;
    if (candidateId && mongoose.Types.ObjectId.isValid(String(candidateId))) {
        const byId = await Product.findById(candidateId);
        if (byId) return byId;
    }
    if (item.name) {
        return Product.findOne({ name: item.name });
    }
    return null;
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

    const resolvedCart = [];

    for (const item of cart) {
        if (!item.name && !item.productId && !item._id) {
            throw new AppError('Sản phẩm trong giỏ hàng thiếu thông tin định danh', 400);
        }

        const dbProduct = await resolveProduct(item);
        if (!dbProduct) {
            throw new AppError(`Không tìm thấy sản phẩm: ${item.name || item.productId || item._id}`, 404);
        }

        let correctPrice = dbProduct.price;
        if (item.sizeLabel && Array.isArray(dbProduct.sizes) && dbProduct.sizes.length > 0) {
            const matchedSize = dbProduct.sizes.find(s => s.label === item.sizeLabel);
            if (matchedSize) {
                correctPrice = matchedSize.price;
            }
        }

        const qty = Math.max(1, Number(item.quantity) || 1);

        resolvedCart.push({
            productId: dbProduct._id,
            name: dbProduct.name,
            price: correctPrice,
            quantity: qty,
            sizeLabel: item.sizeLabel || null
        });
    }

    const { subtotal, discount, total } = computeCartPricing(resolvedCart);

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
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        note: body.note || ''
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

            // Fire-and-forget: never let a slow/broken email provider delay checkout
            if (user.email) sendOrderConfirmationEmail(order, user.email).catch(() => {});
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

// @desc    Lịch sử đơn hàng của user đang đăng nhập
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ username: req.user.username })
        .sort({ createdAt: -1 })
        .limit(50);
    res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id
// @access  Admin
const updateOrder = asyncHandler(async (req, res) => {
    const existing = await Order.findById(req.params.id);
    if (!existing) {
        throw new AppError('Không tìm thấy đơn hàng', 404);
    }

    if (req.body.status === 'confirmed' && existing.status === 'pending') {
        // Trừ tồn kho atomic: chỉ trừ khi stock còn đủ (điều kiện $gte ngay trong update,
        // tránh race khi 2 đơn cùng được confirm). Nếu thiếu hàng giữa chừng thì hoàn lại
        // các item đã trừ trước đó rồi báo lỗi.
        const deducted = [];
        for (const item of existing.cart) {
            const filter = item.productId
                ? { _id: item.productId, stock: { $gte: item.quantity } }
                : { name: item.name, stock: { $gte: item.quantity } };
            const updated = await Product.findOneAndUpdate(filter, { $inc: { stock: -item.quantity } });
            if (!updated) {
                for (const d of deducted) {
                    await Product.findByIdAndUpdate(d.id, { $inc: { stock: d.quantity } });
                }
                throw new AppError(`Sản phẩm "${item.name}" không đủ tồn kho (cần ${item.quantity})`, 400);
            }
            deducted.push({ id: updated._id, quantity: item.quantity });
        }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.json({ success: true, data: order });
});

// @desc    Tra cứu trạng thái đơn hàng theo mã đơn (timeline)
// @route   GET /api/orders/track/:id
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
    let order;
    try {
        order = await Order.findById(req.params.id);
    } catch {
        order = null;
    }
    if (!order) {
        throw new AppError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.', 404);
    }

    const paymentConfirmed = order.paymentMethod === 'cod' || order.paymentStatus === 'paid';
    const inProduction = ['confirmed', 'shipped', 'completed'].includes(order.status);
    const packed = ['shipped', 'completed'].includes(order.status);
    const delivered = order.status === 'completed';

    const steps = [
        { key: 'received', label: 'Đã nhận đơn hàng', done: true, at: order.createdAt },
        { key: 'payment_confirmed', label: 'Đã xác nhận thanh toán', done: paymentConfirmed, at: order.paidAt || (paymentConfirmed ? order.createdAt : null) },
        { key: 'production', label: 'Đang trong quá trình sản xuất', done: inProduction, at: inProduction ? order.updatedAt : null },
        { key: 'packed', label: 'Đóng gói & khắc tên', done: packed, at: packed ? order.updatedAt : null },
        { key: 'delivery', label: 'Đang giao hàng / Hoàn tất', done: delivered, at: delivered ? order.updatedAt : null },
    ];

    // Estimated delivery: 5 days after order creation
    const estimatedDelivery = new Date(order.createdAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    res.json({
        success: true,
        data: {
            orderId: order._id,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            total: order.total,
            createdAt: order.createdAt,
            estimatedDelivery,
            steps
        }
    });
});

module.exports = {
    createOrder,
    getOrders,
    getMyOrders,
    updateOrder,
    trackOrder
};
