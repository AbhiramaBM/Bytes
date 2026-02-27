import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    reminder_date: { type: String, required: true },
    reminder_time: { type: String, required: true },
    status: { type: String, enum: ['active', 'dismissed', 'completed'], default: 'active' }
}, { timestamps: true });

const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);
export default Reminder;
