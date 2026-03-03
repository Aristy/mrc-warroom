import type { CampaignRecord } from '../db/queries/campaign.js';
import type { MemberEnrollment } from '../db/queries/members.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTerrainDoorsValue(payload: any): number { return Number(payload?.portesAPorte || payload?.doors || 0); }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTerrainMeetingsValue(payload: any): number { return Number(payload?.meetings || payload?.meetingsConfirmes || 0); }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPollingSupportValue(payload: any): number { return Number(payload?.support || payload?.scoreSupport || payload?.soutienPourcent || 0); }

export function buildCampaignResponse(items: CampaignRecord[]) {
  const byCategory: Record<string, number> = {};
  let adherents = 0, volunteers = 0, missions = 0, pollingTotal = 0, pollingCount = 0;
  const regions = new Set<string>();

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    if (item.category === 'adherent') adherents++;
    if (item.category === 'mission') missions++;
    if (item.category === 'sondage') { pollingTotal += getPollingSupportValue(item.payload); pollingCount++; }
    if (item.regionId) regions.add(item.regionId);
  }

  return {
    items,
    summary: {
      total: items.length,
      byCategory,
      adherents,
      volunteers,
      missions,
      pollingAverage: pollingCount > 0 ? Math.round((pollingTotal / pollingCount) * 10) / 10 : 0,
      regions,
    },
  };
}

export function buildMemberEnrollmentResponse(items: MemberEnrollment[]) {
  const departments = new Set<string>();
  const membershipTypes = new Set<string>();
  const byStatus: Record<string, number> = {};
  const today = new Date().toISOString().slice(0, 10);
  let todayCount = 0;

  for (const item of items) {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    if (item.departmentId) departments.add(item.departmentId);
    if (item.membershipType) membershipTypes.add(item.membershipType);
    if (item.submittedAt?.slice(0, 10) === today) todayCount++;
  }

  return {
    items,
    summary: {
      total: items.length,
      byStatus,
      departments,
      membershipTypes,
      published: byStatus['published'] || 0,
      today: todayCount,
      departmentsCovered: departments.size,
    },
  };
}

export function buildWarRoomCampaignSummary(items: CampaignRecord[], memberEnrollments: MemberEnrollment[] = []) {
  const published = items.filter(i => i.status === 'published');
  const publishedMembers = memberEnrollments.filter(i => i.status === 'published');
  const summary = buildCampaignResponse(published).summary;
  const memberSummary = buildMemberEnrollmentResponse(publishedMembers).summary;
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalPublished: summary.total + memberSummary.total,
    newAdherents: summary.adherents + memberSummary.total,
    newVolunteers: summary.volunteers,
    terrainReports: summary.byCategory['terrain'] || 0,
    missionsReported: summary.missions,
    digitalEntries: summary.byCategory['digital'] || 0,
    incidentEntries: summary.byCategory['incident'] || 0,
    logisticsEntries: summary.byCategory['logistique'] || 0,
    pollingAverage: summary.pollingAverage,
    publishedToday: published.filter(i => i.updatedAt?.slice(0, 10) === today).length + memberSummary.today,
    memberDepartmentsCovered: memberSummary.departmentsCovered,
  };
}
