import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { logAction } from '../utils/auditLogger.js';

export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { doctorId, clinicId, appointmentDate, appointmentTime, reason } = req.body;

    console.log('[BOOKING] Received:', { userId, doctorId, clinicId, appointmentDate, appointmentTime, reason });

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return sendError(res, 'Missing required fields: doctorId, appointmentDate, and appointmentTime are required.', 400);
    }

    // Validate doctor exists
    const doctor = await get('SELECT id FROM doctors WHERE id = ?', [doctorId]);
    if (!doctor) {
      return sendError(res, 'Doctor not found. Please select a valid doctor.', 404);
    }

    // Get patient profile ID
    const patient = await get('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (!patient) {
      return sendError(res, 'Patient profile not found. Please complete your profile first.', 404);
    }
    const patientProfileId = patient.id;

    // Double booking check (application-level)
    const existing = await get(
      'SELECT id FROM appointments WHERE doctor_id = ? AND appointmentDate = ? AND appointmentTime = ? AND status NOT IN (?, ?)',
      [doctorId, appointmentDate, appointmentTime, 'rejected', 'cancelled']
    );
    if (existing) {
      return sendError(res, 'This time slot is already booked. Please choose a different time.', 409);
    }

    const appointmentId = uuidv4();

    await run(
      `INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, appointmentDate, appointmentTime, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [appointmentId, patientProfileId, doctorId, clinicId || null, appointmentDate, appointmentTime, reason || '']
    );

    console.log('[BOOKING] Success:', appointmentId);
    await logAction(userId, 'BOOK_APPOINTMENT', { appointmentId, doctorId, appointmentDate, appointmentTime });
    sendSuccess(res, { appointmentId }, 'Appointment booked successfully', 201);
  } catch (error) {
    console.error('[BOOKING] Error:', error.message);
    console.error('[BOOKING] Stack:', error.stack);

    // Detect UNIQUE constraint violation (double booking at DB level)
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return sendError(res, 'This time slot is already booked. Please choose a different time.', 409);
    }

    // Detect foreign key constraint violation
    if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
      return sendError(res, 'Invalid doctor or clinic. Please check your selection.', 400);
    }

    // For all other errors, return the real error message
    sendError(res, `Booking failed: ${error.message}`, 500);
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patient = await get('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (!patient) return sendError(res, 'Patient profile not found', 404);

    const appointments = await query(`
      SELECT 
        a.*, 
        du.fullName as doctorName,
        d.specialization,
        c.name as clinicName,
        p.id as prescriptionId
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      LEFT JOIN clinics c ON a.clinic_id = c.id
      LEFT JOIN prescriptions p ON a.id = p.appointment_id
      WHERE a.patient_id = ? AND du.isDeleted = 0
      ORDER BY a.appointmentDate DESC, a.appointmentTime DESC`,
      [patient.id]
    );

    sendSuccess(res, appointments, 'Appointments fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching appointments', 500, error);
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;
    const patient = await get('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (!patient) return sendError(res, 'Unauthorized', 403);

    const result = await run(
      'DELETE FROM appointments WHERE id = ? AND patient_id = ? AND status = ?',
      [appointmentId, patient.id, 'pending']
    );

    if (result.changes === 0) return sendError(res, 'Appointment not found or cannot be cancelled', 404);
    sendSuccess(res, { message: 'Appointment cancelled' }, 'Appointment cancelled successfully');
  } catch (error) {
    sendError(res, 'Error cancelling appointment', 500, error);
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patient = await get('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (!patient) return sendError(res, 'Patient profile not found', 404);

    const prescriptions = await query(`
      SELECT p.*, du.fullName as doctorName, a.appointmentDate, a.appointmentTime
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.patient_id = ?
      ORDER BY p.createdAt DESC`,
      [patient.id]
    );

    for (const p of prescriptions) {
      p.medicines = await query('SELECT * FROM prescription_medicines WHERE prescription_id = ?', [p.id]);
    }

    sendSuccess(res, prescriptions, 'Prescriptions fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching prescriptions', 500, error);
  }
};

export const getMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patient = await get('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (!patient) return sendError(res, 'Patient profile not found', 404);

    const history = await query(`
      SELECT 
        p.id as prescriptionId,
        p.diagnosis,
        p.notes,
        p.createdAt as prescriptionDate,
        du.fullName as doctorName,
        d.specialization,
        a.appointmentDate,
        a.appointmentTime,
        a.reason
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.patient_id = ?
      ORDER BY a.appointmentDate DESC, a.appointmentTime DESC`,
      [patient.id]
    );

    // Attach medicines to each prescription
    for (const entry of history) {
      entry.medicines = await query(
        'SELECT name, dosage, frequency, duration FROM prescription_medicines WHERE prescription_id = ?',
        [entry.prescriptionId]
      );
    }

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
    const patient = await get('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (!patient) return sendError(res, 'Unauthorized', 403);

    const prescription = await get(`
      SELECT p.*, du.fullName as doctorName, a.appointmentDate, p.diagnosis
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN appointments a ON p.appointment_id = a.id
      WHERE p.id = ? AND p.patient_id = ?`,
      [prescriptionId, patient.id]
    );

    if (!prescription) return sendError(res, 'Prescription not found', 404);

    prescription.medicines = await query('SELECT * FROM prescription_medicines WHERE prescription_id = ?', [prescriptionId]);
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
    let record = await get('SELECT * FROM health_records WHERE user_id = ?', [userId]);

    // If no record exists, create a default one for the patient
    if (!record) {
      const id = uuidv4();
      await run(
        'INSERT INTO health_records (id, user_id) VALUES (?, ?)',
        [id, userId]
      );
      record = await get('SELECT * FROM health_records WHERE id = ?', [id]);
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

    await run(
      `INSERT INTO health_records (id, user_id, blood_group, allergies, medical_conditions, weight, height, notes, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET
        blood_group = excluded.blood_group,
        allergies = excluded.allergies,
        medical_conditions = excluded.medical_conditions,
        weight = excluded.weight,
        height = excluded.height,
        notes = excluded.notes,
        updatedAt = CURRENT_TIMESTAMP`,
      [uuidv4(), userId, blood_group, allergies, medical_conditions, weight, height, notes]
    );

    const updated = await get('SELECT * FROM health_records WHERE user_id = ?', [userId]);
    await logAction(userId, 'UPDATE_HEALTH_RECORDS', { recordId: updated.id });

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

    // Past date check
    const now = new Date();
    const reminderDateTime = new Date(`${reminder_date}T${reminder_time}`);
    if (reminderDateTime < now) {
      return sendError(res, 'Reminder cannot be set in the past', 400);
    }

    const id = uuidv4();
    await run(
      `INSERT INTO reminders (id, user_id, title, description, reminder_date, reminder_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [id, userId, title, description, reminder_date, reminder_time]
    );

    const reminder = await get('SELECT * FROM reminders WHERE id = ?', [id]);
    await logAction(userId, 'ADD_REMINDER', { reminderId: id });
    sendSuccess(res, reminder, 'Medicine reminder added successfully', 201);
  } catch (error) {
    console.error('Add reminder error:', error);
    sendError(res, 'Error adding reminder', 500, error);
  }
};

export const getMedicineReminders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reminders = await query(
      'SELECT * FROM reminders WHERE user_id = ? ORDER BY reminder_date ASC, reminder_time ASC',
      [userId]
    );
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

    const result = await run(
      `UPDATE reminders SET 
        title = COALESCE(?, title), 
        description = COALESCE(?, description), 
        reminder_date = COALESCE(?, reminder_date), 
        reminder_time = COALESCE(?, reminder_time), 
        status = COALESCE(?, status),
        updatedAt = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [title, description, reminder_date, reminder_time, status, id, userId]
    );

    if (result.changes === 0) return sendError(res, 'Reminder not found or unauthorized', 404);

    const updated = await get('SELECT * FROM reminders WHERE id = ?', [id]);
    sendSuccess(res, updated, 'Reminder updated successfully');
  } catch (error) {
    sendError(res, 'Error updating reminder', 500, error);
  }
};

export const deleteMedicineReminder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await run(
      'DELETE FROM reminders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.changes === 0) return sendError(res, 'Reminder not found or unauthorized', 404);
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
