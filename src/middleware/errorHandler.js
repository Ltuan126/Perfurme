/**
 * Global Error Handler Middleware
 * Handles all errors thrown in route handlers and middleware.
 */

// Wrap async route handlers to catch errors automatically
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware (must have 4 params)
const errorHandler = (err, req, res, next) => {
    // Log the error for debugging (in production, use a proper logger)
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: messages
        });
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({
            success: false,
            message: 'ID không hợp lệ'
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        return res.status(409).json({
            success: false,
            message: `Giá trị trùng lặp cho trường: ${field}`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token đã hết hạn'
        });
    }

    // Custom application error
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Lỗi server nội bộ';

    res.status(statusCode).json({
        success: false,
        message
    });
};

// Custom error class for application errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { asyncHandler, errorHandler, AppError };
