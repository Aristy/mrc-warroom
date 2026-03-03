import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Role } from '../constants/roles.js';

export function requireRole(allowed: Set<Role>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.code(401).send({ error: 'Authentication required' });
      return;
    }
    if (!allowed.has(request.user.role as Role)) {
      reply.code(403).send({ error: 'Forbidden for current role' });
    }
  };
}
