import type { User } from '../db/queries/users.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null;
  }
}
