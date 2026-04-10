import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, updateSettings } from '../controllers/user';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET    /api/user/profile
router.get('/profile', getProfile);

// PATCH  /api/user/profile
router.patch('/profile', updateProfile);

// PATCH  /api/user/settings
router.patch('/settings', updateSettings);

export default router;
