import UserModel from '../models/userModel.js';
import path from 'path';
import connection from '../dbConnection.js';
import { getStudentByUserId } from './studentController.js';
// import multer from 'multer';
import BalanceModel from '../models/balanceModel.js';
import TariffsModel from '../models/tariffsModel.js';
import StudentModel from '../models/studentModel.js';
import ScheduleModel from '../models/scheduleModel.js';
import TutorModel from '../models/tutorModel.js';
import { getFullScheduleData } from './scheduleController.js';
import { getCourses, getCoursesByUserId, getTutorsByCourseIds } from '../models/courseModel.js';
import ChatModel from '../models/chatModel.js';
import MessageModel from '../models/messageModel.js';
import async from 'async';

export const userDashboard = (req, res) => {
    const userId = req.user.id;

    UserModel.findUserById(userId, (error, user) => {
        if (error || !user) {
            console.error('Error loading user data:', error);
            return res.redirect('/error');
        }
        res.render('userDashboard', { user });
    });
};

export const userChats = (req, res) => {
    const userId = req.user.id;

    UserModel.findUserById(userId, (error, user) => {
        if (error || !user) {
            console.error('Error loading user data:', error);
            return res.redirect('/error');
        }
        res.render('userChats', { user });
    });
};

export const userTariffs = (req, res) => {
    const userId = req.user.id;

    UserModel.findUserById(userId, (error, user) => {
        if (error || !user) {
            console.error('Error loading user data:', error);
            return res.redirect('/error');
        }
        getStudentByUserId(req, res, () => {
            const student = req.student;

            res.render('userTariffs', { user, student });
        });
    });
};

export const userProfile = (req, res) => {
    const userId = req.user.id;

    UserModel.findUserById(userId, (error, user) => {
        if (error || !user) {
            console.error('Error loading user data:', error);
            return res.redirect('/error');
        }
        console.log(user.photo);
        getStudentByUserId(req, res, () => {
            const student = req.student;

            res.render('userProfile', { user, student });
        });
    });
};

export const updateUserProfile = (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, middleName, email } = req.body;

    let photo = req.file ? `/resources/uploads/${req.file.filename}` : req.body.photo;

    UserModel.findUserById(userId, (error, existingUser) => {
        if (error || !existingUser) {
            console.error("Ошибка при получении данных пользователя:", error);
            return res.redirect("/error");
        }

        const userData = {
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
            middleName: middleName || existingUser.middleName,
            email: email || existingUser.email,
            photo: photo || existingUser.photo,
        };

        const query = `
            UPDATE users 
            SET 
                firstName = ?, 
                lastName = ?, 
                middleName = ?, 
                email = ?, 
                photo = ? 
            WHERE id = ?
        `;

        connection.query(query, [userData.firstName, userData.lastName, userData.middleName, userData.email, userData.photo, userId], (updateError) => {
            if (updateError) {
                console.error("Ошибка при обновлении профиля пользователя:", updateError);
                return res.redirect("/error");
            }

            res.redirect("/profile");
        });
    });
};

export const updatePassword = (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        console.error('Missing password data');
        return res.redirect('/error');
    }

    UserModel.findUserById(userId, (error, user) => {
        if (error || !user) {
            console.error('Error finding user:', error);
            return res.redirect('/error');
        }

        bcrypt.compare(currentPassword, user.password, (compareError, isMatch) => {
            if (compareError || !isMatch) {
                console.error('Current password is incorrect');
                return res.redirect('/error');
            }

            UserModel.updatePassword(userId, newPassword, (updateError, results) => {
                if (updateError) {
                    console.error('Error updating password:', updateError);
                    return res.redirect('/error');
                }

                res.redirect('/dashboard');
            });
        });
    });
};

export const updateUserRole = (req, res) => {
    const { userId, newRole } = req.body;

    UserModel.updateUserRole(userId, newRole, (error, results) => {
        if (error) {
            console.error('Error updating user role:', error);
            return res.status(500).send('An error occurred while updating user role');
        }

        res.redirect('/admin/dashboard');
    });
};

