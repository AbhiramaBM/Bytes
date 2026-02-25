import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getAllClinics = async (req, res) => {
  try {
    const { city, search } = req.query;
    let sql = 'SELECT * FROM clinics WHERE 1=1';
    let params = [];

    if (city) {
      sql += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY name ASC';
    const clinics = await query(sql, params);

    sendSuccess(res, clinics, 'Clinics fetched successfully');
  } catch (error) {
    console.error('Error fetching clinics:', error);
    sendError(res, 'Error fetching clinics', 500, error);
  }
};

export const getClinicById = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await get('SELECT * FROM clinics WHERE id = ?', [id]);
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }

    const doctors = await query(`
      SELECT u.id, u.fullName, u.phone, d.id as doctorId, d.specialization
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      WHERE u.role = 'doctor' AND u.isDeleted = 0
    `);

    sendSuccess(res, { clinic, doctors }, 'Clinic fetched successfully');
  } catch (error) {
    console.error('Error fetching clinic:', error);
    sendError(res, 'Error fetching clinic', 500, error);
  }
};

export const getNearbyClinics = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    // SQLite placeholder for geo-logic
    const clinics = await query('SELECT * FROM clinics ORDER BY name ASC');
    sendSuccess(res, clinics, 'Clinics fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching nearby clinics', 500, error);
  }
};

export const getClinicDoctors = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const doctors = await query(`
      SELECT u.id, u.fullName, u.phone, d.id as doctorId, d.specialization
      FROM users u
      JOIN doctors d ON u.id = d.user_id
      JOIN appointments a ON d.id = a.doctor_id
      WHERE a.clinic_id = ?
      GROUP BY d.id
    `, [clinicId]);

    sendSuccess(res, doctors, 'Doctors fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching clinic doctors', 500, error);
  }
};

// Admin Functions
export const createClinic = async (req, res) => {
  try {
    const { name, address, city, phone, email, description } = req.body;
    const id = uuidv4();
    await run(
      'INSERT INTO clinics (id, name, address, city, phone, email, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, address, city, phone, email, description]
    );
    sendSuccess(res, { id }, 'Clinic created successfully', 201);
  } catch (error) {
    sendError(res, 'Error creating clinic', 500, error);
  }
};

export const updateClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { name, address, city, phone, email, description } = req.body;
    await run(
      'UPDATE clinics SET name = ?, address = ?, city = ?, phone = ?, email = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, address, city, phone, email, description, clinicId]
    );
    sendSuccess(res, null, 'Clinic updated successfully');
  } catch (error) {
    sendError(res, 'Error updating clinic', 500, error);
  }
};

export const deleteClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    await run('DELETE FROM clinics WHERE id = ?', [clinicId]);
    sendSuccess(res, null, 'Clinic deleted successfully');
  } catch (error) {
    sendError(res, 'Error deleting clinic', 500, error);
  }
};
