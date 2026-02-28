import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPrescription,
  updatePatientRecords,
  getPrescriptionByAppointmentId,
  logPatientCall,
  getDoctorVideoRoom
} from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateObjectIdParam } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/:id', validateObjectIdParam('id'), getDoctorById);
router.get('/appointments/list', authenticate, authorize(['doctor']), getDoctorAppointments);
router.get('/appointments/:appointmentId', authenticate, authorize(['doctor']), validateObjectIdParam('appointmentId'), getDoctorAppointments);
router.get('/appointments/:appointmentId/prescription', authenticate, authorize(['doctor']), validateObjectIdParam('appointmentId'), getPrescriptionByAppointmentId);
router.post('/appointments/:appointmentId/log-call', authenticate, authorize(['doctor']), validateObjectIdParam('appointmentId'), logPatientCall);
router.get('/appointments/:appointmentId/video-room', authenticate, authorize(['doctor']), validateObjectIdParam('appointmentId'), getDoctorVideoRoom);
router.put('/appointments/:appointmentId/status', authenticate, authorize(['doctor']), validateObjectIdParam('appointmentId'), updateAppointmentStatus);
router.post('/prescriptions', authenticate, authorize(['doctor']), addPrescription);
router.put('/records/:appointmentId', authenticate, authorize(['doctor']), validateObjectIdParam('appointmentId'), updatePatientRecords);

export default router;
