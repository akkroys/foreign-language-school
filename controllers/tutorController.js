import UserModel from '../models/userModel.js';
import TutorModel from '../models/tutorModel.js'

export const tutorProfile = (req, res) => {
    const userId = req.user.id;

    UserModel.findUserById(userId, (error, user) => {
        if (error || !user) {
            console.error('Ошибка при загрузке данных репетитора:', error);
            return res.redirect('/error');
        }

        TutorModel.findByUserId(userId, (tutorError, tutor) => {
            if (tutorError) {
                console.error('Ошибка при загрузке данных репетитора:', tutorError);
                return res.redirect('/error');
            }

            res.render('tutorProfile', { user, tutor });
        });
    });
};

export const tutorDashboard = (req, res) => {
    res.render('tutorDashboard');
};

export const getAllStudents = (req, res) => {
    UserModel.findUsersByRole('user', (error, users) => {
        if (error) {
            console.error('Ошибка при загрузке списка учеников:', error);
            return res.redirect('/error');
        }
        
        res.render('tutorUsersList', { users });
    });
};

export const getTutorByUserId = (req, res, next) => {
    const userId = req.user.id;

    TutorModel.findByUserId(userId, (error, tutor) => {
        if (error || !tutor) {
            console.error("Ошибка при поиске репетитора:", error);
            return res.redirect('/error');
        }

        req.tutor = tutor;
        next();
    });
};

export const updateTutorAbout = (req, res) => {
    const userId = req.user.id;
    const { about } = req.body;

    TutorModel.updateAbout(userId, about, (error, result) => {
        if (error) {
            console.error("Ошибка при обновлении информации о репетиторе:", error);
            return res.redirect('/error');
        }

        res.redirect('/profile'); // Перенаправление после успешного обновления
    });
};