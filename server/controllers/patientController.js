import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Clinic from '../models/Clinic.js';
import Prescription from '../models/Prescription.js';
import HealthRecord from '../models/HealthRecord.js';
import Reminder from '../models/Reminder.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { logAction } from '../utils/auditLogger.js';
import { getPaymentLinkForPrescription } from '../utils/paymentLinkUtils.js';

const toMinutes = (time) => {
  const [hours, minutes] = `${time}`.split(':').map(Number);
  return (hours * 60) + minutes;
};

const fromMinutes = (value) => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
};

const buildDailySlots = () => {
  const slots = [];
  for (let t = 9 * 60; t < 18 * 60; t += 30) {
    slots.push(fromMinutes(t));
  }
  return slots;
};

const sanitizeText = (value = '') => `${value}`.replace(/[<>$]/g, '').trim();

const computeEndTime = (startTime) => {
  const mins = toMinutes(startTime) + 30;
  return fromMinutes(mins);
};

const scoreSlot = ({ slot, preferredTime, patientPreferredHours = [] }) => {
  const slotMinutes = toMinutes(slot);
  const preferredMinutes = preferredTime ? toMinutes(preferredTime) : slotMinutes;
  const distancePenalty = Math.abs(slotMinutes - preferredMinutes);
  const hour = Number(slot.split(':')[0]);
  const patientBonus = patientPreferredHours.includes(hour) ? -20 : 0;

  return distancePenalty + patientBonus;
};

export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { doctorId, clinicId, appointmentDate, appointmentTime, reason, consultationType, aiTriage } = req.body;
    const date = appointmentDate;
    const startTime = appointmentTime;

    if (!doctorId || !date || !startTime) {
      return sendError(res, 'Missing required fields: doctorId, appointmentDate, and appointmentTime are required.', 400);
    }

    // Validate doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return sendError(res, 'Doctor not found. Please select a valid doctor.', 404);
    }

    const appointment = await Appointment.create({
      patientId: userId,
      doctorId,
      clinicId: clinicId || null,
      date,
      startTime,
      endTime: computeEndTime(startTime),
      appointmentDate: date,
      appointmentTime: startTime,
      reason: sanitizeText(reason || ''),
      aiTriage: aiTriage || undefined,
      consultationType: consultationType || 'in-person',
      status: 'booked'
    });

    // Notify doctor with AI triage summary if available
    if (aiTriage?.riskLevel || aiTriage?.symptoms?.length) {
      const summary = [
        'Pre-consultation AI triage submitted.',
        aiTriage.symptoms?.length ? `Symptoms: ${aiTriage.symptoms.join(', ')}` : '',
        aiTriage.riskLevel ? `Risk: ${aiTriage.riskLevel}` : '',
        aiTriage.likelyConditions?.length ? `Likely: ${aiTriage.likelyConditions.slice(0, 3).join(', ')}` : ''
      ].filter(Boolean).join(' ');

      await Message.create({
        senderId: userId,
        receiverId: doctorId,
        message: summary
      });
    }

    await logAction(userId, 'BOOK_APPOINTMENT', { appointmentId: appointment._id, doctorId, date, startTime });
    sendSuccess(res, { appointmentId: appointment._id }, 'Appointment booked successfully', 201);
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, 'This time slot is already booked. Please choose a different time.', 409);
    }
    console.error('[BOOKING] Error:', error);
    sendError(res, `Booking failed: ${error.message}`, 500);
  }
};

