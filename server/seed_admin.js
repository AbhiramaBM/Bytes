import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ruralcare';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['admin', 'doctor', 'patient', 'user'], default: 'patient' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcryptjs.hash('test123', 10);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    
    if (existingAdmin) {
      // Update existing admin
      existingAdmin.password = hashedPassword;
      existingAdmin.fullName = 'Admin User';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully');
    } else {
      
      await User.create({
        email: 'admin@test.com',
        password: hashedPassword,
        fullName: 'Admin User',
        phone: '9876543212',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully');
    }

    console.log('\nLogin credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: test123');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
