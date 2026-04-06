const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorSlot' },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
