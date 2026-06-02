import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AppNavigator from './AppNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';

const ONBOARDED_KEY = 'trainiq_onboarded';

async function getOnboarded(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(ONBOARDED_KEY) === 'true';
  }
  const val = await SecureStore.getItemAsync(ONBOARDED_KEY);
  return val === 'true';
}

async function setOnboarded(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    return;
  }
  await SecureStore.setItemAsync(ONBOARDED_KEY, 'true');
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    getOnboarded().then(val => setHasOnboarded(val));
  }, []);

  if (isLoading || hasOnboarded === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size={36} color="#C8F135" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return (
      <OnboardingNavigator
        onComplete={async () => {
          await setOnboarded();
          setHasOnboarded(true);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <AppNavigator />;
}
