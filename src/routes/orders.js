const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');
const {
    createOrder,
    getOrders,
    updateOrder,
    trackOrder
} = require('../controllers/orderController');

// Public: create COD order (but auth is required to track user and loyalty)
router.post('/', authRequired, validateOrder, createOrder);

// Public: track order status by order code
router.get('/track/:id', trackOrder);

// Admin-only routes
router.get('/', authRequired, requireRole('admin'), getOrders);
router.put('/:id', authRequired, requireRole('admin'), updateOrder);

module.exports = router;
