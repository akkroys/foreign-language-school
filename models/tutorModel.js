import connection from '../dbConnection.js';

export default class TutorModel {
    static findByUserId(userId, callback) {
        connection.query(
            'SELECT * FROM tutor WHERE userId = ? LIMIT 1',
            [userId],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                if (results.length === 0) {
                    return callback(null, null);
                }

                const tutor = results[0];
                return callback(null, tutor);
            }
        );
    }

    static updateAbout(userId, about, callback) {
        connection.query(
            'UPDATE tutor SET about = ? WHERE userId = ?',
            [about, userId],
            (error, result) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, result);
            }
        );
    }

    static getTutorById(tutorId, callback) {

        const query = `
            SELECT 
                users.id, 
                users.firstName, 
                users.lastName, 
                users.photo, 
                tutor.about 
            FROM 
                tutor
            JOIN 
                users 
            ON 
                tutor.userId = users.id 
            WHERE 
                tutor.userId = ?
        `;

        connection.query(query, [tutorId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.length === 0) {
                return callback(new Error("Tutor not found"), null);
            }

            callback(null, results[0]);
        });
    }

    static getFullScheduleData(tutorId, callback) {
        if (typeof tutorId !== 'number') {
            const error = new Error("Invalid tutorId");
            console.error("Error in getFullSchedule:", error);
            return callback(error, null);
        }
        // console.log('tId', tutorId);
        const query = `
            SELECT 
                schedules.id, 
                schedules.startDate, 
                schedules.endDate, 
                schedules.note, 
                schedule_metadata.status,
                schedule_metadata.userId,
                schedule_metadata.tutorFullName,
                schedule_metadata.userName,
                schedule_metadata.courseId
            FROM schedules 
            JOIN schedule_metadata 
            ON schedule_metadata.scheduleId = schedules.id 
            WHERE schedules.tutorId = ?
        `;

        // console.log('Executing query:', query, 'with tutorId:', tutorId);

        connection.query(query, [tutorId], (err, results) => {
            if (err) {
                console.error("Ошибка при получении данных расписания:", err);
                return callback(err, null);
            }
            console.log('func tutorId2', tutorId);
            console.log('results', results);

            callback(null, results);
        });
    }
}
