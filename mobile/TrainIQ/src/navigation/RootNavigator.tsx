import React, { useState } from 'react';
import AppNavigator from './AppNavigator';
import OnboardingNavigator from './OnboardingNavigator';

export default function RootNavigator() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const onboarded = Boolean(hasOnboarded);

  if (!onboarded) {
    return <OnboardingNavigator onComplete={() => setHasOnboarded(true)} />;
  }

  return <AppNavigator />;
}
