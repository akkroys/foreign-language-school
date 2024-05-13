import express from 'express';
import { tutorProfile, getAllStudents } from '../controllers/tutorController.js';
import { protectRoute } from '../auth/protect.js';
import {
    addScheduleSlot,
    deleteSchedule,
    updateSchedule,
    getSchedulesForDHTMLX,
} from '../controllers/scheduleController.js';
import { renderUserChats } from '../controllers/userController.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

router.get('/chats', renderUserChats);
router.use('/chats', chatRoutes);
router.get('/profile', protectRoute, tutorProfile);
router.get('/students', getAllStudents);
router.get('/events', getSchedulesForDHTMLX);
router.post('/events', addScheduleSlot);
router.put('/events/:id', updateSchedule);
router.delete('/events/:id', deleteSchedule);

export default router;