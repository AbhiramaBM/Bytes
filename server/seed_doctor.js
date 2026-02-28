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
  specialization: { type: String },
  experience: { type: String },
  consultationFee: { type: Number },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedDoctor = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcryptjs.hash('test123', 10);

    // Check if doctor exists
    const existingDoctor = await User.findOne({ email: 'doctor@test.com' });
    
    if (existingDoctor) {
      // Update existing doctor
      existingDoctor.password = hashedPassword;
      existingDoctor.fullName = 'Dr. Sarah Smith';
      existingDoctor.role = 'doctor';
      existingDoctor.specialization = 'General Medicine';
      existingDoctor.experience = '5 years';
      existingDoctor.consultationFee = 500;
      await existingDoctor.save();
      console.log('✅ Doctor user updated successfully');
    } else {
      // Create new doctor
      await User.create({
        email: 'doctor@test.com',
        password: hashedPassword,
        fullName: 'Dr. Sarah Smith',
        phone: '9876543211',
        role: 'doctor',
        specialization: 'General Medicine',
        experience: '5 years',
        consultationFee: 500
      });
      console.log('✅ Doctor user created successfully');
    }

    console.log('\nLogin credentials:');
    console.log('Email: doctor@test.com');
    console.log('Password: test123');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedDoctor();
