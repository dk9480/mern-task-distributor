const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const email = 'admin@example.com';
    const plainPassword = 'admin123';

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = new User({
      email,
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin user created');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
