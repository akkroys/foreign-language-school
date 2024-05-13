import ChatModel from '../models/chatModel.js';
import UserModel from '../models/userModel.js';

export const getUserChats = (req, res) => {
    const userId = req.user.id;

    ChatModel.getUserChats(userId, (error, chats) => {
        if (error) {
            console.error('Ошибка при получении чатов:', error);
            return res.status(500).json({ error: 'Ошибка при получении чатов' });
        }

        res.json(chats);
    });
};

export const getChatById = (req, res) => {
    const chatId = req.params.chatId;

    ChatModel.getById(chatId, (error, chat) => {
        if (error) {
            console.error('Ошибка при получении чата:', error);
            return res.status(500).json({ error: 'Ошибка при получении чата' });
        }

        if (!chat) {
            return res.status(404).json({ error: 'Чат не найден' });
        }

        const otherUserId = chat.inChat === req.user.id ? chat.userId : chat.inChat;

        UserModel.findUserById(otherUserId, (userError, otherUser) => {
            if (userError || !otherUser) {
                console.error('Ошибка при получении данных о собеседнике:', userError);
                return res.status(500).json({ error: 'Ошибка при получении данных о собеседнике' });
            }

            chat.name = `${otherUser.firstName} ${otherUser.lastName}`;
            chat.photo = otherUser.photo;

            res.json(chat);
        });
    });
};

export const createChat = (userId, inChatId, callback) => {
    ChatModel.create(userId, inChatId, (error, newChat) => {
        if (error) {
            return callback(error, null);
        }

        UserModel.findUserById(inChatId, (userError, user) => {
            if (userError || !user) {
                console.error("Ошибка при получении данных о пользователе:", userError);
                return callback(userError, null);
            }

            const chatName = `${user.firstName} ${user.lastName}`;

            ChatModel.updateChatName(newChat.id, chatName, (updateError) => {
                if (updateError) {
                    console.error("Ошибка при обновлении названия чата:", updateError);
                    return callback(updateError, null);
                }

                callback(null, newChat);
            });
        });
    });
};