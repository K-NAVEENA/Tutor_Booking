const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const Message = require('../models/Message');
const AdminRequest = require('../models/AdminRequest');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/tutors', async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password');
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('studentId', 'name')
      .populate('tutorId', 'name');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const tutorCount = await User.countDocuments({ role: 'tutor' });
    const bookingCount = await Booking.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    
    res.json({
      totalStudents: studentCount,
      totalTutors: tutorCount,
      totalBookings: bookingCount,
      totalCourses: tutorCount,
      totalFeedback: feedbackCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Ban / Unban a user
router.put('/user/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBanned = true;
    await user.save();
    res.json({ message: `${user.name} has been banned.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/user/:id/unban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBanned = false;
    await user.save();
    res.json({ message: `${user.name} has been unbanned.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel / Delete a booking
router.delete('/booking/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking cancelled and removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Message Management
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/messages/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    msg.adminReply = reply;
    msg.status = 'resolved';
    await msg.save();
    res.json({ message: 'Reply sent and message resolved.', msg });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/messages/:id/resolve', async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    msg.status = 'resolved';
    await msg.save();
    res.json({ message: 'Marked as resolved.', msg });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Request Management
router.get('/requests', async (req, res) => {
  try {
    const requests = await AdminRequest.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/requests/:id/:action', async (req, res) => {
  try {
    const { action } = req.params;
    const request = await AdminRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (action === 'approve') {
      request.status = 'approved';
      await User.findByIdAndUpdate(request.userId, { role: 'admin' });
    } else if (action === 'reject') {
      request.status = 'rejected';
    }
    
    await request.save();
    res.json({ message: `Request ${action}ed successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
