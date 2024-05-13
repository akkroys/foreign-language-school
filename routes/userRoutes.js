import express from 'express';
import { userTariffs, renderBalancePage, renderCoursePage, renderTutorsPage, renderBookLessonPage, renderUserChats } from '../controllers/userController.js';
import balanceRoutes from './balanceRoutes.js';
import chatRoutes from './chatRoutes.js';
import { registerForCourse } from '../controllers/courseController.js';
import { bookLesson, getUserSchedule } from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/tariffs', userTariffs);
router.get('/chats', renderUserChats);
router.use('/chats', chatRoutes);
router.get('/events', getUserSchedule);
router.get('/balance', renderBalancePage);
router.use('/balance', balanceRoutes);
router.get('/courses', renderCoursePage);
router.post('/courses/register-course', registerForCourse);
router.get('/tutors', renderTutorsPage);
router.post('/tutors/book-lesson', bookLesson);
router.get('/tutors/book-lesson/:tutorId', renderBookLessonPage);

export default router;