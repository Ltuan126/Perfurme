const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Thiếu username hoặc password' });
    const exist = await User.findOne({ username });
    if (exist) return res.status(409).json({ message: 'User đã tồn tại' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    // Tự động cấp token để khỏi phải đăng nhập lại
    const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    return res.status(201).json({ message: 'Đăng ký thành công', token, user: { username: user.username, role: user.role } });
  } catch (e) {
    return res.status(500).json({ message: 'Lỗi server đăng ký' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Thiếu username hoặc password' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    return res.json({ token, user: { username: user.username, role: user.role } });
  } catch (e) {
    return res.status(500).json({ message: 'Lỗi server đăng nhập' });
  }
});

module.exports = router;
