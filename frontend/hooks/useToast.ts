import { useState, useRef } from 'react';

type ToastType = 'error' | 'success' | 'neutral' | 'alert';

export const useToast = () => {
  const [visible, setVisible] = useState<{ [key in ToastType]: boolean }>({
    error: false,
    success: false,
    neutral: false,
    alert: false,
  });

  const [messages, setMessages] = useState<{ [key in ToastType]: string }>({
    error: '',
    success: '',
    neutral: '',
    alert: '',
  });

  const timeoutRefs = {
    error: useRef<number | null>(null),
    success: useRef<number | null>(null),
    neutral: useRef<number | null>(null),
    alert: useRef<number | null>(null),
  };

  const showToast = (type: ToastType, message: string, duration = 3000) => {
    if (timeoutRefs[type].current) {
      clearTimeout(timeoutRefs[type].current!);
    }

    setMessages((prev) => ({ ...prev, [type]: message }));
    setVisible((prev) => ({ ...prev, [type]: true }));

    timeoutRefs[type].current = setTimeout(() => {
      setVisible((prev) => ({ ...prev, [type]: false }));
      timeoutRefs[type].current = null;
    }, duration) as unknown as number;
  };

  const hideToast = (type: ToastType) => {
    if (timeoutRefs[type].current) {
      clearTimeout(timeoutRefs[type].current!);
      timeoutRefs[type].current = null;
    }
    setVisible((prev) => ({ ...prev, [type]: false }));
  };

  return {
    showToast,
    hideToast,
    visible,
    messages,
  };
};
