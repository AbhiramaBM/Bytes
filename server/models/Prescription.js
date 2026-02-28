import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, required: true, trim: true },
  frequency: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending_payment', 'paid'], default: 'pending_payment' },
  consultationFee: { type: Number, default: 0 },
  medicineCharges: { type: Number, default: 0 },
  additionalCharges: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  diagnosis: { type: String, required: true, trim: true },
  medicines: { type: [medicineSchema], default: [] },
  notes: { type: String }
}, { timestamps: true });

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
