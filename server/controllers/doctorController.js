import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { logAction } from '../utils/auditLogger.js';

// Get all doctors (for public listing)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await query(`
      SELECT d.id, d.specialization, d.experience, d.consultationFee, d.isActive, u.fullName, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.isActive = 1 AND u.isDeleted = 0
    `);

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
    const doctor = await get(`
      SELECT d.*, u.fullName, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ? AND u.isDeleted = 0
    `, [id]);

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
    const doctor = await get('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (!doctor) return sendError(res, 'Doctor profile not found', 404);

    const doctorId = doctor.id;
    const { appointmentId } = req.params;

    if (appointmentId) {
      const appointment = await get(`
        SELECT a.*, pu.fullName as patientName, pu.phone as patientPhone, pu.age, pu.gender, c.name as clinicName, p.medicalHistory, p.bloodGroup
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        LEFT JOIN clinics c ON a.clinic_id = c.id
        WHERE a.id = ? AND a.doctor_id = ?
      `, [appointmentId, doctorId]);

      if (!appointment) return sendError(res, 'Appointment not found', 404);
      return sendSuccess(res, appointment, 'Appointment fetched');
    }

    const appointments = await query(`
      SELECT a.*, pu.fullName as patientName, pu.phone as patientPhone, c.name as clinicName
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      LEFT JOIN clinics c ON a.clinic_id = c.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointmentDate DESC, a.appointmentTime ASC
    `, [doctorId]);

    sendSuccess(res, appointments, 'Appointments fetched successfully');
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
    const doctor = await get('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (!doctor) return sendError(res, 'Unauthorized', 403);

    const validStatuses = ['approved', 'rejected', 'appointed'];
    if (!validStatuses.includes(status)) return sendError(res, 'Invalid status', 400);

    const appointment = await get('SELECT status FROM appointments WHERE id = ? AND doctor_id = ?', [appointmentId, doctor.id]);
    if (!appointment) return sendError(res, 'Appointment not found', 404);

    if (status === 'approved' || status === 'rejected') {
      if (appointment.status !== 'pending') return sendError(res, `Cannot set to ${status} from ${appointment.status}`, 400);
    } else if (status === 'appointed') {
      if (appointment.status !== 'approved') return sendError(res, 'Only approved appointments can be marked as appointed', 400);
    }

    await run('UPDATE appointments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [status, appointmentId]);
    await logAction(userId, 'UPDATE_APPOINTMENT_STATUS', { appointmentId, status });
    sendSuccess(res, { status }, 'Appointment status updated successfully');
  } catch (error) {
    sendError(res, 'Error updating appointment', 500, error);
  }
};

// Add prescription
export const addPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines = [], notes } = req.body;
    const userId = req.user.userId;
    const doctor = await get('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (!doctor) return sendError(res, 'Unauthorized', 403);

    const appointment = await get('SELECT * FROM appointments WHERE id = ? AND doctor_id = ?', [appointmentId, doctor.id]);
    if (!appointment) return sendError(res, 'Appointment not found', 404);

    if (!['approved', 'appointed'].includes(appointment.status)) {
      return sendError(res, 'Can only add prescription for approved or appointed appointments', 400);
    }

    if (!diagnosis || !diagnosis.trim()) {
      return sendError(res, 'Diagnosis is required', 400);
    }

    // Validate medicines
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

    const prescriptionId = uuidv4();

    await run('BEGIN TRANSACTION');
    try {
      await run(
        'INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, diagnosis, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [prescriptionId, appointmentId, appointment.patient_id, doctor.id, diagnosis, notes || '']
      );

      for (const med of validMedicines) {
        await run(
          'INSERT INTO prescription_medicines (prescription_id, name, dosage, frequency, duration) VALUES (?, ?, ?, ?, ?)',
          [prescriptionId, med.name.trim(), med.dosage.trim(), med.frequency.trim(), med.duration.trim()]
        );
      }

      await run('UPDATE appointments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', ['completed', appointmentId]);

      await run('COMMIT');
      await logAction(userId, 'CREATE_PRESCRIPTION', { appointmentId, prescriptionId, medicineCount: validMedicines.length });
    } catch (err) {
      await run('ROLLBACK');
      throw err;
    }

    // Return full prescription with medicines
    const prescription = await get('SELECT * FROM prescriptions WHERE id = ?', [prescriptionId]);
    const savedMedicines = await query('SELECT * FROM prescription_medicines WHERE prescription_id = ?', [prescriptionId]);
    prescription.medicines = savedMedicines;

    sendSuccess(res, prescription, 'Prescription added and appointment completed successfully', 201);
  } catch (error) {
    console.error('Error adding prescription:', error);
    sendError(res, `Error adding prescription: ${error.message}`, 500);
  }
};

// Get prescription for appointment
export const getPrescriptionByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const prescription = await get('SELECT * FROM prescriptions WHERE appointment_id = ?', [appointmentId]);
    if (!prescription) return sendSuccess(res, null, 'No prescription found');

    const medicines = await query('SELECT * FROM prescription_medicines WHERE prescription_id = ?', [prescription.id]);
    prescription.medicines = medicines;

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
    const doctor = await get('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (!doctor) return sendError(res, 'Unauthorized', 403);

    const appointment = await get(`
      SELECT a.id, pu.fullName as patientName, pu.phone as patientPhone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE a.id = ? AND a.doctor_id = ?
    `, [appointmentId, doctor.id]);

    if (!appointment) return sendError(res, 'Appointment not found', 404);

    await logAction(userId, 'CALL_PATIENT', {
      appointmentId,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone
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
