import mysql from 'mysql2';

const dbConfig = {
    host: "localhost",
    port: 3306,
    user: 'root',
    password: '123_Nastya',
    database: 'language_school'
};

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
    if (err) {
        console.error('An error occurred while connecting to the DB');
        throw err;
    }
    console.log('Connected to MySQL');
});

connection.on('error', function (err) {
    console.error('Database connection error:', err);
});

export default connection;
