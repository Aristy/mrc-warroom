import crypto from 'crypto';
import { db } from '../index.js';
import { SESSION_TTL_MS } from '../../constants/roles.js';
import type { User } from './users.js';

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export function createSession(user: User): Session {
  const id = crypto.randomBytes(24).toString('hex');
  const createdAt = Date.now();
  const expiresAt = createdAt + SESSION_TTL_MS;
  db.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(id, user.id, createdAt, expiresAt);
  return { id, userId: user.id, createdAt, expiresAt };
}

export function getSession(sessionId: string): Session | null {
  const row = db.prepare('SELECT id, user_id, created_at, expires_at FROM sessions WHERE id = ? AND expires_at > ?')
    .get(sessionId, Date.now()) as { id: string; user_id: string; created_at: number; expires_at: number } | undefined;
  if (!row) return null;
  return { id: row.id, userId: row.user_id, createdAt: row.created_at, expiresAt: row.expires_at };
}

export function deleteSession(sessionId: string): void {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export function purgeExpiredSessions(): void {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
}
