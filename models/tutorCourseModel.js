import connection from '../dbConnection.js';

export default class TutorCourseModel {
    static addCourseToTutor(courseId, tutorId, callback) {
        const query = `
            INSERT INTO tutorCourse (courseId, tutorId) 
            VALUES (?, ?)
        `;

        connection.query(query, [courseId, tutorId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            return callback(null, results.insertId);
        });
    }

    static removeCourseFromTutor(courseId, tutorId, callback) {
        const query = `
            DELETE FROM tutorCourse 
            WHERE courseId = ? AND tutorId = ?
        `;

        connection.query(query, [courseId, tutorId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            return callback(null, results.affectedRows);
        });
    }

    static getCoursesByTutorId(tutorId, callback) {
        const query = `
            SELECT courses.id, courses.title 
            FROM tutorCourse 
            JOIN courses ON tutorCourse.courseId = courses.id 
            WHERE tutorCourse.tutorId = ?
        `;

        connection.query(query, [tutorId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            return callback(null, results);
        });
    }
}
