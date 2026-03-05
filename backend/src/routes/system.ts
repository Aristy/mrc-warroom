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
import { readUsers, findUserById, createUser, updateUser, deleteUser, sanitizeUser } from '../db/queries/users.js';
import { hashPassword } from '../services/auth.service.js';
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

  // User management
  app.get('/api/system/users', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (_req, reply) => {
    return reply.send(readUsers().map(sanitizeUser));
  });

  app.post('/api/users', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const { username, name, email, role, password, scopeDepartmentId, scopeDepartmentName, scopeArrondissementName, scopeZoneName, candidateVisibility, terrainModules } = body;
    if (!username || !name || !role || !password) return reply.status(400).send({ error: 'username, name, role, password sont requis' });
    const existing = readUsers().find(u => u.username === String(username).trim().toLowerCase());
    if (existing) return reply.status(409).send({ error: 'Ce nom d\'utilisateur existe déjà' });
    const { salt, hash } = hashPassword(String(password));
    const user = createUser({
      username: String(username), name: String(name),
      email: email ? String(email) : `${String(username).trim().toLowerCase()}@mrc.local`,
      role: role as never,
      passwordSalt: salt, passwordHash: hash,
      scopeDepartmentId: scopeDepartmentId ? String(scopeDepartmentId) : undefined,
      scopeDepartmentName: scopeDepartmentName ? String(scopeDepartmentName) : undefined,
      scopeArrondissementName: scopeArrondissementName ? String(scopeArrondissementName) : undefined,
      scopeZoneName: scopeZoneName ? String(scopeZoneName) : undefined,
      candidateVisibility: candidateVisibility as Record<string, boolean> | undefined,
      terrainModules: terrainModules as never,
    });
    return reply.status(201).send(sanitizeUser(user));
  });

  app.put('/api/users/:id', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const target = findUserById(id);
    if (!target) return reply.status(404).send({ error: 'Utilisateur introuvable' });
    const updateData: Parameters<typeof updateUser>[1] = {};
    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.email !== undefined) updateData.email = String(body.email);
    if (body.role !== undefined) updateData.role = body.role as never;
    if (body.scopeDepartmentId !== undefined) updateData.scopeDepartmentId = String(body.scopeDepartmentId);
    if (body.scopeDepartmentName !== undefined) updateData.scopeDepartmentName = String(body.scopeDepartmentName);
    if (body.scopeArrondissementName !== undefined) updateData.scopeArrondissementName = String(body.scopeArrondissementName);
    if (body.scopeZoneName !== undefined) updateData.scopeZoneName = String(body.scopeZoneName);
    if (body.candidateVisibility !== undefined) updateData.candidateVisibility = body.candidateVisibility as Record<string, boolean>;
    if (body.terrainModules !== undefined) updateData.terrainModules = body.terrainModules as never;
    if (body.password && String(body.password).length >= 6) {
      const { salt, hash } = hashPassword(String(body.password));
      updateData.passwordSalt = salt; updateData.passwordHash = hash;
    }
    const updated = updateUser(id, updateData);
    return reply.send(updated ? sanitizeUser(updated) : { error: 'Échec de la mise à jour' });
  });

  app.delete('/api/users/:id', { preHandler: requireRole(SYSTEM_ADMIN_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const requestingUser = request.user;
    if (requestingUser?.id === id) return reply.status(400).send({ error: 'Impossible de supprimer votre propre compte' });
    const ok = deleteUser(id);
    return reply.send({ deleted: ok });
  });
}
