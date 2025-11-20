import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions<T> {
  initialData?: T | null;
  enabled?: boolean;
  onError?: (err: any) => void;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<T>;
}

/**
 * Custom hook for fetching data with loading and error states
 * @param fetchFunction - Async function that returns data
 * @param dependencies - Dependencies array for useEffect
 * @param options - Options object
 * @returns { data, loading, error, refetch }
 */
export const useFetch = <T = any>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch data';
      setError(errorMessage);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, options]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, options.enabled]);

  const refetch = useCallback((): Promise<T> => {
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};
