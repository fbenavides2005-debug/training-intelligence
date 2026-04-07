import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getReadiness,
  getReadinessHistory,
  getRecommendations,
  dismissRecommendation,
  getWeeklyPlan,
  completePlanDay,
} from '../controllers/coach';

const router = Router();

router.use(authenticate);

// GET   /api/coach/readiness              — today's readiness score
router.get('/readiness', getReadiness);

// GET   /api/coach/readiness/history      — readiness history
router.get('/readiness/history', getReadinessHistory);

// GET   /api/coach/recommendations        — today's recommendations
router.get('/recommendations', getRecommendations);

// PATCH /api/coach/recommendations/:id/dismiss
router.patch('/recommendations/:id/dismiss', dismissRecommendation);

// GET   /api/coach/plan                   — current weekly plan
router.get('/plan', getWeeklyPlan);

// PATCH /api/coach/plan/day/:index/complete
router.patch('/plan/day/:index/complete', completePlanDay);

export default router;
