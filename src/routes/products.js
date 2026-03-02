const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validate');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authRequired, requireRole('admin'), validateProduct, createProduct);
router.put('/:id', authRequired, requireRole('admin'), validateProduct, updateProduct);
router.delete('/:id', authRequired, requireRole('admin'), deleteProduct);

module.exports = router;
