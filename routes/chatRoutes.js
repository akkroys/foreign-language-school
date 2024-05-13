import express from 'express';
import { getUserChats, getChatById, createChat } from '../controllers/chatController.js';
import { getMessagesByChatId, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getUserChats);
router.get('/:chatId', getChatById);
router.post('/chats', createChat);
router.get('/:chatId/messages', getMessagesByChatId);
router.post('/:chatId/messages', sendMessage);

export default router;
