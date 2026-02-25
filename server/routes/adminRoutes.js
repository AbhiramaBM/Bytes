import express from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  deleteUser,
  getSystemAnalytics,
  adminLogin,
  getDoctorsForAdmin,
  createDoctor,
  updateDoctorStatus,
  deleteDoctor
} from '../controllers/adminController.js';
import {
  getAllClinics,
  createClinic,
  updateClinic,
  deleteClinic
} from '../controllers/clinicController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateEmail } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize(['admin']), getAdminDashboard);
router.get('/users', authenticate, authorize(['admin']), getAllUsers);
router.delete('/users/:userId', authenticate, authorize(['admin']), deleteUser);
router.get('/analytics', authenticate, authorize(['admin']), getSystemAnalytics);

// Clinic routes
router.get('/clinics', authenticate, authorize(['admin']), getAllClinics);
router.post('/clinics', authenticate, authorize(['admin']), createClinic);
router.put('/clinics/:clinicId', authenticate, authorize(['admin']), updateClinic);
router.delete('/clinics/:clinicId', authenticate, authorize(['admin']), deleteClinic);

// Doctor management
router.get('/doctors', authenticate, authorize(['admin']), getDoctorsForAdmin);
router.post('/doctors', authenticate, authorize(['admin']), validateEmail, createDoctor);
router.put('/doctors/:doctorId/status', authenticate, authorize(['admin']), updateDoctorStatus);
router.delete('/doctors/:doctorId', authenticate, authorize(['admin']), deleteDoctor);


// Admin auth
router.post('/login', adminLogin);

export default router;
