/**
 * Payment Controller
 * Handles payment initiation and webhook callbacks
 */

const Order = require('../models/Order');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

function calcEarnedPoints(amount) {
  return Math.floor((amount || 0) / 10);
}

function nextTier(points) {
  if (points >= 2000) return 'VIP';
  if (points >= 1000) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'None';
}

// @desc    Initiate payment (Momo/VNPay)
// @route   POST /api/payment/init
// @access  Public
const initiatePayment = asyncHandler(async (req, res) => {
  const { orderId, method } = req.body;

  if (!orderId || !method) {
    throw new AppError('orderId và method là bắt buộc', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404);
  }

  if (order.paymentStatus !== 'pending') {
    throw new AppError('Đơn hàng này đã được thanh toán hoặc không hợp lệ', 400);
  }

  try {
    const paymentSession = await paymentService.initiate(method, {
      amount: order.total,
      orderId: order._id.toString(),
      orderInfo: `Thanh toán đơn hàng ${order._id.toString().slice(-6).toUpperCase()}`
    });

    // Store request ID for webhook matching (for Momo)
    if (method === 'momo' && paymentSession.requestId) {
      order.paymentRef = paymentSession.requestId;
      await order.save();
    }

    res.json({
      success: true,
      data: paymentSession
    });
  } catch (err) {
    throw new AppError(`Khởi tạo thanh toán thất bại: ${err.message}`, 400);
  }
});

// @desc    Payment webhook callback (Momo/VNPay)
// @route   POST /api/payment/callback
// @access  Public (but requires valid signature)
const paymentCallback = asyncHandler(async (req, res) => {
  const { method } = req.query; // method=momo or method=vnpay via query string
  const payload = req.body;

  if (!method) {
    throw new AppError('method query param diperlukan', 400);
  }

  try {
    // Verify callback signature
    const verification = paymentService.verifyCallback(method, payload);

    if (!verification.success) {
      // Payment failed – update order
      const order = await Order.findById(verification.orderId);
      if (order) {
        order.paymentStatus = 'failed';
        await order.save();
      }
      return res.json({
        success: false,
        message: verification.message || 'Thanh toán thất bại'
      });
    }

    // Payment successful – update order + award loyalty points
    const order = await Order.findById(verification.orderId);
    if (!order) {
      throw new AppError('Không tìm thấy đơn hàng', 404);
    }

    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.paymentRef = verification.transId || verification.transactionNo || payload.transId;
    await order.save();

    // Award loyalty points now that payment is confirmed
    if (order.username) {
      const user = await User.findOne({ username: order.username });
      if (user) {
        const earned = calcEarnedPoints(order.total);
        const newPoints = (user.points || 0) + earned;
        user.points = newPoints;
        user.tier = nextTier(newPoints);
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Thanh toán thành công và đơn hàng đã được khởi tạo',
      orderId: order._id
    });
  } catch (err) {
    console.error(`Payment callback error (${method}):`, err.message);
    // Always return 200 OK to prevent gateway retries from thinking callback failed
    res.status(200).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Check payment status
// @route   GET /api/payment/status/:orderId
// @access  Public
const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404);
  }

  res.json({
    success: true,
    data: {
      orderId: order._id,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      total: order.total
    }
  });
});

module.exports = {
  initiatePayment,
  paymentCallback,
  checkPaymentStatus
};
