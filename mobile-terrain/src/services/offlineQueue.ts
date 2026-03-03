import { getQueue, saveQueue } from './storage.js';
import { postRecord } from './api.js';
import type { QueueItem } from '../types/domain.js';

export async function enqueue(item: Omit<QueueItem, 'id' | 'attempts' | 'createdAt'>): Promise<void> {
  const queue = await getQueue();
  queue.push({ ...item, id: `Q-${Date.now()}-${Math.random().toString(36).slice(2)}`, attempts: 0, createdAt: new Date().toISOString() });
  await saveQueue(queue);
}

export async function processQueue(token: string): Promise<{ processed: number; failed: number }> {
  const queue = await getQueue();
  let processed = 0, failed = 0;
  const remaining: QueueItem[] = [];

  for (const item of queue) {
    try {
      await postRecord(token, item.url, JSON.parse(item.body));
      processed++;
    } catch {
      item.attempts++;
      if (item.attempts < 5) remaining.push(item);
      else failed++;
    }
  }

  await saveQueue(remaining);
  return { processed, failed };
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  await saveQueue(queue.filter(q => q.id !== id));
}
