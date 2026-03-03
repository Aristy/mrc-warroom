import type { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/rbac.js';
import { MEMBER_ENTRY_ROLES, MEMBER_ENTRY_WRITE_ROLES, MEMBER_ENTRY_PUBLICATION_ROLES } from '../constants/roles.js';
import { readMemberEnrollments, insertMemberEnrollment, publishMemberEnrollment } from '../db/queries/members.js';
import { pushWarRoom, pushCandidateBrief } from '../ws/broadcaster.js';

export async function membersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/member-enrollments', { preHandler: requireRole(MEMBER_ENTRY_ROLES) }, async (request, reply) => {
    const { departmentId, status } = request.query as { departmentId?: string; status?: string };
    const items = readMemberEnrollments({ departmentId, status });
    return reply.send({ items, total: items.length });
  });

  app.post('/api/member-enrollments', { preHandler: requireRole(MEMBER_ENTRY_WRITE_ROLES) }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const user = request.user!;
    const item = insertMemberEnrollment({
      ...(body as object),
      submittedBy: user.id,
      submittedByUsername: user.username,
      submittedByRole: user.role,
    });
    pushWarRoom();
    return reply.code(201).send(item);
  });

  app.post('/api/member-enrollments/:id/publish', { preHandler: requireRole(MEMBER_ENTRY_PUBLICATION_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { note } = (request.body as { note?: string }) || {};
    const item = publishMemberEnrollment(id, note || '', request.user!.name);
    if (!item) return reply.code(404).send({ error: 'Not found' });
    pushWarRoom();
    pushCandidateBrief();
    return reply.send(item);
  });
}
