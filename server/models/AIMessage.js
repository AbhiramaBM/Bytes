import mongoose from 'mongoose';

const aiMessageSchema = new mongoose.Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AIConversation', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true }
}, { timestamps: true });

const AIMessage = mongoose.models.AIMessage || mongoose.model('AIMessage', aiMessageSchema);
export default AIMessage;
