import express from 'express';
import {
    adminCourses,
    getAllStudents,
    getStudentDetail,
    promoteToTutor,
    getAllTutors,
    getTutorDetail,
    demoteTutor,
    addCourseToTutor,
    removeCourseFromTutor,
    searchTutors,
    searchStudents
} from '../controllers/adminController.js';
import courseRoutes from './courseRoutes.js';
import { adminGetAllSchedulesForDHTMLX, adminDeleteSchedule, adminUpdateSchedule } from '../controllers/scheduleController.js';
import { renderUserChats } from '../controllers/userController.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

router.get('/courses', adminCourses);
router.get('/chats', renderUserChats);
router.use('/chats', chatRoutes);
router.use('/api/courses', courseRoutes);
router.get('/students', getAllStudents);
router.get('/tutors', getAllTutors);
router.get('/students/search', searchStudents);
router.get('/students/:studentId', getStudentDetail);
router.post('/students/:studentId/promote', promoteToTutor);
router.get('/tutors/search', searchTutors);
router.get('/tutors/:tutorId', getTutorDetail);
router.post('/tutors/:tutorId/demote', demoteTutor);
router.post('/tutors/:tutorId/add-course', addCourseToTutor);
router.post('/tutors/:tutorId/remove-course', removeCourseFromTutor);
router.get('/events', adminGetAllSchedulesForDHTMLX);
router.put('/events/:id', adminUpdateSchedule);
router.delete('/events/:id', adminDeleteSchedule);

export default router;