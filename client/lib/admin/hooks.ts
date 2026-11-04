'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';

/** GET an admin endpoint, with loading/error state and a reload function. */
export function useApiData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const latest = useRef(0);

  const load = useCallback(async () => {
    if (!path) return;
    const ticket = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await api<T>('GET', path);
      if (ticket === latest.current) setData(result);
    } catch (err) {
      if (ticket === latest.current) setError(err instanceof ApiError ? err.message : 'Could not load data.');
    } finally {
      if (ticket === latest.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    // Fetch on mount and whenever the path changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return { data, setData, error, loading, reload: load };
}

/** Warn before leaving the page with unsaved edits. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);
}
