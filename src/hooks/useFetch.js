import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for fetching data from any async function.
 * Handles loading, error, and data states automatically.
 *
 * @param {Function} fetchFn - Async function that returns an axios response
 * @param {Array} deps - Dependency array (re-run when these change)
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

export default useFetch;
