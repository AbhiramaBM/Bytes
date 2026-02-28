import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Payment from '../models/Payment.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { generateToken } from '../utils/tokenUtils.js';
import { logAction } from '../utils/auditLogger.js';
import { createAutoRemindersForPrescription } from '../utils/medicineReminderUtils.js';

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
    const {
      email,
      password,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      googleMapsLink,
      specialization,
      experience,
      experienceYears,
      registrationNumber,
      consultationFee,
      availableSlots = [],
      languages = [],
      education,
      hospitalName,
      profileImage
    } = req.body;

    if (!email || !password || !fullName || !address || !city || !state || !pincode) {
      return sendError(res, 'Missing required fields (email, password, fullName, address, city, state, pincode)', 400);
    }
    if ((latitude !== undefined && Number.isNaN(Number(latitude))) || (longitude !== undefined && Number.isNaN(Number(longitude)))) {
      return sendError(res, 'Invalid latitude or longitude', 400);
    }

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
      address,
      city,
      state,
      pincode,
      latitude: latitude !== undefined && latitude !== '' ? Number(latitude) : undefined,
      longitude: longitude !== undefined && longitude !== '' ? Number(longitude) : undefined,
      googleMapsLink,
      specialization,
      experience,
      experienceYears,
      registrationNumber,
      consultationFee,
      availableSlots,
      languages,
      education,
      hospitalName,
      profileImage,
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

export const getPendingPrescriptionPayments = async (req, res) => {
  try {
    const rows = await Prescription.find({ status: 'pending_payment' })
      .populate('patientId', 'fullName email phone')
      .populate('doctorId', 'fullName specialization')
      .populate('appointmentId', 'appointmentDate appointmentTime date startTime')
      .sort({ createdAt: -1 });

    const data = rows.map((p) => ({
      _id: p._id,
      status: p.status,
      totalAmount: p.totalAmount || 0,
      currency: p.currency || 'INR',
      createdAt: p.createdAt,
      patient: p.patientId ? {
        _id: p.patientId._id,
        fullName: p.patientId.fullName,
        email: p.patientId.email,
        phone: p.patientId.phone
      } : null,
      doctor: p.doctorId ? {
        _id: p.doctorId._id,
        fullName: p.doctorId.fullName,
        specialization: p.doctorId.specialization
      } : null,
      appointment: p.appointmentId ? {
        _id: p.appointmentId._id,
        appointmentDate: p.appointmentId.appointmentDate || p.appointmentId.date,
        appointmentTime: p.appointmentId.appointmentTime || p.appointmentId.startTime
      } : null
    }));

    sendSuccess(res, data, 'Pending prescription payments fetched');
  } catch (error) {
    sendError(res, 'Error fetching pending prescription payments', 500, error);
  }
};

export const adminUnlockPrescriptionPayment = async (req, res) => {
  try {
    const adminId = req.user?.userId;
    const { prescriptionId } = req.params;
    const { reason = 'manual admin unlock' } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      return sendError(res, 'Invalid prescriptionId', 400);
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) return sendError(res, 'Prescription not found', 404);

    if (prescription.status !== 'paid') {
      prescription.status = 'paid';
      await prescription.save();
    }

    const appointment = await Appointment.findById(prescription.appointmentId);
    if (appointment && appointment.status !== 'completed') {
      appointment.status = 'completed';
      await appointment.save();
    }

    let payment = await Payment.findOne({
      prescriptionId: prescription._id,
      patientId: prescription.patientId,
      status: 'success'
    });

    if (!payment) {
      // Reuse pending payment if it exists, otherwise create a success record.
      payment = await Payment.findOne({
        prescriptionId: prescription._id,
        patientId: prescription.patientId,
        status: 'pending'
      });

      if (payment) {
        payment.status = 'success';
        payment.gatewayPaymentId = payment.gatewayPaymentId || `ADMIN-${Date.now()}-${prescription._id.toString().slice(-6)}`;
        payment.verifiedAt = new Date();
        await payment.save();
      } else {
        payment = await Payment.create({
          prescriptionId: prescription._id,
          patientId: prescription.patientId,
          doctorId: prescription.doctorId,
          appointmentId: prescription.appointmentId,
          amount: prescription.totalAmount || 0,
          currency: prescription.currency || 'INR',
          status: 'success',
          gatewayPaymentId: `ADMIN-${Date.now()}-${prescription._id.toString().slice(-6)}`,
          verifiedAt: new Date()
        });
      }
    }

    const reminderCount = await createAutoRemindersForPrescription({
      patientId: prescription.patientId,
      prescriptionId: prescription._id,
      appointmentId: prescription.appointmentId,
      medicines: prescription.medicines || []
    });

    await logAction(adminId, 'ADMIN_UNLOCK_PRESCRIPTION_PAYMENT', {
      prescriptionId: prescription._id,
      appointmentId: prescription.appointmentId,
      paymentId: payment._id,
      reason,
      reminderCount
    });

    const payload = {
      prescriptionId: prescription._id,
      paymentId: payment._id,
      appointmentId: prescription.appointmentId,
      reminderCount
    };

    sendSuccess(res, payload, 'Prescription payment unlocked by admin');
  } catch (error) {
    sendError(res, 'Failed to unlock prescription payment', 500, error);
  }
};

