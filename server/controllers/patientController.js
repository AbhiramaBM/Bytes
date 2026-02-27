import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Clinic from '../models/Clinic.js';
import Prescription from '../models/Prescription.js';
import HealthRecord from '../models/HealthRecord.js';
import Reminder from '../models/Reminder.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { logAction } from '../utils/auditLogger.js';

export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { doctorId, clinicId, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return sendError(res, 'Missing required fields: doctorId, appointmentDate, and appointmentTime are required.', 400);
    }

    // Validate doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return sendError(res, 'Doctor not found. Please select a valid doctor.', 404);
    }

    // Double booking check
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $nin: ['rejected', 'cancelled'] }
    });
    if (existing) {
      return sendError(res, 'This time slot is already booked. Please choose a different time.', 409);
    }

    const appointment = new Appointment({
      patientId: userId,
      doctorId,
      clinicId: clinicId || null,
      appointmentDate,
      appointmentTime,
      reason: reason || '',
      status: 'pending'
    });

    await appointment.save();

    await logAction(userId, 'BOOK_APPOINTMENT', { appointmentId: appointment._id, doctorId, appointmentDate, appointmentTime });
    sendSuccess(res, { appointmentId: appointment._id }, 'Appointment booked successfully', 201);
  } catch (error) {
    console.error('[BOOKING] Error:', error);
    sendError(res, `Booking failed: ${error.message}`, 500);
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const appointments = await Appointment.find({ patientId: userId })
      .populate('doctorId', 'fullName specialization')
      .populate('clinicId', 'name')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    // In Mongo version, we'll manually check for prescription existence or use a virtual/lookup
    // For now, let's keep it simple and just return the populated appointments
    sendSuccess(res, appointments, 'Appointments fetched successfully');
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
      status: 'pending'
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

    sendSuccess(res, prescriptions, 'Prescriptions fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching prescriptions', 500, error);
  }
};

export const getMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await Prescription.find({ patientId: userId })
      .populate('doctorId', 'fullName specialization')
      .populate('appointmentId', 'appointmentDate appointmentTime reason')
      .sort({ createdAt: -1 });

    sendSuccess(res, history, 'Medical history fetched successfully');
  } catch (error) {
    console.error('Medical history error:', error);
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

