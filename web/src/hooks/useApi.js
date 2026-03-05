import { useState, useEffect, useCallback } from 'react';
export function useApi(fetcher, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(() => {
        setLoading(true);
        fetcher()
            .then(setData)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    useEffect(() => { load(); }, [load]);
    return { data, loading, error, refresh: load };
}
