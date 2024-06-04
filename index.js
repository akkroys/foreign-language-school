import express from 'express';
import path from 'path';
import mainRouter from './routes/main.js';
import loginRoutes from './routes/login.js';
import passport from 'passport';
import './auth/passport.js';
import session from 'express-session';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import { ensureRole } from './auth/protect.js';
import commonRoutes from './routes/commonRoutes.js';
import { Server } from 'socket.io';
import http from 'http';
import multer from 'multer';
import bodyParser from 'body-parser';
import { sendMessage as sendMessageController } from './controllers/messageController.js';
import { updateUserProfile } from './controllers/userController.js';
import connection from './database.js';
const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(upload.any()); 
app.use(multer().any());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', (data) => {
        console.log('Message received:', data);

        const req = {
            params: { chatId: data.chatId },
            body: { senderId: data.senderId, receiverId: data.receiverId, message: data.message },
        };
        const res = {
            status: (code) => ({
                json: (result) => {
                    if (code >= 400) {
                        console.error('Error:', result.error);
                    } else {
                        console.log('Message sent:', result);

                        io.emit('broadcastMessage', {
                            chatId: data.chatId,
                            senderId: data.senderId,
                            receiverId: data.receiverId,
                            message: data.message,
                            messageTime: new Date(),
                        });
                    }
                },
            }),
        };

        sendMessageController(req, res);
    });


    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });


});

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'CZlWUyvGnx7Df9PktWxJMGy7',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static(path.join(process.cwd(), '/views')));
app.use('/', mainRouter);
app.use('/', loginRoutes);
app.use('/', commonRoutes);

const uploadsDir = path.join(process.cwd(), '/views/resources/uploads/');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueFilename = `${req.user.id}_${file.originalname}`;
        cb(null, uniqueFilename);
    },
});

export const upload = multer({ storage });
app.use(upload.any());
commonRoutes.post('/profile/update', upload.single('photo'), updateUserProfile);

app.use('/admin', ensureRole('admin'), adminRoutes);
app.use('/user', ensureRole('user'), userRoutes);
app.use('/tutor', ensureRole('tutor'), tutorRoutes);
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.sendStatus(500);
            return;
        }
        res.redirect('/');
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
