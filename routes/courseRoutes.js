import express from 'express';
import {
    addCourse,
    removeCourse,
    editCourse,
    getAllCourses,
    getCourse,
    getAllGoalsController,
    searchCourseByTitle,
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/goals', getAllGoalsController);
router.get('/search', searchCourseByTitle);
router.post('/', addCourse);
router.delete('/:id', removeCourse);
router.put('/:id', editCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourse);

export default router;
