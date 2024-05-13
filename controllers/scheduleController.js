import ScheduleModel from '../models/scheduleModel.js';
import TutorModel from '../models/tutorModel.js';
import UserModel from '../models/userModel.js';
import ChatModel from '../models/chatModel.js';
import { createChat } from './chatController.js';

export const addScheduleSlot = (req, res) => {
    const tutorId = req.user.id;
    const { start_date, end_date, text } = req.body;

    ScheduleModel.addScheduleSlot(tutorId, start_date, end_date, text, (error, scheduleId) => {
        if (error) {
            console.error("Ошибка при добавлении слота расписания:", error);
            return res.status(500).send("Ошибка при добавлении слота расписания");
        }

        res.status(201).send({ message: "Слот добавлен", scheduleId });
    });
};

export const deleteSchedule = (req, res) => {
    const scheduleId = req.params.id;

    ScheduleModel.deleteSchedule(scheduleId, (error, affectedRows) => {
        if (error) {
            console.error("Ошибка при удалении слота расписания:", error);
            return res.status(500).send("Ошибка при удалении слота");
        }

        if (affectedRows === 0) {
            return res.status(404).send("Слот не найден");
        }

        res.status(200).send("Слот удален");
    });
};

export const updateSchedule = (req, res) => {
    const scheduleId = req.params.id;
    const newDetails = req.body;

    ScheduleModel.updateSchedule(scheduleId, newDetails, (error, affectedRows) => {
        if (error) {
            console.error("Ошибка при обновлении слота расписания:", error);
            return res.status(500).send("Ошибка при обновлении");
        }

        if (affectedRows === 0) {
            return res.status(404).send("Слот не найден");
        }

        res.status(200).send("Слот обновлен");
    });
};

export const getSchedulesForDHTMLX = (req, res, callback) => {
    const tutorId = req.user.id;
    if (!tutorId) {
        const error = new Error("Invalid tutorId");
        return callback(error, null);
    }

    ScheduleModel.getSchedulesForDHTMLX(tutorId, (error, schedules) => {
        if (error) {
            return callback(error, null);
        }

        callback(null, schedules);
    });
};


export const getFullScheduleData = (req, res) => {
    const tutorId = req.params;

    ScheduleModel.getFullScheduleData(tutorId, (error, schedules) => {
        if (error) {
            console.error("Ошибка при получении полного расписания:", error);
            return res.status(500).send("Ошибка при получении расписания");
        }

        res.status(200).json(schedules);
    });
};

export const getSchedulesByDate = (req, res) => {
    const { startDate, endDate } = req.query;

    ScheduleModel.getSchedulesByDate(startDate, endDate, (error, schedules) => {
        if (error) {
            console.error("Ошибка при получении расписаний по дате:", error);
            return res.status(500).send("Ошибка при получении расписаний");
        }

        res.status(200).json(schedules);
    });
};

export const bookLesson = (req, res) => {
    const { slotId } = req.body;

    if (!slotId) {
        return res.status(400).json({ error: 'slotId is required' });
    }

    const userId = req.user.id;
    const userName = `${req.user.firstName} ${req.user.lastName}`;

    ScheduleModel.getById(slotId, (err, slot) => {
        if (err) {
            console.error("Ошибка при получении данных о слоте:", err);
            return res.status(500).json({ error: 'Ошибка при получении данных о слоте' });
        }

        if (!slot) {
            return res.status(404).json({ error: 'Слот не найден' });
        }

        const tutorId = slot.tutorId;

        TutorModel.getFullScheduleData(tutorId, (error, scheduleData) => {
            if (error) {
                console.error("Ошибка при получении данных расписания:", error);
                return res.status(500).json({ error: 'Ошибка при получении данных расписания' });
            }

            const updatedDetails = {
                note: `Занятие с ${userName}`,
                userId,
                userName,
                status: 1 
            };

            ScheduleModel.updateSchedule(slotId, updatedDetails, (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Ошибка при обновлении расписания:", updateErr);
                    return res.status(500).json({ error: 'Ошибка при обновлении расписания' });
                }

                ChatModel.getExistingChat(userId, tutorId, (chatError, existingChat) => {
                    if (chatError) {
                        console.error("Ошибка при проверке существования чата:", chatError);
                        return res.status(500).json({ error: 'Ошибка при создании чата' });
                    }

                    if (!existingChat) {
                        createChat(userId, tutorId, (createError, newChat) => {
                            if (createError) {
                                console.error("Ошибка при создании нового чата:", createError);
                                return res.status(500).json({ error: 'Ошибка при создании нового чата' });
                            }

                            console.log("Новый чат создан:", newChat.id);
                        });
                    } else {
                        console.log("Чат уже существует:", existingChat.id);
                    }
                });

                return res.status(200).json({ success: true, message: 'Занятие успешно забронировано' });
            });
        });
    });
};


export const getUserSchedule = (req, callback) => {
    const userId = req.user.id;

    ScheduleModel.getUserSchedule(userId, (err, schedules) => {
        if (err) {
            console.error("Ошибка при получении расписания пользователя:", err);
            return callback(err, null);
        }

        const sanitizedSchedules = schedules.map(schedule => ({
            id: schedule.id,
            start_date: new Date(schedule.startDate).toISOString(),
            end_date: new Date(schedule.endDate).toISOString(),
            text: schedule.tutorFullName,
        }));
        
        sanitizedSchedules.forEach(schedule => {
            delete schedule.startDate;
            delete schedule.endDate;
        });

        console.log("Sanitized schedules:", sanitizedSchedules);

        callback(null, sanitizedSchedules);
    });
};