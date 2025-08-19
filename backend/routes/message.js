import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  addReaction,
  deleteMessage,
  createGroupConversation,
  leaveGroup,
  updateGroup,
  addUser,
  getConversationId
} from '../controllers/messageController.js';
import { parser } from '../utils/cloudinary.js';

const router = express.Router();
router.use(verifyToken);

// Conversation routes
router.get('/conversations', getConversations);
router.get('/conversations/user/:otherUserId', getConversationId);
router.post('/conversations', getOrCreateConversation);
router.post('/conversations/group', createGroupConversation);
router.put('/conversations/:conversationId/leave', leaveGroup);
router.put('/conversations/:conversationId/edit', parser.single('avatar'), updateGroup);
router.put('/conversations/:conversationId/add-user', addUser);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', sendMessage);
router.put('/conversations/:conversationId/read', markMessagesAsRead);

// Message interaction routes
router.put('/messages/:messageId/reaction', addReaction);
router.delete('/messages/:messageId', deleteMessage);

export default router;
