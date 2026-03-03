import { broadcast } from './hub.js';
import { WS_TOPICS } from './topics.js';
import { readJsonFile, WAR_ROOM_RUNTIME_FILE } from '../db/index.js';
import { readCampaignRecords } from '../db/queries/campaign.js';
import { readMemberEnrollments } from '../db/queries/members.js';
import { readEvents } from '../db/queries/events.js';
import { readMediaMonitoringItems } from '../db/queries/media.js';
import { buildCandidateBrief, buildWarRoomDashboard } from '../services/dashboard.service.js';

export function pushWarRoom(): void {
  try {
    const warRoomData = readJsonFile(WAR_ROOM_RUNTIME_FILE);
    const campaign = readCampaignRecords();
    const members = readMemberEnrollments();
    const dashboard = buildWarRoomDashboard(warRoomData, campaign, members);
    broadcast(WS_TOPICS.WAR_ROOM, { type: 'war-room-update', payload: dashboard, timestamp: new Date().toISOString() });
  } catch { /* non-blocking */ }
}

export function pushCandidateBrief(): void {
  try {
    const warRoomData = readJsonFile(WAR_ROOM_RUNTIME_FILE);
    const campaign = readCampaignRecords();
    const members = readMemberEnrollments();
    const events = readEvents({ status: 'publie' });
    const media = readMediaMonitoringItems({ status: 'publie' });
    const brief = buildCandidateBrief(warRoomData, campaign, members, null, events, media);
    broadcast(WS_TOPICS.CANDIDATE_BRIEF, { type: 'candidate-brief-update', payload: brief, timestamp: new Date().toISOString() });
  } catch { /* non-blocking */ }
}
