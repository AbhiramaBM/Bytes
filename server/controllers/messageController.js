import User from '../models/User.js';
import Message from '../models/Message.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return sendError(res, 'ReceiverID and message are required', 400);
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: message.trim()
    });

    await newMessage.save();

    sendSuccess(res, { messageId: newMessage._id }, 'Message sent successfully', 201);
  } catch (error) {
    sendError(res, 'Error sending message', 500, error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: conversationId },
        { senderId: conversationId, receiverId: userId }
      ]
    })
      .populate('senderId', 'fullName')
      .populate('receiverId', 'fullName')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { receiverId: userId, senderId: conversationId, isRead: false },
      { $set: { isRead: true } }
    );

    sendSuccess(res, messages, 'Messages fetched successfully');
  } catch (error) {
    sendError(res, 'Error fetching messages', 500, error);
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Aggregation to find unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessageTime: { $first: '$createdAt' },
          lastMessage: { $first: '$message' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          conversationUserId: '$_id',
          fullName: '$userDetails.fullName',
          role: '$userDetails.role',
          lastMessageTime: 1,
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    sendSuccess(res, conversations, 'Conversations fetched successfully');
  } catch (error) {
    console.error('Error fetching conversations:', error);
    sendError(res, 'Error fetching conversations', 500, error);
  }
};

