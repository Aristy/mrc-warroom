import { apiFetch, apiPost } from './client.js';
import type { User } from '../types/domain.js';

export const authApi = {
  login: (login: string, password: string) => apiPost<{ user: User; sessionToken: string }>('/api/auth/login', { login, password }),
  session: () => apiFetch<{ user: User }>('/api/auth/session'),
  logout: () => apiPost<{ ok: boolean }>('/api/auth/logout', {}),
};
