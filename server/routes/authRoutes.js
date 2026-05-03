import express from 'express';
import { signup, login, getMe, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { signupValidation, loginValidation } from '../utils/validators.js';

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
