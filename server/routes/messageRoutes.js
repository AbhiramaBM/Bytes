import express from 'express';
import { 
  sendMessage, 
  getMessages, 
  getConversations 
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', authenticate, sendMessage);
router.get('/conversation/:conversationId', authenticate, getMessages);
router.get('/', authenticate, getConversations);

export default router;
