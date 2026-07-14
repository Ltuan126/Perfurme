const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { validateContact } = require('../middleware/validate');
const { createContact, getContacts } = require('../controllers/contactController');

// Public: gửi liên hệ
router.post('/', validateContact, createContact);

// Admin: xem danh sách liên hệ
router.get('/', isAuthenticated, isAdmin, getContacts);

module.exports = router;
