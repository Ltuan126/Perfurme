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

// POST /api/payment/callback - Webhook callback from Momo/VNPay
// Query: ?method=momo|vnpay
// Body: Payment gateway callback payload
router.post('/callback', paymentCallback);

// GET /api/payment/status/:orderId - Check payment status
router.get('/status/:orderId', checkPaymentStatus);

module.exports = router;
