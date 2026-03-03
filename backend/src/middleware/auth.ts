import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';
import { findUserById } from '../db/queries/users.js';
import { SESSION_COOKIE, SESSION_TTL_MS } from '../constants/roles.js';

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  request.user = null;

  const bearerToken = (() => {
    const raw = String(request.headers.authorization || '').trim();
    const m = raw.match(/^Bearer\s+(.+)$/i);
    return m ? m[1].trim() : '';
  })();

  const cookieSessionId = request.cookies?.[SESSION_COOKIE] ?? '';
  const sessionId = bearerToken || cookieSessionId;
  if (!sessionId) return;

  const row = db.prepare(`
    SELECT s.id AS session_id, s.user_id, s.expires_at
    FROM sessions s
    WHERE s.id = ?
    LIMIT 1
  `).get(sessionId) as { session_id: string; user_id: string; expires_at: number } | undefined;

  if (!row) return;
  if (Number(row.expires_at) <= Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return;
  }

  const user = findUserById(row.user_id);
  if (!user) return;

  db.prepare('UPDATE sessions SET expires_at = ? WHERE id = ?').run(Date.now() + SESSION_TTL_MS, sessionId);
  request.user = user;
}
