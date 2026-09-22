import { useEffect, useState } from 'react';

/**
 * Debounces a value by a specified delay in milliseconds.
 *
 * @param value The value to debounce.
 * @param delayMs The debounce delay in milliseconds (defaults to 300ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
