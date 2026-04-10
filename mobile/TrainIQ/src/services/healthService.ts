import { Platform } from 'react-native';
import * as apiService from './apiService';
import type { HealthSyncPayload } from '../types';

// ── Apple Health Configuration ────────────────────────────
// Requires a development build with react-native-health.
// In Expo Go the native HealthKit module is unavailable;
// all sync functions degrade gracefully.

let _authorized = false;

// ── Permissions ───────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    console.log('Apple Health is only available on iOS');
    return false;
  }

  try {
    // Development build with react-native-health:
    // const AppleHealthKit = require('react-native-health').default;
    // const options = {
    //   permissions: {
    //     read: [
    //       AppleHealthKit.Constants.Permissions.Steps,
    //       AppleHealthKit.Constants.Permissions.HeartRate,
    //       AppleHealthKit.Constants.Permissions.RestingHeartRate,
    //       AppleHealthKit.Constants.Permissions.HeartRateVariability,
    //       AppleHealthKit.Constants.Permissions.SleepAnalysis,
    //       AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    //       AppleHealthKit.Constants.Permissions.Workout,
    //       AppleHealthKit.Constants.Permissions.OxygenSaturation,
    //     ],
    //   },
    // };
    // await new Promise((resolve, reject) => {
    //   AppleHealthKit.initHealthKit(options, (err: string) =>
    //     err ? reject(err) : resolve(true),
    //   );
    // });
    // _authorized = true;
    // return true;

    console.log('HealthKit requires a development build. Expo Go fallback active.');
    return false;
  } catch (err) {
    console.error('HealthKit authorization failed:', err);
    return false;
  }
}

export function isAuthorized(): boolean {
  return _authorized;
}

// ── Data Collection ───────────────────────────────────────

export async function collectTodayData(): Promise<HealthSyncPayload | null> {
  if (!_authorized) return null;

  // In a dev build this queries HealthKit for today's:
  // - Workouts (type, duration, calories, HR, distance)
  // - Heart rate (resting, avg, max)
  // - HRV (average ms)
  // - Sleep analysis (stages, duration)
  // - Activity (steps, calories, exercise minutes)
  return null;
}

// ── Sync to Backend ───────────────────────────────────────

export async function syncToBackend(payload?: HealthSyncPayload): Promise<boolean> {
  try {
    const data = payload ?? (await collectTodayData());
    if (!data) return false;

    await apiService.syncAppleHealth(data);
    return true;
  } catch (err) {
    console.error('Health sync failed:', err);
    return false;
  }
}

// ── Auto-sync on App Open ────────────────────────────────

export async function autoSync(): Promise<void> {
  if (!_authorized) {
    const granted = await requestPermissions();
    if (!granted) return;
  }

  await syncToBackend();
}
