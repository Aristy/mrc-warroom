import { getBackendUrl } from './storage.js';

export async function fetchCandidateBrief(): Promise<unknown> {
  const baseUrl = await getBackendUrl();
  const res = await fetch(`${baseUrl}/dashboard/candidate-brief`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
