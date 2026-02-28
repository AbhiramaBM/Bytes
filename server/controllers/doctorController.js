import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Clinic from '../models/Clinic.js';
import Prescription from '../models/Prescription.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { logAction } from '../utils/auditLogger.js';
import crypto from 'crypto';

// Get all doctors (for public listing)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: { $ne: false } })
      .select('fullName email phone specialization experience experienceYears consultationFee availableSlots languages education hospitalName rating profileImage address city state pincode latitude longitude googleMapsLink isActive');

    sendSuccess(res, doctors, 'Doctors fetched successfully');
  } catch (error) {
    console.error('Error fetching doctors:', error);
    sendError(res, 'Error fetching doctors', 500, error);
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findOne({ _id: id, role: 'doctor' })
      .select('fullName email phone specialization experience experienceYears consultationFee availableSlots languages education hospitalName rating profileImage address city state pincode latitude longitude googleMapsLink isActive');

    if (!doctor) return sendError(res, 'Doctor not found', 404);
    sendSuccess(res, doctor, 'Doctor fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching doctor', 500, error);
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { appointmentId } = req.params;

    if (appointmentId) {
      const appointment = await Appointment.findOne({ _id: appointmentId, doctorId: userId })
        .populate('patientId', 'fullName phone age gender bloodGroup medicalHistory')
        .populate('clinicId', 'name');

      if (!appointment) return sendError(res, 'Appointment not found', 404);
      return sendSuccess(res, appointment, 'Appointment fetched');
    }

    const appointments = await Appointment.find({ doctorId: userId })
      .populate('patientId', 'fullName phone')
      .populate('clinicId', 'name')
      .sort({ appointmentDate: -1, appointmentTime: 1 });

    const formattedAppointments = appointments.map(appt => {
      const apptObj = appt.toObject();
      return {
        ...apptObj,
        patientName: appt.patientId?.fullName || 'Unknown',
        patientPhone: appt.patientId?.phone || 'No phone',
        clinicName: appt.clinicId?.name || 'Main Clinic',
        consultationType: appt.consultationType || 'in-person',
        aiTriage: appt.aiTriage || null
      };
    });

    sendSuccess(res, formattedAppointments, 'Appointments fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching appointments', 500, error);
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const validStatuses = ['approved', 'rejected', 'appointed', 'completed'];
    if (!validStatuses.includes(status)) return sendError(res, 'Invalid status', 400);

    const appointment = await Appointment.findOne({ _id: appointmentId, doctorId: userId });
    if (!appointment) return sendError(res, 'Appointment not found', 404);

    if (status === 'approved' || status === 'rejected') {
      if (!['pending', 'booked'].includes(appointment.status)) return sendError(res, `Cannot set to ${status} from ${appointment.status}`, 400);
    } else if (status === 'appointed') {
      if (appointment.status !== 'approved') return sendError(res, 'Only approved appointments can be marked as appointed', 400);
    }

    appointment.status = status;
    await appointment.save();

    await logAction(userId, 'UPDATE_APPOINTMENT_STATUS', { appointmentId, status });
    sendSuccess(res, { status }, 'Appointment status updated successfully');
  } catch (error) {
    sendError(res, 'Error updating appointment', 500, error);
  }
};

// Add prescription
export const addPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines = [], notes, consultationFee = 0, medicineCharges = 0, additionalCharges = 0, currency = 'INR' } = req.body;
    const userId = req.user.userId;

    const appointment = await Appointment.findOne({ _id: appointmentId, doctorId: userId });
    if (!appointment) return sendError(res, 'Appointment not found', 404);

    if (!['approved', 'appointed'].includes(appointment.status)) {
      return sendError(res, 'Can only add prescription for approved or appointed appointments', 400);
    }

    if (!diagnosis || !diagnosis.trim()) {
      return sendError(res, 'Diagnosis is required', 400);
    }

    const validMedicines = medicines.filter(m => m.name && m.name.trim());
    if (validMedicines.length === 0) {
      return sendError(res, 'At least one medicine is required', 400);
    }

    for (let i = 0; i < validMedicines.length; i++) {
      const med = validMedicines[i];
      if (!med.name?.trim() || !med.dosage?.trim() || !med.frequency?.trim() || !med.duration?.trim()) {
        return sendError(res, `Medicine #${i + 1}: All fields (name, dosage, frequency, duration) are required`, 400);
      }
    }

    const fee = Number(consultationFee) || 0;
    const medsCost = Number(medicineCharges) || 0;
    const extra = Number(additionalCharges) || 0;
    const totalAmount = fee + medsCost + extra;
    if (totalAmount <= 0) {
      return sendError(res, 'Total payment amount must be greater than 0', 400);
    }

    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription?.status === 'paid') {
      return sendError(res, 'Paid prescriptions cannot be modified', 409);
    }

    const prescription = await Prescription.findOneAndUpdate(
      { appointmentId },
      {
        appointmentId,
        patientId: appointment.patientId,
        doctorId: userId,
        status: 'pending_payment',
        consultationFee: fee,
        medicineCharges: medsCost,
        additionalCharges: extra,
        totalAmount,
        currency,
        diagnosis: diagnosis.trim(),
        medicines: validMedicines,
        notes: notes || ''
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await logAction(userId, 'CREATE_PRESCRIPTION', {
      appointmentId,
      prescriptionId: prescription._id,
      medicineCount: validMedicines.length,
      status: 'pending_payment',
      totalAmount
    });

    sendSuccess(res, prescription, 'Prescription generated and waiting for patient payment', 201);
  } catch (error) {
    console.error('Error adding prescription:', error);
    sendError(res, `Error adding prescription: ${error.message}`, 500);
  }
};

// Get prescription for appointment
export const getPrescriptionByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const prescription = await Prescription.findOne({ appointmentId });
    if (!prescription) return sendSuccess(res, null, 'No prescription found');

    sendSuccess(res, prescription, 'Prescription fetched');
  } catch (error) {
    sendError(res, 'Error fetching prescription', 500, error);
  }
};

// Log patient call
export const logPatientCall = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;

    const appointment = await Appointment.findOne({ _id: appointmentId, doctorId: userId })
      .populate('patientId', 'fullName phone');

    if (!appointment) return sendError(res, 'Appointment not found', 404);

    await logAction(userId, 'CALL_PATIENT', {
      appointmentId,
      patientName: appointment.patientId.fullName,
      patientPhone: appointment.patientId.phone
    });

    sendSuccess(res, null, 'Call logged successfully');
  } catch (error) {
    sendError(res, 'Error logging call', 500, error);
  }
};

export const updatePatientRecords = async (req, res) => {
  try {
    sendSuccess(res, null, 'Feature coming soon: Patient record update');
  } catch (error) {
    sendError(res, 'Error updating records', 500, error);
  }
};

export const getDoctorVideoRoom = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({ _id: appointmentId, doctorId: userId });
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

