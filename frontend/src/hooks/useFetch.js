import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useFetch = (urlOrFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = typeof urlOrFn === 'function'
        ? await urlOrFn()
        : await api.get(urlOrFn);
      setData(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch, setData };
};

export default useFetch;
