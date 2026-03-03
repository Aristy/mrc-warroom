import { useState, useEffect, useCallback, useRef } from 'react';
import { getQueue } from '../services/storage.js';
import { processQueue } from '../services/offlineQueue.js';

export function useOfflineQueue(token: string | null) {
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<{ processed: number; failed: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshCount = useCallback(async () => {
    const q = await getQueue();
    setQueueCount(q.length);
  }, []);

  const sync = useCallback(async () => {
    if (!token || syncing) return;
    setSyncing(true);
    try {
      const result = await processQueue(token);
      setLastResult(result);
      await refreshCount();
    } finally {
      setSyncing(false);
    }
  }, [token, syncing, refreshCount]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Auto-sync every 60s when token is available
  useEffect(() => {
    if (!token) return;
    intervalRef.current = setInterval(sync, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, sync]);

  return { queueCount, syncing, lastResult, sync, refreshCount };
}
