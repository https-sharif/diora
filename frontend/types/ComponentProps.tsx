import { PromotionRequest } from './PromotionRequest';

export interface ShopOnboardingProps {
  onComplete: () => void;
}

export interface PromotionRequestModalProps {
  isVisible: boolean;
  onClose: () => void;
  request: PromotionRequest | null;
  onUpdate: () => void;
}

export interface UserOnboardingProps {
  onComplete: () => void;
}

export interface OnboardingManagerProps {
  children: React.ReactNode;
}

export type ToastProps = {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  onHide: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
  showIcon?: boolean;
  actionText?: string;
  onActionPress?: () => void;
};

export interface LoadingViewProps {
  text?: string;
  size?: 'small' | 'large';
}
