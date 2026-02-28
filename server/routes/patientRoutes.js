import express from 'express';
import {
  bookAppointment,
  getPatientAppointments,
  getAppointmentSlots,
  getPatientVideoRoom,
  cancelAppointment,
  getPrescriptions,
  getMedicalHistory,
  getMedicalHistoryByPatientId,
  suggestAppointmentTime,
  getPrescriptionById,
  getHealthRecords,
  updateHealthRecords,
  addMedicineReminder,
  getMedicineReminders,
  updateMedicineReminder,
  deleteMedicineReminder,
  emergencySOS,
  getNearbyEmergency
} from '../controllers/patientController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateAppointment, validateObjectIdParam } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/appointments', authenticate, authorize(['patient']), validateAppointment, bookAppointment);
router.get('/appointments/slots', authenticate, authorize(['patient']), getAppointmentSlots);
router.post('/appointments/suggest-time', authenticate, authorize(['patient']), suggestAppointmentTime);
router.get('/appointments', authenticate, authorize(['patient']), getPatientAppointments);
router.get('/appointments/:appointmentId/video-room', authenticate, authorize(['patient']), validateObjectIdParam('appointmentId'), getPatientVideoRoom);
router.delete('/appointments/:appointmentId', authenticate, authorize(['patient']), validateObjectIdParam('appointmentId'), cancelAppointment);
router.get('/prescriptions', authenticate, authorize(['patient']), getPrescriptions);
router.get('/prescriptions/:prescriptionId', authenticate, authorize(['patient']), validateObjectIdParam('prescriptionId'), getPrescriptionById);
router.get('/medical-history', authenticate, authorize(['patient']), getMedicalHistory);
router.get('/medical-history/:patientId', authenticate, validateObjectIdParam('patientId'), getMedicalHistoryByPatientId);
router.get('/health-records', authenticate, authorize(['patient']), getHealthRecords);
router.put('/health-records', authenticate, authorize(['patient']), updateHealthRecords);
router.post('/medicine-reminders', authenticate, authorize(['patient']), addMedicineReminder);
router.get('/medicine-reminders', authenticate, authorize(['patient']), getMedicineReminders);
router.put('/medicine-reminders/:id', authenticate, authorize(['patient']), validateObjectIdParam('id'), updateMedicineReminder);
router.delete('/medicine-reminders/:id', authenticate, authorize(['patient']), validateObjectIdParam('id'), deleteMedicineReminder);
router.post('/emergency-sos', authenticate, authorize(['patient']), emergencySOS);
router.get('/emergency/nearby', getNearbyEmergency);

export default router;
