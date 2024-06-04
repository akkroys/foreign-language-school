import connection from '../dbConnection.js';

export default class ChatModel {
    static getUserChats(userId, callback) {
        connection.query(
            'SELECT * FROM chats WHERE userId = ? OR inChat = ?',
            [userId, userId],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                return callback(null, results);
            }
        );
    }

    static getById(chatId, callback) {
        connection.query(
            'SELECT * FROM chats WHERE id = ? LIMIT 1',
            [chatId],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                if (results.length === 0) {
                    return callback(null, null);
                }

                const chat = results[0];
                return callback(null, chat);
            }
        );
    }

    static create(userId, inChat, callback) {
        connection.query(
            'INSERT INTO chats (userId, inChat) VALUES (?, ?)',
            [userId, inChat],
            (error, result) => {
                if (error) {
                    return callback(error, null);
                }

                const newChat = {
                    id: result.insertId,
                    userId,
                    inChat,
                };

                return callback(null, newChat);
            }
        );
    }
    
    static getExistingChat(userId, inChat, callback) {
        connection.query(
            'SELECT * FROM chats WHERE (userId = ? AND inChat = ?) OR (userId = ? AND inChat = ?)',
            [userId, inChat, inChat, userId],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                if (results.length === 0) {
                    return callback(null, null);
                }

                return callback(null, results[0]);
            }
        );
    }

    static updateChatName(chatId, chatName, callback) {
        const query = 'UPDATE chats SET name = ? WHERE id = ?';
        connection.query(query, [chatName, chatId], (error, results) => {
            if (error) {
                console.error("Ошибка при обновлении имени чата:", error);
                return callback(error, null);
            }
            callback(null, results);
        });
    }
}
