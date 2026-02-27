import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    blood_group: { type: String },
    allergies: { type: String },
    medical_conditions: { type: String },
    weight: { type: String },
    height: { type: String },
    notes: { type: String }
}, { timestamps: true });

const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', healthRecordSchema);
export default HealthRecord;
