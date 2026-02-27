import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { logAction } from '../utils/auditLogger.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return sendError(res, 'Required fields missing: email, password, and fullName are required.', 400);
    }

    const emailClean = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return sendError(res, 'Invalid email format.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password is too short. Minimum 6 characters required.', 400);
    }

    const existing = await User.findOne({ email: emailClean });
    if (existing) {
      return sendError(res, 'Email already registered. Please login instead.', 400);
    }

    const hashed = await bcryptjs.hash(password, 10);

    const user = new User({
      email: emailClean,
      password: hashed,
      fullName: fullName.trim(),
      role: 'patient',
      isVerified: true
    });

    await user.save();

    await logAction(user._id, 'REGISTER', { email: emailClean, role: 'patient' });

    sendSuccess(res, {
      userId: user._id,
      email: emailClean,
      fullName: user.fullName,
      role: user.role
    }, 'User registered successfully.', 201);
  } catch (error) {
    sendError(res, 'Registration failed due to server error.', 500, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required', 400);

    const emailClean = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailClean });

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account deactivated. Please contact support.', 403);
    }

    const valid = await bcryptjs.compare(password, user.password);
    if (!valid) return sendError(res, 'Invalid credentials', 401);

    const token = generateToken(user._id, user.role);
    await logAction(user._id, 'LOGIN', { email: user.email, role: user.role });
    sendSuccess(res, { userId: user._id, email: user.email, fullName: user.fullName, role: user.role, token }, 'Login successful');
  } catch (error) {
    sendError(res, 'Login failed', 500, error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password -otp -otpExpiry -otpAttempts');
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, user, 'Profile fetched');
  } catch (error) {
    sendError(res, 'Error fetching profile', 500, error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, email, phone, age, gender, address, city, state, pincode } = req.body;

    if (email) {
      const emailClean = email.toLowerCase().trim();
      const existing = await User.findOne({ email: emailClean, _id: { $ne: userId } });
      if (existing) return sendError(res, 'Email already in use', 400);
      req.body.email = emailClean;
    }

    if (phone) {
      const phoneClean = phone.trim();
      if (!/^\+?[0-9]{10,15}$/.test(phoneClean)) return sendError(res, 'Invalid phone format', 400);
      const existing = await User.findOne({ phone: phoneClean, _id: { $ne: userId } });
      if (existing) return sendError(res, 'Phone already in use', 400);
      req.body.phone = phoneClean;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email: req.body.email,
        phone: req.body.phone,
        age,
        gender,
        address,
        city,
        state,
        pincode
      },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry -otpAttempts');

    if (!updatedUser) return sendError(res, 'User not found', 404);
    sendSuccess(res, updatedUser, 'Profile updated');
  } catch (error) {
    sendError(res, 'Error updating profile', 500, error);
  }
};


