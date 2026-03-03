import { apiFetch } from './client.js';
import type { WarRoomData, CandidateBrief, SystemSettings } from '../types/domain.js';

export const dashboardApi = {
  warRoom: () => apiFetch<WarRoomData>('/dashboard/war-room'),
  candidateBrief: () => apiFetch<CandidateBrief>('/dashboard/candidate-brief'),
  pollingReview: () => apiFetch<unknown>('/dashboard/polling-review'),
  socialMedia: () => apiFetch<unknown>('/dashboard/social-media'),
};

export const systemApi = {
  settings: () => apiFetch<SystemSettings>('/api/system/settings'),
  updateSettings: (data: Partial<SystemSettings>) => apiFetch<SystemSettings>('/api/system/settings', { method: 'PUT', body: JSON.stringify(data) }),
  overview: () => apiFetch<unknown>('/api/system/overview'),
  clearTestData: () => apiFetch<unknown>('/api/system/clear-test-data', { method: 'POST' }),
  clearAllData: () => apiFetch<unknown>('/api/system/clear-all-data', { method: 'POST' }),
};
