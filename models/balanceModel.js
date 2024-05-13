import connection from '../dbConnection.js';

class BalanceModel {
    static getUserBalance(userId, callback) {
        const selectQuery = `
            SELECT balance FROM users WHERE id = ?
        `;

        connection.query(selectQuery, [userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.length === 0) {
                return callback(new Error("User not found"), null);
            }

            callback(null, results[0].balance);
        });
    }

    static addFunds(userId, amount, callback) {
        const updateQuery = `
            UPDATE users SET balance = balance + ? WHERE id = ?
        `;

        connection.query(updateQuery, [amount, userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.affectedRows === 0) {
                return callback(new Error("User not found"), null);
            }

            const insertBalanceHistoryQuery = `
                INSERT INTO balanceHistory (date, cashFlowId, customMessage, userToUserId)
                VALUES (NOW(), NULL, 'Средства поступили на счет', ?)
            `;

            connection.query(insertBalanceHistoryQuery, [userId], (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                callback(null, results);
            });
        });
    }

    static addCashFlow(userId, amount, callback) {
        const insertCashFlowQuery = `
            INSERT INTO cashFlow (amount, count, userToUserId) 
            VALUES (?, 1, ?)
        `;

        connection.query(insertCashFlowQuery, [amount, userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, results.insertId);
        });
    }

    static getBalanceHistory(userId, callback) {
        const selectQuery = `
            SELECT * FROM balanceHistory WHERE userToUserId = ?
        `;

        connection.query(selectQuery, [userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, results);
        });
    }

    static getUserBalance(userId, callback) {
        const selectQuery = `
            SELECT balance FROM users WHERE id = ?
        `;

        connection.query(selectQuery, [userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.length === 0) {
                return callback(new Error("User not found"), null);
            }

            callback(null, results[0].balance);
        });
    }

    static addToBalance(userId, amount, callback) {
        const updateQuery = `
            UPDATE users SET balance = balance + ? WHERE id = ?
        `;

        connection.query(updateQuery, [amount, userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.affectedRows === 0) {
                return callback(new Error("User not found"), null);
            }

            const insertBalanceHistoryQuery = `
                INSERT INTO balanceHistory (date, cashFlowId, customMessage, userToUserId)
                VALUES (NOW(), NULL, 'Средства поступили на счет', ?)
            `;

            connection.query(insertBalanceHistoryQuery, [userId], (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                callback(null, results);
            });
        });
    }

    static deductFromBalance(userId, amount, callback) {
        const updateQuery = `
            UPDATE users SET balance = balance - ? WHERE id = ?
        `;

        connection.query(updateQuery, [amount, userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.affectedRows === 0) {
                return callback(new Error("User not found"), null);
            }

            const insertBalanceHistoryQuery = `
                INSERT INTO balanceHistory (date, cashFlowId, customMessage, userToUserId)
                VALUES (NOW(), NULL, 'Произошло списание средств', ?)
            `;

            connection.query(insertBalanceHistoryQuery, [userId], (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                callback(null, results);
            });
        });
    }

    static getUserTransactions(userId, callback) {
        const selectQuery = `
        SELECT 
            bh.date, 
            bh.customMessage, 
            cf.amount 
        FROM 
            balanceHistory bh
        LEFT JOIN 
            cashFlow cf 
        ON 
            bh.cashFlowId = cf.id 
        WHERE 
            bh.userToUserId = ? 
        ORDER BY 
            bh.date DESC
    `;


        connection.query(selectQuery, [userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, results);
        });
    }

    static addTransaction(userId, description, cashFlowId, callback) {
        const insertQuery = `
            INSERT INTO balanceHistory (date, cashFlowId, customMessage, userToUserId)
            VALUES (NOW(), ?, ?, ?)
        `;
    
        connection.query(insertQuery, [cashFlowId, description, userId], (err, results) => {
            if (err) {
                return callback(err, null);
            }
        
            callback(null, results.insertId);
        });
        
    }
}


export default BalanceModel;
