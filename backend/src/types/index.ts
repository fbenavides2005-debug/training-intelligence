// ── Enums ──────────────────────────────────────────────

export type TrainingMode = 'casual' | 'professional' | 'health';
export type Sport = 'running' | 'cycling' | 'swimming' | 'strength' | 'crossfit' | 'yoga' | 'other';
export type DataSource = 'apple_health' | 'whoop' | 'manual';
export type RecommendationType = 'training' | 'recovery' | 'sleep' | 'nutrition' | 'general';
export type Priority = 'low' | 'medium' | 'high';
export type SessionType = 'cardio' | 'strength' | 'flexibility' | 'sport' | 'recovery' | 'other';
export type FatigueLevel = 'low' | 'moderate' | 'high' | 'critical';

// ── Health Data ────────────────────────────────────────

export interface HeartRateSample {
  timestamp: Date;
  bpm: number;
}

export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: Date;
  endTime: Date;
  durationMin: number;
}

// ── Normalized Health Snapshot ──────────────────────────

export interface NormalizedHealthData {
  date: Date;
  source: DataSource;

  // Heart
  restingHeartRate?: number;
  maxHeartRate?: number;
  avgHeartRate?: number;
  hrvMs?: number;

  // Sleep
  sleepDurationMin?: number;
  sleepQualityPct?: number;
  sleepStages?: SleepStage[];

  // Activity
  steps?: number;
  activeCalories?: number;
  totalCalories?: number;

  // WHOOP-specific
  recoveryScore?: number;
  strainScore?: number;
  sleepPerformancePct?: number;

  // SpO2 / Skin temp
  spo2Pct?: number;
  skinTempC?: number;
}

// ── Readiness ──────────────────────────────────────────

export interface ReadinessBreakdown {
  sleep: number;        // 0–25
  hrv: number;          // 0–25
  strain: number;       // 0–25
  recovery: number;     // 0–25
}

// ── JWT Payload ────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
