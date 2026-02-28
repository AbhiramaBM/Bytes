import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  appointmentDate: { type: String },
  appointmentTime: { type: String },
  status: { type: String, enum: ['booked', 'pending', 'approved', 'rejected', 'appointed', 'completed', 'cancelled'], default: 'booked' },
  reason: { type: String },
  aiTriage: {
    symptoms: [{ type: String }],
    followUpQuestions: [{ type: String }],
    followUpAnswers: [{ question: String, answer: String }],
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    likelyConditions: [{ type: String }],
    recommendedSpecializations: [{ type: String }],
    doctorAdvice: { type: String }
  },
  videoRoomId: { type: String },
  consultationType: { type: String, enum: ['in-person', 'online'], default: 'in-person' },
}, { timestamps: true });

appointmentSchema.pre('validate', function syncLegacyFields(next) {
  if (!this.appointmentDate && this.date) this.appointmentDate = this.date;
  if (!this.appointmentTime && this.startTime) this.appointmentTime = this.startTime;

  if (!this.date && this.appointmentDate) this.date = this.appointmentDate;
  if (!this.startTime && this.appointmentTime) this.startTime = this.appointmentTime;

  if (!this.endTime && this.startTime) {
    const [h, m] = `${this.startTime}`.split(':').map(Number);
    const baseMinutes = (h * 60) + m + 30;
    const outH = Math.floor(baseMinutes / 60);
    const outM = baseMinutes % 60;
    this.endTime = `${`${outH}`.padStart(2, '0')}:${`${outM}`.padStart(2, '0')}`;
  }

  next();
});

appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
