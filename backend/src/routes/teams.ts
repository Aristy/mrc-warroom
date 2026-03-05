import type { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/rbac.js';
import { TEAM_ACCESS_ROLES, TERRAIN_MODULE_IDS } from '../constants/roles.js';
import { readTeams, upsertTeam } from '../db/queries/teams.js';
import { readUsers, updateTerrainModules, findUserById, sanitizeUser } from '../db/queries/users.js';
import { readTerritoryData } from '../services/territory.service.js';

export async function teamsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/teams', { preHandler: requireRole(TEAM_ACCESS_ROLES) }, async (_req, reply) => {
    return reply.send({ teams: readTeams() });
  });

  app.post('/api/teams', { preHandler: requireRole(TEAM_ACCESS_ROLES) }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const user = request.user!;
    if (!body.name || !body.cellType) return reply.code(400).send({ error: 'name and cellType required' });

    const territory = readTerritoryData();
    const departmentId = String(body.departmentId || '');
    const department = territory.departments.find(d => d.id === departmentId);
    const now = new Date().toISOString();
    const id = String(body.id || `TEAM-${Date.now()}`);
    const existingId = String(body.existingId || '');

    const item = {
      id, name: String(body.name), cellType: String(body.cellType).toLowerCase(),
      departmentId, departmentName: department?.name || String(body.departmentName || ''),
      arrondissementName: String(body.arrondissementName || ''),
      zoneName: String(body.zoneName || ''),
      status: String(body.status || 'active'), notes: String(body.notes || ''),
      createdBy: user.name, createdAt: now, updatedAt: now,
      members: (Array.isArray(body.members) ? body.members : []).map((m: { userId?: string; teamRole?: string }) => ({
        userId: String(m.userId || ''), teamRole: String(m.teamRole || 'member'),
      })).filter((m: { userId: string }) => m.userId),
    };

    const team = upsertTeam(item, existingId || undefined);
    return reply.code(existingId ? 200 : 201).send(team);
  });

  app.get('/api/team-users', { preHandler: requireRole(TEAM_ACCESS_ROLES) }, async (_req, reply) => {
    return reply.send({ users: readUsers().map(sanitizeUser) });
  });

  app.put('/api/team-users/:id/terrain-modules', { preHandler: requireRole(TEAM_ACCESS_ROLES) }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { modules } = request.body as { modules?: string[] };
    if (!Array.isArray(modules)) return reply.code(400).send({ error: 'modules array required' });

    const user = findUserById(id);
    if (!user) return reply.code(404).send({ error: 'User not found' });

    const normalized = [...new Set(modules.map(m => String(m).trim().toLowerCase()).filter(m => TERRAIN_MODULE_IDS.includes(m as typeof TERRAIN_MODULE_IDS[number])))];
    updateTerrainModules(id, normalized);
    const updated = findUserById(id);
    return reply.send(sanitizeUser(updated!));
  });
}
