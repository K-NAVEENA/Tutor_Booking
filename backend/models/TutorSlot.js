const mongoose = require('mongoose');

const tutorSlotSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TutorSlot', tutorSlotSchema);
