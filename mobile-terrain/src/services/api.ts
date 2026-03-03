import { getEffectiveBackendUrl } from './storage.js';
import type { LoginResponse, TerritoryDepartment } from '../types/domain.js';

async function baseUrl(): Promise<string> {
  const url = await getEffectiveBackendUrl();
  return url.replace(/\/$/, '');
}

export async function login(loginId: string, password: string): Promise<LoginResponse> {
  const url = await baseUrl();
  const res = await fetch(`${url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: loginId, password }),
  });
  if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error((body as { error?: string }).error || `HTTP ${res.status}`); }
  const data = await res.json();
  // Map backend user fields to mobile MobileUser shape
  const u = data.user ?? {};
  const user = {
    id: u.id,
    login: u.username ?? u.login,
    name: u.name,
    role: u.role,
    terrainModules: u.terrainModules ?? [],
    department: u.scopeDepartmentName || undefined,
    arrondissement: u.scopeArrondissementName || undefined,
    zone: u.scopeZoneName || undefined,
    geographicScope: u.scopeZoneName || u.scopeArrondissementName || u.scopeDepartmentName || undefined,
  };
  return { token: data.sessionToken ?? data.token, user };
}

export async function logout(token: string): Promise<void> {
  const url = await baseUrl();
  await fetch(`${url}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
}

export async function fetchDepartments(token: string): Promise<TerritoryDepartment[]> {
  const url = await baseUrl();
  const res = await fetch(`${url}/api/territory/departments`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const body = await res.json();
  return body.departments || [];
}

export async function postRecord(token: string, endpoint: string, payload: unknown): Promise<void> {
  const url = await baseUrl();
  const res = await fetch(`${url}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error((body as { error?: string }).error || `HTTP ${res.status}`); }
}
