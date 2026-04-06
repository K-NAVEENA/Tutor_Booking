const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber
    });
    await user.save();

    if (role === 'tutor') {
      const TutorProfile = require('../models/TutorProfile');
      const profile = new TutorProfile({ userId: user._id });
      await profile.save();

      // Notify all admins about new tutor
      const admins = await User.find({ role: 'admin' }).select('_id');
      await Promise.all(admins.map(admin =>
        Notification.create({
          userId: admin._id,
          message: `New tutor "${name}" has joined the platform. Review their profile.`,
          role: 'admin'
        })
      ));

      // Notify all students about new tutor
      const allStudents = await User.find({ role: 'student' }).select('_id');
      await Promise.all(allStudents.map(student =>
        Notification.create({
          userId: student._id,
          message: `A new tutor "${name}" has joined TutorBook! Check out their profile.`,
          role: 'student'
        })
      ));
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.isBanned) return res.status(403).json({ message: 'Your account has been banned by the administrator.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
