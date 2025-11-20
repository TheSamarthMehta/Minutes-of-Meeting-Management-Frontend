import { useState, useCallback } from 'react';
import { api } from '../utils/api';

interface ApiOptions {
  onSuccess?: (result: any) => void;
  onError?: (err: any) => void;
  showError?: boolean;
}

interface UseApiReturn {
  loading: boolean;
  error: string | null;
  get: <T = any>(endpoint: string, options?: ApiOptions) => Promise<T>;
  post: <T = any>(endpoint: string, data: any, options?: ApiOptions) => Promise<T>;
  put: <T = any>(endpoint: string, data: any, options?: ApiOptions) => Promise<T>;
  delete: <T = any>(endpoint: string, options?: ApiOptions) => Promise<T>;
  execute: <T = any>(apiCall: () => Promise<T>, options?: ApiOptions) => Promise<T>;
  clearError: () => void;
}

export const useApi = (): UseApiReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T = any>(apiCall: () => Promise<T>, options: ApiOptions = {}): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiCall();
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'An error occurred';
      setError(errorMessage);

      if (options.onError) {
        options.onError(err);
      } else if (options.showError !== false && process.env.NODE_ENV === 'development') {
        console.error('API Error:', errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    return execute(() => api.get<T>(endpoint), options);
  }, [execute]);

  const post = useCallback(async <T = any>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> => {
    return execute(() => api.post<T>(endpoint, data), options);
  }, [execute]);

  const put = useCallback(async <T = any>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> => {
    return execute(() => api.put<T>(endpoint, data), options);
  }, [execute]);

  const del = useCallback(async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    return execute(() => api.delete<T>(endpoint), options);
  }, [execute]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    execute,
    clearError,
  };
};
