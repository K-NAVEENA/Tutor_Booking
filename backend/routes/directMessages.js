const express = require('express');
const router = express.Router();
const DirectMessage = require('../models/DirectMessage');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Admin sends message to student
router.post('/admin/send', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const directMsg = new DirectMessage({
      senderRole: 'admin',
      receiverId,
      message
    });
    await directMsg.save();
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student fetches messages from admin
router.get('/student/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await DirectMessage.find({ receiverId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark as read
router.put('/messages/:id/read', authMiddleware, async (req, res) => {
  try {
    await DirectMessage.findByIdAndUpdate(req.params.id, { readStatus: true });
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
