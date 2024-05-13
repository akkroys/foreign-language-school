import mysql from 'mysql2';
import dotenv from 'dotenv';


dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
    if (err) {
        console.error('An error occurred while connecting to the DB');
        throw err;
    }

    connection.query('CREATE DATABASE IF NOT EXISTS language_school', (err, result) => {
        if (err) {
            console.error('Error creating database:', err);
            throw err;
        }
        console.log('Database language_school created or already exists');
    });

    connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    lastName VARCHAR(255),
                    firstName VARCHAR(255),
                    middleName VARCHAR(255) DEFAULT NULL,
                    photo VARCHAR(255) DEFAULT 'user.png',
                    email VARCHAR(255),
                    password VARCHAR(255),
                    role VARCHAR(255) DEFAULT 'user',
                    balance FLOAT DEFAULT 0,
                    activeToken VARCHAR(255)
                )
            `, (err, result) => {
        if (err) {
            console.error('Error creating users table:', err);
            throw err;
        }
    });

    connection.query(`
                CREATE TABLE IF NOT EXISTS students (
                    userId INT,
                    wish VARCHAR(255) DEFAULT NULL,
                    startWithPayment DATETIME,
                    wasFirstPayment BIT,
                    lessonsCount INT,
                    skippedInThisMonth INT,
                    usedTrial BIT,
                    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
                )
            `, (err, result) => {
        if (err) {
            console.error('Error creating students table:', err);
            throw err;
        }
    });

    connection.query(`
                CREATE TABLE IF NOT EXISTS tutor (
                    userId INT,
                    about VARCHAR(255) DEFAULT NULL,
                    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
                )
            `, (err, result) => {
        if (err) {
            console.error('Error creating tutor table:', err);
            throw err;
        }
    });

    connection.query(`
                CREATE TABLE IF NOT EXISTS goals (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255)
                )
            `, (err, result) => {
        if (err) {
            console.error('Error creating goals table:', err);
            throw err;
        }
    });

    connection.query(`
                CREATE TABLE IF NOT EXISTS courses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255),
                    goalId INT,
                    FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
                )
            `, (err, result) => {
        if (err) {
            console.error('Error creating courses table:', err);
            throw err;
        }
    });

    connection.query(`
                CREATE TABLE IF NOT EXISTS tutorCourse (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    courseId INT,
                    tutorId INT,
                    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
                    FOREIGN KEY (tutorId) REFERENCES tutor(userId) ON DELETE CASCADE
                )
            `, (err, result) => {
        if (err) {
            console.error('Error creating tutorCourse table:', err);
            throw err;
        }
    });

    connection.query(`
                CREATE TABLE IF NOT EXISTS registrations (
                    userId INT,
                    courseId INT,
                    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
                )
            `, (err, result) => {
        if (err) {
            console.error('Error creating registrations table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS schedules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tutorId INT NOT NULL,
            startDate DATETIME,
            endDate DATETIME,
            note VARCHAR(255),
            FOREIGN KEY (tutorId) REFERENCES users(id) ON DELETE CASCADE
            );
            `, (err, result) => {
        if (err) {
            console.error('Error creating schedules table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS schedule_metadata (
            id INT AUTO_INCREMENT PRIMARY KEY,
            scheduleId INT NOT NULL,
            userId INT DEFAULT NULL,
            tutorFullName VARCHAR(255),
            createdDate DATETIME,
            userName VARCHAR(255),
            courseId VARCHAR(255),
            looped INT DEFAULT NULL,
            dateId INT,
            status INT,
            rescheduledDate DATETIME,
            newDate DATETIME,
            waitPaymentDate DATETIME,
            removeDate DATETIME,
            FOREIGN KEY (scheduleId) REFERENCES schedules(id) ON DELETE CASCADE,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            );
            `, (err, result) => {
        if (err) {
            console.error('Error creating schedules_metadata table:', err);
            throw err;
        }
    });

    connection.query(`
                CREATE TABLE IF NOT EXISTS tariffs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255),
                    lessonsCount INT,
                    amount FLOAT
                )
            `, (err, result) => {
        if (err) {
            console.error('Error creating tariffs table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS chats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT,
                inChat INT,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (inChat) REFERENCES users(id) ON DELETE CASCADE
            )
            `, (err, result) => {
        if (err) {
            console.error('Error creating chats table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                messageTime DATETIME,
                senderId VARCHAR(255),
                receiverId VARCHAR(255),
                message TEXT,
                filePath VARCHAR(255),
                chatToId INT,
                FOREIGN KEY (chatToId) REFERENCES chats(id) ON DELETE CASCADE
            )
            `, (err, result) => {
        if (err) {
            console.error('Error creating messages table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS rescheduledLessons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                oldTime DATETIME,
                newTime DATETIME,
                reason VARCHAR(255),
                initiator VARCHAR(255),
                scheduledToId INT,
                FOREIGN KEY (scheduledToId) REFERENCES schedules(id) ON DELETE CASCADE
            )
            `, (err, result) => {
        if (err) {
            console.error('Error creating rescheduledLessons table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS readyDate (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATETIME,
                scheduledToId INT,
                FOREIGN KEY (scheduledToId) REFERENCES schedules(id) ON DELETE CASCADE
            )
            `, (err, result) => {
        if (err) {
            console.error('Error creating readyDate table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS skippedDate (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATETIME,
                wasWarn BIT,
                initPaid INT,
                scheduledToId INT,
                FOREIGN KEY (scheduledToId) REFERENCES schedules(id) ON DELETE CASCADE
            )
            `, (err, result) => {
        if (err) {
            console.error('Error creating skippedDate table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS userDates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dateTime DATETIME,
                registrationToUserId INT,
                tutorToUserId INT,
                FOREIGN KEY (registrationToUserId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (tutorToUserId) REFERENCES users(id) ON DELETE CASCADE
            )
            `, (err, result) => {
        if (err) {
            console.error('Error creating userDates table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS cashFlow (
                id INT AUTO_INCREMENT PRIMARY KEY,
                amount INT,
                count INT,
                userToUserId INT,
                FOREIGN KEY (userToUserId) REFERENCES users(id) ON DELETE CASCADE
            )
            `, (err, result) => {
        if (err) {
            console.error('Error creating cashFlow table:', err);
            throw err;
        }
    });

    connection.query(`
            CREATE TABLE IF NOT EXISTS balanceHistory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATETIME,
                cashFlowId INT,
                customMessage VARCHAR(255),
                userToUserId INT,
                FOREIGN KEY (cashFlowId) REFERENCES cashFlow(id) ON DELETE CASCADE,
                FOREIGN KEY (userToUserId) REFERENCES users(id) ON DELETE CASCADE
            )
            `, (err, result) => {
        if (err) {
            console.error('Error creating balanceHistory table:', err);
            throw err;
        }
    });

    connection.query('SELECT COUNT(*) AS count FROM goals', (selectErr, selectResult) => {
        if (selectErr) {
            console.error('Error selecting data from goals:', selectErr);
            throw selectErr;
        }

        if (selectResult[0].count === 0) {
            const goals = [
                'Сдать экзамен (школа/университет)',
                'Сдать международный экзамен',
                'Бизнес-сфера',
                'Путешествовать',
                'Изучить с нуля',
                'Преодолеть языковой барьер',
                'Другое'
            ];

            const insertQuery = 'INSERT INTO goals (title) VALUES ?';

            connection.query(insertQuery, [goals.map(goal => ([goal]))], (insertErr, insertResult) => {
                if (insertErr) {
                    console.error('Error inserting data into goals:', insertErr);
                    throw insertErr;
                }
            });
        }

    });
    connection.query(
        'SELECT COUNT(*) AS count FROM tariffs',
        (selectErr, selectResult) => {
            if (selectErr) {
                console.error('Error checking tariffs table:', selectErr);
                return;
            }

            if (selectResult[0].count === 0) {
                const defaultTariffs = [
                    ['Минимальный', 4, 160],
                    ['Средний', 8, 300],
                    ['Максимальный', 16, 580]
                ];

                const insertQuery = 'INSERT INTO tariffs (title, lessonsCount, amount) VALUES ?';
                connection.query(insertQuery, [defaultTariffs], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error('Error inserting default tariffs:', insertErr);
                        return;
                    }
                    console.log('Default tariffs inserted successfully');
                });
            } else {
            }
        }
    );

    connection.end();

});

connection.on('error', function (err) {
    console.error('Database connection error:', err);
});

export default connection;