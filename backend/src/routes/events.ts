import type { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/rbac.js';
import { EVENT_VIEW_ROLES, EVENT_WRITE_ROLES, EVENT_ZONE_VALIDATION_ROLES, EVENT_WR_VALIDATION_ROLES } from '../constants/roles.js';
import { readEvents, findEventById, insertEvent, addEventMedia, addEventValidation, publishEvent } from '../db/queries/events.js';
import { saveFile } from '../services/upload.service.js';
import { pushWarRoom, pushCandidateBrief } from '../ws/broadcaster.js';

export async function eventsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/events', { preHandler: requireRole(EVENT_VIEW_ROLES) }, async (request, reply) => {
    const { departmentId, status } = request.query as { departmentId?: string; status?: string };
    const items = readEvents({ departmentId, status });
    return reply.send({ items, total: items.length });
  });

  app.get('/api/events/map', { preHandler: requireRole(EVENT_VIEW_ROLES) }, async (_req, reply) => {
    const items = readEvents({ status: 'publie' });
    return reply.send({ items: items.filter(e => e.gpsLat && e.gpsLon), total: items.length });
  });

  app.get('/api/events/:id', { preHandler: requireRole(EVENT_VIEW_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = findEventById(id);
    if (!event) return reply.code(404).send({ error: 'Not found' });
    return reply.send(event);
  });

  app.post('/api/events', { preHandler: requireRole(EVENT_WRITE_ROLES) }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const user = request.user!;
    const event = insertEvent({
      ...(body as object),
      createdBy: user.id,
      createdByUsername: user.username,
      createdByRole: user.role,
    });
    pushWarRoom();
    return reply.code(201).send(event);
  });

  app.post('/api/events/:id/media', { preHandler: requireRole(EVENT_WRITE_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = findEventById(id);
    if (!event) return reply.code(404).send({ error: 'Event not found' });

    const data = await request.file();
    if (!data) return reply.code(400).send({ error: 'No file uploaded' });

    const buffer = await data.toBuffer();
    const isVideo = data.mimetype.startsWith('video/');
    const filePath = saveFile('events', data.filename, buffer);

    addEventMedia(id, {
      mediaType: isVideo ? 'video' : 'image',
      filePath,
      externalUrl: '',
      caption: (request.body as Record<string, string>)?.caption || '',
      createdBy: request.user!.name,
    });

    return reply.send({ ok: true, filePath });
  });

  app.post('/api/events/:id/validate-zone', { preHandler: requireRole(EVENT_ZONE_VALIDATION_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { decision, comment } = request.body as { decision?: string; comment?: string };
    if (!decision) return reply.code(400).send({ error: 'decision required' });
    addEventValidation(id, 'zone', decision, comment || '', request.user!.name, request.user!.role);
    const updated = findEventById(id);
    pushWarRoom();
    return reply.send(updated);
  });

  app.post('/api/events/:id/validate-war-room', { preHandler: requireRole(EVENT_WR_VALIDATION_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { decision, comment } = request.body as { decision?: string; comment?: string };
    if (!decision) return reply.code(400).send({ error: 'decision required' });
    addEventValidation(id, 'war_room', decision, comment || '', request.user!.name, request.user!.role);
    const updated = findEventById(id);
    pushWarRoom();
    return reply.send(updated);
  });

  app.post('/api/events/:id/publish', { preHandler: requireRole(EVENT_WR_VALIDATION_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { note } = (request.body as { note?: string }) || {};
    const updated = publishEvent(id, note || '', request.user!.name);
    if (!updated) return reply.code(404).send({ error: 'Not found' });
    pushWarRoom();
    pushCandidateBrief();
    return reply.send(updated);
  });
}
