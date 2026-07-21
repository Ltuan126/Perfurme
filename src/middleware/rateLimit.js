const { rateLimit } = require('express-rate-limit');

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const authWindowMs = toInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const loginMaxAttempts = toInt(process.env.AUTH_RATE_LIMIT_LOGIN_MAX, 10);
const registerMaxAttempts = toInt(process.env.AUTH_RATE_LIMIT_REGISTER_MAX, 5);
const refreshMaxAttempts = toInt(process.env.AUTH_RATE_LIMIT_REFRESH_MAX, 30);

const authLoginLimiter = rateLimit({
  windowMs: authWindowMs,
  max: loginMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.'
  }
});

const authRegisterLimiter = rateLimit({
  windowMs: authWindowMs,
  max: registerMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Đăng ký quá nhiều lần. Vui lòng thử lại sau ít phút.'
  }
});

// Refresh có thể bị gọi lặp lại hợp lệ (nhiều tab) nên nới hơn login/register,
// nhưng vẫn cần chặn để tránh brute-force refresh token bị lộ.
const authRefreshLimiter = rateLimit({
  windowMs: authWindowMs,
  max: refreshMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu làm mới phiên đăng nhập. Vui lòng thử lại sau ít phút.'
  }
});

module.exports = {
  authLoginLimiter,
  authRegisterLimiter,
  authRefreshLimiter
};
