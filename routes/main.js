import express from 'express';
import mainPageController from '../controllers/mainPageController.js';

const router = express.Router();

router.get('/', mainPageController.mainView);

export default router;