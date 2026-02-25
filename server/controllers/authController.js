import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../config/db.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { logAction } from '../utils/auditLogger.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return sendError(res, 'Required fields missing', 400);
    }

    if (password.length < 6) return sendError(res, 'Password too short', 400);

    const emailClean = email.toLowerCase().trim();
    const existing = await get('SELECT id FROM users WHERE email = ?', [emailClean]);
    if (existing) return sendError(res, 'Email already registered', 400);

    const hashed = await bcryptjs.hash(password, 10);
    const userId = uuidv4();
    const patientProfileId = uuidv4();

    await run('BEGIN TRANSACTION');
    try {
      await run(
        'INSERT INTO users (id, email, password, fullName, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, emailClean, hashed, fullName.trim(), phone, 'patient']
      );

      // Create patient profile
      await run(
        'INSERT INTO patients (id, user_id) VALUES (?, ?)',
        [patientProfileId, userId]
      );

      await run('COMMIT');
    } catch (err) {
      await run('ROLLBACK');
      throw err;
    }

    await logAction(userId, 'REGISTER', { email: emailClean, role: 'patient' });
    const token = generateToken(userId, 'patient');
    sendSuccess(res, { userId, email: emailClean, fullName, role: 'patient', token }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'Registration failed', 500, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required', 400);

    const emailClean = email.toLowerCase().trim();
    const user = await get('SELECT * FROM users WHERE email = ?', [emailClean]);

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (user.isDeleted) {
      return sendError(res, 'Account deactivated. Please contact support.', 403);
    }

    const valid = await bcryptjs.compare(password, user.password);
    if (!valid) return sendError(res, 'Invalid credentials', 401);

    const token = generateToken(user.id, user.role);
    await logAction(user.id, 'LOGIN', { email: user.email, role: user.role });
    sendSuccess(res, { userId: user.id, email: user.email, fullName: user.fullName, role: user.role, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500, error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await get('SELECT id, email, fullName, phone, role, age, gender, address, city, state, pincode FROM users WHERE id = ? AND isDeleted = 0', [userId]);
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

    // 1. Email validation if provided
    if (email) {
      const emailClean = email.toLowerCase().trim();
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailClean)) {
        return sendError(res, 'Invalid email format', 400);
      }

      const existing = await get('SELECT id FROM users WHERE email = ? AND id != ?', [emailClean, userId]);
      if (existing) return sendError(res, 'Email already in use by another account', 400);
      req.body.email = emailClean;
    }

    // 2. Phone validation if provided
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
      return sendError(res, 'Invalid phone number format', 400);
    }

    await run(
      `UPDATE users SET 
        fullName = COALESCE(?, fullName), 
        email = COALESCE(?, email),
        phone = COALESCE(?, phone), 
        age = COALESCE(?, age), 
        gender = COALESCE(?, gender), 
        address = COALESCE(?, address), 
        city = COALESCE(?, city), 
        state = COALESCE(?, state), 
        pincode = COALESCE(?, pincode),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [fullName, req.body.email || null, phone, age, gender, address, city, state, pincode, userId]
    );

    const user = await get('SELECT id, email, fullName, phone, role, age, gender, address, city, state, pincode FROM users WHERE id = ?', [userId]);
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    sendError(res, 'Error updating profile', 500, error);
  }
};
