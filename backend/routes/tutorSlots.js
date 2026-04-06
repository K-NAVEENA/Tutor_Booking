const express = require('express');
const router = express.Router();
const TutorSlot = require('../models/TutorSlot');
const Booking = require('../models/Booking');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Tutor creates slot
router.post('/tutor/slots', authMiddleware, roleMiddleware(['tutor']), async (req, res) => {
  try {
    const { course, date, timeSlot } = req.body;
    const newSlot = new TutorSlot({
      tutorId: req.user.id,
      course,
      date,
      timeSlot,
      isBooked: false
    });
    await newSlot.save();
    res.status(201).json({ message: 'Slot added successfully', slot: newSlot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Tutor gets their own slots
router.get('/tutor/slots', authMiddleware, roleMiddleware(['tutor']), async (req, res) => {
  try {
    const slots = await TutorSlot.find({ tutorId: req.user.id }).sort({ date: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete slot
router.delete('/tutor/slots/:id', authMiddleware, roleMiddleware(['tutor']), async (req, res) => {
  try {
    const slot = await TutorSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ message: 'Cannot delete booked slot' });
    await TutorSlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student gets tutor's slots
router.get('/student/tutor/:id/slots', authMiddleware, async (req, res) => {
  try {
    const slots = await TutorSlot.find({ tutorId: req.params.id, isBooked: false }).sort({ date: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student books via slot
router.post('/student/book-slot', authMiddleware, roleMiddleware(['student']), async (req, res) => {
  try {
    const { tutorId, slotId } = req.body;
    const slot = await TutorSlot.findById(slotId);
    if (!slot || slot.isBooked) return res.status(400).json({ message: 'Slot unavailable' });

    const booking = new Booking({
      studentId: req.user.id,
      tutorId,
      slotId,
      date: slot.date,
      timeSlot: slot.timeSlot,
      status: 'pending'
    });
    
    // Mark slot as pending booked? The user prompt doesn't say mark it as booked yet, but usually we mark as booked once approved. Actually, I'll keep it as isBooked = false until approved.
    await booking.save();
    res.status(201).json({ message: 'Booking request sent', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Confirm/Reject flow (for tutor)
router.put('/tutor/booking/:id/:action', authMiddleware, roleMiddleware(['tutor']), async (req, res) => {
  try {
    const { action } = req.params;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (action === 'approved') {
      booking.status = 'approved';
      if (booking.slotId) {
        await TutorSlot.findByIdAndUpdate(booking.slotId, { isBooked: true });
      }
    } else if (action === 'rejected') {
      booking.status = 'rejected';
    }

    await booking.save();

    // Notification Logic (Assume already there as the summary mentions notification bells)
    const Notification = require('../models/Notification');
    const studentNotification = new Notification({
      userId: booking.studentId,
      type: 'BOOKING_UPDATE',
      message: `Your booking request has been ${action}.`,
      isRead: false
    });
    await studentNotification.save();

    res.json({ message: `Booking ${action}ed successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
