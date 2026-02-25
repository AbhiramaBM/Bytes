import { v4 as uuidv4 } from 'uuid';
import { query, run } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return sendError(res, 'ReceiverID and message are required', 400);
    }

    const messageId = uuidv4();

    await run(
      'INSERT INTO messages (id, senderId, receiverId, message, isRead) VALUES (?, ?, ?, ?, 0)',
      [messageId, senderId, receiverId, message]
    );

    sendSuccess(res, { messageId }, 'Message sent successfully', 201);
  } catch (error) {
    sendError(res, 'Error sending message', 500, error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    const messages = await query(
      `SELECT 
        m.id, 
        m.senderId, 
        m.receiverId, 
        m.message, 
        m.isRead, 
        m.createdAt,
        u1.fullName as senderName,
        u2.fullName as receiverName
       FROM messages m
       JOIN users u1 ON m.senderId = u1.id
       JOIN users u2 ON m.receiverId = u2.id
       WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
       ORDER BY m.createdAt ASC`,
      [userId, conversationId, conversationId, userId]
    );

    // Mark messages as read
    await run(
      'UPDATE messages SET isRead = 1 WHERE receiverId = ? AND senderId = ?',
      [userId, conversationId]
    );

    sendSuccess(res, messages, 'Messages fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching messages', 500, error);
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await query(
      `SELECT DISTINCT 
        CASE 
          WHEN m.senderId = ? THEN m.receiverId 
          ELSE m.senderId 
        END as conversationUserId,
        u.fullName,
        u.role,
        MAX(m.createdAt) as lastMessageTime,
        COUNT(CASE WHEN m.isRead = 0 AND m.receiverId = ? THEN 1 END) as unreadCount
       FROM messages m
       JOIN users u ON u.id = CASE 
         WHEN m.senderId = ? THEN m.receiverId 
         ELSE m.senderId 
       END
       WHERE m.senderId = ? OR m.receiverId = ?
       GROUP BY conversationUserId
       ORDER BY lastMessageTime DESC`,
      [userId, userId, userId, userId, userId]
    );

    sendSuccess(res, conversations, 'Conversations fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching conversations', 500, error);
  }
};
