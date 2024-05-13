import connection from '../dbConnection.js';

export default class MessageModel {
    static getByChatId(chatId, callback) {
        connection.query(
            'SELECT * FROM messages WHERE chatToId = ? ORDER BY messageTime ASC',
            [chatId],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                return callback(null, results);
            }
        );
    }

    static create(chatId, senderId, receiverId, message, callback) {
        const insertQuery = `
            INSERT INTO messages (chatToId, senderId, receiverId, message, messageTime)
            VALUES (?, ?, ?, ?, NOW())
        `;

        connection.query(
            insertQuery,
            [chatId, senderId, receiverId, message],
            (error, result) => {
                if (error) {
                    console.error('Ошибка при добавлении сообщения в базу данных:', error);
                    return callback(error, null);
                }

                const newMessage = {
                    id: result.insertId,
                    chatToId: chatId,
                    senderId,
                    receiverId,
                    message,
                    messageTime: new Date(),
                };

                callback(null, newMessage);
            }
        );
    }
}
