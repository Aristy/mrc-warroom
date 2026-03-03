import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.js';
import { territoryRoutes } from './territory.js';
import { campaignRoutes } from './campaign.js';
import { membersRoutes } from './members.js';
import { eventsRoutes } from './events.js';
import { mediaRoutes } from './media.js';
import { teamsRoutes } from './teams.js';
import { dashboardRoutes } from './dashboard.js';
import { systemRoutes } from './system.js';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await authRoutes(app);
  await territoryRoutes(app);
  await campaignRoutes(app);
  await membersRoutes(app);
  await eventsRoutes(app);
  await mediaRoutes(app);
  await teamsRoutes(app);
  await dashboardRoutes(app);
  await systemRoutes(app);
}
