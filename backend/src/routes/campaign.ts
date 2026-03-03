import type { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/rbac.js';
import { OPERATIONS_ROLES, CAMPAIGN_CATEGORIES } from '../constants/roles.js';
import { readCampaignRecords, insertCampaignRecord } from '../db/queries/campaign.js';
import { pushWarRoom, pushCandidateBrief } from '../ws/broadcaster.js';

export async function campaignRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/campaign-records', { preHandler: requireRole(OPERATIONS_ROLES) }, async (request, reply) => {
    const { regionId, category } = request.query as { regionId?: string; category?: string };
    const records = readCampaignRecords({ regionId, category });
    return reply.send({ items: records, total: records.length });
  });

  app.post('/api/campaign-records', { preHandler: requireRole(OPERATIONS_ROLES) }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const category = String(body.category || '');
    if (!CAMPAIGN_CATEGORIES.includes(category as typeof CAMPAIGN_CATEGORIES[number])) {
      return reply.code(400).send({ error: `Invalid category. Must be one of: ${CAMPAIGN_CATEGORIES.join(', ')}` });
    }
    const user = request.user!;
    const record = insertCampaignRecord({
      category: category as typeof CAMPAIGN_CATEGORIES[number],
      regionId: String(body.regionId || body.region_id || ''),
      regionName: String(body.regionName || body.region_name || ''),
      zone: String(body.zone || ''),
      centerName: String(body.centerName || body.center_name || ''),
      title: String(body.title || category),
      summary: String(body.summary || ''),
      payload: (body.payload as Record<string, unknown>) || {},
      priority: String(body.priority || 'medium'),
      status: 'submitted',
      submittedBy: user.name,
      submittedByRole: user.role,
    });
    pushWarRoom();
    pushCandidateBrief();
    return reply.code(201).send(record);
  });
}
