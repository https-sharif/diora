import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

type ToastType = 'error' | 'success' | 'neutral' | 'alert';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: () => void;
  currentToast: ToastState | null;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [currentToast, setCurrentToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: ToastType, message: string, duration = 3000) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new toast
    setCurrentToast({ visible: true, message, type });

    // Auto-hide after duration
    timeoutRef.current = setTimeout(() => {
      setCurrentToast(null);
      timeoutRef.current = null;
    }, duration);
  };

  const hideToast = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentToast(null);
    timeoutRef.current = null;
  };

  const value: ToastContextType = {
    showToast,
    hideToast,
    currentToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
