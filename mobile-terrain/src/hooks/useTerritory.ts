import { useState, useEffect, useCallback } from 'react';
import { getDepartmentsCache, saveDepartmentsCache } from '../services/storage.js';
import { fetchDepartments } from '../services/api.js';
import type { TerritoryDepartment } from '../types/domain.js';

export function useTerritory(token: string | null) {
  const [departments, setDepartments] = useState<TerritoryDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (!forceRefresh) {
        const cached = await getDepartmentsCache();
        if (cached && cached.length > 0) {
          setDepartments(cached);
          setLoading(false);
          return;
        }
      }
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await fetchDepartments(token);
      setDepartments(data);
      await saveDepartmentsCache(data);
    } catch (e) {
      const cached = await getDepartmentsCache();
      if (cached && cached.length > 0) {
        setDepartments(cached);
      } else {
        setError(e instanceof Error ? e.message : 'Erreur chargement territoire');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { departments, loading, error, refresh: () => load(true) };
}
