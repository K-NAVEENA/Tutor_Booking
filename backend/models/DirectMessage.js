const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  senderRole: { type: String, default: 'admin' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  readStatus: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DirectMessage', directMessageSchema);
