import React, { useEffect } from 'react';
import { UserOnboarding } from './UserOnboarding';
import ShopOnboarding from './ShopOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingManagerProps } from '@/types/ComponentProps';

export const OnboardingManager: React.FC<OnboardingManagerProps> = ({
  onComplete,
}) => {
  const { user } = useAuth();

  const needsOnboarding = !user.onboarding?.isComplete;
  useEffect(() => {
    if (!needsOnboarding) {
      onComplete();
    }
  }, [needsOnboarding, onComplete]);

  if (!user) {
    return null;
  }

  if (needsOnboarding) {
    if (user.type === 'user') {
      return <UserOnboarding onComplete={onComplete} />;
    }

    if (user.type === 'shop') {
      return <ShopOnboarding onComplete={onComplete} />;
    }
  }
  return null;
};
