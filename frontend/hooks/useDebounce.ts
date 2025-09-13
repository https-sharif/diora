import { useCallback, useRef } from 'react';

export const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<{ [key: string]: any }>({});

  const debouncedCallback = useCallback(
    (key: string, ...args: any[]) => {
      if (timeoutRef.current[key]) {
        clearTimeout(timeoutRef.current[key]);
      }

      timeoutRef.current[key] = setTimeout(() => {
        callback(...args);
        delete timeoutRef.current[key];
      }, delay);
    },
    [callback, delay]
  );

  const cleanup = useCallback(() => {
    Object.values(timeoutRef.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    timeoutRef.current = {};
  }, []);

  return { debouncedCallback, cleanup };
};