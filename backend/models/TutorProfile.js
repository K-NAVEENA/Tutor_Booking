const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subjects: [{ type: String }],
  experience: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  description: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
});

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
