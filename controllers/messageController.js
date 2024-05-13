import MessageModel from '../models/messageModel.js';
import ChatModel from '../models/chatModel.js';

export const getMessagesByChatId = (req, res) => {
    const chatId = req.params.chatId;

    MessageModel.getByChatId(chatId, (error, messages) => {
        if (error) {
            console.error('Ошибка при получении сообщений:', error);
            return res.status(500).json({ error: 'Ошибка при получении сообщений' });
        }

        res.json(messages);
    });
};

export const sendMessage = (req, res) => {
    const chatId = req.params.chatId;
    const { senderId, receiverId, message } = req.body;

    if (!chatId || !senderId || !receiverId || !message) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    ChatModel.getById(chatId, (error, chat) => {
        if (error) {
            console.error('Ошибка при получении чата:', error);
            return res.status(500).json({ error: 'Ошибка при получении чата' });
        }

        if (!chat) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        MessageModel.create(chatId, senderId, receiverId, message, (createError, newMessage) => {
            if (createError) {
                console.error('Ошибка при отправке сообщения:', createError);
                return res.status(500).json({ error: 'Ошибка при отправке сообщения' });
            }

            res.status(201).json(newMessage);
        });
    });
};
