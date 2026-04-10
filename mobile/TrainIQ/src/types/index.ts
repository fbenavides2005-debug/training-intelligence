// ── UI Types ───────────────────────────────────────────

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
}

export interface WeeklyLoad {
  day: string;
  load: number;
  max: number;
}

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