export const suggestAppointmentTime = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { doctorId, appointmentDate, preferredTime } = req.body;

    if (!doctorId || !appointmentDate) {
      return sendError(res, 'doctorId and appointmentDate are required', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return sendError(res, 'Invalid doctorId', 400);
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: { $ne: false } });
    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    const existingAppointments = await Appointment.find({
      doctorId,
      date: appointmentDate,
      status: { $nin: ['rejected', 'cancelled'] }
    }).select('startTime');

    const bookedSlots = new Set(existingAppointments.map((item) => item.startTime));
    const allSlots = buildDailySlots();
    const availableSlots = allSlots.filter((slot) => !bookedSlots.has(slot));

    if (availableSlots.length === 0) {
      return sendSuccess(res, { suggestedSlots: [] }, 'No slots available for the selected date');
    }

    const patientHistory = await Appointment.find({ patientId })
      .select('startTime')
      .sort({ createdAt: -1 })
      .limit(20);

    const preferredHours = patientHistory
      .map((a) => Number(`${a.startTime}`.split(':')[0]))
      .filter((n) => Number.isFinite(n));

    const suggestions = availableSlots
      .map((slot) => ({
        time: slot,
        score: scoreSlot({ slot, preferredTime, patientPreferredHours: preferredHours })
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((item) => item.time);

    sendSuccess(res, { suggestedSlots: suggestions }, 'Suggested available time slots fetched successfully');
  } catch (error) {
    sendError(res, 'Error suggesting appointment time', 500, error);
  }
};

export const getAppointmentSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return sendError(res, 'doctorId and date are required', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return sendError(res, 'Invalid doctorId', 400);
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: { $ne: false } })
      .select('availableSlots');
    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    const allSlots = doctor.availableSlots?.length ? doctor.availableSlots : buildDailySlots();
    const booked = await Appointment.find({
      doctorId,
      date,
      status: { $nin: ['rejected', 'cancelled'] }
    }).select('startTime');

    const bookedSet = new Set(booked.map((item) => item.startTime));
    const slots = allSlots.map((slot) => ({
      startTime: slot,
      endTime: computeEndTime(slot),
      isBooked: bookedSet.has(slot)
    }));

    sendSuccess(res, {
      date,
      doctorId,
      slots,
      availableSlots: slots.filter((s) => !s.isBooked).map((s) => s.startTime),
      bookedSlots: slots.filter((s) => s.isBooked).map((s) => s.startTime)
    }, 'Slots fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching appointment slots', 500, error);
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const appointments = await Appointment.find({ patientId: userId })
      .populate('doctorId', 'fullName specialization')
      .populate('clinicId', 'name')
      .sort({ date: -1, startTime: -1 });

    const formattedAppointments = appointments.map(appt => {
      const apptObj = appt.toObject();
      return {
        ...apptObj,
        doctorName: appt.doctorId?.fullName || 'N/A',
        specialization: appt.doctorId?.specialization || 'N/A',
        clinicName: appt.clinicId?.name || 'N/A',
        appointmentDate: appt.date || appt.appointmentDate,
        appointmentTime: appt.startTime || appt.appointmentTime,
        aiTriage: appt.aiTriage || null
      };
    });

    sendSuccess(res, formattedAppointments, 'Appointments fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching appointments', 500, error);
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;

    const appointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      patientId: userId,
      status: { $in: ['pending', 'booked'] }
    });

    if (!appointment) return sendError(res, 'Appointment not found or cannot be cancelled', 404);
    sendSuccess(res, { message: 'Appointment cancelled' }, 'Appointment cancelled successfully');
  } catch (error) {
    sendError(res, 'Error cancelling appointment', 500, error);
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const prescriptions = await Prescription.find({ patientId: userId })
      .populate('doctorId', 'fullName')
      .populate('appointmentId', 'appointmentDate appointmentTime')
      .sort({ createdAt: -1 });

    const formattedPrescriptions = prescriptions.map((p) => {
      const pObj = p.toObject();
      const isPaid = p.status === 'paid';
      return {
        ...pObj,
        prescriptionId: p._id,
        doctorName: p.doctorId?.fullName || 'Doctor',
        appointmentDate: p.appointmentId?.appointmentDate || 'N/A',
        appointmentTime: p.appointmentId?.appointmentTime || 'N/A',
        visitDate: p.appointmentId?.appointmentDate || p.createdAt,
        paymentRequired: !isPaid,
        totalAmount: p.totalAmount || 0,
        currency: p.currency || 'INR',
        paymentLink: !isPaid ? getPaymentLinkForPrescription({ prescriptionId: p._id, totalAmount: p.totalAmount || 0 }) : null,
        diagnosis: isPaid ? p.diagnosis : 'Locked until payment is successful',
        notes: isPaid ? p.notes : 'Locked until payment is successful',
        medicines: isPaid ? p.medicines : []
      };
    });

    sendSuccess(res, formattedPrescriptions, 'Prescriptions fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching prescriptions', 500, error);
  }
};

