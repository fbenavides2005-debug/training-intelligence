import type { INormalizedHealth } from '../models/HealthData';
import type { ReadinessBreakdown } from '../types';

/**
 * Computes a daily readiness score (0–100) from normalized health data.
 *
 * Breakdown: Sleep (25), HRV (25), Strain (25), Recovery (25)
 */
export function computeReadiness(data: INormalizedHealth): {
  score: number;
  breakdown: ReadinessBreakdown;
  label: 'peak' | 'good' | 'moderate' | 'low';
} {
  // Sleep component (0–25)
  // Target: 420 min (7 hrs). 100% at ≥ 480, 0% at ≤ 240
  const sleepMin = data.sleep?.durationMin ?? 0;
  const sleepPct = Math.min(1, Math.max(0, (sleepMin - 240) / 240));
  const sleepScore = Math.round(sleepPct * 25);

  // HRV component (0–25)
  // Higher is better. Scale: 0 at ≤ 20ms, 100% at ≥ 80ms
  const hrv = data.hrvMs ?? 0;
  const hrvPct = Math.min(1, Math.max(0, (hrv - 20) / 60));
  const hrvScore = Math.round(hrvPct * 25);

  // Strain component (0–25)
  // Inverse: lower strain = more readiness. 0 at ≥ 18, 100% at ≤ 6
  const strain = data.strainScore ?? 10;
  const strainPct = Math.min(1, Math.max(0, (18 - strain) / 12));
  const strainScore = Math.round(strainPct * 25);

  // Recovery component (0–25)
  // Direct map from WHOOP recovery score (0–100) or sleep quality
  const recoverySrc = data.recoveryScore ?? data.sleep?.qualityPct ?? 50;
  const recoveryPct = Math.min(1, Math.max(0, recoverySrc / 100));
  const recoveryScore = Math.round(recoveryPct * 25);

  const score = sleepScore + hrvScore + strainScore + recoveryScore;

  const label: 'peak' | 'good' | 'moderate' | 'low' =
    score >= 80 ? 'peak' :
    score >= 60 ? 'good' :
    score >= 40 ? 'moderate' : 'low';

  return {
    score,
    breakdown: {
      sleep: sleepScore,
      hrv: hrvScore,
      strain: strainScore,
      recovery: recoveryScore,
    },
    label,
  };
}
