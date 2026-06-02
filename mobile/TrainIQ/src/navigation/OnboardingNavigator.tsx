import React, { useState } from 'react';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import GoalsScreen from '../screens/onboarding/GoalsScreen';
import ConnectDevicesScreen from '../screens/onboarding/ConnectDevicesScreen';

type Step = 'welcome' | 'goals' | 'devices';

export default function OnboardingNavigator({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [step, setStep] = useState<Step>('welcome');

  if (step === 'welcome') {
    return <WelcomeScreen onNext={() => setStep('goals')} />;
  }
  if (step === 'goals') {
    return <GoalsScreen onNext={() => setStep('devices')} />;
  }
  return <ConnectDevicesScreen onComplete={onComplete} />;
}
