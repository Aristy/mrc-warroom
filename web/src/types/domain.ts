export type Role = 'war_room' | 'regional_coordinator' | 'zone_leader' | 'field_agent' | 'membership_data_entry' | 'candidate' | 'direction' | 'digital_team' | 'logistics_team';
export type TerrainModuleId = 'campaign' | 'sondage' | 'incident' | 'events' | 'mission' | 'digital' | 'logistique' | 'adherent';
export type CampaignCategory = 'terrain' | 'sondage' | 'incident' | 'adherent' | 'digital' | 'mission' | 'logistique';
export type AlertLevel = 'low' | 'medium' | 'high' | 'critical' | 'normal';

export interface CandidateVisibility {
  showAdhesion: boolean; showPolling: boolean; showIncidents: boolean;
  showEvents: boolean; showMedia: boolean; showDigital: boolean; showTerrain: boolean;
}

export interface User {
  id: string; username: string; email: string; name: string;
  role: Role; roleName: string; homePath: string;
  scopeDepartmentId: string; scopeDepartmentName: string;
  scopeArrondissementName: string; scopeZoneName: string;
  candidateVisibility: CandidateVisibility;
  terrainModules: TerrainModuleId[];
}

export interface CampaignRecord {
  id: string; category: CampaignCategory; regionId: string; regionName: string;
  zone: string; centerName: string; title: string; summary: string;
  payload: Record<string, unknown>; priority: string; status: string;
  submittedBy: string; submittedByRole: string; submittedAt: string; updatedAt: string;
}

export interface EventItem {
  id: string; title: string; description: string; eventType: string;
  eventDate: string; startTime: string; endTime: string;
  departmentId: string; departmentName: string;
  arrondissementName: string; zoneName: string; localityName: string;
  gpsLat: number | null; gpsLon: number | null;
  participantEstimate: number; impactLevel: string; tone: string; markerLevel: string;
  sourceUrl: string; sourceType: string; status: string;
  isStrategic: boolean; publicationNote: string;
  createdByUsername: string; createdBy: string; createdByRole: string;
  validatedBy: string; validatedAt: string; publishedBy: string; publishedAt: string;
  createdAt: string; updatedAt: string;
  media: EventMedia[]; validations: EventValidation[];
}

export interface EventMedia { id: string; eventId: string; mediaType: string; filePath: string; externalUrl: string; caption: string; createdBy: string; createdAt: string; }
export interface EventValidation { id: string; eventId: string; level: string; decision: string; comment: string; decidedBy: string; decidedByRole: string; decidedAt: string; }

export interface MemberEnrollment {
  id: string; departmentId: string; departmentName: string;
  arrondissementName: string; zoneName: string; localityName: string;
  fullName: string; lastName: string; firstNames: string;
  phone: string; email: string; gender: string; ageRange: string; occupation: string;
  membershipType: string; consentGiven: boolean; notes: string;
  status: string; submittedBy: string; submittedByRole: string;
  submittedAt: string; updatedAt: string;
}

export interface MediaItem {
  id: string; title: string; summary: string;
  departmentId: string; departmentName: string;
  sourceUrl: string; sourceType: string; tone: string;
  reachEstimate: number; screenshotPath: string; status: string; crisisLevel: string;
  createdByUsername: string; createdBy: string;
  validatedBy: string; publishedAt: string; createdAt: string; updatedAt: string;
}

export interface Team {
  id: string; name: string; cellType: string;
  departmentId: string; departmentName: string;
  arrondissementName: string; zoneName: string;
  status: string; notes: string; createdBy: string;
  createdAt: string; updatedAt: string;
  members: TeamMember[];
}
export interface TeamMember { id: string; teamId: string; userId: string; username: string; name: string; role: string; teamRole: string; assignedAt: string; }

export interface TerritoryDepartment { id: string; name: string; arrondissements?: TerritoryArrondissement[]; }
export interface TerritoryArrondissement { id: string; name: string; departmentId: string; departmentName: string; zones?: TerritoryZone[]; }
export interface TerritoryZone { id: string; name: string; arrondissementId: string; arrondissementName: string; departmentId: string; departmentName: string; }
export interface TerritoryCenter { id: string; name: string; zoneId: string; zoneName: string; departmentId: string; departmentName: string; }

// Dashboard types
export interface WarRoomKpis { missions: { objectifJour: number; missionsEngagees: number; tauxRealisation: number }; terrain: { portesAPorte: { done: number; target: number }; meetingsConfirmes: number }; digital: { vuesVideo: number; whatsappRelay: number }; logistique: { transportPrevuCamions: number; risques24h: number }; }
export interface WarRoomRegion { id: string; name: string; districts: string[]; zones: string[]; stats: { agents: number; missions: number; incidents: number; risk: AlertLevel }; events: unknown[]; }
export interface ProgrammeStop { date: string; lieu: string; departement: string; regionId: string; type: 'visite' | 'nuit' | 'retour'; nuit: boolean; }
export interface WarRoomData { alert: { level: AlertLevel }; kpis: WarRoomKpis; map: { zonesChaudes: number; zonesFaibles: number; actionDuJour: string; regions: WarRoomRegion[] }; priorities: Priority[]; incidents24h: Incident24h[]; calendarToday: CalendarItem[]; campaign: CampaignSummary; candidateProgramme?: ProgrammeStop[]; meta?: { source: string; generatedAt: string }; }
export interface Priority { regionId: string; region: string; percent: number; risk: AlertLevel; action: string; }
export interface Incident24h { heure: string; type: string; lieu: string; gravite: string; statut: string; }
export interface CalendarItem { time: string; type: string; lieu: string; responsable: string; }
export interface CampaignSummary { totalPublished: number; newAdherents: number; terrainReports: number; missionsReported: number; digitalEntries: number; incidentEntries: number; pollingAverage: number; publishedToday: number; }

export interface CandidateNational { missionRate: number; missionsEngaged: number; doorsKnocked: number; meetingsConfirmed: number; digitalViews: number; digitalRelay: number; incidents24h: number; pollingAverage: number; adherents: number; publishedToday: number; priorityRegions: number; terrainReports: number; mediaPublished: number; mediaReach: number; sensitiveMentions: number; publishedEvents: number; strategicEvents: number; }
export interface CandidateRegion { id: string; name: string; risk: AlertLevel; mobilisation: number; pollingAverage: number; incidents: number; memberEnrollments: number; eventsPublished: number; strategicEvents: number; mediaReach: number; mediaPublished: number; mediaSensitive: number; }
export interface TimelineItem { regionId: string; region: string; sourceType: string; time: string; type: string; status: string; summary: string; zone: string; }
export interface CandidateBrief { visibility: CandidateVisibility; headline: { alertLevel: AlertLevel; actionDuJour: string; note: string; generatedAt: string }; national: CandidateNational; priorities: Priority[]; recentAdhesions: { id: string; fullName: string; departmentName: string; submittedAt: string }[]; publishedEvents: Partial<EventItem>[]; publishedMedia: Partial<MediaItem>[]; regions: CandidateRegion[]; timeline: TimelineItem[]; politicalBrief: { actionDuJour: string; note: string }; }

export interface SystemSettings { platformName: string; candidateName: string; mobileAppName: string; mobileDefaultBackendUrl: string; operationalMessage: string; environmentMode: string; updatedAt: string; }
