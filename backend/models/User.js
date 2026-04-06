const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'tutor', 'admin'], required: true },
  phoneNumber: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
