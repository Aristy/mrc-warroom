import { apiFetch } from './client.js';
export const dashboardApi = {
    warRoom: () => apiFetch('/dashboard/war-room'),
    candidateBrief: () => apiFetch('/dashboard/candidate-brief'),
    pollingReview: () => apiFetch('/dashboard/polling-review'),
    socialMedia: () => apiFetch('/dashboard/social-media'),
};
export const systemApi = {
    settings: () => apiFetch('/api/system/settings'),
    updateSettings: (data) => apiFetch('/api/system/settings', { method: 'PUT', body: JSON.stringify(data) }),
    overview: () => apiFetch('/api/system/overview'),
    clearTestData: () => apiFetch('/api/system/clear-test-data', { method: 'POST' }),
    clearAllData: () => apiFetch('/api/system/clear-all-data', { method: 'POST' }),
};
