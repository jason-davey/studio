
'use client';

import { useState, useEffect } from 'react';
import { remoteConfigInstance, fetchAndActivate, getValue } from '@/lib/firebase';
import type { Value } from 'firebase/remote-config';

export function useRemoteConfigValue<T>(key: string, defaultValue: T): T {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!remoteConfigInstance) {
      // This can happen during SSR or if Firebase isn't initialized on client
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchAndActivate(remoteConfigInstance);
        const remoteValue = getValue(remoteConfigInstance, key);
        
        if (remoteValue.getSource() !== 'static') { // 'static' means default value was used
          try {
            const parsedValue = JSON.parse(remoteValue.asString()) as T;
            setValue(parsedValue);
          } catch (e) {
            // If parsing fails, it might be a simple string value
            setValue(remoteValue.asString() as unknown as T);
          }
        } else {
          // If the value is from 'static' (default), use the passed defaultValue
          // or if it's a complex object, the default from remoteConfigInstance.defaultConfig
          // which might have been stringified.
          try {
            const parsedDefault = JSON.parse(remoteConfigInstance.defaultConfig[key] as string) as T;
            setValue(parsedDefault);
          } catch (e) {
             setValue(defaultValue); // Fallback to hook's defaultValue
          }
        }
      } catch (err) {
        console.error('Error fetching remote config:', err);
        setError(err as Error);
        // In case of error, use the defaultValue passed to the hook
        setValue(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [key, defaultValue]);

  // You could also return loading and error states if needed by the component
  // return { value, loading, error };
  return value;
}
