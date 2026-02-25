import express from 'express';
import {
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  getPrescriptions,
  getMedicalHistory,
  downloadPrescription,
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
import { validateAppointment } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/appointments', authenticate, authorize(['patient']), validateAppointment, bookAppointment);
router.get('/appointments', authenticate, authorize(['patient']), getPatientAppointments);
router.delete('/appointments/:appointmentId', authenticate, authorize(['patient']), cancelAppointment);
router.get('/prescriptions', authenticate, authorize(['patient']), getPrescriptions);
router.get('/prescriptions/:prescriptionId', authenticate, authorize(['patient']), downloadPrescription);
router.get('/medical-history', authenticate, authorize(['patient']), getMedicalHistory);
router.get('/health-records', authenticate, authorize(['patient']), getHealthRecords);
router.put('/health-records', authenticate, authorize(['patient']), updateHealthRecords);
router.post('/medicine-reminders', authenticate, authorize(['patient']), addMedicineReminder);
router.get('/medicine-reminders', authenticate, authorize(['patient']), getMedicineReminders);
router.put('/medicine-reminders/:id', authenticate, authorize(['patient']), updateMedicineReminder);
router.delete('/medicine-reminders/:id', authenticate, authorize(['patient']), deleteMedicineReminder);
router.post('/emergency-sos', authenticate, authorize(['patient']), emergencySOS);
router.get('/emergency/nearby', getNearbyEmergency);

export default router;
