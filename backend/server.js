require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const tutorRoutes = require('./routes/tutor');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const publicRoutes = require('./routes/public');
const directMessageRoutes = require('./routes/directMessages');
const tutorSlotRoutes = require('./routes/tutorSlots');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Seed Admin
    try {
      const adminExists = await User.findOne({ email: 'admin@tutorplatform.com' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const admin = new User({
          name: 'Super Admin',
          email: 'admin@tutorplatform.com',
          password: hashedPassword,
          role: 'admin',
          phoneNumber: '0000000000'
        });
        await admin.save();
        console.log('Default admin created: admin@tutorplatform.com / admin123');
      }
    } catch (err) {
      console.error('Error seeding admin:', err);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', publicRoutes);
app.use('/api', directMessageRoutes);
app.use('/api', tutorSlotRoutes);

app.get('/', (req, res) => {
  res.send('Tutor Booking API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
