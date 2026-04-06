const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const AdminRequest = require('../models/AdminRequest');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public Contact Form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Access Request (Requires Authentication)
router.post('/admin-request', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    // Check if a request already exists
    const existing = await AdminRequest.findOne({ userId, status: 'pending' });
    if (existing) return res.status(400).json({ message: 'A request is already pending.' });

    const newRequest = new AdminRequest({ userId, email });
    await newRequest.save();
    res.status(201).json({ message: 'Admin access request sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
