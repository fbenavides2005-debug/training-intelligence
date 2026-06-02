import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthResponse } from '../types';

const TOKEN_KEY = 'trainiq_jwt';

// ── Token helpers (web-safe) ───────────────────────────
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ── API Client ─────────────────────────────────────────
const api = axios.create({
  baseURL: 'https://trainiq-production.up.railway.app/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (cfg) => {
  const token = await getToken();
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// ── Auth API ───────────────────────────────────────────
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
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
