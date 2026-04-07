import mongoose, { Schema, Document, Types } from 'mongoose';
import type { DataSource, SleepStage } from '../types';

// ── Apple Health Snapshot ──────────────────────────────

export interface IAppleHealthData extends Document {
  userId: Types.ObjectId;
  date: Date;
  workouts: Array<{
    type: string;
    durationMin: number;
    caloriesBurned: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    distanceKm?: number;
    startTime: Date;
    endTime: Date;
  }>;
  heartRate: {
    resting?: number;
    avg?: number;
    max?: number;
  };
  hrv: {
    avgMs?: number;
    sdnn?: number;
  };
  sleep: {
    totalMin?: number;
    stages?: SleepStage[];
    inBedMin?: number;
  };
  activity: {
    steps: number;
    activeCalories: number;
    totalCalories: number;
    standHours: number;
    exerciseMin: number;
  };
  createdAt: Date;
}

const appleHealthSchema = new Schema<IAppleHealthData>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    workouts: [
      {
        type: { type: String },
        durationMin: Number,
        caloriesBurned: Number,
        avgHeartRate: Number,
        maxHeartRate: Number,
        distanceKm: Number,
        startTime: Date,
        endTime: Date,
      },
    ],
    heartRate: {
      resting: Number,
      avg: Number,
      max: Number,
    },
    hrv: {
      avgMs: Number,
      sdnn: Number,
    },
    sleep: {
      totalMin: Number,
      stages: [
        {
          stage: { type: String, enum: ['awake', 'light', 'deep', 'rem'] },
          startTime: Date,
          endTime: Date,
          durationMin: Number,
        },
      ],
      inBedMin: Number,
    },
    activity: {
      steps: { type: Number, default: 0 },
      activeCalories: { type: Number, default: 0 },
      totalCalories: { type: Number, default: 0 },
      standHours: { type: Number, default: 0 },
      exerciseMin: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

appleHealthSchema.index({ userId: 1, date: -1 }, { unique: true });

export const AppleHealthData = mongoose.model<IAppleHealthData>(
  'AppleHealthData',
  appleHealthSchema,
);

// ── WHOOP Snapshot ─────────────────────────────────────

export interface IWhoopData extends Document {
  userId: Types.ObjectId;
  date: Date;
  cycleId?: string;
  recovery: {
    score: number;             // 0–100
    restingHeartRate: number;
    hrvMs: number;
    spo2Pct?: number;
    skinTempC?: number;
  };
  strain: {
    score: number;             // 0–21
    avgHeartRate: number;
    maxHeartRate: number;
    caloriesBurned: number;
  };
  sleep: {
    qualityPct: number;        // 0–100 (sleep performance)
    totalMin: number;
    remMin: number;
    deepMin: number;
    lightMin: number;
    awakeMin: number;
    respiratoryRate?: number;
  };
  createdAt: Date;
}

const whoopSchema = new Schema<IWhoopData>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    cycleId: String,
    recovery: {
      score: { type: Number, required: true },
      restingHeartRate: { type: Number, required: true },
      hrvMs: { type: Number, required: true },
      spo2Pct: Number,
      skinTempC: Number,
    },
    strain: {
      score: { type: Number, required: true },
      avgHeartRate: Number,
      maxHeartRate: Number,
      caloriesBurned: Number,
    },
    sleep: {
      qualityPct: Number,
      totalMin: Number,
      remMin: Number,
      deepMin: Number,
      lightMin: Number,
      awakeMin: Number,
      respiratoryRate: Number,
    },
  },
  { timestamps: true },
);

whoopSchema.index({ userId: 1, date: -1 }, { unique: true });

export const WhoopData = mongoose.model<IWhoopData>('WhoopData', whoopSchema);

// ── Normalized Health Data ─────────────────────────────

export interface INormalizedHealth extends Document {
  userId: Types.ObjectId;
  date: Date;
  sources: DataSource[];

  heartRate: {
    resting?: number;
    avg?: number;
    max?: number;
  };
  hrvMs?: number;
  spo2Pct?: number;
  skinTempC?: number;

  sleep: {
    durationMin?: number;
    qualityPct?: number;
    deepMin?: number;
    remMin?: number;
    lightMin?: number;
    awakeMin?: number;
  };

  activity: {
    steps?: number;
    activeCalories?: number;
    totalCalories?: number;
    exerciseMin?: number;
  };

  // WHOOP-derived
  recoveryScore?: number;
  strainScore?: number;

  createdAt: Date;
  updatedAt: Date;
}

const normalizedSchema = new Schema<INormalizedHealth>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    sources: [{ type: String, enum: ['apple_health', 'whoop', 'manual'] }],
    heartRate: {
      resting: Number,
      avg: Number,
      max: Number,
    },
    hrvMs: Number,
    spo2Pct: Number,
    skinTempC: Number,
    sleep: {
      durationMin: Number,
      qualityPct: Number,
      deepMin: Number,
      remMin: Number,
      lightMin: Number,
      awakeMin: Number,
    },
    activity: {
      steps: Number,
      activeCalories: Number,
      totalCalories: Number,
      exerciseMin: Number,
    },
    recoveryScore: Number,
    strainScore: Number,
  },
  { timestamps: true },
);

normalizedSchema.index({ userId: 1, date: -1 }, { unique: true });

export const NormalizedHealth = mongoose.model<INormalizedHealth>(
  'NormalizedHealth',
  normalizedSchema,
);
