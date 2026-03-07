import { apiFetch, apiPost } from './client.js';
import type { CampaignRecord, MemberEnrollment, EventItem, MediaItem, Team, User, TerritoryDepartment } from '../types/domain.js';

export const campaignApi = {
  list: (params?: { regionId?: string; category?: string }) => apiFetch<{ items: CampaignRecord[]; total: number }>(`/api/campaign-records${params ? '?' + new URLSearchParams(params as Record<string, string>) : ''}`),
  create: (data: unknown) => apiPost<CampaignRecord>('/api/campaign-records', data),
};

export const membersApi = {
  list: (params?: { departmentId?: string; status?: string }) => apiFetch<{ items: MemberEnrollment[]; total: number }>(`/api/member-enrollments${params ? '?' + new URLSearchParams(params as Record<string, string>) : ''}`),
  create: (data: unknown) => apiPost<MemberEnrollment>('/api/member-enrollments', data),
  validateZone: (id: string) => apiPost<MemberEnrollment>(`/api/member-enrollments/${id}/validate-zone`, {}),
  reject: (id: string, note?: string) => apiPost<MemberEnrollment>(`/api/member-enrollments/${id}/reject`, { note }),
  publish: (id: string, note?: string) => apiPost<MemberEnrollment>(`/api/member-enrollments/${id}/publish`, { note }),
};

export const eventsApi = {
  list: (params?: { departmentId?: string; status?: string }) => apiFetch<{ items: EventItem[]; total: number }>(`/api/events${params ? '?' + new URLSearchParams(params as Record<string, string>) : ''}`),
  get: (id: string) => apiFetch<EventItem>(`/api/events/${id}`),
  map: () => apiFetch<{ items: EventItem[] }>('/api/events/map'),
  create: (data: unknown) => apiPost<EventItem>('/api/events', data),
  validateZone: (id: string, decision: string, comment?: string) => apiPost<EventItem>(`/api/events/${id}/validate-zone`, { decision, comment }),
  validateWarRoom: (id: string, decision: string, comment?: string) => apiPost<EventItem>(`/api/events/${id}/validate-war-room`, { decision, comment }),
  publish: (id: string, note?: string) => apiPost<EventItem>(`/api/events/${id}/publish`, { note }),
};

export const mediaApi = {
  list: (params?: { departmentId?: string; status?: string }) => apiFetch<{ items: MediaItem[]; total: number }>(`/api/media-monitoring${params ? '?' + new URLSearchParams(params as Record<string, string>) : ''}`),
  create: (data: unknown) => apiPost<MediaItem>('/api/media-monitoring', data),
  resolveLink: (url: string) => apiPost<{ sourceType: string; url: string }>('/api/media-monitoring/resolve-link', { url }),
  validate: (id: string) => apiPost<MediaItem>(`/api/media-monitoring/${id}/validate`, {}),
  publish: (id: string, note?: string) => apiPost<MediaItem>(`/api/media-monitoring/${id}/publish`, { note }),
};

export const teamsApi = {
  list: () => apiFetch<{ teams: Team[] }>('/api/teams'),
  create: (data: unknown) => apiPost<Team>('/api/teams', data),
  users: () => apiFetch<{ users: User[] }>('/api/team-users'),
  updateModules: (userId: string, modules: string[]) => apiFetch<User>(`/api/team-users/${userId}/terrain-modules`, { method: 'PUT', body: JSON.stringify({ modules }) }),
};

export const territoryApi = {
  departments: () => apiFetch<{ departments: TerritoryDepartment[] }>('/api/territory/departments'),
  arrondissements: (departmentId?: string) => apiFetch<{ arrondissements: unknown[] }>(`/api/territory/arrondissements${departmentId ? `?departmentId=${departmentId}` : ''}`),
  zones: (departmentId?: string) => apiFetch<{ zones: unknown[] }>(`/api/territory/zones${departmentId ? `?departmentId=${departmentId}` : ''}`),
  centers: (zoneId?: string) => apiFetch<{ centers: unknown[] }>(`/api/territory/centers${zoneId ? `?zoneId=${zoneId}` : ''}`),
};
