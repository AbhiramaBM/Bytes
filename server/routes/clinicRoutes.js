import express from 'express';
import { 
  getAllClinics, 
  getClinicById, 
  getNearbyClinics, 
  getClinicDoctors 
} from '../controllers/clinicController.js';

const router = express.Router();

router.get('/', getAllClinics);
router.get('/nearby', getNearbyClinics);
router.get('/:id', getClinicById);
router.get('/:clinicId/doctors', getClinicDoctors);

export default router;
