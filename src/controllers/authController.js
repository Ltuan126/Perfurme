const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Đăng ký tài khoản
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check duplicate
    const exist = await User.findOne({ username });
    if (exist) {
        throw new AppError('User đã tồn tại', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });

    // Auto-issue token after registration
    const token = jwt.sign(
        { sub: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        token,
        user: { username: user.username, role: user.role }
    });
});

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        throw new AppError('Sai tài khoản hoặc mật khẩu', 401);
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        throw new AppError('Sai tài khoản hoặc mật khẩu', 401);
    }

    const token = jwt.sign(
        { sub: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        success: true,
        token,
        user: { username: user.username, role: user.role }
    });
});

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.sub).select('username role points tier');
    if (!user) {
        throw new AppError('Không tìm thấy user', 404);
    }
    res.json({ success: true, data: user });
});

module.exports = { register, login, getMe };
