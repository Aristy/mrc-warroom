export type Role =
  | 'war_room'
  | 'regional_coordinator'
  | 'zone_leader'
  | 'field_agent'
  | 'membership_data_entry'
  | 'candidate'
  | 'direction';

export const ROLE_SEED = [
  { id: 'war_room', name: 'War Room', homePath: '/dashboard' },
  { id: 'regional_coordinator', name: 'Coordinateur regional', homePath: '/dashboard' },
  { id: 'zone_leader', name: 'Chef de zone', homePath: '/campaign' },
  { id: 'field_agent', name: 'Agent terrain', homePath: '/campaign' },
  { id: 'membership_data_entry', name: 'Saisie adhesion', homePath: '/members' },
  { id: 'candidate', name: 'Candidat', homePath: '/candidate' },
  { id: 'direction', name: 'Direction', homePath: '/candidate' },
] as const;

export const OPERATIONS_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'zone_leader', 'field_agent']);
export const MEMBER_ENTRY_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'zone_leader', 'membership_data_entry']);
export const MEMBER_ENTRY_WRITE_ROLES = new Set<Role>(['regional_coordinator', 'zone_leader', 'membership_data_entry']);
export const MEMBER_ENTRY_PUBLICATION_ROLES = new Set<Role>(['war_room']);
export const EVENT_VIEW_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'zone_leader', 'field_agent', 'direction']);
export const EVENT_WRITE_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'zone_leader', 'field_agent']);
export const EVENT_ZONE_VALIDATION_ROLES = new Set<Role>(['war_room', 'regional_coordinator']);
export const EVENT_WR_VALIDATION_ROLES = new Set<Role>(['war_room']);
export const TERRITORY_ACCESS_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'direction']);
export const TERRITORY_REFERENCE_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'zone_leader', 'field_agent', 'membership_data_entry', 'direction']);
export const TEAM_ACCESS_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'direction']);
export const MEDIA_MONITORING_VIEW_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'zone_leader', 'direction']);
export const MEDIA_MONITORING_WRITE_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'zone_leader']);
export const SOCIAL_DASHBOARD_ROLES = new Set<Role>(['war_room', 'regional_coordinator', 'direction']);
export const SYSTEM_ADMIN_ROLES = new Set<Role>(['war_room', 'direction']);
export const EXECUTIVE_ROLES = new Set<Role>(['candidate', 'direction']);

export const SESSION_COOKIE = 'mrc_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export const CAMPAIGN_CATEGORIES = ['terrain', 'sondage', 'incident', 'adherent', 'digital', 'mission', 'logistique'] as const;
export type CampaignCategory = typeof CAMPAIGN_CATEGORIES[number];

export const TERRAIN_MODULE_IDS = ['campaign', 'sondage', 'incident', 'events', 'mission', 'digital', 'logistique', 'adherent'] as const;
export type TerrainModuleId = typeof TERRAIN_MODULE_IDS[number];

export const GEOGRAPHIC_SCOPE_HINTS = [
  { id: 'CGBZV', name: 'Brazzaville' },
  { id: 'CG16', name: 'Pointe-Noire' },
  { id: 'CG11', name: 'Bouenza' },
  { id: 'CG8', name: 'Cuvette Centrale' },
  { id: 'CG15', name: 'Cuvette Ouest' },
  { id: 'CG5', name: 'Kouilou' },
  { id: 'CG2', name: 'Lekoumou' },
  { id: 'CG9', name: 'Niari' },
  { id: 'CG14', name: 'Plateaux' },
  { id: 'CG7', name: 'Likouala' },
  { id: 'CG13', name: 'Sangha' },
  { id: 'CG12', name: 'Pool' },
];
