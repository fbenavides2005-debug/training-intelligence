import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Syne_600SemiBold, Syne_700Bold } from '@expo-google-fonts/syne';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    Syne_600SemiBold,
    Syne_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}
