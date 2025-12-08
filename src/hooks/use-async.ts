import { useCallback, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for managing async operations with loading and error states
 */
export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState({ data: null, isLoading: true, error: null });
    
    try {
      const data = await asyncFn();
      setState({ data, isLoading: false, error: null });
      return { success: true as const, data };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: null, isLoading: false, error: err });
      return { success: false as const, error: err };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook for managing loading states for multiple operations
 */
export function useLoadingState(initialState: Record<string, boolean> = {}) {
  const [loadingStates, setLoadingStates] = useState(initialState);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] ?? false;
  }, [loadingStates]);

  const anyLoading = Object.values(loadingStates).some(Boolean);

  return { loadingStates, setLoading, isLoading, anyLoading };
}

/**
 * Hook for delayed loading indicator (prevent flash for fast operations)
 */
export function useDelayedLoading(isLoading: boolean, delay: number = 200) {
  const [showLoading, setShowLoading] = useState(false);

  // Show loading after delay, hide immediately when done
  useState(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => setShowLoading(true), delay);
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(timeoutId);
  });

  return showLoading;
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [data, setData] = useState(initialData);
  const [previousData, setPreviousData] = useState<T | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (optimisticData: T) => {
    // Save previous data for rollback
    setPreviousData(data);
    
    // Apply optimistic update immediately
    setData(optimisticData);
    setIsUpdating(true);
    setError(null);

    try {
      // Perform actual update
      const result = await updateFn(optimisticData);
      setData(result);
      setPreviousData(null);
      return { success: true as const, data: result };
    } catch (err) {
      // Rollback on error
      setData(previousData!);
      const error = err instanceof Error ? err : new Error('Update failed');
      setError(error);
      return { success: false as const, error };
    } finally {
      setIsUpdating(false);
    }
  }, [data, previousData, updateFn]);

  const rollback = useCallback(() => {
    if (previousData !== null) {
      setData(previousData);
      setPreviousData(null);
    }
  }, [previousData]);

  return { data, isUpdating, error, update, rollback };
}
