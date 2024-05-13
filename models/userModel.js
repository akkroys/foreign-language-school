import connection from "../dbConnection.js";
import bcrypt from 'bcryptjs';

export default class UserModel {

    constructor({ lastName, firstName, middleName, photo, email, password, role = 'user', balance = 0 }) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.middleName = middleName;
        this.photo = photo;
        this.email = email;
        this.password = password;
        this.role = role;
        this.balance = balance;
    }

    createUser(callback) {
        connection.query(`INSERT INTO users SET ?`, this, (error, results) => {
            if (error) {
                console.error('Error creating user:', error);
                return callback(error, null);
            }

            const userId = results.insertId;

            connection.query(
                `INSERT INTO students 
                 (userId, wish, startWithPayment, wasFirstPayment, lessonsCount, skippedInThisMonth, usedTrial) 
                 VALUES (?, NULL, NOW(), 0, 0, 0, 0)`,
                [userId],
                (studentError, studentResults) => {
                    if (studentError) {
                        console.error('Error adding to students:', studentError);
                        return callback(studentError, null);
                    }
                    return callback(null, { ...results, studentResults });
                }
            );
        });
    }


    static findByEmail(email, callback) {
        connection.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email], (error, results) => {
            if (error) {
                console.error('Error finding user by email:', error);
                return callback(error, null);
            }

            if (results.length === 0) {
                return callback(null, null);
            }

            const user = results[0];
            console.log('User found with email:', email);
            console.log('User:', user);
            return callback(null, user);
        });
    }


    static hashPassword(password, callback) {
        bcrypt.hash(password, 10, (error, hashedPassword) => {
            if (error) {
                console.error('Error hashing password:', error);
                return callback(error, null);
            }
            return callback(null, hashedPassword);
        });
    }

    static findUserById(id, callback) {
        connection.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results[0]);
        });
    }

    static updateUserRole(userId, newRole, callback) {
        connection.query(
            'UPDATE users SET role = ? WHERE id = ?',
            [newRole, userId],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                if (newRole === 'tutor') {
                    connection.query(
                        'DELETE FROM students WHERE userId = ?',
                        [userId],
                        (delError) => {
                            if (delError) {
                                return callback(delError, null);
                            }

                            connection.query(
                                'INSERT INTO tutor (userId) VALUES (?)',
                                [userId],
                                (tutorError, tutorResults) => {
                                    if (tutorError) {
                                        return callback(tutorError, null);
                                    }
                                    return callback(null, results);
                                }
                            );
                        }
                    );
                } else {
                    return callback(null, results);
                }
            }
        );
    }

    static findUsersByRole(role, callback) {
        const query = 'SELECT * FROM users WHERE role = ?';

        connection.query(query, [role], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            return callback(null, results);
        });
    }

    static searchTutorsByNameOrEmail(searchQuery, callback) {
        const query = `
            SELECT * 
            FROM users 
            WHERE role = 'tutor' 
              AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)
        `;

        const likeQuery = `%${searchQuery}%`;

        connection.query(
            query,
            [likeQuery, likeQuery, likeQuery],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                return callback(null, results);
            }
        );
    }
    static searchStudentsByNameOrEmail(searchQuery, callback) {
        const query = `
            SELECT * 
            FROM users 
            WHERE role = 'user' 
              AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)
        `;

        const likeQuery = `%${searchQuery}%`;

        connection.query(
            query,
            [likeQuery, likeQuery, likeQuery],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                return callback(null, results);
            }
        );
    }
}