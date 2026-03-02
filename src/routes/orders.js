const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');
const {
    createOrder,
    getOrders,
    updateOrder
} = require('../controllers/orderController');

// Public: create COD order
router.post('/', validateOrder, createOrder);

// Admin-only routes
router.get('/', authRequired, requireRole('admin'), getOrders);
router.put('/:id', authRequired, requireRole('admin'), updateOrder);

module.exports = router;
