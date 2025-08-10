import React from 'react';
import { OnboardingManager } from '@/components/OnboardingManager';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const handleComplete = () => {
    // Navigate to the main app after onboarding completion
    router.replace('/(tabs)');
  };

  return <OnboardingManager onComplete={handleComplete} />;
}
