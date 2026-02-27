import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Appointment from '../models/Appointment.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { generateToken } from '../utils/tokenUtils.js';
import { logAction } from '../utils/auditLogger.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: { $ne: false } });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: { $ne: false } });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const totalClinics = await Clinic.countDocuments();

    sendSuccess(res, {
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      totalClinics
    }, 'Dashboard data fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching dashboard', 500, error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let queryObj = { isActive: { $ne: false } };

    if (search) {
      queryObj.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      queryObj.role = role;
    }

    const users = await User.find(queryObj)
      .select('email fullName phone role createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(queryObj);

    sendSuccess(res, {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    }, 'Users fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching users', 500, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) return sendError(res, 'User not found', 404);

    user.isActive = false;
    await user.save();

    await logAction(adminId, 'SOFT_DELETE_USER', { targetUserId: userId, name: user.fullName, role: user.role });

    sendSuccess(res, { message: 'User deactivated' }, 'User deactivated successfully');
  } catch (error) {
    sendError(res, 'Error deactivating user', 500, error);
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required', 400);

    const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' });
    if (!user) return sendError(res, 'Invalid admin credentials', 401);

    const valid = await bcryptjs.compare(password, user.password);
    if (!valid) return sendError(res, 'Invalid admin credentials', 401);

    const token = generateToken(user._id, user.role);
    sendSuccess(res, { userId: user._id, email: user.email, fullName: user.fullName, role: user.role, token }, 'Admin login successful');
  } catch (error) {
    sendError(res, 'Admin login failed', 500, error);
  }
};

export const getDoctorsForAdmin = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    let queryObj = { role: 'doctor', isActive: { $ne: false } };

    if (search) {
      queryObj.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      queryObj.isActive = isActive === 'true';
    }

    const doctors = await User.find(queryObj).sort({ createdAt: -1 });
    sendSuccess(res, doctors, 'Doctors fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching doctors', 500, error);
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { email, password, fullName, phone, specialization, experience, registrationNumber, consultationFee } = req.body;
    if (!email || !password || !fullName) return sendError(res, 'Missing required fields', 400);

    const emailClean = email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailClean });
    if (existing) return sendError(res, 'Email already registered', 400);

    const hashed = await bcryptjs.hash(password, 10);

    const user = new User({
      email: emailClean,
      password: hashed,
      fullName: fullName.trim(),
      phone,
      role: 'doctor',
      specialization,
      experience,
      registrationNumber,
      consultationFee,
      isVerified: true // Admins create verified accounts
    });

    await user.save();
    await logAction(req.user?.userId, 'CREATE_DOCTOR', { email: emailClean, fullName, doctorId: user._id });

    sendSuccess(res, user, 'Doctor created successfully', 201);
  } catch (error) {
    sendError(res, 'Error creating doctor', 500, error);
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const activeAppointments = await Appointment.findOne({ doctorId, status: { $in: ['pending', 'approved', 'appointed'] } });
    if (activeAppointments) return sendError(res, 'Cannot deactivate doctor with active appointments', 400);

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') return sendError(res, 'Doctor not found', 404);

    doctor.isActive = false;
    await doctor.save();

    await logAction(req.user?.userId, 'SOFT_DELETE_DOCTOR', { doctorId });

    sendSuccess(res, { message: 'Doctor profile deactivated' }, 'Doctor deactivated successfully');
  } catch (error) {
    sendError(res, 'Error deactivating doctor', 500, error);
  }
};

export const getPatientsForAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    let queryObj = { role: 'patient', isActive: { $ne: false } };

    if (search) {
      queryObj.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await User.find(queryObj).sort({ createdAt: -1 });
    sendSuccess(res, patients, 'Patients fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching patients', 500, error);
  }
};

export const getAllAppointmentsForAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    let queryObj = {};

    if (status) {
      queryObj.status = status;
    }

    // Search is complex with population, but for simplicity let's handle via post-filter or basic refs if needed
    // For now, let's just do status filter and simple populate
    const appointments = await Appointment.find(queryObj)
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName specialization')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    sendSuccess(res, appointments, 'Appointments fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching appointments', 500, error);
  }
};

export const updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { isActive } = req.body;
    const updated = await User.findByIdAndUpdate(doctorId, { isActive }, { new: true });
    if (!updated) return sendError(res, 'Doctor not found', 404);
    sendSuccess(res, { isActive: updated.isActive }, 'Doctor status updated');
  } catch (error) {
    sendError(res, 'Error updating doctor status', 500, error);
  }
};

export const getSystemAnalytics = async (req, res) => {
  try {
    // This requires audit_logs collection or similar. 
    // For now return placeholder until audit logger is refactored
    sendSuccess(res, { totalLogins: 0, totalBookings: 0, totalPrescriptions: 0 }, 'Analytics fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching analytics', 500, error);
  }
};

