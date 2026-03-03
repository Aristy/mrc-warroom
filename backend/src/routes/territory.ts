import type { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/rbac.js';
import { TERRITORY_ACCESS_ROLES, TERRITORY_REFERENCE_ROLES } from '../constants/roles.js';
import { readTerritoryData, writeTerritoryData, buildTerritoryResponse } from '../services/territory.service.js';

export async function territoryRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/territory/departments', { preHandler: requireRole(TERRITORY_REFERENCE_ROLES) }, async (_req, reply) => {
    const data = readTerritoryData();
    return reply.send({ departments: data.departments });
  });

  app.get('/api/territory/arrondissements', { preHandler: requireRole(TERRITORY_REFERENCE_ROLES) }, async (request, reply) => {
    const { departmentId } = request.query as { departmentId?: string };
    const data = readTerritoryData();
    const arr = departmentId ? data.arrondissements.filter(a => a.departmentId === departmentId) : data.arrondissements;
    return reply.send({ arrondissements: arr });
  });

  app.get('/api/territory/zones', { preHandler: requireRole(TERRITORY_REFERENCE_ROLES) }, async (request, reply) => {
    const { departmentId, arrondissementId } = request.query as { departmentId?: string; arrondissementId?: string };
    const data = readTerritoryData();
    let zones = data.zones;
    if (departmentId) zones = zones.filter(z => z.departmentId === departmentId);
    if (arrondissementId) zones = zones.filter(z => z.arrondissementId === arrondissementId);
    return reply.send({ zones });
  });

  app.get('/api/territory/centers', { preHandler: requireRole(TERRITORY_REFERENCE_ROLES) }, async (request, reply) => {
    const { zoneId } = request.query as { zoneId?: string };
    const data = readTerritoryData();
    const centers = zoneId ? data.centers.filter(c => c.zoneId === zoneId) : data.centers;
    return reply.send({ centers });
  });

  app.post('/api/territory/import', { preHandler: requireRole(TERRITORY_ACCESS_ROLES) }, async (request, reply) => {
    const body = request.body as { departments?: unknown[] };
    if (!Array.isArray(body?.departments)) return reply.code(400).send({ error: 'departments array required' });
    const built = buildTerritoryResponse({ departments: body.departments });
    writeTerritoryData({ departments: body.departments });
    return reply.send({ ok: true, summary: built.summary });
  });
}
