import mongoose, { Schema, Document, Types } from 'mongoose';
import type { ReadinessBreakdown, RecommendationType, Priority } from '../types';

// ── Daily Readiness ────────────────────────────────────

export interface IReadiness extends Document {
  userId: Types.ObjectId;
  date: Date;
  score: number;              // 0–100
  breakdown: ReadinessBreakdown;
  label: 'peak' | 'good' | 'moderate' | 'low';
  createdAt: Date;
}

const readinessSchema = new Schema<IReadiness>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    breakdown: {
      sleep: { type: Number, min: 0, max: 25, required: true },
      hrv: { type: Number, min: 0, max: 25, required: true },
      strain: { type: Number, min: 0, max: 25, required: true },
      recovery: { type: Number, min: 0, max: 25, required: true },
    },
    label: { type: String, enum: ['peak', 'good', 'moderate', 'low'], required: true },
  },
  { timestamps: true },
);

readinessSchema.index({ userId: 1, date: -1 }, { unique: true });

export const Readiness = mongoose.model<IReadiness>('Readiness', readinessSchema);

// ── AI Recommendation ──────────────────────────────────

export interface IRecommendation extends Document {
  userId: Types.ObjectId;
  date: Date;
  type: RecommendationType;
  priority: Priority;
  title: string;
  description: string;
  actionable: boolean;
  dismissed: boolean;
  createdAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['training', 'recovery', 'sleep', 'nutrition', 'general'], required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    actionable: { type: Boolean, default: true },
    dismissed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

recommendationSchema.index({ userId: 1, date: -1 });

export const Recommendation = mongoose.model<IRecommendation>(
  'Recommendation',
  recommendationSchema,
);

// ── Weekly Plan ────────────────────────────────────────

export interface IWeeklyPlan extends Document {
  userId: Types.ObjectId;
  weekStart: Date;            // Monday of the week
  weekEnd: Date;              // Sunday
  days: Array<{
    date: Date;
    focus: string;            // e.g. "Upper body strength", "Active recovery"
    plannedDurationMin: number;
    plannedIntensity: number; // 1–10
    completed: boolean;
    notes?: string;
  }>;
  weeklyGoal: string;
  totalPlannedLoadMin: number;
  createdAt: Date;
  updatedAt: Date;
}

const weeklyPlanSchema = new Schema<IWeeklyPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    days: [
      {
        date: { type: Date, required: true },
        focus: { type: String, required: true },
        plannedDurationMin: { type: Number, required: true },
        plannedIntensity: { type: Number, min: 1, max: 10, required: true },
        completed: { type: Boolean, default: false },
        notes: String,
      },
    ],
    weeklyGoal: { type: String, required: true },
    totalPlannedLoadMin: { type: Number, required: true },
  },
  { timestamps: true },
);

weeklyPlanSchema.index({ userId: 1, weekStart: -1 }, { unique: true });

export const WeeklyPlan = mongoose.model<IWeeklyPlan>('WeeklyPlan', weeklyPlanSchema);
