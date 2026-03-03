import { useState, useEffect, useCallback } from 'react';
import { fetchCandidateBrief } from '../services/api.js';
import { getCachedBrief, setCachedBrief } from '../services/storage.js';
import { useAutoRefresh } from './useAutoRefresh.js';

export function useCandidateBrief() {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stale, setStale] = useState(false);

  const load = useCallback(async () => {
    try {
      const fresh = await fetchCandidateBrief();
      setData(fresh);
      setLastUpdated(new Date());
      setStale(false);
      setError(null);
      await setCachedBrief(fresh);
    } catch (e) {
      setError((e as Error).message);
      setStale(true);
      const cached = await getCachedBrief();
      if (cached && !data) setData(cached);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getCachedBrief().then(cached => { if (cached) setData(cached); });
    load();
  }, [load]);

  useAutoRefresh(load, 30_000);

  return { data, loading, error, stale, lastUpdated, refresh: load };
}
