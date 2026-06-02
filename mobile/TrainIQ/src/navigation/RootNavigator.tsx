import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const value = await SecureStore.getItemAsync('trainiq_onboarded');
      setHasOnboarded(value === 'true');
    })();
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
          await SecureStore.setItemAsync('trainiq_onboarded', 'true');
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
