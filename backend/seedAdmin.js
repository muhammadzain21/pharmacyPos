require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacy';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = 'admin@gmail.com';
    const password = 'admin1234';
    const role = 'admin';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists:', email);
    } else {
      const user = new User({ email, password, role });
      await user.save();
      console.log('Admin user created successfully:', email);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
})();
