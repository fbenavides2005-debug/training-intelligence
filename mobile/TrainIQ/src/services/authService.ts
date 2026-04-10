import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import type { AuthResponse } from '../types';

const TOKEN_KEY = 'trainiq_jwt';

// ── API Client ─────────────────────────────────────────

const api = axios.create({
  baseURL: 'https://trainiq-production.up.railway.app/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT to every request
api.interceptors.request.use(async (cfg) => {
  const token = await getToken();
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// ── Token helpers ──────────────────────────────────────

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ── Auth API ───────────────────────────────────────────

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  await saveToken(data.token);
  return data;
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  trainingMode: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    firstName,
    lastName,
    email,
    password,
    trainingMode,
  });
  await saveToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  await removeToken();
}

export { api };
