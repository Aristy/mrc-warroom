import { apiFetch, apiPost } from './client.js';
export const campaignApi = {
    list: (params) => apiFetch(`/api/campaign-records${params ? '?' + new URLSearchParams(params) : ''}`),
    create: (data) => apiPost('/api/campaign-records', data),
};
export const membersApi = {
    list: (params) => apiFetch(`/api/member-enrollments${params ? '?' + new URLSearchParams(params) : ''}`),
    create: (data) => apiPost('/api/member-enrollments', data),
    publish: (id, note) => apiPost(`/api/member-enrollments/${id}/publish`, { note }),
};
export const eventsApi = {
    list: (params) => apiFetch(`/api/events${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id) => apiFetch(`/api/events/${id}`),
    map: () => apiFetch('/api/events/map'),
    create: (data) => apiPost('/api/events', data),
    validateZone: (id, decision, comment) => apiPost(`/api/events/${id}/validate-zone`, { decision, comment }),
    validateWarRoom: (id, decision, comment) => apiPost(`/api/events/${id}/validate-war-room`, { decision, comment }),
    publish: (id, note) => apiPost(`/api/events/${id}/publish`, { note }),
};
export const mediaApi = {
    list: (params) => apiFetch(`/api/media-monitoring${params ? '?' + new URLSearchParams(params) : ''}`),
    create: (data) => apiPost('/api/media-monitoring', data),
    resolveLink: (url) => apiPost('/api/media-monitoring/resolve-link', { url }),
    validate: (id) => apiPost(`/api/media-monitoring/${id}/validate`, {}),
    publish: (id, note) => apiPost(`/api/media-monitoring/${id}/publish`, { note }),
};
export const teamsApi = {
    list: () => apiFetch('/api/teams'),
    create: (data) => apiPost('/api/teams', data),
    users: () => apiFetch('/api/users'),
    updateModules: (userId, modules) => apiFetch(`/api/users/${userId}/terrain-modules`, { method: 'PUT', body: JSON.stringify({ modules }) }),
};
export const territoryApi = {
    departments: () => apiFetch('/api/territory/departments'),
    arrondissements: (departmentId) => apiFetch(`/api/territory/arrondissements${departmentId ? `?departmentId=${departmentId}` : ''}`),
    zones: (departmentId) => apiFetch(`/api/territory/zones${departmentId ? `?departmentId=${departmentId}` : ''}`),
    centers: (zoneId) => apiFetch(`/api/territory/centers${zoneId ? `?zoneId=${zoneId}` : ''}`),
};
