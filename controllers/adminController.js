import UserModel from '../models/userModel.js';
import StudentModel from '../models/studentModel.js';
import TutorCourseModel from '../models/tutorCourseModel.js';
import { getCourses } from '../models/courseModel.js';

export const getTutorDetail = (req, res) => {
    const tutorId = req.params.tutorId;

    UserModel.findUserById(tutorId, (error, tutor) => {
        if (error || !tutor) {
            console.error("Ошибка при получении данных репетитора:", error);
            return res.redirect("/error");
        }

        TutorCourseModel.getCoursesByTutorId(tutorId, (courseError, courses) => {
            if (courseError) {
                console.error("Ошибка при получении курсов репетитора:", courseError);
                return res.redirect("/error");
            }

            getCourses().then((availableCourses) => {
                res.render("tutorDetail", { tutor, courses, availableCourses });
            }).catch((availableCoursesError) => {
                console.error("Ошибка при получении доступных курсов:", availableCoursesError);
                return res.redirect("/error");
            });

            
        });
    });
};

export const demoteTutor = (req, res) => {
    const tutorId = req.params.tutorId;

    UserModel.updateUserRole(tutorId, "user", (updateError) => {
        if (updateError) {
            console.error("Ошибка при разжаловании репетитора:", updateError);
            return res.redirect("/error");
        }

        res.redirect("/admin/tutors");
    });
};

export const addCourseToTutor = (req, res) => {
    const tutorId = req.params.tutorId;
    const { courseId } = req.body;

    TutorCourseModel.addCourseToTutor(courseId, tutorId, (addError) => {
        if (addError) {
            console.error("Ошибка при добавлении курса репетитору:", addError);
            return res.redirect("/error");
        }

        res.redirect(`/admin/tutors/${tutorId}`);
    });
};

export const removeCourseFromTutor = (req, res) => {
    const tutorId = req.params.tutorId;
    const { courseId } = req.body;

    TutorCourseModel.removeCourseFromTutor(courseId, tutorId, (removeError) => {
        if (removeError) {
            console.error("Ошибка при удалении курса у репетитора:", removeError);
            return res.redirect("/error");
        }

        res.redirect(`/admin/tutors/${tutorId}`);
    });
};

export const adminProfile = (req, res) => {
    const userId = req.user.id;

    UserModel.findUserById(userId, (error, user) => {
        if (error || !user) {
            console.error('Ошибка при загрузке данных администратора:', error);
            return res.redirect('/error');
        }
        res.render('adminProfile', { user });
    });
};

export const adminDashboard = (req, res) => {
    const user = req.user;

    res.render('adminDashboard', { user });
};

export const adminCourses = (req, res) => {
    const user = req.user;
    res.render('adminCourses', { user });
};

export const getAllStudents = (req, res) => {
    UserModel.findUsersByRole('user', (error, users) => {
        if (error) {
            console.error('Ошибка при загрузке списка учеников:', error);
            return res.redirect('/error');
        }

        res.render('adminUsersList', { users });
    });
};

export const getAllTutors = (req, res) => {
    UserModel.findUsersByRole('tutor', (error, tutors) => {
        if (error) {
            console.error('Ошибка при загрузке списка репетиторов:', error);
            return res.redirect('/error');
        }

        res.render('adminTutorsList', { tutors });
    });
};

export const getStudentDetail = (req, res) => {
    const studentId = req.params.studentId;

    StudentModel.findStudentWithUserData(studentId, (error, student) => {
        if (error || !student) {
            console.error('Ошибка при загрузке данных ученика:', error);
            return res.redirect('/error');
        }

        res.render('studentDetail', { student });
    });
};


export const promoteToTutor = (req, res) => {
    const studentId = req.params.studentId;

    UserModel.updateUserRole(studentId, 'tutor', (error) => {
        if (error) {
            console.error('Ошибка при повышении ученика до репетитора:', error);
            return res.redirect('/error');
        }

        res.redirect(`/admin/students`);
    });
};

export const searchTutors = (req, res) => {
    const searchQuery = req.query.searchQuery;

    UserModel.searchTutorsByNameOrEmail(searchQuery, (error, tutors) => {
        if (error) {
            console.error("Ошибка при поиске репетиторов:", error);
            return res.redirect('/error');
        }

        res.render('adminTutorsList', { tutors });
    });
};

export const searchStudents = (req, res) => {
    const searchQuery = req.query.searchQuery;

    UserModel.searchStudentsByNameOrEmail(searchQuery, (error, users) => {
        if (error) {
            console.error("Ошибка при поиске студентов:", error);
            return res.redirect('/error');
        }

        res.render('adminUsersList', { users });
    });
};