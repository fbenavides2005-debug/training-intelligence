import * as WebBrowser from 'expo-web-browser';

const BACKEND = 'https://ubiquitous-spork-97p65j6qjxvp29rxg-4000.app.github.dev';

// ── Auth ──────────────────────────────────────────────────

/**
 * Open the WHOOP OAuth flow in a browser. Returns true if the browser was
 * opened (success/failure is determined by polling whoopStatus afterwards).
 */
export async function whoopAuth(): Promise<void> {
  await WebBrowser.openBrowserAsync(`${BACKEND}/api/whoop/auth`, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  });
}

// ── Status ────────────────────────────────────────────────

export async function whoopStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND}/api/whoop/status`);
    if (!res.ok) return false;
    const data = (await res.json()) as { connected: boolean };
    return data.connected;
  } catch {
    return false;
  }
}

// ── Data fetchers ─────────────────────────────────────────

export interface WhoopRecovery {
  recoveryScore: number;
  hrvRmssd: number;
  restingHeartRate: number;
  spo2?: number;
  skinTempCelsius?: number;
}

export interface WhoopSleep {
  totalHours: number;
  deepHours: number;
  remHours: number;
  lightHours: number;
  sleepEfficiency?: number;
}

export interface WhoopWorkout {
  id: number;
  sport: string;
  startTime: string;
  durationMin: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  kilojoules?: number;
  strain?: number;
}

export async function getWhoopRecovery(): Promise<WhoopRecovery | null> {
  try {
    const res = await fetch(`${BACKEND}/api/whoop/recovery`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      records?: Array<{
        score?: {
          recovery_score?: number;
          hrv_rmssd_milli?: number;
          resting_heart_rate?: number;
          spo2_percentage?: number;
          skin_temp_celsius?: number;
        };
      }>;
    };
    const record = data.records?.[0];
    if (!record?.score) return null;
    return {
      recoveryScore: Math.round(record.score.recovery_score ?? 0),
      hrvRmssd: Math.round(record.score.hrv_rmssd_milli ?? 0),
      restingHeartRate: Math.round(record.score.resting_heart_rate ?? 0),
      spo2: record.score.spo2_percentage,
      skinTempCelsius: record.score.skin_temp_celsius,
    };
  } catch {
    return null;
  }
}

export async function getWhoopSleep(): Promise<WhoopSleep | null> {
  try {
    const res = await fetch(`${BACKEND}/api/whoop/sleep`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      records?: Array<{
        score?: {
          stage_summary?: {
            total_in_bed_time_milli?: number;
            total_awake_time_milli?: number;
            total_light_sleep_time_milli?: number;
            total_slow_wave_sleep_time_milli?: number;
            total_rem_sleep_time_milli?: number;
          };
          sleep_efficiency_percentage?: number;
          sleep_performance_percentage?: number;
        };
      }>;
    };
    const score = data.records?.[0]?.score;
    const stage = score?.stage_summary;
    if (!stage) return null;

    const msToHrs = (ms: number) => parseFloat((ms / 3_600_000).toFixed(1));

    const deep = msToHrs(stage.total_slow_wave_sleep_time_milli ?? 0);
    const rem = msToHrs(stage.total_rem_sleep_time_milli ?? 0);
    const light = msToHrs(stage.total_light_sleep_time_milli ?? 0);
    const total = parseFloat((deep + rem + light).toFixed(1));

    return {
      totalHours: total,
      deepHours: deep,
      remHours: rem,
      lightHours: light,
      sleepEfficiency: score?.sleep_efficiency_percentage,
    };
  } catch {
    return null;
  }
}

export async function getWhoopWorkouts(): Promise<WhoopWorkout[]> {
  try {
    const res = await fetch(`${BACKEND}/api/whoop/workouts`);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      records?: Array<{
        id?: number;
        sport_id?: number;
        sport_name?: string;
        start?: string;
        end?: string;
        score?: {
          strain?: number;
          average_heart_rate?: number;
          max_heart_rate?: number;
          kilojoule?: number;
        };
      }>;
    };

    return (data.records ?? []).map((r) => {
      const startMs = r.start ? new Date(r.start).getTime() : 0;
      const endMs = r.end ? new Date(r.end).getTime() : startMs;
      return {
        id: r.id ?? 0,
        sport: r.sport_name ?? sportName(r.sport_id ?? -1),
        startTime: r.start ?? '',
        durationMin: Math.round((endMs - startMs) / 60_000),
        avgHeartRate: r.score?.average_heart_rate,
        maxHeartRate: r.score?.max_heart_rate,
        kilojoules: r.score?.kilojoule,
        strain: r.score?.strain,
      };
    });
  } catch {
    return [];
  }
}

function sportName(id: number): string {
  const map: Record<number, string> = {
    0: 'Running',
    1: 'Cycling',
    16: 'Baseball',
    17: 'Basketball',
    18: 'Rowing',
    19: 'Fencing',
    20: 'Field Hockey',
    21: 'Football',
    22: 'Golf',
    24: 'Ice Hockey',
    25: 'Lacrosse',
    27: 'Rugby',
    28: 'Sailing',
    29: 'Skiing',
    30: 'Soccer',
    31: 'Softball',
    32: 'Squash',
    33: 'Swimming',
    34: 'Tennis',
    35: 'Track & Field',
    36: 'Volleyball',
    37: 'Water Polo',
    38: 'Wrestling',
    39: 'Boxing',
    42: 'Dance',
    43: 'Pilates',
    44: 'Yoga',
    45: 'Weightlifting',
    47: 'Cross Country Skiing',
    48: 'Functional Fitness',
    49: 'Duathlon',
    51: 'Gymnastics',
    52: 'Hiking',
    53: 'Horseback Riding',
    55: 'Kayaking',
    56: 'Martial Arts',
    57: 'Mountain Biking',
    59: 'Paddleboarding',
    60: 'Rock Climbing',
    61: 'Rowing Machine',
    62: 'Spinning',
    63: 'Stairmaster',
    64: 'Surfing',
    65: 'Swimming',
    66: 'Triathlon',
    67: 'Walking',
    68: 'Elliptical',
    69: 'Snowboarding',
    70: 'HIIT',
    71: 'Strength',
    72: 'Cardio',
    73: 'Crossfit',
    74: 'Meditation',
  };
  return map[id] ?? 'Workout';
}
