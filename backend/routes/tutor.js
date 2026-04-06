const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Public route to get all tutors
router.get('/', async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('-password');
    const profiles = await TutorProfile.find();
    
    // Combine data
    const tutorList = tutors.map(tutor => {
      const profile = profiles.find(p => p.userId.toString() === tutor._id.toString());
      return { ...tutor._doc, profile: profile || {} };
    });
    
    res.json(tutorList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Protected routes for tutor
router.use(authMiddleware);
router.use(roleMiddleware(['tutor', 'admin']));

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ tutorId: req.user.id }).populate('studentId', 'name email phoneNumber');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/booking/:id/approve', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, tutorId: req.user.id },
      { status: 'approved' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Notify the student
    const tutor = await User.findById(req.user.id).select('name');
    await Notification.create({
      userId: booking.studentId,
      message: `Your booking with ${tutor.name} has been approved! Date: ${booking.date} at ${booking.timeSlot}.`,
      role: 'student'
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map(admin =>
      Notification.create({
        userId: admin._id,
        message: `Tutor ${tutor.name} approved a booking (${booking.date} at ${booking.timeSlot}).`,
        role: 'admin'
      })
    ));

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/booking/:id/reject', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, tutorId: req.user.id },
      { status: 'rejected' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { subjects, experience, price, description } = req.body;
    let profile = await TutorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { subjects, experience, price, description },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const Feedback = require('../models/Feedback');

router.post('/feedback', async (req, res) => {
  try {
    const { studentId, rating, comment } = req.body;
    const feedback = new Feedback({
      tutorId: req.user.id,
      studentId,
      rating,
      comment,
      role: 'tutor'
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
