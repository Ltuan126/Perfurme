/**
 * Input Validation Middleware
 * Validates request body fields before reaching the controller.
 */

const { AppError } = require('./errorHandler');

// Generic validator factory – accepts an array of field rules
// Each rule: { field, label, required?, type?, min?, max?, maxlength?, match?, matchMsg? }
function validateBody(rules) {
    return (req, res, next) => {
        const errors = [];
        const body = req.body || {};

        for (const rule of rules) {
            const value = body[rule.field];

            // Required check
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push(`${rule.label || rule.field} là bắt buộc`);
                continue;
            }

            // Skip further checks if value is empty and not required
            if (value === undefined || value === null || value === '') continue;

            // Type check
            if (rule.type === 'string' && typeof value !== 'string') {
                errors.push(`${rule.label || rule.field} phải là chuỗi`);
            }
            if (rule.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
                errors.push(`${rule.label || rule.field} phải là số`);
            }

            // String length
            if (rule.maxlength && typeof value === 'string' && value.length > rule.maxlength) {
                errors.push(`${rule.label || rule.field} không vượt quá ${rule.maxlength} ký tự`);
            }

            // Min / Max for numbers
            if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
                errors.push(`${rule.label || rule.field} không được nhỏ hơn ${rule.min}`);
            }
            if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
                errors.push(`${rule.label || rule.field} không được lớn hơn ${rule.max}`);
            }

            // Regex match
            if (rule.match && typeof value === 'string' && !rule.match.test(value)) {
                errors.push(rule.matchMsg || `${rule.label || rule.field} không hợp lệ`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors
            });
        }

        next();
    };
}

// Pre-built validators for common routes

const validateRegister = validateBody([
    { field: 'username', label: 'Tên đăng nhập', required: true, type: 'string', maxlength: 50 },
    { field: 'password', label: 'Mật khẩu', required: true, type: 'string', maxlength: 128 }
]);

const validateLogin = validateBody([
    { field: 'username', label: 'Tên đăng nhập', required: true, type: 'string' },
    { field: 'password', label: 'Mật khẩu', required: true, type: 'string' }
]);

const validateProduct = validateBody([
    { field: 'name', label: 'Tên sản phẩm', required: true, type: 'string', maxlength: 200 },
    { field: 'price', label: 'Giá', required: true, type: 'number', min: 0 },
    { field: 'description', label: 'Mô tả', type: 'string', maxlength: 2000 }
]);

const validateOrder = validateBody([
    { field: 'name', label: 'Tên khách hàng', required: true, type: 'string', maxlength: 100 },
    { field: 'address', label: 'Địa chỉ', required: true, type: 'string', maxlength: 500 },
    { field: 'phone', label: 'Số điện thoại', required: true, type: 'string', match: /^[0-9+\-\s()]{7,20}$/, matchMsg: 'Số điện thoại không hợp lệ' }
]);

const validateReview = validateBody([
    { field: 'productId', label: 'Product ID', required: true, type: 'string' },
    { field: 'rating', label: 'Đánh giá', required: true, type: 'number', min: 1, max: 5 }
]);

module.exports = {
    validateBody,
    validateRegister,
    validateLogin,
    validateProduct,
    validateOrder,
    validateReview
};
