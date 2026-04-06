const config = require('../config');

const BASE = config.whoop.apiBaseUrl;

async function whoopFetch(accessToken, path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WHOOP API error (${res.status}): ${error}`);
  }

  return res.json();
}

// --- User ---

function getProfile(accessToken) {
  return whoopFetch(accessToken, '/v1/user/profile/basic');
}

function getBodyMeasurement(accessToken) {
  return whoopFetch(accessToken, '/v1/user/body_measurement');
}

// --- Cycles ---

function getCycles(accessToken, { limit, start, end, nextToken } = {}) {
  return whoopFetch(accessToken, '/v1/cycle', { limit, start, end, nextToken });
}

function getCycleById(accessToken, cycleId) {
  return whoopFetch(accessToken, `/v1/cycle/${cycleId}`);
}

// --- Recovery ---

function getRecoveryCollection(accessToken, { limit, start, end, nextToken } = {}) {
  return whoopFetch(accessToken, '/v1/recovery', { limit, start, end, nextToken });
}

function getRecoveryForCycle(accessToken, cycleId) {
  return whoopFetch(accessToken, `/v1/cycle/${cycleId}/recovery`);
}

// --- Sleep ---

function getSleepCollection(accessToken, { limit, start, end, nextToken } = {}) {
  return whoopFetch(accessToken, '/v1/activity/sleep', { limit, start, end, nextToken });
}

function getSleepById(accessToken, sleepId) {
  return whoopFetch(accessToken, `/v1/activity/sleep/${sleepId}`);
}

// --- Workouts ---

function getWorkoutCollection(accessToken, { limit, start, end, nextToken } = {}) {
  return whoopFetch(accessToken, '/v1/activity/workout', { limit, start, end, nextToken });
}

function getWorkoutById(accessToken, workoutId) {
  return whoopFetch(accessToken, `/v1/activity/workout/${workoutId}`);
}

module.exports = {
  getProfile,
  getBodyMeasurement,
  getCycles,
  getCycleById,
  getRecoveryCollection,
  getRecoveryForCycle,
  getSleepCollection,
  getSleepById,
  getWorkoutCollection,
  getWorkoutById,
};
