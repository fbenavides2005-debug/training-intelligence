import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';
import type { User, TrainingMode } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    trainingMode: TrainingMode,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while checking stored token
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await authService.getToken();
        if (token) {
          // Fetch user profile with stored token
          const { data } = await authService.api.get<User>('/user/profile');
          setUser(data);
        }
      } catch {
        // Token expired or invalid — clear it silently
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      const { data } = await authService.api.get<User>('/user/profile');
      setUser(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.error || 'No se pudo iniciar sesion. Revisa tus credenciales.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      trainingMode: TrainingMode,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        await authService.register(firstName, lastName, email, password, trainingMode);
        const { data } = await authService.api.get<User>('/user/profile');
        setUser(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.error || 'No se pudo crear la cuenta. Intenta de nuevo.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
