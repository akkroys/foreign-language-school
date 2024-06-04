import express from 'express';
import mainPageController from '../controllers/mainPageController.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('main', { user: req.user });
});

export default router;