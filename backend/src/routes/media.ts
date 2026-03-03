import type { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/rbac.js';
import { MEDIA_MONITORING_VIEW_ROLES, MEDIA_MONITORING_WRITE_ROLES } from '../constants/roles.js';
import { readMediaMonitoringItems, findMediaById, insertMediaItem, validateMediaItem, publishMediaItem, updateMediaScreenshot } from '../db/queries/media.js';
import { saveFile } from '../services/upload.service.js';
import { pushWarRoom, pushCandidateBrief } from '../ws/broadcaster.js';

function inferSourceType(url: string): string {
  const u = String(url || '').toLowerCase();
  if (u.includes('youtube') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('facebook') || u.includes('fb.com')) return 'facebook';
  if (u.includes('instagram')) return 'instagram';
  if (u.includes('twitter') || u.includes('x.com')) return 'x';
  if (u.includes('tiktok')) return 'tiktok';
  if (u.includes('wa.me') || u.includes('whatsapp')) return 'whatsapp';
  return 'presse';
}

export async function mediaRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/media-monitoring', { preHandler: requireRole(MEDIA_MONITORING_VIEW_ROLES) }, async (request, reply) => {
    const { departmentId, status } = request.query as { departmentId?: string; status?: string };
    const items = readMediaMonitoringItems({ departmentId, status });
    return reply.send({ items, total: items.length });
  });

  app.post('/api/media-monitoring', { preHandler: requireRole(MEDIA_MONITORING_WRITE_ROLES) }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const user = request.user!;
    const sourceType = String(body.sourceType || inferSourceType(String(body.sourceUrl || '')));
    const item = insertMediaItem({
      ...(body as object),
      sourceType,
      createdBy: user.id,
      createdByUsername: user.username,
    });
    pushWarRoom();
    return reply.code(201).send(item);
  });

  app.post('/api/media-monitoring/resolve-link', { preHandler: requireRole(MEDIA_MONITORING_VIEW_ROLES) }, async (request, reply) => {
    const { url } = request.body as { url?: string };
    if (!url) return reply.code(400).send({ error: 'url required' });
    return reply.send({ sourceType: inferSourceType(url), url });
  });

  app.post('/api/media-monitoring/:id/screenshot', { preHandler: requireRole(MEDIA_MONITORING_WRITE_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = findMediaById(id);
    if (!item) return reply.code(404).send({ error: 'Not found' });
    const data = await request.file();
    if (!data) return reply.code(400).send({ error: 'No file' });
    const buffer = await data.toBuffer();
    const filePath = saveFile('media', data.filename, buffer);
    updateMediaScreenshot(id, filePath);
    return reply.send({ ok: true, filePath });
  });

  app.post('/api/media-monitoring/:id/validate', { preHandler: requireRole(MEDIA_MONITORING_WRITE_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const updated = validateMediaItem(id, request.user!.name);
    if (!updated) return reply.code(404).send({ error: 'Not found' });
    pushWarRoom();
    return reply.send(updated);
  });

  app.post('/api/media-monitoring/:id/publish', { preHandler: requireRole(MEDIA_MONITORING_WRITE_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { note } = (request.body as { note?: string }) || {};
    const updated = publishMediaItem(id, note || '', request.user!.name);
    if (!updated) return reply.code(404).send({ error: 'Not found' });
    pushWarRoom();
    pushCandidateBrief();
    return reply.send(updated);
  });
}
