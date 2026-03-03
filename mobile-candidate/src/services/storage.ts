import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = { BACKEND_URL: 'candidate_backend_url', CACHED_BRIEF: 'candidate_brief_cache' };

export async function getBackendUrl(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.BACKEND_URL)) || 'http://169.255.58.148';
}
export async function setBackendUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.BACKEND_URL, url.replace(/\/$/, ''));
}
export async function getCachedBrief(): Promise<unknown | null> {
  const raw = await AsyncStorage.getItem(KEYS.CACHED_BRIEF);
  return raw ? JSON.parse(raw) : null;
}
export async function setCachedBrief(data: unknown): Promise<void> {
  await AsyncStorage.setItem(KEYS.CACHED_BRIEF, JSON.stringify(data));
}
