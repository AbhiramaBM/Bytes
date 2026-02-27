import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  specialization: { type: String },
  experience: { type: String },
  consultationFee: { type: Number },
  role: { type: String, enum: ['admin', 'doctor', 'patient', 'user'], default: 'patient' },
  age: { type: Number },
  gender: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  registrationNumber: { type: String, unique: true, sparse: true },
  bloodGroup: { type: String },
  medicalHistory: { type: String },
}, { timestamps: true });


const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
