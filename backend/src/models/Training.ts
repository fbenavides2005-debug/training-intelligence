import mongoose, { Schema, Document, Types } from 'mongoose';
import type { SessionType, DataSource, FatigueLevel } from '../types';

// ── Training Session ───────────────────────────────────

export interface ITrainingSession extends Document {
  userId: Types.ObjectId;
  date: Date;
  type: SessionType;
  sport: string;
  title: string;
  durationMin: number;
  intensity: number;          // 1–10 RPE
  caloriesBurned?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  distanceKm?: number;
  source: DataSource;
  notes?: string;
  createdAt: Date;
}

const sessionSchema = new Schema<ITrainingSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['cardio', 'strength', 'flexibility', 'sport', 'recovery', 'other'], required: true },
    sport: { type: String, default: 'general' },
    title: { type: String, required: true, trim: true },
    durationMin: { type: Number, required: true },
    intensity: { type: Number, min: 1, max: 10, required: true },
    caloriesBurned: Number,
    avgHeartRate: Number,
    maxHeartRate: Number,
    distanceKm: Number,
    source: { type: String, enum: ['apple_health', 'whoop', 'manual'], default: 'manual' },
    notes: String,
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1, date: -1 });

export const TrainingSession = mongoose.model<ITrainingSession>(
  'TrainingSession',
  sessionSchema,
);

// ── Recovery Record ────────────────────────────────────

export interface IRecoveryRecord extends Document {
  userId: Types.ObjectId;
  date: Date;
  sleepQualityPct: number;    // 0–100
  hrvTrend: 'improving' | 'stable' | 'declining';
  fatigueLevel: FatigueLevel;
  muscleSoreness: number;     // 1–5
  mood: number;               // 1–5
  notes?: string;
  createdAt: Date;
}

const recoverySchema = new Schema<IRecoveryRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    sleepQualityPct: { type: Number, min: 0, max: 100, required: true },
    hrvTrend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
    fatigueLevel: { type: String, enum: ['low', 'moderate', 'high', 'critical'], required: true },
    muscleSoreness: { type: Number, min: 1, max: 5, default: 3 },
    mood: { type: Number, min: 1, max: 5, default: 3 },
    notes: String,
  },
  { timestamps: true },
);

recoverySchema.index({ userId: 1, date: -1 }, { unique: true });

export const RecoveryRecord = mongoose.model<IRecoveryRecord>(
  'RecoveryRecord',
  recoverySchema,
);
