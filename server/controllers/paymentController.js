import crypto from 'crypto';
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import { createAutoRemindersForPrescription } from '../utils/medicineReminderUtils.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { logAction } from '../utils/auditLogger.js';

const getVerificationSecret = () => process.env.PAYMENT_VERIFY_SECRET || process.env.JWT_SECRET || 'dev_payment_secret';

const createSignaturePayload = ({ paymentId, gatewayPaymentId, prescriptionId, amount }) =>
  `${paymentId}|${gatewayPaymentId}|${prescriptionId}|${amount}`;

const createSignature = (payload) =>
  crypto.createHmac('sha256', getVerificationSecret()).update(payload).digest('hex');

const secureCompare = (a, b) => {
  const left = Buffer.from(`${a}`);
  const right = Buffer.from(`${b}`);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
};

export const initiatePrescriptionPayment = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { prescriptionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      return sendError(res, 'Invalid prescriptionId', 400);
    }

    const prescription = await Prescription.findOne({ _id: prescriptionId, patientId });
    if (!prescription) return sendError(res, 'Prescription not found', 404);
    if (prescription.status === 'paid') {
      return sendError(res, 'Prescription is already paid', 400);
    }

    const amount = Number(prescription.totalAmount) > 0 ? Number(prescription.totalAmount) : 0;
    if (amount <= 0) {
      return sendError(res, 'Prescription payment amount is not configured', 400);
    }

    let payment = await Payment.findOne({
      prescriptionId,
      patientId,
      status: 'pending'
    });

    if (!payment) {
      payment = await Payment.create({
        prescriptionId: prescription._id,
        patientId,
        doctorId: prescription.doctorId,
        appointmentId: prescription.appointmentId,
        amount,
        currency: 'INR',
        status: 'pending'
      });
    }

    sendSuccess(res, {
      paymentId: payment._id,
      prescriptionId: prescription._id,
      amount: payment.amount,
      currency: payment.currency,
      verificationFormat: 'signature = HMAC_SHA256(secret, "${paymentId}|${gatewayPaymentId}|${prescriptionId}|${amount}")'
    }, 'Payment initiated');
  } catch (error) {
    sendError(res, 'Failed to initiate payment', 500, error);
  }
};

export const verifyPrescriptionPayment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const patientId = req.user.userId;
    const { paymentId } = req.params;
    const { gatewayPaymentId, signature } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return sendError(res, 'Invalid paymentId', 400);
    }
    if (!gatewayPaymentId || !signature) {
      return sendError(res, 'gatewayPaymentId and signature are required', 400);
    }

    let processedPayload = null;

    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ _id: paymentId, patientId }).session(session);
      if (!payment) throw new Error('PAYMENT_NOT_FOUND');

      if (payment.status === 'success') {
        processedPayload = { alreadyProcessed: true, paymentId: payment._id };
        return;
      }

      const payload = createSignaturePayload({
        paymentId: payment._id,
        gatewayPaymentId,
        prescriptionId: payment.prescriptionId,
        amount: payment.amount
      });
      const expectedSignature = createSignature(payload);
      if (!secureCompare(expectedSignature, signature)) {
        payment.status = 'failed';
        await payment.save({ session });
        throw new Error('INVALID_SIGNATURE');
      }

      const prescription = await Prescription.findOne({
        _id: payment.prescriptionId,
        patientId
      }).session(session);
      if (!prescription) throw new Error('PRESCRIPTION_NOT_FOUND');

      if (prescription.status !== 'paid') {
        prescription.status = 'paid';
        await prescription.save({ session });
      }

      const appointment = await Appointment.findById(payment.appointmentId).session(session);
      if (appointment && appointment.status !== 'completed') {
        appointment.status = 'completed';
        await appointment.save({ session });
      }

      payment.status = 'success';
      payment.gatewayPaymentId = `${gatewayPaymentId}`.trim();
      payment.verifiedAt = new Date();
      await payment.save({ session });

      const reminderCount = await createAutoRemindersForPrescription({
        patientId: prescription.patientId,
        prescriptionId: prescription._id,
        appointmentId: prescription.appointmentId,
        medicines: prescription.medicines || [],
        session
      });

      await logAction(patientId, 'PRESCRIPTION_PAYMENT_SUCCESS', {
        paymentId: payment._id,
        prescriptionId: prescription._id,
        appointmentId: prescription.appointmentId,
        reminderCount
      });

      processedPayload = {
        paymentId: payment._id,
        prescriptionId: prescription._id,
        appointmentId: prescription.appointmentId,
        reminderCount
      };
    });

    if (processedPayload?.alreadyProcessed) {
      return sendSuccess(res, processedPayload, 'Payment already verified');
    }

    sendSuccess(res, processedPayload, 'Payment verified successfully');
  } catch (error) {
    if (error.message === 'INVALID_SIGNATURE') {
      return sendError(res, 'Invalid payment signature', 401);
    }
    if (error.message === 'PAYMENT_NOT_FOUND') {
      return sendError(res, 'Payment not found', 404);
    }
    if (error.message === 'PRESCRIPTION_NOT_FOUND') {
      return sendError(res, 'Prescription not found', 404);
    }
    if (error?.code === 11000) {
      return sendError(res, 'Duplicate gateway payment reference', 409);
    }
    sendError(res, 'Payment verification failed', 500, error);
  } finally {
    await session.endSession();
  }
};

export const getPaymentByPrescription = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { prescriptionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      return sendError(res, 'Invalid prescriptionId', 400);
    }

    const payment = await Payment.findOne({ prescriptionId, patientId }).sort({ createdAt: -1 });
    if (!payment) return sendError(res, 'No payment record found', 404);

    sendSuccess(res, payment, 'Payment status fetched');
  } catch (error) {
    sendError(res, 'Error fetching payment status', 500, error);
  }
};

export const getPrescriptionBilling = async (req, res) => {
  try {
    const patientId = req.user.userId;
    const { prescriptionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      return sendError(res, 'Invalid prescriptionId', 400);
    }

    const prescription = await Prescription.findOne({ _id: prescriptionId, patientId })
      .select('status consultationFee medicineCharges additionalCharges totalAmount currency');

    if (!prescription) return sendError(res, 'Prescription not found', 404);

    sendSuccess(res, prescription, 'Prescription billing fetched');
  } catch (error) {
    sendError(res, 'Error fetching prescription billing', 500, error);
  }
};
