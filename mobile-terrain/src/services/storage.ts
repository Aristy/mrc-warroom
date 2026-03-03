import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QueueItem, MobileUser, TerritoryDepartment } from '../types/domain.js';

const K = {
  BACKEND_URL: 'terrain_backend_url',
  SESSION: 'terrain_session',
  QUEUE: 'terrain_queue',
  DEPARTMENTS: 'terrain_departments',
};

const DEFAULT_BACKEND_URL = 'http://192.168.1.100:8787';

// Backend URL
export async function getBackendUrl(): Promise<string | null> {
  return AsyncStorage.getItem(K.BACKEND_URL);
}
export async function setBackendUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(K.BACKEND_URL, url);
}
export async function getEffectiveBackendUrl(): Promise<string> {
  const url = await AsyncStorage.getItem(K.BACKEND_URL);
  return url ?? DEFAULT_BACKEND_URL;
}

// Session
export async function getSession(): Promise<{ token: string; user: MobileUser } | null> {
  const raw = await AsyncStorage.getItem(K.SESSION);
  return raw ? JSON.parse(raw) : null;
}
export async function saveSession(session: { token: string; user: MobileUser }): Promise<void> {
  await AsyncStorage.setItem(K.SESSION, JSON.stringify(session));
}
export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(K.SESSION);
}

// Offline queue
export async function getQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(K.QUEUE);
  return raw ? JSON.parse(raw) : [];
}
export async function saveQueue(q: QueueItem[]): Promise<void> {
  await AsyncStorage.setItem(K.QUEUE, JSON.stringify(q));
}

// Territory cache
export async function getDepartmentsCache(): Promise<TerritoryDepartment[] | null> {
  const raw = await AsyncStorage.getItem(K.DEPARTMENTS);
  return raw ? JSON.parse(raw) : null;
}
export async function saveDepartmentsCache(d: TerritoryDepartment[]): Promise<void> {
  await AsyncStorage.setItem(K.DEPARTMENTS, JSON.stringify(d));
}
