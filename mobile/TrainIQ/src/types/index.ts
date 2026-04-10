// ── Navigation ─────────────────────────────────────────

export type RootTabParamList = {
  Home: undefined;
  Training: undefined;
  Coach: undefined;
  Recovery: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ── Auth / User ────────────────────────────────────────

export type TrainingMode = 'casual' | 'professional' | 'health';

export interface User {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    age?: number;
    weightKg?: number;
    heightCm?: number;
    sport?: string;
    trainingMode: TrainingMode;
    avatarUrl?: string;
  };
  settings: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    weekStartsOn: 'monday' | 'sunday';
  };
  connectedSources: {
    appleHealth: boolean;
    whoop: { connected: boolean };
  };
}

export interface AuthResponse {
  token: string;
  userId: string;
}

// ── UI Component Props ─────────────────────────────────

export interface RecoveryMetric {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}

export interface CoachRecommendation {
  id: string;
  title: string;
  description: string;
  tag: string;
  type?: string;
  priority?: string;
}

export interface WeeklyLoad {
  day: string;
  load: number;
  max: number;
}

// ── API Response Types ─────────────────────────────────

export interface ReadinessResponse {
  _id?: string;
  score: number;
  breakdown: {
    sleep: number;
    hrv: number;
    strain: number;
    recovery: number;
  };
  label: 'peak' | 'good' | 'moderate' | 'low';
  date: string;
}

export interface NormalizedHealthResponse {
  _id?: string;
  date: string;
  sources: string[];
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
  recoveryScore?: number;
  strainScore?: number;
}

export interface RecommendationResponse {
  _id: string;
  date: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  actionable: boolean;
  dismissed: boolean;
}

export interface TrainingSessionResponse {
  _id: string;
  date: string;
  type: string;
  sport: string;
  title: string;
  durationMin: number;
  intensity: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  distanceKm?: number;
  source: string;
  notes?: string;
}

export interface RecoveryRecordResponse {
  _id: string;
  date: string;
  sleepQualityPct: number;
  hrvTrend: 'improving' | 'stable' | 'declining';
  fatigueLevel: string;
  muscleSoreness: number;
  mood: number;
  notes?: string;
}

export interface WeeklyPlanResponse {
  _id: string;
  weekStart: string;
  weekEnd: string;
  weeklyGoal: string;
  totalPlannedLoadMin: number;
  days: Array<{
    date: string;
    focus: string;
    plannedDurationMin: number;
    plannedIntensity: number;
    completed: boolean;
    notes?: string;
  }>;
}

// ── Apple Health Types ─────────────────────────────────

export interface HealthSyncPayload {
  date: string;
  workouts: Array<{
    type: string;
    durationMin: number;
    caloriesBurned: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    distanceKm?: number;
    startTime: string;
    endTime: string;
  }>;
  heartRate: {
    resting?: number;
    avg?: number;
    max?: number;
  };
  hrv: {
    avgMs?: number;
  };
  sleep: {
    totalMin?: number;
    stages?: Array<{
      stage: 'awake' | 'light' | 'deep' | 'rem';
      startTime: string;
      endTime: string;
      durationMin: number;
    }>;
  };
  activity: {
    steps: number;
    activeCalories: number;
    totalCalories: number;
    exerciseMin: number;
  };
}
