import { api } from './authService';
import type {
  User,
  ReadinessResponse,
  NormalizedHealthResponse,
  RecommendationResponse,
  WeeklyPlanResponse,
  HealthSyncPayload,
} from '../types';

// ── User ──────────────────────────────────────────────────

export async function getUserProfile(): Promise<User> {
  const { data } = await api.get<User>('/user/profile');
  return data;
}

export async function updateProfile(updates: Record<string, unknown>): Promise<User> {
  const { data } = await api.patch<User>('/user/profile', updates);
  return data;
}

export async function updateSettings(updates: Record<string, unknown>): Promise<User> {
  const { data } = await api.patch<User>('/user/settings', updates);
  return data;
}

// ── Health ────────────────────────────────────────────────

export async function getHealthToday(): Promise<NormalizedHealthResponse | null> {
  const { data } = await api.get('/health/today');
  if (data && data.data === null) return null;
  return data;
}

export async function getHealthHistory(days = 7): Promise<NormalizedHealthResponse[]> {
  const { data } = await api.get<NormalizedHealthResponse[]>(`/health/history?days=${days}`);
  return Array.isArray(data) ? data : [];
}

export async function syncAppleHealth(payload: HealthSyncPayload): Promise<void> {
  await api.post('/health/apple', payload);
}

// ── Coach ─────────────────────────────────────────────────

export async function getReadiness(): Promise<ReadinessResponse | null> {
  try {
    const { data } = await api.get<ReadinessResponse>('/coach/readiness');
    return data;
  } catch {
    return null;
  }
}

export async function getReadinessHistory(days = 7): Promise<ReadinessResponse[]> {
  try {
    const { data } = await api.get<ReadinessResponse[]>(`/coach/readiness/history?days=${days}`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getRecommendations(): Promise<RecommendationResponse[]> {
  try {
    const { data } = await api.get<RecommendationResponse[]>('/coach/recommendations');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function dismissRecommendation(id: string): Promise<void> {
  await api.patch(`/coach/recommendations/${id}/dismiss`);
}

export async function getWeeklyPlan(): Promise<WeeklyPlanResponse | null> {
  try {
    const { data } = await api.get<WeeklyPlanResponse>('/coach/plan');
    return data;
  } catch {
    return null;
  }
}

export async function completePlanDay(index: number): Promise<void> {
  await api.patch(`/coach/plan/day/${index}/complete`);
}
