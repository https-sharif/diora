import { useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing multiple operations with individual keys
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Object with debouncedCallback and cleanup functions
 * 
 * @example
 * const { debouncedCallback, cleanup } = useDebounce(
 *   (id: string, value: number) => updateQuantity(id, value),
 *   500
 * );
 * 
 * // Usage: debouncedCallback(uniqueKey, ...args)
 * debouncedCallback('item-1', 'item-1', 5);
 * debouncedCallback('item-2', 'item-2', 3);
 * 
 * // Cleanup on unmount
 * useEffect(() => cleanup, [cleanup]);
 */
export const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<{ [key: string]: any }>({});

  const debouncedCallback = useCallback(
    (key: string, ...args: any[]) => {
      // Clear existing timeout for this specific key
      if (timeoutRef.current[key]) {
        clearTimeout(timeoutRef.current[key]);
      }

      // Set new timeout for this key
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