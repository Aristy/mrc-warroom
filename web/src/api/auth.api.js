import { apiFetch, apiPost } from './client.js';
export const authApi = {
    login: (login, password) => apiPost('/api/auth/login', { login, password }),
    session: () => apiFetch('/api/auth/session'),
    logout: () => apiPost('/api/auth/logout', {}),
};
