import { db } from '../index.js';
import { nanoid } from 'nanoid';

export interface MediaItem {
  id: string; title: string; summary: string;
  departmentId: string; departmentName: string;
  arrondissementName: string; zoneName: string;
  sourceUrl: string; sourceType: string;
  tone: string; reachEstimate: number;
  screenshotPath: string; status: string; crisisLevel: string;
  publicationNote: string; createdByUsername: string; createdBy: string;
  validatedBy: string; validatedAt: string; publishedAt: string;
  createdAt: string; updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): MediaItem {
  return {
    id: row.id, title: row.title, summary: row.summary || '',
    departmentId: row.department_id, departmentName: row.department_name,
    arrondissementName: row.arrondissement_name || '', zoneName: row.zone_name || '',
    sourceUrl: row.source_url || '', sourceType: row.source_type || 'presse',
    tone: row.tone || 'neutre', reachEstimate: Number(row.reach_estimate || 0),
    screenshotPath: row.screenshot_path || '', status: row.status || 'en_attente',
    crisisLevel: row.crisis_level || 'niveau_1', publicationNote: row.publication_note || '',
    createdByUsername: row.created_by_username || '', createdBy: row.created_by,
    validatedBy: row.validated_by || '', validatedAt: row.validated_at || '',
    publishedAt: row.published_at || '', createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function readMediaMonitoringItems(filters?: { departmentId?: string; status?: string }): MediaItem[] {
  let query = 'SELECT * FROM media_monitoring';
  const params: string[] = [];
  const conditions: string[] = [];
  if (filters?.departmentId) { conditions.push('department_id = ?'); params.push(filters.departmentId); }
  if (filters?.status) { conditions.push('status = ?'); params.push(filters.status); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY created_at DESC';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.prepare(query).all(...params) as any[]).map(mapRow);
}

export function findMediaById(id: string): MediaItem | null {
  const row = db.prepare('SELECT * FROM media_monitoring WHERE id = ? LIMIT 1').get(id);
  return row ? mapRow(row) : null;
}

export function insertMediaItem(data: Partial<MediaItem>): MediaItem {
  const now = new Date().toISOString();
  const id = `MM-${Date.now()}-${nanoid(6)}`;
  db.prepare(`
    INSERT INTO media_monitoring (
      id, title, summary, department_id, department_name, arrondissement_name, zone_name,
      source_url, source_type, tone, reach_estimate, screenshot_path,
      status, crisis_level, created_by_username, created_by, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, data.title || '', data.summary || '',
    data.departmentId || '', data.departmentName || '',
    data.arrondissementName || '', data.zoneName || '',
    data.sourceUrl || '', data.sourceType || 'presse',
    data.tone || 'neutre', data.reachEstimate || 0,
    data.screenshotPath || '', 'en_attente', data.crisisLevel || 'niveau_1',
    data.createdByUsername || '', data.createdBy || '', now, now,
  );
  return findMediaById(id)!;
}

export function validateMediaItem(id: string, validatedBy: string): MediaItem | null {
  const now = new Date().toISOString();
  db.prepare(`UPDATE media_monitoring SET status = 'valide', validated_by = ?, validated_at = ?, updated_at = ? WHERE id = ?`)
    .run(validatedBy, now, now, id);
  return findMediaById(id);
}

export function publishMediaItem(id: string, note: string, publishedBy: string): MediaItem | null {
  const now = new Date().toISOString();
  db.prepare(`UPDATE media_monitoring SET status = 'publie', publication_note = ?, published_at = ?, updated_at = ? WHERE id = ?`)
    .run(note, now, now, id);
  void publishedBy;
  return findMediaById(id);
}

export function updateMediaScreenshot(id: string, screenshotPath: string): void {
  db.prepare('UPDATE media_monitoring SET screenshot_path = ?, updated_at = ? WHERE id = ?')
    .run(screenshotPath, new Date().toISOString(), id);
}
