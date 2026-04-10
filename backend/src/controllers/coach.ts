import { Request, Response } from 'express';
import { NormalizedHealth } from '../models/HealthData';
import { Readiness } from '../models/Coach';
import { Recommendation, WeeklyPlan } from '../models/Coach';
import { computeReadiness } from '../services/readiness';

/**
 * GET /api/coach/readiness — Get today's readiness score
 * Computes it on the fly from the latest normalized health data.
 */
export async function getReadiness(req: Request, res: Response): Promise<void> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const healthData = await NormalizedHealth.findOne({ userId: req.userId, date: today });
  if (!healthData) {
    res.json({
      message: 'No health data available to compute readiness',
      readiness: null,
    });
    return;
  }

  const result = computeReadiness(healthData);

  // Persist the computed readiness
  const readiness = await Readiness.findOneAndUpdate(
    { userId: req.userId, date: today },
    { userId: req.userId, date: today, ...result },
    { upsert: true, new: true },
  );

  res.json(readiness);
}

/**
 * GET /api/coach/readiness/history?days=7 — Readiness score history
 */
export async function getReadinessHistory(req: Request, res: Response): Promise<void> {
  const days = Math.min(Number(req.query.days) || 7, 90);
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setDate(since.getDate() - days);

  const data = await Readiness.find({
    userId: req.userId,
    date: { $gte: since },
  }).sort({ date: -1 });

  res.json(data);
}

/**
 * GET /api/coach/recommendations — Get today's AI recommendations
 */
export async function getRecommendations(req: Request, res: Response): Promise<void> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const recommendations = await Recommendation.find({
    userId: req.userId,
    date: today,
    dismissed: false,
  }).sort({ priority: -1 });

  res.json(recommendations);
}

/**
 * PATCH /api/coach/recommendations/:id/dismiss — Dismiss a recommendation
 */
export async function dismissRecommendation(req: Request, res: Response): Promise<void> {
  const rec = await Recommendation.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { dismissed: true },
    { new: true },
  );

  if (!rec) {
    res.status(404).json({ error: 'Recommendation not found' });
    return;
  }

  res.json(rec);
}

/**
 * GET /api/coach/plan — Get current weekly plan
 */
export async function getWeeklyPlan(req: Request, res: Response): Promise<void> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setUTCHours(0, 0, 0, 0);

  const plan = await WeeklyPlan.findOne({
    userId: req.userId,
    weekStart: monday,
  });

  if (!plan) {
    res.json({ message: 'No weekly plan generated yet', plan: null });
    return;
  }

  res.json(plan);
}

/**
 * PATCH /api/coach/plan/day/:index/complete — Mark a plan day as completed
 */
export async function completePlanDay(req: Request, res: Response): Promise<void> {
  const dayIndex = Number(req.params.index);
  if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
    res.status(400).json({ error: 'Day index must be 0–6' });
    return;
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setUTCHours(0, 0, 0, 0);

  const plan = await WeeklyPlan.findOneAndUpdate(
    { userId: req.userId, weekStart: monday },
    { $set: { [`days.${dayIndex}.completed`]: true } },
    { new: true },
  );

  if (!plan) {
    res.status(404).json({ error: 'No plan found for this week' });
    return;
  }

  res.json(plan);
}
