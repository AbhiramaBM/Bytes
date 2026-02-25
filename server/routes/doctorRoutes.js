import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPrescription,
  updatePatientRecords,
  getPrescriptionByAppointmentId,
  logPatientCall
} from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/appointments/list', authenticate, authorize(['doctor']), getDoctorAppointments);
router.get('/appointments/:appointmentId', authenticate, authorize(['doctor']), getDoctorAppointments);
router.get('/appointments/:appointmentId/prescription', authenticate, authorize(['doctor']), getPrescriptionByAppointmentId);
router.post('/appointments/:appointmentId/log-call', authenticate, authorize(['doctor']), logPatientCall);
router.put('/appointments/:appointmentId/status', authenticate, authorize(['doctor']), updateAppointmentStatus);
router.post('/prescriptions', authenticate, authorize(['doctor']), addPrescription);
router.put('/records/:appointmentId', authenticate, authorize(['doctor']), updatePatientRecords);

export default router;
