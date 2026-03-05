import { apiFetch } from './client.js';
import type { User } from '../types/domain.js';

export interface UserCreatePayload {
  username: string;
  name: string;
  email?: string;
  password: string;
  role: User['role'];
  scopeDepartmentId?: string;
  scopeDepartmentName?: string;
  scopeArrondissementName?: string;
  scopeZoneName?: string;
  candidateVisibility?: Partial<User['candidateVisibility']>;
  terrainModules?: User['terrainModules'];
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  role?: User['role'];
  password?: string;
  scopeDepartmentId?: string;
  scopeDepartmentName?: string;
  scopeArrondissementName?: string;
  scopeZoneName?: string;
  candidateVisibility?: Partial<User['candidateVisibility']>;
  terrainModules?: User['terrainModules'];
}

export const usersApi = {
  list: () => apiFetch<User[]>('/api/system/users'),
  create: (data: UserCreatePayload) => apiFetch<User>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UserUpdatePayload) => apiFetch<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<{ deleted: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),
};
