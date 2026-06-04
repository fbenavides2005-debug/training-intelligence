const API_BASE = 'https://training-intelligence-a43n.onrender.com';

export interface WhoopRecovery {
  recoveryScore: number;
  restingHeartRate: number;
  hrvRmssd: number;
  spo2: number | null;
  skinTempCelsius: number | null;
}

export interface WhoopSleep {
  totalHours: number;
  deepHours: number;
  remHours: number;
  lightHours: number;
  sleepEfficiency: number | null;
}

export async function whoopStatus(): Promise<{ connected: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/whoop/status`);
    return await res.json();
  } catch {
    return { connected: false };
  }
}

export async function getWhoopRecovery(): Promise<WhoopRecovery | null> {
  try {
    const res = await fetch(`${API_BASE}/api/whoop/recovery`);
    if (!res.ok) return null;
    const data = await res.json();
    const score = data.records?.[0]?.score;
    if (!score) return null;
    return {
      recoveryScore: Math.round(score.recovery_score ?? 0),
      restingHeartRate: Math.round(score.resting_heart_rate ?? 0),
      hrvRmssd: Math.round(score.hrv_rmssd_milli ?? 0),
      spo2: score.spo2_percentage ?? null,
      skinTempCelsius: score.skin_temp_celsius ?? null,
    };
  } catch {
    return null;
  }
}

export async function getWhoopSleep(): Promise<WhoopSleep | null> {
  try {
    const res = await fetch(`${API_BASE}/api/whoop/sleep`);
    if (!res.ok) return null;
    const data = await res.json();
    const record = data.records?.[0];
    if (!record) return null;
    const stage = record.score?.stage_summary;
    if (!stage) return null;
    const toHours = (ms: number) => Math.round((ms / 1000 / 60 / 60) * 10) / 10;
    const totalMs = (stage.total_in_bed_time_milli ?? 0) - (stage.total_awake_time_milli ?? 0);
    return {
      totalHours: toHours(totalMs),
      deepHours: toHours(stage.total_slow_wave_sleep_time_milli ?? 0),
      remHours: toHours(stage.total_rem_sleep_time_milli ?? 0),
      lightHours: toHours(stage.total_light_sleep_time_milli ?? 0),
      sleepEfficiency: record.score?.sleep_efficiency_percentage ?? null,
    };
  } catch {
    return null;
  }
}

export async function getWhoopWorkouts() {
  try {
    const res = await fetch(`${API_BASE}/api/whoop/workouts`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.records || [];
  } catch {
    return [];
  }
}

export function getWhoopAuthUrl() {
  return `${API_BASE}/api/whoop/auth`;
}

export async function whoopAuth(): Promise<void> {
  const authUrl = `${API_BASE}/api/whoop/auth`;
  if (typeof window !== 'undefined') {
    window.open(authUrl, '_blank', 'width=600,height=700');
  }
}
