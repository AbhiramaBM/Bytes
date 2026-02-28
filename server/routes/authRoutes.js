import express from 'express';
import { register, login, getProfile, updateProfile, uploadProfileImage } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { profileUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile/image', authenticate, profileUpload.single('profileImage'), uploadProfileImage);

export default router;
