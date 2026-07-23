const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET;
const ACCESS_TOKEN_TTL = JWT_EXPIRES_IN;
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
const MAX_ACTIVE_SESSIONS = 5;

// Refresh token chỉ lưu dạng hash SHA-256 trong DB — DB bị lộ cũng không dùng lại được token
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function parseCookies(req) {
    const header = req.headers.cookie || '';
    return header.split(';').reduce((acc, part) => {
        const index = part.indexOf('=');
        if (index === -1) return acc;
        const key = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();
        if (key) acc[key] = decodeURIComponent(value);
        return acc;
    }, {});
}

function cookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30
    };
}

function signAccessToken(user) {
    return jwt.sign(
        { sub: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );
}

function signRefreshToken(user) {
    // jti ngẫu nhiên để 2 token ký trong cùng 1 giây vẫn khác nhau —
    // nếu không, rotation sẽ vô nghĩa vì hash trùng nhau
    return jwt.sign(
        { sub: user._id, jti: crypto.randomUUID() },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_TTL }
    );
}

function attachRefreshCookie(res, refreshToken) {
    res.cookie('refresh_token', refreshToken, cookieOptions());
}

function clearRefreshCookie(res) {
    res.clearCookie('refresh_token', {
        ...cookieOptions(),
        maxAge: undefined
    });
}

function buildUserResponse(user) {
    return {
        username: user.username,
        role: user.role,
        points: user.points,
        tier: user.tier
    };
}

// Ký cặp token mới + lưu hash refresh token vào DB (dọn token hết hạn,
// giới hạn MAX_ACTIVE_SESSIONS phiên — vượt thì loại phiên cũ nhất)
async function issueSession(res, user) {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const { exp } = jwt.decode(refreshToken);
    const now = Date.now();
    const active = (user.refreshTokens || []).filter(t => t.expiresAt && t.expiresAt.getTime() > now);
    active.push({ tokenHash: hashToken(refreshToken), createdAt: new Date(now), expiresAt: new Date(exp * 1000) });
    user.refreshTokens = active.slice(-MAX_ACTIVE_SESSIONS);
    await user.save();

    attachRefreshCookie(res, refreshToken);
    return { accessToken, user: buildUserResponse(user) };
}

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

    const session = await issueSession(res, user);

    res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        ...session,
        token: session.accessToken
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

    const session = await issueSession(res, user);

    res.json({
        success: true,
        ...session,
        token: session.accessToken
    });
});

// @desc    Refresh access token using HttpOnly cookie
// @route   POST /api/auth/refresh
// @access  Public (cookie-based)
const refresh = asyncHandler(async (req, res) => {
    const cookies = parseCookies(req);
    const refreshToken = cookies.refresh_token;

    if (!refreshToken) {
        throw new AppError('Thiếu refresh token', 401);
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch {
        throw new AppError('Refresh token không hợp lệ hoặc đã hết hạn', 401);
    }

    const user = await User.findById(payload.sub);
    if (!user) {
        throw new AppError('Refresh token không còn hiệu lực', 401);
    }

    // Token phải tồn tại trong danh sách phiên đang hoạt động (đã bị logout/thu hồi → từ chối)
    const incomingHash = hashToken(refreshToken);
    const known = (user.refreshTokens || []).some(t => t.tokenHash === incomingHash);
    if (!known) {
        throw new AppError('Refresh token không còn hiệu lực', 401);
    }

    // Rotation: thu hồi token cũ ngay khi dùng — mỗi refresh token chỉ dùng được 1 lần
    user.refreshTokens = user.refreshTokens.filter(t => t.tokenHash !== incomingHash);

    const session = await issueSession(res, user);

    res.json({
        success: true,
        ...session,
        token: session.accessToken
    });
});

// @desc    Logout current session
// @route   POST /api/auth/logout
// @access  Public (cookie-based)
const logout = asyncHandler(async (req, res) => {
    const cookies = parseCookies(req);
    const refreshToken = cookies.refresh_token;

    if (refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const user = await User.findById(payload.sub);
            if (user) {
                // Chỉ thu hồi phiên này (per-device) — các thiết bị khác vẫn đăng nhập
                const incomingHash = hashToken(refreshToken);
                user.refreshTokens = (user.refreshTokens || []).filter(t => t.tokenHash !== incomingHash);
                await user.save();
            }
        } catch {
            // Ignore invalid token on logout and just clear cookie.
        }
    }

    clearRefreshCookie(res);
    res.json({ success: true, message: 'Đã đăng xuất' });
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

module.exports = { register, login, refresh, logout, getMe, updateMe };
