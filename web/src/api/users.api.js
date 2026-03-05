import { apiFetch } from './client.js';
export const usersApi = {
    list: () => apiFetch('/api/system/users'),
    create: (data) => apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
};
