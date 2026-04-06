const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['student', 'admin']));

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id }).populate('tutorId', 'name email phoneNumber');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/bookings', async (req, res) => {
  try {
    const { tutorId, date, timeSlot } = req.body;
    const booking = new Booking({
      studentId: req.user.id,
      tutorId,
      date,
      timeSlot
    });
    await booking.save();
    res.status(201).json({ message: 'Booking request sent successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phoneNumber }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const Feedback = require('../models/Feedback');

router.post('/feedback', async (req, res) => {
  try {
    const { tutorId, rating, comment } = req.body;
    const feedback = new Feedback({
      studentId: req.user.id,
      tutorId,
      rating,
      comment,
      role: 'student'
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