export const getMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await Prescription.find({ patientId: userId, status: 'paid' })
      .populate('doctorId', 'fullName specialization')
      .populate('appointmentId', 'appointmentDate appointmentTime reason')
      .sort({ createdAt: -1 });

    const formattedHistory = history.map((h) => {
      const hObj = h.toObject();
      const visitDate = h.appointmentId?.appointmentDate || h.createdAt;

      return {
        ...hObj,
        prescriptionId: h._id,
        doctorName: h.doctorId?.fullName || 'Unknown',
        specialization: h.doctorId?.specialization || 'N/A',
        appointmentDate: h.appointmentId?.appointmentDate || 'N/A',
        appointmentTime: h.appointmentId?.appointmentTime || 'N/A',
        visitDate,
        reason: h.appointmentId?.reason || 'N/A'
      };
    });

    sendSuccess(res, formattedHistory, 'Medical history fetched successfully');
  } catch (error) {
    console.error('Medical history error:', error);
    sendError(res, 'Error fetching medical history', 500, error);
  }
};

export const getPatientVideoRoom = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({ _id: appointmentId, patientId: userId });
    if (!appointment) return sendError(res, 'Appointment not found', 404);

    if (!['approved', 'appointed', 'completed'].includes(appointment.status)) {
      return sendError(res, 'Video room available only for approved/appointed appointments', 400);
    }

    if (!appointment.videoRoomId) {
      appointment.videoRoomId = `ruralcare-${appointment._id}-${crypto.randomBytes(4).toString('hex')}`;
      await appointment.save();
    }

    const roomUrl = `https://meet.jit.si/${appointment.videoRoomId}`;
    sendSuccess(res, { roomId: appointment.videoRoomId, roomUrl }, 'Video room fetched');
  } catch (error) {
    sendError(res, 'Error fetching video room', 500, error);
  }
};

export const getMedicalHistoryByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const currentUserId = req.user.userId;
    const role = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return sendError(res, 'Invalid patientId', 400);
    }

    const canAccess =
      role === 'admin' ||
      (role === 'patient' && currentUserId === patientId) ||
      role === 'doctor';

    if (!canAccess) {
      return sendError(res, 'Not authorized to view this medical history', 403);
    }

    const query = role === 'patient'
      ? { patientId, status: 'paid' }
      : { patientId };

    const history = await Prescription.find(query)
      .populate('doctorId', 'fullName specialization')
      .populate('appointmentId', 'appointmentDate appointmentTime reason')
      .sort({ createdAt: -1 });

    const formattedHistory = history.map((h) => ({
      ...h.toObject(),
      prescriptionId: h._id,
      doctorName: h.doctorId?.fullName || 'Unknown',
      specialization: h.doctorId?.specialization || 'N/A',
      appointmentDate: h.appointmentId?.appointmentDate || 'N/A',
      appointmentTime: h.appointmentId?.appointmentTime || 'N/A',
      visitDate: h.appointmentId?.appointmentDate || h.createdAt,
      reason: h.appointmentId?.reason || 'N/A'
    }));

    sendSuccess(res, formattedHistory, 'Medical history fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching medical history', 500, error);
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const userId = req.user.userId;

    const prescription = await Prescription.findOne({ _id: prescriptionId, patientId: userId })
      .populate('doctorId', 'fullName')
      .populate('appointmentId', 'appointmentDate');

    if (!prescription) return sendError(res, 'Prescription not found', 404);
    if (prescription.status !== 'paid') {
      return sendError(res, 'Prescription is locked until payment is completed', 402);
    }
    sendSuccess(res, prescription, 'Prescription fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching prescription', 500, error);
  }
};

