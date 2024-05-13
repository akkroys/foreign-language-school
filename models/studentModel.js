import connection from '../dbConnection.js';

export default class StudentModel {
    static findByUserId(userId, callback) {
        connection.query(
            'SELECT * FROM students WHERE userId = ? LIMIT 1',
            [userId],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                if (results.length === 0) {
                    return callback(null, null);
                }

                const student = results[0];
                return callback(null, student);
            }
        );
    }

    static addLessons(userId, lessonsToAdd, callback) {
        this.findByUserId(userId, (err, student) => {
            if (err) {
                return callback(err, null);
            }

            const currentLessonsCount = student.lessonsCount || 0;
            const updatedLessonsCount = currentLessonsCount + lessonsToAdd;

            const updateQuery = `
                UPDATE students SET lessonsCount = ? WHERE userId = ?
            `;

            connection.query(updateQuery, [updatedLessonsCount, userId], (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                if (results.affectedRows === 0) {
                    return callback(new Error("Student not found"), null);
                }

                callback(null, updatedLessonsCount);
            });
        });
    }


    static updateWish(userId, wish, callback) {
        connection.query(
            'UPDATE students SET wish = ? WHERE userId = ?',
            [wish, userId],
            (error, result) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, result);
            }
        );
    }

    static findStudentWithUserData(studentId, callback) {
        const query = `
        SELECT 
            users.id AS id,
            users.email AS email, 
            users.firstName AS firstName, 
            users.lastName AS lastName, 
            students.wish AS wish,
            students.lessonsCount AS lessonsCount, 
            students.startWithPayment AS startWithPayment, 
            students.skippedInThisMonth AS skippedInThisMonth
        FROM 
            users 
        JOIN 
            students 
        ON 
            users.id = students.userId 
        WHERE 
            students.userId = ?
    `;

        connection.query(query, [studentId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            if (results.length === 0) {
                return callback(null, null);
            }

            return callback(null, results[0]);
        });
    }

}
