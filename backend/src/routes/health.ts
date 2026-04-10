import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { syncAppleHealth, syncWhoop, getToday, getHistory } from '../controllers/health';

const router = Router();

router.use(authenticate);

// POST  /api/health/apple   — sync Apple Health snapshot
router.post('/apple', syncAppleHealth);

// POST  /api/health/whoop   — sync WHOOP snapshot
router.post('/whoop', syncWhoop);

// GET   /api/health/today   — normalized data for today
router.get('/today', getToday);

// GET   /api/health/history?days=7  — historical data
router.get('/history', getHistory);

export default router;
