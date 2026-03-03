import { db } from '../index.js';
import { nanoid } from 'nanoid';

export interface EventMedia {
  id: string; eventId: string; mediaType: string;
  filePath: string; externalUrl: string; caption: string;
  createdBy: string; createdAt: string;
}

export interface EventValidation {
  id: string; eventId: string; level: string; decision: string;
  comment: string; decidedBy: string; decidedByRole: string; decidedAt: string;
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
  media: EventMedia[];
  validations: EventValidation[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEventRow(row: any): EventItem {
  return {
    id: row.id, title: row.title, description: row.description || '',
    eventType: row.event_type, eventDate: row.event_date || '',
    startTime: row.start_time || '', endTime: row.end_time || '',
    departmentId: row.department_id, departmentName: row.department_name,
    arrondissementName: row.arrondissement_name || '', zoneName: row.zone_name || '',
    localityName: row.locality_name || '',
    gpsLat: row.gps_lat ?? null, gpsLon: row.gps_lon ?? null,
    participantEstimate: Number(row.participant_estimate || 0),
    impactLevel: row.impact_level || 'local', tone: row.tone || 'neutre',
    markerLevel: row.marker_level || 'blue', sourceUrl: row.source_url || '',
    sourceType: row.source_type || 'terrain', status: row.status || 'en_attente',
    isStrategic: Boolean(row.is_strategic), publicationNote: row.publication_note || '',
    createdByUsername: row.created_by_username || '', createdBy: row.created_by,
    createdByRole: row.created_by_role, validatedBy: row.validated_by || '',
    validatedAt: row.validated_at || '', publishedBy: row.published_by || '',
    publishedAt: row.published_at || '', createdAt: row.created_at, updatedAt: row.updated_at,
    media: [], validations: [],
  };
}

function loadMedia(eventId: string): EventMedia[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.prepare('SELECT * FROM event_media WHERE event_id = ? ORDER BY created_at ASC').all(eventId) as any[]).map(r => ({
    id: r.id, eventId: r.event_id, mediaType: r.media_type,
    filePath: r.file_path || '', externalUrl: r.external_url || '',
    caption: r.caption || '', createdBy: r.created_by, createdAt: r.created_at,
  }));
}

function loadValidations(eventId: string): EventValidation[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.prepare('SELECT * FROM event_validations WHERE event_id = ? ORDER BY decided_at ASC').all(eventId) as any[]).map(r => ({
    id: r.id, eventId: r.event_id, level: r.level, decision: r.decision,
    comment: r.comment || '', decidedBy: r.decided_by,
    decidedByRole: r.decided_by_role, decidedAt: r.decided_at,
  }));
}

export function readEvents(filters?: { departmentId?: string; status?: string }): EventItem[] {
  let query = 'SELECT * FROM events';
  const params: string[] = [];
  const conditions: string[] = [];
  if (filters?.departmentId) { conditions.push('department_id = ?'); params.push(filters.departmentId); }
  if (filters?.status) { conditions.push('status = ?'); params.push(filters.status); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY created_at DESC';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(r => ({ ...mapEventRow(r), media: loadMedia(r.id), validations: loadValidations(r.id) }));
}

export function findEventById(id: string): EventItem | null {
  const row = db.prepare('SELECT * FROM events WHERE id = ? LIMIT 1').get(id);
  if (!row) return null;
  const ev = mapEventRow(row);
  return { ...ev, media: loadMedia(id), validations: loadValidations(id) };
}

export function insertEvent(data: Partial<EventItem>): EventItem {
  const now = new Date().toISOString();
  const id = `EVT-${Date.now()}-${nanoid(6)}`;
  db.prepare(`
    INSERT INTO events (
      id, title, description, event_type, event_date, start_time, end_time,
      department_id, department_name, arrondissement_name, zone_name, locality_name,
      gps_lat, gps_lon, participant_estimate, impact_level, tone, marker_level,
      source_url, source_type, status, is_strategic, created_by_username, created_by, created_by_role,
      created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, data.title || '', data.description || '', data.eventType || '',
    data.eventDate || '', data.startTime || '', data.endTime || '',
    data.departmentId || '', data.departmentName || '',
    data.arrondissementName || '', data.zoneName || '', data.localityName || '',
    data.gpsLat ?? null, data.gpsLon ?? null,
    data.participantEstimate || 0, data.impactLevel || 'local',
    data.tone || 'neutre', data.markerLevel || 'blue',
    data.sourceUrl || '', data.sourceType || 'terrain',
    'en_attente', data.isStrategic ? 1 : 0,
    data.createdByUsername || '', data.createdBy || '', data.createdByRole || '',
    now, now,
  );
  return findEventById(id)!;
}

export function addEventMedia(eventId: string, media: Omit<EventMedia, 'id' | 'eventId' | 'createdAt'>): void {
  const now = new Date().toISOString();
  const id = `EMEDIA-${Date.now()}-${nanoid(6)}`;
  db.prepare(`INSERT INTO event_media (id, event_id, media_type, file_path, external_url, caption, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)`)
    .run(id, eventId, media.mediaType, media.filePath || '', media.externalUrl || '', media.caption || '', media.createdBy, now);
}

export function addEventValidation(eventId: string, level: string, decision: string, comment: string, decidedBy: string, decidedByRole: string): void {
  const now = new Date().toISOString();
  const id = `EVAL-${Date.now()}-${nanoid(6)}`;
  db.prepare(`INSERT INTO event_validations (id, event_id, level, decision, comment, decided_by, decided_by_role, decided_at) VALUES (?,?,?,?,?,?,?,?)`)
    .run(id, eventId, level, decision, comment || '', decidedBy, decidedByRole, now);
  const statusMap: Record<string, string> = { zone: 'valide_zone', war_room: 'valide_war_room' };
  const nextStatus = decision === 'rejete' ? 'rejete' : (statusMap[level] || 'en_attente');
  db.prepare('UPDATE events SET status = ?, validated_by = ?, validated_at = ?, updated_at = ? WHERE id = ?')
    .run(nextStatus, decidedBy, now, now, eventId);
}

export function publishEvent(eventId: string, note: string, publishedBy: string): EventItem | null {
  const now = new Date().toISOString();
  db.prepare(`UPDATE events SET status = 'publie', publication_note = ?, published_by = ?, published_at = ?, updated_at = ? WHERE id = ?`)
    .run(note, publishedBy, now, now, eventId);
  return findEventById(eventId);
}
