const API_BASE = 'https://training-intelligence-a43n.onrender.com';

export async function whoopStatus(): Promise<{ connected: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/whoop/status`);
    return await res.json();
  } catch {
    return { connected: false };
  }
}

export async function getWhoopRecovery() {
  try {
    const res = await fetch(`${API_BASE}/api/whoop/recovery`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.records?.[0]?.score || null;
  } catch {
    return null;
  }
}

export async function getWhoopSleep() {
  try {
    const res = await fetch(`${API_BASE}/api/whoop/sleep`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.records?.[0]?.score || null;
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
