import express from 'express';
import {
  initiatePrescriptionPayment,
  verifyPrescriptionPayment,
  getPaymentByPrescription,
  getPrescriptionBilling
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateObjectIdParam } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post(
  '/prescriptions/:prescriptionId/initiate',
  authenticate,
  authorize(['patient']),
  validateObjectIdParam('prescriptionId'),
  initiatePrescriptionPayment
);

router.post(
  '/:paymentId/verify',
  authenticate,
  authorize(['patient']),
  validateObjectIdParam('paymentId'),
  verifyPrescriptionPayment
);

router.get(
  '/prescriptions/:prescriptionId',
  authenticate,
  authorize(['patient']),
  validateObjectIdParam('prescriptionId'),
  getPaymentByPrescription
);

router.get(
  '/prescriptions/:prescriptionId/billing',
  authenticate,
  authorize(['patient']),
  validateObjectIdParam('prescriptionId'),
  getPrescriptionBilling
);

export default router;
