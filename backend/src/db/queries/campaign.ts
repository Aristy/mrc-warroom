import { db } from '../index.js';
import { nanoid } from 'nanoid';
import type { CampaignCategory } from '../../constants/roles.js';

export interface CampaignRecord {
  id: string;
  category: CampaignCategory;
  regionId: string;
  regionName: string;
  zone: string;
  centerName: string;
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  priority: string;
  status: string;
  submittedBy: string;
  submittedByRole: string;
  submittedAt: string;
  updatedAt: string;
}

interface CampaignRow {
  id: string; category: string; region_id: string; region_name: string;
  zone: string; center_name: string; title: string; summary: string;
  payload_json: string; priority: string; status: string;
  submitted_by: string; submitted_by_role: string; submitted_at: string; updated_at: string;
}

function mapRow(row: CampaignRow): CampaignRecord {
  let payload: Record<string, unknown> = {};
  try { payload = JSON.parse(row.payload_json || '{}'); } catch { /* empty */ }
  return {
    id: row.id, category: row.category as CampaignCategory,
    regionId: row.region_id, regionName: row.region_name,
    zone: row.zone, centerName: row.center_name,
    title: row.title, summary: row.summary, payload,
    priority: row.priority, status: row.status,
    submittedBy: row.submitted_by, submittedByRole: row.submitted_by_role,
    submittedAt: row.submitted_at, updatedAt: row.updated_at,
  };
}

export function readCampaignRecords(filters?: { regionId?: string; category?: string }): CampaignRecord[] {
  let query = 'SELECT * FROM campaign_records';
  const params: string[] = [];
  const conditions: string[] = [];
  if (filters?.regionId) { conditions.push('region_id = ?'); params.push(filters.regionId); }
  if (filters?.category) { conditions.push('category = ?'); params.push(filters.category); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY submitted_at DESC';
  return (db.prepare(query).all(...params) as CampaignRow[]).map(mapRow);
}

export function insertCampaignRecord(data: Omit<CampaignRecord, 'id' | 'submittedAt' | 'updatedAt'>): CampaignRecord {
  const now = new Date().toISOString();
  const id = `CR-${Date.now()}-${nanoid(6)}`;
  db.prepare(`
    INSERT INTO campaign_records (id, category, region_id, region_name, zone, center_name, title, summary, payload_json, priority, status, submitted_by, submitted_by_role, submitted_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.category, data.regionId, data.regionName, data.zone, data.centerName,
    data.title, data.summary, JSON.stringify(data.payload || {}),
    data.priority || 'medium', data.status || 'submitted',
    data.submittedBy, data.submittedByRole, now, now);
  return readCampaignRecords()[0];
}
