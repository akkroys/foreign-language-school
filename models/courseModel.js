import connection from '../dbConnection.js';

export const createCourse = async (title, goalId) => {
    const sql = `INSERT INTO courses (title, goalId) VALUES (?, ?)`;
    const values = [title, goalId];
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.insertId);
        });
    });
};

export const deleteCourse = async (id) => {
    const sql = `DELETE FROM courses WHERE id = ?`;
    const values = [id];
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.affectedRows);
        });
    });
};

export const updateCourse = async (id, newTitle, newGoalId) => {
    const sql = `UPDATE courses SET title = ?, goalId = ? WHERE id = ?`;
    const values = [newTitle, newGoalId, id];
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.affectedRows);
        });
    });
};

export const getCourseById = async (id) => {
    const sql = `SELECT * FROM courses WHERE id = ?`;
    const values = [id];
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]);
        });
    });
};

export const getCourses = async () => {
    const sql = `SELECT * FROM courses`;
    return new Promise((resolve, reject) => {
        connection.query(sql, [], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

export const searchCourses = async (query) => {
    const sql = `SELECT * FROM courses WHERE title LIKE ?`;
    const values = [`%${query}%`];
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

export const getAllGoals = async () => {
    const sql = 'SELECT * FROM goals';
    return new Promise((resolve, reject) => {
        connection.query(sql, [], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

export const addRegistration = async (userId, courseId) => {
    const insertQuery = `
        INSERT INTO registrations (userId, courseId)
        VALUES (?, ?)
    `;

    const [results] = await connection.promise().query(insertQuery, [userId, courseId]);
    return results;
};

export const getCoursesByUserId = (userId, callback) => {
    const query = `
        SELECT 
            r.courseId,
            c.title,
            c.goalId
        FROM 
            registrations r
        JOIN 
            courses c
        ON 
            r.courseId = c.id
        WHERE 
            r.userId = ?
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, results);
    });
};

export const getTutorsByCourseIds = (courseIds, callback) => {
    if (courseIds.length === 0) {
        return callback(null, []);
    }

    const placeholders = courseIds.map(() => '?').join(',');

    const query = `
        SELECT 
            t.userId,
            u.firstName,
            u.lastName,
            t.about,
            u.photo,
            c.title AS courseTitle,
            c.id AS courseId
        FROM 
            tutorCourse tc
        JOIN 
            tutor t ON tc.tutorId = t.userId
        JOIN 
            users u ON t.userId = u.id
        JOIN 
            courses c ON tc.courseId = c.id
        WHERE 
            tc.courseId IN (${placeholders})
    `;

    connection.query(query, courseIds, (err, results) => {
        if (err) {
            return callback(err, null);
        }

        const tutorsByCourse = results.reduce((acc, tutor) => {
            if (!acc[tutor.userId]) {
                acc[tutor.userId] = {
                    userId: tutor.userId,
                    firstName: tutor.firstName,
                    lastName: tutor.lastName,
                    about: tutor.about,
                    photo: tutor.photo,
                    courses: []
                };
            }
            acc[tutor.userId].courses.push({ courseId: tutor.courseId, title: tutor.courseTitle });
            return acc;
        }, {});

        const tutors = Object.values(tutorsByCourse);
        callback(null, tutors);
    });
};
