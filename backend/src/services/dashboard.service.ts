import type { CampaignRecord } from '../db/queries/campaign.js';
import type { MemberEnrollment } from '../db/queries/members.js';
import type { EventItem } from '../db/queries/events.js';
import type { MediaItem } from '../db/queries/media.js';
import type { User } from '../db/queries/users.js';
import { buildWarRoomCampaignSummary, buildMemberEnrollmentResponse, buildCampaignResponse, getPollingSupportValue, getTerrainDoorsValue, getTerrainMeetingsValue } from './campaign.service.js';
import { normalizeKey, buildTerritoryResponse, readTerritoryData } from './territory.service.js';

interface RawRegion {
  id: string;
  name: string;
  districts?: string[];
  zones?: string[];
  stats?: {
    risk?: string;
    agents?: number;
    missions?: number;
    incidents?: number;
  };
  events?: RegionHighlight[];
}

interface RegionHighlight {
  time?: string;
  type?: string;
  status?: string;
  summary?: string;
  zone?: string;
}

interface CandidateRegion {
  id: string;
  name: string;
  districts: string[];
  zones: string[];
  risk: string;
  mobilisation: number;
  missions: number;
  incidents: number;
  memberEnrollments: number;
  pollingAverage: number;
  terrainDoors: number;
  terrainMeetings: number;
  digitalViews: number;
  digitalRelay: number;
  mediaReach: number;
  mediaPublished: number;
  mediaSensitive: number;
  eventsPublished: number;
  strategicEvents: number;
  highlights: RegionHighlight[];
}

function normalizeRisk(priority: string): string {
  const v = String(priority || '').trim().toLowerCase();
  if (v === 'critical' || v === 'high') return 'high';
  if (v === 'medium') return 'medium';
  return 'low';
}

