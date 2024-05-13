import { createCourse, deleteCourse, updateCourse, getCourseById, getCourses, getAllGoals, searchCourses, addRegistration } from '../models/courseModel.js';

export const addCourse = async (req, res) => {
    try {
        const { title, goalId } = req.body;
        const courseId = await createCourse(title, goalId);
        res.status(201).json({ message: 'Курс создан', id: courseId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteCourse(id);
        if (result > 0) {
            res.status(200).json({ message: 'Курс удален' });
        } else {
            res.status(404).json({ message: 'Курс не найден' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const editCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { newTitle, newGoalId } = req.body;
        const result = await updateCourse(id, newTitle, newGoalId);
        if (result > 0) {
            res.status(200).json({ message: 'Курс обновлен' });
        } else {
            res.status(404).json({ message: 'Курс не найден или изменения незначительны' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const courses = await getCourses();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await getCourseById(id);
        if (course) {
            res.status(200).json(course);
        } else {
            res.status(404).json({ message: 'Курс не найден' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllGoalsController = async (req, res) => {
    try {
        const goals = await getAllGoals();
        res.status(200).json(goals);
    } catch (err) {
        console.error('Error fetching goals:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const searchCourseByTitle = async (req, res) => {
    try {
        const { query } = req.query;
        const courses = await searchCourses(query);
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const registerForCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;

        await addRegistration(userId, courseId);

        res.status(200).json({ message: "Регистрация успешна" });
    } catch (err) {
        console.error("Ошибка при регистрации на курс:", err);
        res.status(500).json({ error: err.message });
    }
};