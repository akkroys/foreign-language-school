import express from 'express';
import { registerView, loginView, registerUser, loginUser } from '../controllers/loginController.js';

const router = express.Router();

router.get('/register', registerView);
router.get('/login', loginView);
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;