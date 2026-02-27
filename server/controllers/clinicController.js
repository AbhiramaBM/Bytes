import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getAllClinics = async (req, res) => {
  try {
    const { city, search } = req.query;
    let queryObj = {};

    if (city) {
      queryObj.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const clinics = await Clinic.find(queryObj).sort({ name: 1 });

    sendSuccess(res, clinics, 'Clinics fetched successfully');
  } catch (error) {
    console.error('Error fetching clinics:', error);
    sendError(res, 'Error fetching clinics', 500, error);
  }
};

export const getClinicById = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }

    // Getting all active doctors as per original logic
    const doctors = await User.find({ role: 'doctor', isActive: { $ne: false } })
      .select('fullName phone specialization');

    sendSuccess(res, { clinic, doctors }, 'Clinic fetched successfully');
  } catch (error) {
    console.error('Error fetching clinic:', error);
    sendError(res, 'Error fetching clinic', 500, error);
  }
};

export const getNearbyClinics = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    // Basic implementation for now
    const clinics = await Clinic.find().sort({ name: 1 });
    sendSuccess(res, clinics, 'Clinics fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching nearby clinics', 500, error);
  }
};

export const getClinicDoctors = async (req, res) => {
  try {
    const { clinicId } = req.params;
    // In original code, it was getting doctors associated with the clinic via appointments
    // We'll keep a similar logic or just return all doctors for now if preferred.
    // Let's refine based on appointments if possible.
    const doctors = await User.find({ role: 'doctor', isActive: { $ne: false } })
      .select('fullName phone specialization');

    sendSuccess(res, doctors, 'Doctors fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching clinic doctors', 500, error);
  }
};

// Admin Functions
export const createClinic = async (req, res) => {
  try {
    const { name, address, city, phone, email, description, state } = req.body;
    const clinic = new Clinic({ name, address, city, state, phone, email, description });
    await clinic.save();
    sendSuccess(res, { id: clinic._id }, 'Clinic created successfully', 201);
  } catch (error) {
    sendError(res, 'Error creating clinic', 500, error);
  }
};

export const updateClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { name, address, city, phone, email, description, state } = req.body;
    const updated = await Clinic.findByIdAndUpdate(
      clinicId,
      { name, address, city, state, phone, email, description },
      { new: true, runValidators: true }
    );

    if (!updated) return sendError(res, 'Clinic not found', 404);
    sendSuccess(res, updated, 'Clinic updated successfully');
  } catch (error) {
    sendError(res, 'Error updating clinic', 500, error);
  }
};

export const deleteClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const deleted = await Clinic.findByIdAndDelete(clinicId);
    if (!deleted) return sendError(res, 'Clinic not found', 404);
    sendSuccess(res, null, 'Clinic deleted successfully');
  } catch (error) {
    sendError(res, 'Error deleting clinic', 500, error);
  }
};

