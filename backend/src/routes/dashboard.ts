import type { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/rbac.js';
import { OPERATIONS_ROLES, EXECUTIVE_ROLES, SOCIAL_DASHBOARD_ROLES } from '../constants/roles.js';
import { readCampaignRecords } from '../db/queries/campaign.js';
import { readMemberEnrollments } from '../db/queries/members.js';
import { readEvents } from '../db/queries/events.js';
import { readMediaMonitoringItems } from '../db/queries/media.js';
import { readJsonFile, WAR_ROOM_RUNTIME_FILE } from '../db/index.js';
import { buildCandidateBrief, buildWarRoomDashboard, buildPollingReview, buildSocialDashboard } from '../services/dashboard.service.js';

const WAR_ROOM_ROLES = new Set([...OPERATIONS_ROLES]);

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get('/dashboard/war-room', { preHandler: requireRole(WAR_ROOM_ROLES) }, async (_req, reply) => {
    const warRoomData = readJsonFile(WAR_ROOM_RUNTIME_FILE);
    const campaign = readCampaignRecords();
    const members = readMemberEnrollments();
    return reply.send(buildWarRoomDashboard(warRoomData, campaign, members));
  });

  app.get('/dashboard/candidate-brief', async (request, reply) => {
    const warRoomData = readJsonFile(WAR_ROOM_RUNTIME_FILE);
    const campaign = readCampaignRecords();
    const members = readMemberEnrollments();
    const events = readEvents({ status: 'publie' });
    const media = readMediaMonitoringItems({ status: 'publie' });
    const brief = buildCandidateBrief(warRoomData, campaign, members, request.user, events, media);
    return reply.send(brief);
  });

  app.get('/dashboard/polling-review', { preHandler: requireRole(new Set(['war_room', 'regional_coordinator'])) }, async (_req, reply) => {
    const warRoomData = readJsonFile(WAR_ROOM_RUNTIME_FILE);
    const campaign = readCampaignRecords();
    return reply.send(buildPollingReview(campaign, warRoomData));
  });

  app.get('/dashboard/social-media', { preHandler: requireRole(SOCIAL_DASHBOARD_ROLES) }, async (_req, reply) => {
    const warRoomData = readJsonFile(WAR_ROOM_RUNTIME_FILE);
    const media = readMediaMonitoringItems();
    return reply.send(buildSocialDashboard(warRoomData, media));
  });
}
