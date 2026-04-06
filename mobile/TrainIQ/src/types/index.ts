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

export type RootTabParamList = {
  Home: undefined;
  Training: undefined;
  Coach: undefined;
  Recovery: undefined;
  Profile: undefined;
};
