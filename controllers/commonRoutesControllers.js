// import multer from 'multer';
import { updateUserProfile } from './userController.js';
import { getStudentByUserId, updateStudentProfileC } from './studentController.js';
import UserModel from '../models/userModel.js';
import { getTutorByUserId } from './tutorController.js';
import { getSchedulesForDHTMLX, getUserSchedule, adminGetAllSchedulesForDHTMLX } from './scheduleController.js';

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, '/views/resources/uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${req.user.id}_${file.originalname}`);
//     },
// });

// const upload = multer({ storage });

export const updateStudentProfile = (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, middleName, email, photo, wish } = req.body;

    // if (!userId || !firstName || !lastName || !email) {
    //     console.error("Недостаточно данных для обновления профиля");
    //     return res.redirect("/error");
    // }

    UserModel.findUserById(userId, (userError, existingUser) => {
        if (userError) {
            console.error("Ошибка при получении данных пользователя:", userError);
            return res.redirect("/error");
        }

        const userData = {
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
            middleName: middleName || existingUser.middleName,
            email: email || existingUser.email,
            photo: req.file ? `../views/resources/uploads/${req.file.filename}` : existingUser.photo,
        };

        updateUserProfile(userId, userData, (updateError) => {
            if (updateError) {
                console.error("Ошибка при обновлении данных пользователя:", updateError);
                return res.redirect("/error");
            }

            updateStudentProfileC(userId, studentData, (studentUpdateError) => {
                if (studentUpdateError) {
                    console.error("Ошибка при обновлении данных студента:", studentUpdateError);
                    return res.redirect("/error");
                }

                res.redirect("/profile");
            });
        });
    });
};

const commonDashboard = (req, res) => {
    const userRole = req.userRole;
    const tutorId = typeof req.user.id === 'number' ? req.user.id : null;

    switch (userRole) {
        case 'admin':
            adminGetAllSchedulesForDHTMLX((error, schedules) => {
                if (error) {
                    console.error("Error getting schedules for admin:", error);
                    return res.redirect('/error');
                }
                if (!schedules) {
                    schedules = [];
                }
                // console.log('comr schedules: ', schedules);
                res.render('adminDashboard', { user: req.user, schedules });
            });
            break;
        case 'tutor':
            if (!tutorId) {
                console.error("Invalid tutorId");
                return res.status(400).send("Invalid tutorId");
            }

            getSchedulesForDHTMLX(req, res, (error, schedules) => {
                if (error) {
                    console.error("Error getting schedules for tutor:", error);
                    return res.redirect('/error');
                }
                if (!schedules) {
                    schedules = [];
                }
                // console.log('schedules:', schedules);
                res.render('tutorDashboard', { user: req.user, schedules });
            });
            break;
        case 'user':
        default:
            getUserSchedule(req, (error, schedules) => {
                if (error) {
                    console.error("Error getting user schedules:", error);
                    return res.redirect('/error');
                }

                if (!schedules) {
                    schedules = [];
                }

                // console.log('User schedules:', schedules);
                res.render('userDashboard', { user: req.user, schedules });
            });
            break;
    }
};

const commonProfile = (req, res) => {
    const userRole = req.userRole;

    switch (userRole) {
        case 'admin':
            res.render('adminProfile', { user: req.user });
            break;
        case 'tutor':
            getTutorByUserId(req, res, () => {
                const tutor = req.tutor;
                res.render('tutorProfile', { user: req.user, tutor });
            });
            break;
        case 'user':
        default:
            getStudentByUserId(req, res, () => {
                const student = req.student;
                res.render('userProfile', { user: req.user, student });
            });
            break;
    }
};

export { commonDashboard, commonProfile, updateUserProfile };
