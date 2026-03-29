const express = require('express');
const router = express.Router();
const { validateRegister, validateLogin } = require('../middleware/validate');
const { register, login } = require('../controllers/authController');
const { authLoginLimiter, authRegisterLimiter } = require('../middleware/rateLimit');

// Register
router.post('/register', authRegisterLimiter, validateRegister, register);

// Login
router.post('/login', authLoginLimiter, validateLogin, login);

module.exports = router;