function toComparableTimestamp(value: string | undefined): number {
  if (!value) return 0;
  const ts = Date.parse(String(value).replace(' ', 'T'));
  return Number.isNaN(ts) ? 0 : ts;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCandidateBrief(warRoomData: any, campaignItems: CampaignRecord[], memberEnrollments: MemberEnrollment[], viewerUser: User | null = null, publishedEvents: EventItem[], publishedMedia: MediaItem[]) {
  const visibility = {
    showAdhesion: Boolean(viewerUser?.candidateVisibility?.showAdhesion),
    showPolling: viewerUser?.candidateVisibility?.showPolling !== false,
    showIncidents: viewerUser?.candidateVisibility?.showIncidents !== false,
    showEvents: viewerUser?.candidateVisibility?.showEvents !== false,
    showMedia: viewerUser?.candidateVisibility?.showMedia !== false,
    showDigital: viewerUser?.candidateVisibility?.showDigital !== false,
    showTerrain: viewerUser?.candidateVisibility?.showTerrain !== false,
  };

  const publishedMemberEnrollments = memberEnrollments.filter(i => i.status === 'published');
  const campaign = buildWarRoomCampaignSummary(campaignItems, publishedMemberEnrollments);
  const rawRegions: RawRegion[] = Array.isArray(warRoomData?.map?.regions) ? warRoomData.map.regions : [];
  const regionLookup = new Map<string, string>(rawRegions.map((r) => [normalizeKey(r.name), r.id]));

  const memberDepartmentRollup: Record<string, { departmentId: string; departmentName: string; total: number }> = {};
  publishedMemberEnrollments.forEach(item => {
    const key = item.departmentId || item.departmentName;
    if (!memberDepartmentRollup[key]) memberDepartmentRollup[key] = { departmentId: item.departmentId, departmentName: item.departmentName, total: 0 };
    memberDepartmentRollup[key].total++;
  });

  const rollupByDepartment: Record<string, { departmentId: string; departmentName: string; terrainDoors: number; terrainMeetings: number; pollingTotal: number; pollingCount: number; incidentEntries: number; digitalViews: number; digitalRelay: number; mediaReach: number; mediaPublished: number; mediaSensitive: number; eventsPublished: number; strategicEvents: number; }> = {};

  function ensureRollup(departmentId: string, departmentName: string) {
    const key = departmentId || departmentName;
    if (!rollupByDepartment[key]) rollupByDepartment[key] = { departmentId, departmentName, terrainDoors: 0, terrainMeetings: 0, pollingTotal: 0, pollingCount: 0, incidentEntries: 0, digitalViews: 0, digitalRelay: 0, mediaReach: 0, mediaPublished: 0, mediaSensitive: 0, eventsPublished: 0, strategicEvents: 0 };
    return rollupByDepartment[key];
  }

  campaignItems.filter(i => i.status === 'published').forEach(item => {
    const departmentId = item.regionId || (regionLookup.get(normalizeKey(item.regionName)) ?? '');
    const departmentName = item.regionName || '';
    const rollup = ensureRollup(departmentId, departmentName);
    if (item.category === 'terrain') { rollup.terrainDoors += getTerrainDoorsValue(item.payload); rollup.terrainMeetings += getTerrainMeetingsValue(item.payload); }
    if (item.category === 'sondage') { rollup.pollingTotal += getPollingSupportValue(item.payload); rollup.pollingCount++; }
    if (item.category === 'incident') rollup.incidentEntries++;
    if (item.category === 'digital') { rollup.digitalViews += Number(item.payload?.viewsVideo || 0); rollup.digitalRelay += Number(item.payload?.whatsappRelay || 0); }
  });

  publishedEvents.forEach(item => {
    const rollup = ensureRollup(item.departmentId || '', item.departmentName || '');
    rollup.eventsPublished++;
    if (item.isStrategic) rollup.strategicEvents++;
  });

  publishedMedia.forEach(item => {
    const departmentId = item.departmentId || (regionLookup.get(normalizeKey(item.departmentName)) ?? '');
    const rollup = ensureRollup(departmentId, item.departmentName || '');
    rollup.mediaPublished++;
    rollup.mediaReach += Number(item.reachEstimate || 0);
    if (String(item.tone || '').toLowerCase() === 'sensible') rollup.mediaSensitive++;
  });

  const regions: CandidateRegion[] = rawRegions.map((region) => {
    const rollup = rollupByDepartment[region.id] || ensureRollup(region.id, region.name);
    const pollingAverage = rollup.pollingCount > 0 ? Math.round((rollup.pollingTotal / rollup.pollingCount) * 10) / 10 : 0;
    return {
      id: region.id, name: region.name,
      districts: Array.isArray(region.districts) ? region.districts : [],
      zones: Array.isArray(region.zones) ? region.zones : [],
      risk: normalizeRisk(region.stats?.risk ?? ''),
      mobilisation: Number(region.stats?.agents || 0),
      missions: Number(region.stats?.missions || 0),
      incidents: Number(region.stats?.incidents || 0) + rollup.incidentEntries,
      memberEnrollments: Number(memberDepartmentRollup[region.id]?.total || 0),
      pollingAverage, terrainDoors: rollup.terrainDoors, terrainMeetings: rollup.terrainMeetings,
      digitalViews: rollup.digitalViews, digitalRelay: rollup.digitalRelay,
      mediaReach: rollup.mediaReach, mediaPublished: rollup.mediaPublished, mediaSensitive: rollup.mediaSensitive,
      eventsPublished: rollup.eventsPublished, strategicEvents: rollup.strategicEvents,
      highlights: Array.isArray(region.events) ? region.events.slice(0, 3).map((e) => ({ time: e.time, type: e.type, status: e.status, summary: e.summary, zone: e.zone || '-' })) : [],
    };
  });

  const priorities = Array.isArray(warRoomData?.priorities) ? warRoomData.priorities.map((p: { regionId?: string; region?: string; percent?: number; risk?: string; action?: string }) => ({ regionId: p.regionId, region: p.region, percent: Number(p.percent || 0), risk: normalizeRisk(p.risk ?? ''), action: p.action })) : [];

  const sortedEvents = [...publishedEvents].sort((a, b) => toComparableTimestamp(b.publishedAt || b.updatedAt || b.createdAt) - toComparableTimestamp(a.publishedAt || a.updatedAt || a.createdAt));
  const sortedMedia = [...publishedMedia].sort((a, b) => toComparableTimestamp(b.publishedAt || b.updatedAt || b.createdAt) - toComparableTimestamp(a.publishedAt || a.updatedAt || a.createdAt));

  const topPolling = [...regions].sort((a, b) => b.pollingAverage - a.pollingAverage)[0];
  const topRisk = [...priorities].sort((a, b) => { const s = (r: string) => r === 'high' ? 2 : r === 'medium' ? 1 : 0; return s(b.risk) - s(a.risk) || b.percent - a.percent; })[0];
  const topNarrative = [...regions].sort((a, b) => b.mediaReach - a.mediaReach)[0];
  const strategicEventsCount = publishedEvents.filter(e => e.isStrategic).length;
  const totalMediaReach = publishedMedia.reduce((acc, m) => acc + Number(m.reachEstimate || 0), 0);
  const actionParts = [topRisk?.region ? `Tenir ${topRisk.region}` : '', topPolling?.name ? `capitaliser sur ${topPolling.name}` : ''].filter(Boolean);

  const politicalBrief = {
    actionDuJour: actionParts.join(' | ') || 'Suivi national',
    note: [topNarrative?.name ? `Narratif fort: ${topNarrative.name}` : '', strategicEventsCount > 0 ? `${strategicEventsCount} evenement(s) strategique(s)` : '', totalMediaReach > 0 ? `${totalMediaReach.toLocaleString('fr-FR')} de portee media publiee` : '', Number(campaign.pollingAverage || 0) > 0 ? `Sondage moyen ${campaign.pollingAverage}%` : ''].filter(Boolean).join(' | ') || 'Vue executive consolidee pour le candidat.',
  };

  const recentAdhesions = [...publishedMemberEnrollments].sort((a, b) => toComparableTimestamp(b.submittedAt) - toComparableTimestamp(a.submittedAt)).slice(0, 8).map(i => ({ id: i.id, fullName: i.fullName, departmentId: i.departmentId, departmentName: i.departmentName, arrondissementName: i.arrondissementName, localityName: i.localityName, submittedAt: i.submittedAt }));
  const adhesionByDepartment = Object.values(memberDepartmentRollup).sort((a, b) => b.total - a.total).slice(0, 6);

  const timeline = [
    ...regions.flatMap((r) => r.highlights.map((h) => ({ regionId: r.id, region: r.name, sourceType: 'region_event', ...h }))),
    ...(Array.isArray(warRoomData?.incidents24h) ? warRoomData.incidents24h.map((i: { lieu?: string; heure?: string; type?: string; gravite?: string; statut?: string }) => ({ regionId: '', region: i.lieu || '-', sourceType: 'incident', time: i.heure || '', type: i.type || 'Incident', status: i.gravite || i.statut || 'Medium', summary: `${i.lieu || '-'} | ${i.type || 'Incident'} | ${i.statut || '-'}`, zone: i.lieu || '-' })) : []),
    ...sortedEvents.slice(0, 10).map(e => ({ regionId: e.departmentId || '', region: e.departmentName || '-', sourceType: 'event', time: e.startTime || e.eventDate || e.publishedAt || e.updatedAt || e.createdAt, type: e.isStrategic ? 'Evenement strategique' : 'Evenement publie', status: e.impactLevel || e.tone || 'Publie', summary: e.title, zone: e.zoneName || e.arrondissementName || '-' })),
    ...sortedMedia.slice(0, 10).map(m => ({ regionId: m.departmentId || '', region: m.departmentName || '-', sourceType: 'media', time: m.publishedAt || m.updatedAt || m.createdAt, type: `Media ${m.sourceType || ''}`.trim(), status: m.tone || 'neutre', summary: m.title, zone: m.zoneName || m.arrondissementName || '-' })),
  ].sort((a, b) => toComparableTimestamp(b.time) - toComparableTimestamp(a.time)).slice(0, 10);

  return {
    visibility,
    headline: { alertLevel: normalizeRisk(warRoomData?.alert?.level || 'normal'), actionDuJour: politicalBrief.actionDuJour || warRoomData?.map?.actionDuJour || 'Suivi national', note: politicalBrief.note, generatedAt: new Date().toISOString() },
    national: { missionRate: Number(warRoomData?.kpis?.missions?.tauxRealisation || 0), missionsEngaged: Number(warRoomData?.kpis?.missions?.missionsEngagees || 0), doorsKnocked: Number(warRoomData?.kpis?.terrain?.portesAPorte?.done || 0), meetingsConfirmed: Number(warRoomData?.kpis?.terrain?.meetingsConfirmes || 0), digitalViews: Number(warRoomData?.kpis?.digital?.vuesVideo || 0), digitalRelay: Number(warRoomData?.kpis?.digital?.whatsappRelay || 0), incidents24h: Array.isArray(warRoomData?.incidents24h) ? warRoomData.incidents24h.length : 0, pollingAverage: Number(campaign.pollingAverage || 0), adherents: Number(campaign.newAdherents || 0), publishedToday: Number(campaign.publishedToday || 0), memberDepartmentsCovered: Number(campaign.memberDepartmentsCovered || 0), priorityRegions: priorities.filter((p: { risk: string }) => p.risk !== 'low').length, terrainReports: Number(campaign.terrainReports || 0), incidentEntries: Number(campaign.incidentEntries || 0), digitalEntries: Number(campaign.digitalEntries || 0), mediaPublished: publishedMedia.length, mediaReach: publishedMedia.reduce((acc, m) => acc + Number(m.reachEstimate || 0), 0), sensitiveMentions: publishedMedia.filter(m => String(m.tone || '').toLowerCase() === 'sensible').length, publishedEvents: publishedEvents.length, strategicEvents: publishedEvents.filter(e => e.isStrategic).length },
    priorities, recentAdhesions, adhesionByDepartment,
    publishedEvents: sortedEvents.slice(0, 8).map(e => ({ id: e.id, title: e.title, description: e.description, eventType: e.eventType, eventDate: e.eventDate, startTime: e.startTime, endTime: e.endTime, departmentId: e.departmentId, departmentName: e.departmentName, arrondissementName: e.arrondissementName, zoneName: e.zoneName, participantEstimate: e.participantEstimate, impactLevel: e.impactLevel, tone: e.tone, markerLevel: e.markerLevel, isStrategic: e.isStrategic, publishedAt: e.publishedAt || e.updatedAt || e.createdAt, mediaCount: e.media?.length || 0, gpsLat: e.gpsLat, gpsLon: e.gpsLon })),
    publishedMedia: sortedMedia.slice(0, 8).map(m => ({ id: m.id, title: m.title, summary: m.summary, departmentId: m.departmentId, departmentName: m.departmentName, sourceType: m.sourceType, tone: m.tone, reachEstimate: m.reachEstimate, sourceUrl: m.sourceUrl, publishedAt: m.publishedAt || m.updatedAt || m.createdAt })),
    regions, timeline, politicalBrief,
  };
}

export function createEmptyWarRoomData() {
  const territory = readTerritoryData();
  return {
    alert: { level: 'normal' },
    kpis: { missions: { objectifJour: 0, missionsEngagees: 0, tauxRealisation: 0 }, terrain: { portesAPorte: { done: 0, target: 0 }, meetingsConfirmes: 0 }, digital: { vuesVideo: 0, whatsappRelay: 0 }, logistique: { transportPrevuCamions: 0, risques24h: 0 } },
    map: { zonesChaudes: 0, zonesFaibles: 0, actionDuJour: '', regions: territory.departments.map(d => ({ id: d.id, name: d.name, districts: (d.arrondissements || []).map(a => a.name), zones: (d.arrondissements || []).flatMap(a => (a.zones || []).map(z => z.name)), stats: { agents: 0, missions: 0, incidents: 0, risk: 'low' }, events: [] })) },
    priorities: [], incidents24h: [], calendarToday: [],
    completePollingReview: { summary: { total: 0, supportAverage: 0, turnoutAverage: 0, topIssue: '-', topRegion: '-' }, items: [] },
    campaign: { totalPublished: 0, newAdherents: 0, newVolunteers: 0, terrainReports: 0, missionsReported: 0, digitalEntries: 0, incidentEntries: 0, logisticsEntries: 0, pollingAverage: 0, publishedToday: 0, memberDepartmentsCovered: 0 },
  };
}

export function buildWarRoomDashboard(warRoomData: unknown, campaignItems: CampaignRecord[], memberEnrollments: MemberEnrollment[]) {
  const campaign = buildWarRoomCampaignSummary(campaignItems, memberEnrollments);
  return { ...(warRoomData as object), campaign, meta: { source: 'live', generatedAt: new Date().toISOString() } };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildPollingReview(campaignItems: CampaignRecord[], warRoomData: any) {
  const pollingItems = campaignItems.filter(i => i.category === 'sondage' && i.status === 'published');
  const { summary } = buildCampaignResponse(pollingItems);
  return { ...(warRoomData?.completePollingReview || {}), summary: { ...warRoomData?.completePollingReview?.summary, total: pollingItems.length, supportAverage: summary.pollingAverage }, items: pollingItems.map(i => ({ id: i.id, region: i.regionName, zone: i.zone, submittedAt: i.submittedAt, payload: i.payload })) };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSocialDashboard(warRoomData: any, mediaItems: MediaItem[]) {
  const publishedMedia = mediaItems.filter(m => m.status === 'publie');
  return { ...(warRoomData?.social || {}), mediaStats: { total: publishedMedia.length, totalReach: publishedMedia.reduce((acc, m) => acc + Number(m.reachEstimate || 0), 0), sensitive: publishedMedia.filter(m => m.tone === 'sensible').length, bySourceType: publishedMedia.reduce((acc: Record<string, number>, m) => { acc[m.sourceType] = (acc[m.sourceType] || 0) + 1; return acc; }, {}) }, generatedAt: new Date().toISOString() };
}
