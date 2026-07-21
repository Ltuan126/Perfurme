const express = require('express');
const router = express.Router();
const { validateRegister, validateLogin } = require('../middleware/validate');
const { register, login, refresh, logout } = require('../controllers/authController');
const { authLoginLimiter, authRegisterLimiter, authRefreshLimiter } = require('../middleware/rateLimit');

// Register
router.post('/register', authRegisterLimiter, validateRegister, register);

// Login
router.post('/login', authLoginLimiter, validateLogin, login);

// Refresh access token using HttpOnly cookie
router.post('/refresh', authRefreshLimiter, refresh);

// Logout and invalidate refresh token cookie
router.post('/logout', logout);

module.exports = router;
