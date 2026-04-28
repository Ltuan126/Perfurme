const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  paymentCallback,
  checkPaymentStatus
} = require('../controllers/paymentController');

// POST /api/payment/init - Initiate payment (Momo/VNPay)
// Body: { orderId, method: 'momo' | 'vnpay' }
router.post('/init', initiatePayment);

// POST /api/payment/callback - IPN webhook (Momo / VNPay server-to-server)
router.post('/callback', paymentCallback);

// GET /api/payment/callback - Return URL sau khi user thanh toán xong (VNPay redirect)
router.get('/callback', paymentCallback);

// GET /api/payment/status/:orderId - Check payment status
router.get('/status/:orderId', checkPaymentStatus);

module.exports = router;
