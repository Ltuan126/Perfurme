const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(0, parseInt(req.query.limit) || 0);
    const search = (req.query.search || '').trim();

    const filter = {};
    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        filter.$or = [{ name: regex }, { description: regex }];
    }

    let query = Product.find(filter).sort({ name: 1 });
    if (limit > 0) {
        query = query.skip((page - 1) * limit).limit(limit);
    }

    const [products, total] = await Promise.all([query, Product.countDocuments(filter)]);

    res.json({
        success: true,
        count: products.length,
        data: products,
        meta: { page, limit: limit || total, total, totalPages: limit > 0 ? Math.ceil(total / limit) : 1 }
    });
});

// @desc    Lấy chi tiết sản phẩm theo ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new AppError('Không tìm thấy sản phẩm', 404);
    }
    res.json({ success: true, data: product });
});

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
});

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!product) {
        throw new AppError('Không tìm thấy sản phẩm', 404);
    }
    res.json({ success: true, data: product });
});

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        throw new AppError('Không tìm thấy sản phẩm', 404);
    }
    res.json({ success: true, message: 'Đã xóa sản phẩm' });
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
