import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { generateToken } from '../utils/tokenUtils.js';
import { logAction } from '../utils/auditLogger.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const stats = await get(`
      SELECT 
        (SELECT COUNT(*) FROM patients) as totalPatients,
        (SELECT COUNT(*) FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.isDeleted = 0) as totalDoctors,
        (SELECT COUNT(*) FROM appointments) as totalAppointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pendingAppointments,
        (SELECT COUNT(*) FROM clinics) as totalClinics
    `);

    sendSuccess(res, stats, 'Dashboard data fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching dashboard', 500, error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT id, email, fullName, phone, role, createdAt FROM users WHERE isDeleted = 0';
    let countSql = 'SELECT COUNT(*) as total FROM users WHERE isDeleted = 0';
    const params = [];

    if (search) {
      const searchPattern = `%${search}%`;
      sql += ' AND (fullName LIKE ? OR email LIKE ?)';
      countSql += ' AND (fullName LIKE ? OR email LIKE ?)';
      params.push(searchPattern, searchPattern);
    }

    if (role) {
      sql += ' AND role = ?';
      countSql += ' AND role = ?';
      params.push(role);
    }

    sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const users = await query(sql, finalParams);
    const countResult = await get(countSql, params);

    sendSuccess(res, {
      users,
      pagination: {
        total: countResult.total,
        page: parseInt(page),
        pages: Math.ceil(countResult.total / limit)
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

    const user = await get('SELECT id, fullName, role FROM users WHERE id = ?', [userId]);
    if (!user) return sendError(res, 'User not found', 404);

    await run('UPDATE users SET isDeleted = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
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

    const user = await get('SELECT * FROM users WHERE email = ? AND role = ?', [email.toLowerCase().trim(), 'admin']);
    if (!user) return sendError(res, 'Invalid admin credentials', 401);

    const valid = await bcryptjs.compare(password, user.password);
    if (!valid) return sendError(res, 'Invalid admin credentials', 401);

    const token = generateToken(user.id, user.role);
    sendSuccess(res, { userId: user.id, email: user.email, fullName: user.fullName, role: user.role, token }, 'Admin login successful');
  } catch (error) {
    sendError(res, 'Admin login failed', 500, error);
  }
};

export const getDoctorsForAdmin = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    let sql = `
      SELECT u.id as userId, u.email, u.fullName, u.phone, d.id as doctorId, d.specialization, d.registrationNumber, d.experience, d.isActive
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      WHERE u.isDeleted = 0
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.fullName LIKE ? OR u.email LIKE ? OR d.specialization LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (isActive !== undefined) {
      sql += ' AND d.isActive = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY u.createdAt DESC';
    const doctors = await query(sql, params);
    sendSuccess(res, doctors, 'Doctors fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching doctors', 500, error);
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { email, password, fullName, phone, specialization, experience, registrationNumber, consultationFee } = req.body;
    if (!email || !password || !fullName) return sendError(res, 'Missing required fields', 400);

    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) return sendError(res, 'Email already registered', 400);

    const userId = uuidv4();
    const doctorId = uuidv4();
    const hashed = await bcryptjs.hash(password, 10);

    await run('BEGIN TRANSACTION');
    try {
      await run(
        'INSERT INTO users (id, email, password, fullName, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, email.toLowerCase().trim(), hashed, fullName.trim(), phone, 'doctor']
      );
      await run(
        'INSERT INTO doctors (id, user_id, specialization, experience, registrationNumber, consultationFee) VALUES (?, ?, ?, ?, ?, ?)',
        [doctorId, userId, specialization, experience, registrationNumber, consultationFee]
      );
      await run('COMMIT');
      await logAction(req.user?.userId, 'CREATE_DOCTOR', { email, fullName, doctorId });
    } catch (err) {
      await run('ROLLBACK');
      throw err;
    }

    const doctor = await get(`
      SELECT u.id as userId, u.email, u.fullName, d.id as doctorId, d.specialization, d.experience
      FROM users u JOIN doctors d ON u.id = d.user_id WHERE u.id = ?
    `, [userId]);

    sendSuccess(res, doctor, 'Doctor created successfully', 201);
  } catch (error) {
    sendError(res, 'Error creating doctor', 500, error);
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const active = await get('SELECT id FROM appointments WHERE doctor_id = ? AND status NOT IN (?, ?)', [doctorId, 'completed', 'rejected']);
    if (active) return sendError(res, 'Cannot deactivate doctor with active appointments', 400);

    const doctor = await get('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
    if (!doctor) return sendError(res, 'Doctor not found', 404);

    await run('BEGIN TRANSACTION');
    try {
      await run('UPDATE users SET isDeleted = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [doctor.user_id]);
      await logAction(req.user?.userId, 'SOFT_DELETE_DOCTOR', { doctorId, userId: doctor.user_id });
      await run('COMMIT');
    } catch (err) {
      await run('ROLLBACK');
      throw err;
    }

    sendSuccess(res, { message: 'Doctor profile deactivated' }, 'Doctor deactivated successfully');
  } catch (error) {
    sendError(res, 'Error deactivating doctor', 500, error);
  }
};

export const getPatientsForAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT u.id as userId, u.email, u.fullName, u.phone, p.id as patientId, p.medicalHistory, p.bloodGroup, u.createdAt
      FROM users u
      JOIN patients p ON u.id = p.user_id
      WHERE u.isDeleted = 0
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.fullName LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY u.createdAt DESC';
    const patients = await query(sql, params);
    sendSuccess(res, patients, 'Patients fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching patients', 500, error);
  }
};

export const getAllAppointmentsForAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT a.*, pu.fullName as patientName, du.fullName as doctorName, d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (pu.fullName LIKE ? OR du.fullName LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY a.appointmentDate DESC, a.appointmentTime DESC';
    const appointments = await query(sql, params);
    sendSuccess(res, appointments, 'Appointments fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching appointments', 500, error);
  }
};

export const updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { isActive } = req.body;
    await run('UPDATE doctors SET isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [isActive ? 1 : 0, doctorId]);
    sendSuccess(res, { isActive }, 'Doctor status updated');
  } catch (error) {
    sendError(res, 'Error updating doctor status', 500, error);
  }
};

export const getSystemAnalytics = async (req, res) => {
  try {
    const analytics = await get(`
      SELECT 
        (SELECT COUNT(*) FROM audit_logs WHERE action = 'LOGIN') as totalLogins,
        (SELECT COUNT(*) FROM audit_logs WHERE action = 'BOOK_APPOINTMENT') as totalBookings,
        (SELECT COUNT(*) FROM audit_logs WHERE action = 'CREATE_PRESCRIPTION') as totalPrescriptions
    `);
    sendSuccess(res, analytics, 'Analytics fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching analytics', 500, error);
  }
};
