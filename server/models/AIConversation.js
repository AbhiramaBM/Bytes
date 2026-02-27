import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' }
}, { timestamps: true });

const AIConversation = mongoose.models.AIConversation || mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
