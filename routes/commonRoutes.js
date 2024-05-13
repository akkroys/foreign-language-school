import express from 'express';
import { ensureAuthenticated, addUserRole } from '../auth/protect.js';
import { commonDashboard, commonProfile, updateStudentProfile } from '../controllers/commonRoutesControllers.js';
import { updatePassword} from '../controllers/userController.js';
// import { updateUserProfile } from '../controllers/userController.js';
import { updateStudentWish } from '../controllers/studentController.js';
import { updateTutorAbout } from '../controllers/tutorController.js';
// import { upload } from '../index.js';

const router = express.Router();

router.use(ensureAuthenticated);
router.use(addUserRole);

router.get('/dashboard', commonDashboard);
router.get('/profile', commonProfile);
// router.post('/profile/update', upload.single('photo'), updateUserProfile);
router.post('/profile/update-wish', updateStudentWish);
router.post('/profile/updatePassword', updatePassword);
router.post('/update-about', updateTutorAbout);

export default router;