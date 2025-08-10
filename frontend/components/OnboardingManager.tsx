import React, { useEffect, useState } from 'react';
import { UserOnboarding } from './UserOnboarding';
import ShopOnboarding from './ShopOnboarding';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingManagerProps {
  onComplete: () => void;
}

export const OnboardingManager: React.FC<OnboardingManagerProps> = ({ onComplete }) => {
  const { user, refreshUser } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) {
    console.log('OnboardingManager - No user found');
    return null;
  }

  console.log(`OnboardingManager [${refreshKey}] - User type:`, user.type);
  console.log(`OnboardingManager [${refreshKey}] - User ID:`, user._id);
  console.log(`OnboardingManager [${refreshKey}] - Full user object keys:`, Object.keys(user));
  console.log(`OnboardingManager [${refreshKey}] - Onboarding isComplete:`, user.onboarding?.isComplete);
  console.log(`OnboardingManager [${refreshKey}] - Full user onboarding object:`, JSON.stringify(user.onboarding, null, 2));
  console.log(`OnboardingManager [${refreshKey}] - Raw onboarding property:`, user.onboarding);

  // Check if onboarding is needed based on single isComplete flag
  const needsOnboarding = !user.onboarding?.isComplete;

  console.log(`OnboardingManager [${refreshKey}] - needsOnboarding:`, needsOnboarding);

  // If onboarding is needed, show the appropriate onboarding based on user type
  if (needsOnboarding) {
    if (user.type === 'user') {
      console.log(`OnboardingManager [${refreshKey}] - Showing UserOnboarding`);
      return <UserOnboarding onComplete={onComplete} />;
    }
    
    if (user.type === 'shop') {
      console.log(`OnboardingManager [${refreshKey}] - Showing ShopOnboarding`);
      return <ShopOnboarding onComplete={onComplete} />;
    }
  }

  // No onboarding needed, complete immediately
  console.log(`OnboardingManager [${refreshKey}] - No onboarding needed, calling onComplete`);
  onComplete();
  return null;
};
