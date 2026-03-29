const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../middleware/auth');
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
        { expiresIn: JWT_EXPIRES_IN }
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
        { expiresIn: JWT_EXPIRES_IN }
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
    const user = await User.findById(req.user.sub).select('username role points tier fullName email phone address dateOfBirth gender');
    if (!user) {
        throw new AppError('Không tìm thấy user', 404);
    }
    res.json({ success: true, data: user });
});

// @desc    Cập nhật thông tin user hiện tại
// @route   PUT /api/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.sub);
    if (!user) {
        throw new AppError('Không tìm thấy user', 404);
    }

    const updates = req.body || {};

    if (Object.prototype.hasOwnProperty.call(updates, 'fullName')) {
        user.fullName = String(updates.fullName || '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'email')) {
        user.email = String(updates.email || '').trim().toLowerCase();
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'phone')) {
        user.phone = String(updates.phone || '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'address')) {
        user.address = String(updates.address || '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'gender')) {
        user.gender = String(updates.gender || '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'dateOfBirth')) {
        if (!updates.dateOfBirth) {
            user.dateOfBirth = null;
        } else {
            const parsedDate = new Date(updates.dateOfBirth);
            if (Number.isNaN(parsedDate.getTime())) {
                throw new AppError('Ngày sinh không hợp lệ', 400);
            }
            user.dateOfBirth = parsedDate;
        }
    }

    await user.save();

    res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: {
            username: user.username,
            role: user.role,
            points: user.points,
            tier: user.tier,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender
        }
    });
});

module.exports = { register, login, getMe, updateMe };
