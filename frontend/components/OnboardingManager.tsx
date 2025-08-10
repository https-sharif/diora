import React from 'react';
import { UserOnboarding } from './UserOnboarding';
import { ShopOnboarding } from './ShopOnboarding';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingManagerProps {
  onComplete: () => void;
}

export const OnboardingManager: React.FC<OnboardingManagerProps> = ({ onComplete }) => {
  const { user, refreshUser } = useAuth();

  if (!user) {
    return null;
  }

  console.log('OnboardingManager - User type:', user.type);
  console.log('OnboardingManager - User onboarding:', user.onboarding);

  // Determine which onboarding to show based on user type
  const needsUserOnboarding = user.type === 'user' && !user.onboarding?.isComplete;
  const needsShopOnboarding = user.type === 'shop' && !user.onboarding?.shopOnboarding?.isComplete;

  console.log('OnboardingManager - needsUserOnboarding:', needsUserOnboarding);
  console.log('OnboardingManager - needsShopOnboarding:', needsShopOnboarding);

  // Show appropriate onboarding based on user type
  if (user.type === 'user' && needsUserOnboarding) {
    return <UserOnboarding onComplete={onComplete} />;
  }

  if (user.type === 'shop' && needsShopOnboarding) {
    return <ShopOnboarding onComplete={onComplete} />;
  }

  // No onboarding needed, complete immediately
  onComplete();
  return null;
};
