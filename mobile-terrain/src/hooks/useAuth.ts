import { useState, useEffect, useCallback } from 'react';
import { getSession, saveSession, clearSession } from '../services/storage.js';
import { login as apiLogin, logout as apiLogout } from '../services/api.js';
import type { MobileUser } from '../types/domain.js';

interface AuthState {
  user: MobileUser | null;
  token: string | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    getSession().then(session => {
      setState({ user: session?.user ?? null, token: session?.token ?? null, loading: false });
    });
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const { token, user } = await apiLogin(username, password);
    await saveSession({ token, user });
    setState({ user, token, loading: false });
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    if (state.token) {
      try { await apiLogout(state.token); } catch { /* ignore */ }
    }
    await clearSession();
    setState({ user: null, token: null, loading: false });
  }, [state.token]);

  const handleUnauthorized = useCallback(async (): Promise<void> => {
    await clearSession();
    setState({ user: null, token: null, loading: false });
  }, []);

  return { ...state, login, logout, handleUnauthorized };
}
