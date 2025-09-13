import { useGlobalToast } from '@/contexts/ToastContext';

export const useToast = () => {
  const { showToast, hideToast, currentToast } = useGlobalToast();

  return {
    showToast,
    hideToast,
    currentToast,
    visible: {
      error: currentToast?.type === 'error' && currentToast.visible,
      success: currentToast?.type === 'success' && currentToast.visible,
      neutral: currentToast?.type === 'neutral' && currentToast.visible,
      alert: currentToast?.type === 'alert' && currentToast.visible,
    },
    messages: {
      error: currentToast?.type === 'error' ? currentToast.message : '',
      success: currentToast?.type === 'success' ? currentToast.message : '',
      neutral: currentToast?.type === 'neutral' ? currentToast.message : '',
      alert: currentToast?.type === 'alert' ? currentToast.message : '',
    },
  };
};
