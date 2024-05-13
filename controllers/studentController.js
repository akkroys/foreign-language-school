import StudentModel from '../models/studentModel.js';
import connection from '../dbConnection.js';


export const getStudentByUserId = (req, res, next) => {
    const userId = req.user.id;

    StudentModel.findByUserId(userId, (error, student) => {
        if (error || !student) {
            console.error('Error finding student:', error);
            return res.redirect('/error');
        }
        req.student = student;
        next();
    });
};

export const updateStudentWish = (req, res) => {
    const userId = req.user.id;
    const { wish } = req.body;

    if (wish === undefined || wish === null) {
        console.error("Недостаточно данных для обновления пожелания");
        return res.redirect("/error");
    }

    StudentModel.updateWish(userId, wish, (error) => {
        if (error) {
            console.error("Ошибка при обновлении пожелания студента:", error);
            return res.redirect("/error");
        }
        res.redirect("/profile");
    });
};

export const updateStudentProfileC = (userId, newStudentData, callback) => {
    StudentModel.findByUserId(userId, (error, student) => {
        if (error) {
            console.error("Error finding student:", error);
            return callback(error, null);
        }

        if (!student) {
            console.error("Student not found with the given userId");
            const notFoundError = new Error("Student not found");
            return callback(notFoundError, null);
        }

        const updatedStudent = {
            wish: newStudentData.wish || student.wish,
            startWithPayment: newStudentData.startWithPayment || student.startWithPayment,
            wasFirstPayment: newStudentData.wasFirstPayment || student.wasFirstPayment,
            lessonsCount: newStudentData.lessonsCount || student.lessonsCount,
            skippedInThisMonth: newStudentData.skippedInThisMonth || student.skippedInThisMonth,
            usedTrial: newStudentData.usedTrial || student.usedTrial,
        };

        const query = `
            UPDATE students
            SET 
                wish = ?,
                startWithPayment = ?,
                wasFirstPayment = ?,
                lessonsCount = ?,
                skippedInThisMonth = ?,
                usedTrial = ?
            WHERE userId = ?
        `;

        const values = [
            updatedStudent.wish,
            updatedStudent.startWithPayment,
            updatedStudent.wasFirstPayment,
            updatedStudent.lessonsCount,
            updatedStudent.skippedInThisMonth,
            updatedStudent.usedTrial,
            userId,
        ];

        connection.query(query, values, (updateError, results) => {
            if (updateError) {
                console.error("Error updating student profile:", updateError);
                return callback(updateError, null);
            }

            return callback(null, results);
        });
    });
};