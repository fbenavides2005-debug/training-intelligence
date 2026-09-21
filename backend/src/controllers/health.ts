import { Request, Response, NextFunction } from 'express';
import { AppleHealthData, WhoopData, NormalizedHealth } from '../models/HealthData';
import { normalizeHealthData } from '../services/normalizer';

/**
 * POST /api/health/apple — Sync Apple Health data for a given date
 */
export async function syncAppleHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, workouts, heartRate, hrv, sleep, activity } = req.body;

    if (!date) {
      res.status(400).json({ error: 'date is required' });
      return;
    }

    const dayStart = new Date(date);
    if (isNaN(dayStart.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    dayStart.setUTCHours(0, 0, 0, 0);

    const appleData = await AppleHealthData.findOneAndUpdate(
      { userId: req.userId, date: dayStart },
      { userId: req.userId, date: dayStart, workouts, heartRate, hrv, sleep, activity },
      { upsert: true, new: true },
    );

    // Re-normalize
    const whoopData = await WhoopData.findOne({ userId: req.userId, date: dayStart });
    const normalized = normalizeHealthData(appleData, whoopData);

    await NormalizedHealth.findOneAndUpdate(
      { userId: req.userId, date: dayStart },
      { userId: req.userId, date: dayStart, ...normalized },
      { upsert: true, new: true },
    );

    res.json({ message: 'Apple Health data synced', date: dayStart });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/health/whoop — Sync WHOOP data for a given date
 */
export async function syncWhoop(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, cycleId, recovery, strain, sleep } = req.body;

    if (!date) {
      res.status(400).json({ error: 'date is required' });
      return;
    }

    const dayStart = new Date(date);
    if (isNaN(dayStart.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    dayStart.setUTCHours(0, 0, 0, 0);

    const whoopData = await WhoopData.findOneAndUpdate(
      { userId: req.userId, date: dayStart },
      { userId: req.userId, date: dayStart, cycleId, recovery, strain, sleep },
      { upsert: true, new: true },
    );

    // Re-normalize
    const appleData = await AppleHealthData.findOne({ userId: req.userId, date: dayStart });
    const normalized = normalizeHealthData(appleData, whoopData);

    await NormalizedHealth.findOneAndUpdate(
      { userId: req.userId, date: dayStart },
      { userId: req.userId, date: dayStart, ...normalized },
      { upsert: true, new: true },
    );

    res.json({ message: 'WHOOP data synced', date: dayStart });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/health/today — Get today's normalized health snapshot
 */
export async function getToday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const data = await NormalizedHealth.findOne({ userId: req.userId, date: today });
    if (!data) {
      res.json({ message: 'No health data for today yet', data: null });
      return;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/health/history?days=7 — Get health data history
 */
export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawDays = req.query.days;
    const days = Math.min(Number(typeof rawDays === 'string' ? rawDays : undefined) || 7, 90);
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setDate(since.getDate() - days);

    const data = await NormalizedHealth.find({
      userId: req.userId,
      date: { $gte: since },
    }).sort({ date: -1 });

    res.json(data);
  } catch (err) {
    next(err);
  }
}
