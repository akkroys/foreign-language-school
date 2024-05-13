import connection from '../dbConnection.js';

class TariffsModel {
    static addTariff(title, lessonsCount, amount, callback) {
        const insertQuery = `
            INSERT INTO tariffs (title, lessonsCount, amount)
            VALUES (?, ?, ?)
        `;

        connection.query(insertQuery, [title, lessonsCount, amount], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            const tariffId = results.insertId;
            callback(null, tariffId);
        });
    }

    static getAllTariffs(callback) {
        const selectQuery = `
            SELECT * FROM tariffs
        `;

        connection.query(selectQuery, (err, results) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, results);
        });
    }

    static getTariffById(tariffId, callback) {
        const selectQuery = `
            SELECT * FROM tariffs
            WHERE id = ?
        `;

        connection.query(selectQuery, [tariffId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.length === 0) {
                return callback(new Error("Tariff not found"), null);
            }

            callback(null, results[0]);
        });
    }

    static updateTariff(tariffId, newTitle, newLessonsCount, newAmount, callback) {
        const updateQuery = `
            UPDATE tariffs
            SET title = ?, lessonsCount = ?, amount = ?
            WHERE id = ?
        `;

        connection.query(
            updateQuery,
            [newTitle, newLessonsCount, newAmount, tariffId],
            (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                if (results.affectedRows === 0) {
                    return callback(new Error("Tariff not found"), null);
                }

                callback(null, results);
            }
        );
    }

    static deleteTariff(tariffId, callback) {
        const deleteQuery = `
            DELETE FROM tariffs
            WHERE id = ?
        `;

        connection.query(deleteQuery, [tariffId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.affectedRows === 0) {
                return callback(new Error("Tariff not found"), null);
            }

            callback(null, results);
        });
    }
}

export default TariffsModel;
