import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  age: z.number().int().min(10).max(120).optional(),
  weightKg: z.number().min(20).max(300).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  sport: z.enum(['running', 'cycling', 'swimming', 'strength', 'crossfit', 'yoga', 'other']).optional(),
  trainingMode: z.enum(['casual', 'professional', 'health']).optional(),
}).partial();

const updateSettingsSchema = z.object({
  units: z.enum(['metric', 'imperial']).optional(),
  notifications: z.boolean().optional(),
  weekStartsOn: z.enum(['monday', 'sunday']).optional(),
}).partial();

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    update[`profile.${key}`] = value;
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: update },
    { new: true },
  ).select('-passwordHash');

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    update[`settings.${key}`] = value;
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: update },
    { new: true },
  ).select('-passwordHash');

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
}
