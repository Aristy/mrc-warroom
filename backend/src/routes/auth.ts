import type { FastifyInstance } from 'fastify';
import { findUserByLogin, sanitizeUser } from '../db/queries/users.js';
import { createSession, deleteSession } from '../db/queries/sessions.js';
import { verifyPassword } from '../services/auth.service.js';
import { SESSION_COOKIE, SESSION_TTL_MS } from '../constants/roles.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/auth/login', async (request, reply) => {
    const { login, password } = request.body as { login?: string; password?: string };
    if (!login || !password) return reply.code(400).send({ error: 'login and password are required' });

    const user = findUserByLogin(login);
    if (!user || !verifyPassword(user, password)) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const session = createSession(user);
    const safe = sanitizeUser(user);

    reply.setCookie(SESSION_COOKIE, session.id, {
      path: '/', httpOnly: true, sameSite: 'lax', maxAge: SESSION_TTL_MS / 1000,
    });

    return reply.send({ user: safe, sessionToken: session.id });
  });

  app.get('/api/auth/session', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ error: 'Not authenticated' });
    return reply.send({ user: sanitizeUser(request.user) });
  });

  app.post('/api/auth/logout', async (request, reply) => {
    const bearerToken = (() => {
      const raw = String(request.headers.authorization || '').trim();
      const m = raw.match(/^Bearer\s+(.+)$/i);
      return m ? m[1].trim() : '';
    })();
    const cookieSessionId = request.cookies?.[SESSION_COOKIE] ?? '';
    const sessionId = bearerToken || cookieSessionId;
    if (sessionId) deleteSession(sessionId);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.send({ ok: true });
  });
}
