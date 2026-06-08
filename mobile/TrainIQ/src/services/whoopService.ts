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

export async function getWhoopWorkouts() {
  try {
    const res = await fetch(`${BACKEND}/api/whoop/workouts`);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      records?: Array<{
        id?: number;
        sport_id?: number;
        created_at?: string;
        updated_at?: string;
        start?: string;
        end?: string;
        timezone_offset?: string;
        score_state?: string;
        score?: {
          strain?: number;
          average_heart_rate?: number;
          max_heart_rate?: number;
          kilojoule?: number;
          percent_recorded?: number;
          distance_meter?: number;
          altitude_gain_meter?: number;
          altitude_change_meter?: number;
          zone_duration?: {
            zone_zero_milli?: number;
            zone_one_milli?: number;
            zone_two_milli?: number;
            zone_three_milli?: number;
            zone_four_milli?: number;
            zone_five_milli?: number;
          };
        };
      }>;
    };

    return (data.records ?? []).map((r) => ({
      id: r.id ?? 0,
      sport_id: r.sport_id ?? 0,
      created_at: r.created_at ?? '',
      updated_at: r.updated_at ?? '',
      start: r.start ?? '',
      end: r.end ?? '',
      timezone_offset: r.timezone_offset ?? '',
      score_state: r.score_state ?? '',
      score: r.score ? {
        strain: r.score.strain ?? 0,
        average_heart_rate: r.score.average_heart_rate ?? 0,
        max_heart_rate: r.score.max_heart_rate ?? 0,
        kilojoule: r.score.kilojoule ?? 0,
        percent_recorded: r.score.percent_recorded ?? 0,
        distance_meter: r.score.distance_meter,
        altitude_gain_meter: r.score.altitude_gain_meter,
        altitude_change_meter: r.score.altitude_change_meter,
        zone_duration: r.score.zone_duration,
      } : undefined,
    }));
  } catch {
    return [];
  }
}
