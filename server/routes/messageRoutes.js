import express from 'express';
import { 
  sendMessage, 
  getMessages, 
  getConversations 
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { validateObjectIdParam } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/send', authenticate, sendMessage);
router.get('/conversation/:conversationId', authenticate, validateObjectIdParam('conversationId'), getMessages);
router.get('/', authenticate, getConversations);

export default router;