export const downloadPrescription = async (req, res) => {
  try {
    sendSuccess(res, null, 'Download feature coming soon');
  } catch (error) {
    sendError(res, 'Error downloading prescription', 500, error);
  }
};

export const getHealthRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    let record = await HealthRecord.findOne({ user_id: userId });

    if (!record) {
      record = new HealthRecord({ user_id: userId });
      await record.save();
    }

    sendSuccess(res, record, 'Health records fetched');
  } catch (error) {
    console.error('Fetch health records error:', error);
    sendError(res, 'Error fetching health records', 500, error);
  }
};

export const updateHealthRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { blood_group, allergies, medical_conditions, weight, height, notes } = req.body;

    const updated = await HealthRecord.findOneAndUpdate(
      { user_id: userId },
      {
        blood_group,
        allergies,
        medical_conditions,
        weight,
        height,
        notes
      },
      { new: true, upsert: true, runValidators: true }
    );

    await logAction(userId, 'UPDATE_HEALTH_RECORDS', { recordId: updated._id });
    sendSuccess(res, updated, 'Health records updated successfully');
  } catch (error) {
    console.error('Update health records error:', error);
    sendError(res, 'Error updating records', 500, error);
  }
};

export const addMedicineReminder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, reminder_date, reminder_time } = req.body;

    if (!title || !reminder_date || !reminder_time) {
      return sendError(res, 'Title, date, and time are required', 400);
    }

    const now = new Date();
    const reminderDateTime = new Date(`${reminder_date}T${reminder_time}`);
    if (reminderDateTime < now) {
      return sendError(res, 'Reminder cannot be set in the past', 400);
    }

    const reminder = new Reminder({
      user_id: userId,
      title,
      description,
      reminder_date,
      reminder_time,
      status: 'active'
    });

    await reminder.save();
    await logAction(userId, 'ADD_REMINDER', { reminderId: reminder._id });
    sendSuccess(res, reminder, 'Medicine reminder added successfully', 201);
  } catch (error) {
    console.error('Add reminder error:', error);
    sendError(res, 'Error adding reminder', 500, error);
  }
};

export const getMedicineReminders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reminders = await Reminder.find({ user_id: userId }).sort({ reminder_date: 1, reminder_time: 1 });
    sendSuccess(res, reminders, 'Medicine reminders fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching reminders', 500, error);
  }
};

export const updateMedicineReminder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, description, reminder_date, reminder_time, status } = req.body;

    const updated = await Reminder.findOneAndUpdate(
      { _id: id, user_id: userId },
      { title, description, reminder_date, reminder_time, status },
      { new: true, runValidators: true }
    );

    if (!updated) return sendError(res, 'Reminder not found or unauthorized', 404);
    sendSuccess(res, updated, 'Reminder updated successfully');
  } catch (error) {
    sendError(res, 'Error updating reminder', 500, error);
  }
};

export const deleteMedicineReminder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await Reminder.findOneAndDelete({ _id: id, user_id: userId });

    if (!deleted) return sendError(res, 'Reminder not found or unauthorized', 404);
    sendSuccess(res, { id }, 'Reminder deleted successfully');
  } catch (error) {
    sendError(res, 'Error deleting reminder', 500, error);
  }
};

export const emergencySOS = async (req, res) => {
  try {
    sendSuccess(res, null, 'SOS feature coming soon');
  } catch (error) {
    sendError(res, 'Error sending SOS', 500, error);
  }
};

export const getNearbyEmergency = async (req, res) => {
  try {
    sendSuccess(res, [], 'Nearby emergency features coming soon');
  } catch (error) {
    sendError(res, 'Error fetching nearby emergency services', 500, error);
  }
};

