import { useEffect, useState } from "react";

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  parse: (value: string) => T,
  serialize: (value: T) => string
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? defaultValue : parse(stored);
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(value));
    } catch {
      // UI preference persistence should never block Daily Hub usage.
    }
  }, [key, serialize, value]);

  return [value, setValue] as const;
}
