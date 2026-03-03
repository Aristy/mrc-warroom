import type { FastifyInstance } from 'fastify';
import fs from 'fs';
import { requireRole } from '../middleware/rbac.js';
import { SYSTEM_ADMIN_ROLES } from '../constants/roles.js';
import { db, readJsonFile, writeJsonFile, SYSTEM_SETTINGS_FILE, WAR_ROOM_RUNTIME_FILE, UPLOADS_DIR } from '../db/index.js';
import { readCampaignRecords } from '../db/queries/campaign.js';
import { readMemberEnrollments } from '../db/queries/members.js';
import { readEvents } from '../db/queries/events.js';
import { readMediaMonitoringItems } from '../db/queries/media.js';
import { readTeams } from '../db/queries/teams.js';
import { readTerritoryData } from '../services/territory.service.js';
import { buildWarRoomCampaignSummary } from '../services/campaign.service.js';
import { createEmptyWarRoomData } from '../services/dashboard.service.js';
import { clearDirectoryContents } from '../services/upload.service.js';
import path from 'path';

const DEFAULTS = {
  platformName: 'MRC Operations Platform',
  candidateName: 'Denis Sassou Nguesso',
  mobileAppName: 'DSN2026',
  candidateDashboardPath: '/candidate',
  mobileDefaultBackendUrl: 'http://169.255.58.148',
  operationalMessage: '',
  environmentMode: 'production',
};

function readSettings() {
  if (!fs.existsSync(SYSTEM_SETTINGS_FILE)) writeJsonFile(SYSTEM_SETTINGS_FILE, { ...DEFAULTS, updatedAt: new Date().toISOString() });
  const payload = readJsonFile(SYSTEM_SETTINGS_FILE) as Record<string, unknown> | null;
  return { ...DEFAULTS, ...(payload || {}), updatedAt: (payload as { updatedAt?: string })?.updatedAt || new Date().toISOString() };
}

export async function systemRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/system/settings', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (_req, reply) => {
    return reply.send(readSettings());
  });

  app.put('/api/system/settings', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const next = { ...DEFAULTS, ...body, updatedAt: new Date().toISOString() };
    writeJsonFile(SYSTEM_SETTINGS_FILE, next);
    return reply.send(next);
  });

  app.get('/api/system/overview', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (_req, reply) => {
    const settings = readSettings();
    const campaign = readCampaignRecords();
    const members = readMemberEnrollments();
    const events = readEvents();
    const media = readMediaMonitoringItems();
    const teams = readTeams();
    const territory = readTerritoryData();
    const warRoomData = readJsonFile(WAR_ROOM_RUNTIME_FILE) as { priorities?: unknown[]; incidents24h?: unknown[] } | null;
    const sessionCount = (db.prepare('SELECT COUNT(*) AS count FROM sessions').get() as { count: number }).count;
    const userCount = (db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }).count;
    const runtimeCampaign = buildWarRoomCampaignSummary(campaign, members);

    return reply.send({
      generatedAt: new Date().toISOString(),
      environmentMode: settings.environmentMode,
      platformName: settings.platformName,
      modules: { users: userCount, sessions: sessionCount, campaignRecords: campaign.length, memberEnrollments: members.length, events: events.length, mediaMentions: media.length, teams: teams.length, departments: territory.departments.length },
      dashboards: { priorityRegions: warRoomData?.priorities?.length || 0, incidents24h: warRoomData?.incidents24h?.length || 0, publishedEvents: events.filter(e => e.status === 'publie').length, publishedMedia: media.filter(m => m.status === 'publie').length, campaignPublished: runtimeCampaign.totalPublished },
    });
  });

  app.post('/api/system/clear-test-data', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (_req, reply) => {
    db.exec(`DELETE FROM team_members; DELETE FROM teams; DELETE FROM event_media; DELETE FROM event_validations; DELETE FROM events; DELETE FROM media_monitoring; DELETE FROM member_enrollments; DELETE FROM campaign_records; DELETE FROM sessions;`);
    writeJsonFile(WAR_ROOM_RUNTIME_FILE, createEmptyWarRoomData());
    clearDirectoryContents(path.join(UPLOADS_DIR, 'events'));
    clearDirectoryContents(path.join(UPLOADS_DIR, 'pvs'));
    return reply.send({ clearedAt: new Date().toISOString() });
  });

  app.post('/api/system/clear-all-data', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (_req, reply) => {
    db.exec(`DELETE FROM team_members; DELETE FROM teams; DELETE FROM event_media; DELETE FROM event_validations; DELETE FROM events; DELETE FROM media_monitoring; DELETE FROM member_enrollments; DELETE FROM campaign_records; DELETE FROM sessions;`);
    clearDirectoryContents(path.join(UPLOADS_DIR, 'events'));
    clearDirectoryContents(path.join(UPLOADS_DIR, 'pvs'));
    writeJsonFile(WAR_ROOM_RUNTIME_FILE, createEmptyWarRoomData());
    writeJsonFile(SYSTEM_SETTINGS_FILE, { ...DEFAULTS, environmentMode: 'production', updatedAt: new Date().toISOString() });
    return reply.send({ clearedAt: new Date().toISOString() });
  });
}
