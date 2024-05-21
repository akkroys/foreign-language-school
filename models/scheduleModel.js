import connection from '../dbConnection.js';

export default class ScheduleModel {
    static addScheduleSlot(tutorId, startDate, endDate, note, status, callback) {
        const createdDate = new Date();
        const insertSchedulesQuery = `
            INSERT INTO schedules (tutorId, startDate, endDate, note) 
            VALUES (?, ?, ?, ?)
        `;

        const insertScheduleMetadataQuery = `
            INSERT INTO schedule_metadata (scheduleId, tutorFullName, createdDate, status)
            VALUES (?, ?, ?, ?)
        `;
        const checkDuplicateQuery = `
        SELECT id FROM schedules
        WHERE tutorId = ? AND startDate = ? AND endDate = ?
        `;

        connection.query(checkDuplicateQuery, [tutorId, startDate, endDate], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.length > 0) {
                return callback(new Error("Duplicate slot found"), null);
            }

            connection.query(insertSchedulesQuery, [tutorId, startDate, endDate, note], (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                const scheduleId = results.insertId;

                connection.query(
                    'SELECT firstName, middleName, lastName FROM users WHERE id = ?',
                    [tutorId],
                    (tutorError, tutorResults) => {
                        if (tutorError) {
                            return callback(tutorError, null);
                        }

                        const tutor = tutorResults[0];
                        const tutorFullName = `${tutor.firstName} ${tutor.middleName || ''} ${tutor.lastName}`.trim();

                        connection.query(
                            insertScheduleMetadataQuery,
                            [scheduleId, tutorFullName, createdDate, status],
                            (metaError, metaResults) => {
                                if (metaError) {
                                    return callback(metaError, null);
                                }

                                return callback(null, scheduleId);
                            }
                        );
                    }
                );
            });
        });
    }


    static deleteSchedule(scheduleId, callback) {
        const deleteSchedulesQuery = 'DELETE FROM schedules WHERE id = ?';
        const deleteScheduleMetadataQuery = 'DELETE FROM schedule_metadata WHERE scheduleId = ?';

        connection.query(deleteSchedulesQuery, [scheduleId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            connection.query(deleteScheduleMetadataQuery, [scheduleId], (metaError, metaResults) => {
                if (metaError) {
                    return callback(metaError, null);
                }

                return callback(null, results.affectedRows);
            });
        });
    }

    static getSchedulesForDHTMLX(tutorId, callback) {
        if (typeof tutorId !== 'number') {
            const error = new Error("Invalid tutorId");
            console.error("Error in getSchedulesForDHTMLX:", error);
            return callback(error, null);
        }

        const query = `
            SELECT 
                schedules.id,
                schedules.startDate,
                schedules.endDate,
                schedules.note,
                schedule_metadata.status
            FROM schedules 
            JOIN schedule_metadata 
            ON schedule_metadata.scheduleId = schedules.id 
            WHERE schedules.tutorId = ?
        `;

        connection.query(query, [tutorId], (error, results) => {
            if (error) {
                console.error("SQL Error:", error);
                return callback(error, null);
            }

            const formattedResults = results.map(schedule => ({
                id: schedule.id,
                start_date: schedule.startDate,
                end_date: schedule.endDate,
                text: schedule.note,
                status: schedule.status
            }));

            callback(null, formattedResults);
        });
    }


    static getFullScheduleData(tutorId, callback) {
        if (typeof tutorId !== 'number') {
            const error = new Error("Invalid tutorId");
            console.error("Error in getSchedulesForDHTMLX:", error);
            return callback(error, null);
        }
        const query = `
            SELECT 
                schedules.id, 
                schedules.startDate, 
                schedules.endDate, 
                schedules.note, 
                schedule_metadata.status,
                schedule_metadata.userId,
                schedule_metadata.tutorFullName,
                schedule_metadata.userName,
                schedule_metadata.courseId
            FROM schedules 
            JOIN schedule_metadata 
            ON schedule_metadata.scheduleId = schedules.id 
            WHERE schedules.tutorId = ?
        `;

        console.log('Executing query:', query, 'with tutorId:', tutorId);

        connection.query(query, [tutorId], (err, results) => {
            if (err) {
                console.error("Ошибка при получении данных расписания:", err);
                return callback(err, null);
            }
            console.log('func tutorId2', tutorId);
            console.log('results', results);

            callback(null, results);
        });
    }

    static updateSchedule(scheduleId, updateDetails, callback) {
        const { userId, userName, courseId, status, note } = updateDetails;

        const updateMetadataQuery = `
            UPDATE schedule_metadata 
            SET 
                userId = ?, 
                userName = ?, 
                courseId = ?, 
                status = ? 
            WHERE 
                scheduleId = ?
        `;

        const updateScheduleNoteQuery = `
            UPDATE schedules 
            SET 
                note = ? 
            WHERE 
                id = ?
        `;

        connection.query(updateMetadataQuery, [userId, userName, courseId, status, scheduleId], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            connection.query(updateScheduleNoteQuery, [note, scheduleId], (err, results) => {
                if (err) {
                    return callback(err, null);
                }

                if (status === 2) {
                    const insertReadyDateQuery = `
                        INSERT INTO readyDate (date, scheduledToId) 
                        VALUES (?, ?)
                    `;
                    connection.query(insertReadyDateQuery, [new Date(), scheduleId], (err, results) => {
                        if (err) {
                            return callback(err, null);
                        }

                        return callback(null, results.affectedRows);
                    });
                } else if (status === 4) {
                    const insertSkippedDateQuery = `
                        INSERT INTO skippedDate (date, wasWarn, initPaid, scheduledToId) 
                        VALUES (?, ?, ?, ?)
                    `;
                    connection.query(insertSkippedDateQuery, [new Date(), 0, 0, scheduleId], (err, results) => {
                        if (err) {
                            return callback(err, null);
                        }

                        return callback(null, results.affectedRows);
                    });
                } else {
                    return callback(null, results.affectedRows);
                }
            });
        });
    }

    static getUserSchedule(userId, callback) {
        const query = `
            SELECT 
                schedules.startDate,
                schedules.id,
                schedules.endDate,
                schedule_metadata.tutorFullName,
                schedule_metadata.courseId,
                schedule_metadata.status
            FROM 
                schedules 
            JOIN 
                schedule_metadata 
            ON 
                schedule_metadata.scheduleId = schedules.id
            WHERE 
                schedule_metadata.userId = ?
        `;

        connection.query(query, [userId], (err, results) => {
            if (err) {
                console.error("Ошибка при получении данных расписания:", err);
                return callback(err, null);
            }

            callback(null, results);
        });
    }

    static getById(slotId, callback) {
        const query = `
            SELECT 
                schedules.id,
                schedules.startDate,
                schedules.endDate,
                schedules.note,
                schedules.tutorId,
                schedule_metadata.status,
                schedule_metadata.userId,
                schedule_metadata.tutorFullName,
                schedule_metadata.userName
            FROM schedules
            JOIN schedule_metadata
            ON schedule_metadata.scheduleId = schedules.id
            WHERE schedules.id = ?
        `;

        connection.query(query, [slotId], (err, results) => {
            if (err) {
                console.error("Ошибка при получении слота по ID:", err);
                return callback(err, null);
            }

            if (results.length === 0) {
                return callback(null, null);
            }

            return callback(null, results[0]);
        });
    }

    static adminGetAllSchedulesForDHTMLX(callback) {
        const query = `
            SELECT 
                s.id,
                s.startDate AS start_date,
                s.endDate AS end_date,
                s.note,
                sm.status,
                sm.userName AS student_name,
                sm.tutorFullName AS tutor_name
            FROM schedules s
            JOIN schedule_metadata sm ON s.id = sm.scheduleId
            WHERE sm.status != 0;
        `;

        connection.query(query, (error, results) => {
            if (error) {
                console.error("Ошибка при получении расписания:", error);
                return callback(error, null);
            }

            const formattedResults = results.map(schedule => ({
                id: schedule.id,
                start_date: schedule.start_date ? schedule.start_date : "",
                end_date: schedule.end_date ? schedule.end_date : "",
                text: schedule.note ? schedule.note : "",
                status: schedule.status !== null ? schedule.status : "",
                student_name: schedule.student_name ? schedule.student_name : "",
                tutor_name: schedule.tutor_name ? schedule.tutor_name : ""
            }));

            callback(null, formattedResults);
        });
    }

    static adminDeleteSchedule(id, callback) {
        const deleteSchedulesQuery = 'DELETE FROM schedules WHERE id = ?';
        const deleteScheduleMetadataQuery = 'DELETE FROM schedule_metadata WHERE scheduleId = ?';

        connection.query(deleteSchedulesQuery, [id], (error, results) => {
            if (error) {
                return callback(error);
            }

            connection.query(deleteScheduleMetadataQuery, [id], (metaError, metaResults) => {
                if (metaError) {
                    return callback(metaError);
                }

                callback(null, results.affectedRows);
            });
        });
    }

    static adminUpdateSchedule(id, updateDetails, callback) {
        const { userId, userName, courseId, status, note } = updateDetails;

        const updateMetadataQuery = `
            UPDATE schedule_metadata 
            SET 
                userId = ?, 
                userName = ?, 
                courseId = ?, 
                status = ? 
            WHERE 
                scheduleId = ?
        `;

        const updateScheduleNoteQuery = `
            UPDATE schedules 
            SET 
                note = ? 
            WHERE 
                id = ?
        `;

        connection.query(updateMetadataQuery, [userId, userName, courseId, status, id], (err, results) => {
            if (err) {
                return callback(err);
            }

            connection.query(updateScheduleNoteQuery, [note, id], (err, results) => {
                if (err) {
                    return callback(err);
                }

                if (status === 2) {
                    const insertReadyDateQuery = `
                        INSERT INTO readyDate (date, scheduledToId) 
                        VALUES (?, ?)
                    `;
                    connection.query(insertReadyDateQuery, [new Date(), id], (err, results) => {
                        if (err) {
                            return callback(err);
                        }

                        callback(null, results.affectedRows);
                    });
                } else if (status === 4) {
                    const insertSkippedDateQuery = `
                        INSERT INTO skippedDate (date, wasWarn, initPaid, scheduledToId) 
                        VALUES (?, ?, ?, ?)
                    `;
                    connection.query(insertSkippedDateQuery, [new Date(), 0, 0, id], (err, results) => {
                        if (err) {
                            return callback(err);
                        }

                        callback(null, results.affectedRows);
                    });
                } else {
                    callback(null, results.affectedRows);
                }
            });
        });
    }
}
