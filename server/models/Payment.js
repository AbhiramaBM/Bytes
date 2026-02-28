import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  gatewayPaymentId: { type: String, unique: true, sparse: true },
  verifiedAt: { type: Date }
}, { timestamps: true });

paymentSchema.index({ prescriptionId: 1, patientId: 1, status: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;

