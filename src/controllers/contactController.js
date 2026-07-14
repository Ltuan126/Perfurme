const Contact = require('../models/Contact');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Gửi liên hệ
// @route   POST /api/contact
// @access  Public
const createContact = asyncHandler(async (req, res) => {
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, data: contact });
});

// @desc    Lấy tất cả liên hệ
// @route   GET /api/contact
// @access  Admin
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, data: contacts });
});

module.exports = {
    createContact,
    getContacts
};
