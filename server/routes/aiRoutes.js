import express from 'express';
import {
    chatWithAI,
    getConversationHistory,
    getUserConversations,
    deleteConversation
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', authenticate, chatWithAI);
router.get('/conversations', authenticate, getUserConversations);
router.get('/conversations/:conversationId', authenticate, getConversationHistory);
router.delete('/conversations/:conversationId', authenticate, deleteConversation);

export default router;
