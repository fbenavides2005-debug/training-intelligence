import type { IAppleHealthData, IWhoopData, INormalizedHealth } from '../models/HealthData';
import type { DataSource } from '../types';

/**
 * Merges Apple Health + WHOOP data into a single normalized snapshot.
 * WHOOP values take priority for overlapping fields (HRV, resting HR).
 */
export function normalizeHealthData(
  apple?: IAppleHealthData | null,
  whoop?: IWhoopData | null,
): Partial<INormalizedHealth> {
  const sources: DataSource[] = [];
  if (apple) sources.push('apple_health');
  if (whoop) sources.push('whoop');

  return {
    sources,

    heartRate: {
      resting: whoop?.recovery?.restingHeartRate ?? apple?.heartRate?.resting,
      avg: whoop?.strain?.avgHeartRate ?? apple?.heartRate?.avg,
      max: whoop?.strain?.maxHeartRate ?? apple?.heartRate?.max,
    },

    hrvMs: whoop?.recovery?.hrvMs ?? apple?.hrv?.avgMs,
    spo2Pct: whoop?.recovery?.spo2Pct,
    skinTempC: whoop?.recovery?.skinTempC,

    sleep: {
      durationMin: whoop?.sleep?.totalMin ?? apple?.sleep?.totalMin,
      qualityPct: whoop?.sleep?.qualityPct,
      deepMin: whoop?.sleep?.deepMin,
      remMin: whoop?.sleep?.remMin,
      lightMin: whoop?.sleep?.lightMin,
      awakeMin: whoop?.sleep?.awakeMin,
    },

    activity: {
      steps: apple?.activity?.steps,
      activeCalories: apple?.activity?.activeCalories ?? whoop?.strain?.caloriesBurned,
      totalCalories: apple?.activity?.totalCalories,
      exerciseMin: apple?.activity?.exerciseMin,
    },

    recoveryScore: whoop?.recovery?.score,
    strainScore: whoop?.strain?.score,
  };
}
