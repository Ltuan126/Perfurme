const express = require('express');
const router = express.Router();
const { validateRegister, validateLogin } = require('../middleware/validate');
const { register, login } = require('../controllers/authController');

// Register
router.post('/register', validateRegister, register);

// Login
router.post('/login', validateLogin, login);

module.exports = router;