export const renderBalancePage = (req, res) => {
    const userId = req.user.id;

    StudentModel.findByUserId(userId, (err, student) => {
        if (err) {
            console.error('Error finding student:', err);
            return res.status(500).send("Error finding student");
        }

        BalanceModel.getUserBalance(userId, (err, balance) => {
            if (err) {
                console.error('Error getting user balance:', err);
                return res.status(500).send("Error loading balance");
            }

            BalanceModel.getUserTransactions(userId, (err, transactions) => {
                if (err) {
                    console.error('Error getting user transactions:', err);
                    return res.status(500).send("Error loading transactions");
                }

                TariffsModel.getAllTariffs((err, tariffs) => {
                    if (err) {
                        console.error('Error getting tariffs:', err);
                        return res.status(500).send("Error loading tariffs");
                    }

                    res.render('userBalance', {
                        user: req.user,
                        balance,
                        transactions,
                        tariffs,
                        student,
                    });
                });
            });
        });
    });
};

export const renderCoursePage = async (req, res) => {
    try {
        const courses = await getCourses();
        res.render('userCourses', { courses, user: req.user });
    } catch (err) {
        console.error("Ошибка при загрузке курсов:", err);
        res.status(500).send("Ошибка при загрузке курсов");
    }
};

export const renderTutorsPage = (req, res) => {
    const userId = req.user.id;

    getCoursesByUserId(userId, (err, courses) => {
        if (err) {
            console.error("Ошибка при получении курсов:", err);
            return res.status(500).send("Ошибка при получении курсов");
        }

        const courseIds = courses.map(course => course.courseId);

        getTutorsByCourseIds(courseIds, (err, tutors) => {
            if (err) {
                console.error("Ошибка при получении репетиторов:", err);
                return res.status(500).send("Ошибка при получении репетиторов");
            }

            res.render('userTutors', { courses, tutors, user: req.user });
        });
    });
};

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes}`;
}

export const renderBookLessonPage = (req, res) => {
    const { tutorId: rawTutorId } = req.params;
    const tutorId = parseInt(rawTutorId, 10);

    if (!tutorId) {
        return res.status(400).send("Неверный идентификатор репетитора");
    }

    TutorModel.getTutorById(tutorId, (err, tutor) => {
        if (err) {
            console.error("Ошибка при получении данных о репетиторе:", err);
            return res.status(500).send("Ошибка при получении данных о репетиторе");
        }
        if (!tutor) {
            return res.status(404).send("Репетитор не найден");
        }

        console.log("Requesting schedule for tutor:", tutorId);

        TutorModel.getFullScheduleData(tutorId, (error, schedules) => {
            if (error) {
                console.error("Error retrieving schedule data:", error);
                return res.status(500).send("Error retrieving schedule data");
            }

            // console.log("Retrieved schedules:", schedules);

            const freeSlots = schedules.filter(schedule => {
                const startDate = new Date(schedule.startDate);
                const now = new Date();
                return schedule.status === 0 && startDate > now;
            }).map(slot => {
                return {
                    id: slot.id,
                    startDate: `${formatDate(slot.startDate)} - ${formatTime(slot.startDate)}`,
                    endDate: formatTime(slot.endDate),
                };
            });

            console.log("Filtered free slots:", freeSlots);

            res.render("userBookLesson", {
                user: req.user,
                tutor,
                freeSlots,
            });
        });
    });
};

export const renderUserChats = (req, res) => {
    const userId = req.user.id;

    UserModel.findUserById(userId, (error, user) => {
        if (error || !user) {
            console.error('Ошибка при получении данных пользователя:', error);
            return res.redirect('/error');
        }

        ChatModel.getUserChats(userId, (chatError, chats) => {
            if (chatError) {
                console.error('Ошибка при получении чатов:', chatError);
                return res.redirect('/error');
            }

            async.eachSeries(chats, (chat, callback) => {
                const otherUserId = chat.inChat === userId ? chat.userId : chat.inChat;

                UserModel.findUserById(otherUserId, (userError, otherUser) => {
                    if (userError) {
                        console.error('Ошибка при получении данных другого участника:', userError);
                        return callback(userError);
                    }

                    chat.name = `${otherUser.firstName} ${otherUser.lastName}`;
                    chat.photo = otherUser.photo; 

                    callback(null);
                });
            }, (eachError) => {
                if (eachError) {
                    console.error('Ошибка при обработке чатов:', eachError);
                    return res.redirect('/error');
                }
                let selectedChat = null;
                let fileName = '';
                if(user.role == 'user') {
                    fileName = 'userChats';
                } else if (user.role == 'tutor') {
                    fileName = 'tutorChats';
                } else if (user.role == 'admin') {
                    fileName = 'adminChats';
                }
                res.render(fileName, {
                    user,
                    userChats: chats,
                    selectedChat
                });
            });
        });
    });
};