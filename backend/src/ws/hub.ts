import type { WebSocket } from '@fastify/websocket';
import type { WSTopic } from './topics.js';

const clients = new Map<WSTopic, Set<WebSocket>>();

export function subscribe(ws: WebSocket, topic: WSTopic): void {
  if (!clients.has(topic)) clients.set(topic, new Set());
  clients.get(topic)!.add(ws);
}

export function unsubscribe(ws: WebSocket, topic: WSTopic): void {
  clients.get(topic)?.delete(ws);
}

export function broadcast(topic: WSTopic, message: unknown): void {
  const subs = clients.get(topic);
  if (!subs || subs.size === 0) return;
  const payload = JSON.stringify(message);
  for (const client of subs) {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    } else {
      subs.delete(client);
    }
  }
}

// Heartbeat: ping all clients every 30s
setInterval(() => {
  const ping = JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() });
  for (const subs of clients.values()) {
    for (const client of subs) {
      if (client.readyState === 1) {
        client.send(ping);
      } else {
        subs.delete(client);
      }
    }
  }
}, 30_000);
