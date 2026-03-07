import { db } from '../index.js';
import { nanoid } from 'nanoid';

export interface MemberEnrollment {
  id: string;
  departmentId: string; departmentName: string;
  arrondissementName: string; zoneName: string; localityName: string;
  fullName: string; lastName: string; firstNames: string;
  birthDate: string; birthPlace: string;
  phone: string; email: string;
  gender: string; ageRange: string; occupation: string;
  identityDocumentNumber: string; constituencyQuarter: string; addressLine: string;
  membershipType: string; membershipTypeOther: string;
  motivation: string; skills: string;
  declarationName: string; signedAtPlace: string; signedAtDate: string;
  consentGiven: boolean; notes: string;
  status: string; publicationNote: string;
  publishedBy: string; publishedAt: string;
  submittedByUsername: string; submittedBy: string; submittedByRole: string;
  submittedAt: string; updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): MemberEnrollment {
  return {
    id: row.id, departmentId: row.department_id, departmentName: row.department_name,
    arrondissementName: row.arrondissement_name, zoneName: row.zone_name, localityName: row.locality_name,
    fullName: row.full_name, lastName: row.last_name || '', firstNames: row.first_names || '',
    birthDate: row.birth_date || '', birthPlace: row.birth_place || '',
    phone: row.phone, email: row.email || '',
    gender: row.gender, ageRange: row.age_range, occupation: row.occupation,
    identityDocumentNumber: row.identity_document_number || '',
    constituencyQuarter: row.constituency_quarter || '', addressLine: row.address_line || '',
    membershipType: row.membership_type || 'Membre actif', membershipTypeOther: row.membership_type_other || '',
    motivation: row.motivation || '', skills: row.skills || '',
    declarationName: row.declaration_name || '', signedAtPlace: row.signed_at_place || '', signedAtDate: row.signed_at_date || '',
    consentGiven: Boolean(row.consent_given), notes: row.notes || '',
    status: row.status || 'pending_review', publicationNote: row.publication_note || '',
    publishedBy: row.published_by || '', publishedAt: row.published_at || '',
    submittedByUsername: row.submitted_by_username || '',
    submittedBy: row.submitted_by, submittedByRole: row.submitted_by_role,
    submittedAt: row.submitted_at, updatedAt: row.updated_at,
  };
}

export function readMemberEnrollments(filters?: { departmentId?: string; status?: string }): MemberEnrollment[] {
  let query = 'SELECT * FROM member_enrollments';
  const params: string[] = [];
  const conditions: string[] = [];
  if (filters?.departmentId) { conditions.push('department_id = ?'); params.push(filters.departmentId); }
  if (filters?.status) { conditions.push('status = ?'); params.push(filters.status); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY submitted_at DESC';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.prepare(query).all(...params) as any[]).map(mapRow);
}

export function insertMemberEnrollment(data: Partial<MemberEnrollment>): MemberEnrollment {
  const now = new Date().toISOString();
  const id = `MBR-${Date.now()}-${nanoid(6)}`;
  db.prepare(`
    INSERT INTO member_enrollments (
      id, department_id, department_name, arrondissement_name, zone_name, locality_name,
      full_name, last_name, first_names, birth_date, birth_place, phone, email, gender, age_range, occupation,
      identity_document_number, constituency_quarter, address_line, membership_type, membership_type_other,
      motivation, skills, declaration_name, signed_at_place, signed_at_date,
      consent_given, notes, status, submitted_by_username, submitted_by, submitted_by_role, submitted_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, data.departmentId || '', data.departmentName || '',
    data.arrondissementName || '', data.zoneName || '', data.localityName || '',
    data.fullName || '', data.lastName || '', data.firstNames || '',
    data.birthDate || '', data.birthPlace || '', data.phone || '', data.email || '',
    data.gender || '', data.ageRange || '', data.occupation || '',
    data.identityDocumentNumber || '', data.constituencyQuarter || '', data.addressLine || '',
    data.membershipType || 'Membre actif', data.membershipTypeOther || '',
    data.motivation || '', data.skills || '',
    data.declarationName || '', data.signedAtPlace || '', data.signedAtDate || '',
    data.consentGiven ? 1 : 0, data.notes || '', 'pending_review',
    data.submittedByUsername || '', data.submittedBy || '', data.submittedByRole || '', now, now,
  );
  return readMemberEnrollments()[0];
}

export function validateZoneMemberEnrollment(id: string, validatedBy: string): MemberEnrollment | null {
  const now = new Date().toISOString();
  db.prepare(`UPDATE member_enrollments SET status = 'zone_validated', published_by = ?, updated_at = ? WHERE id = ? AND status = 'pending_review'`)
    .run(validatedBy, now, id);
  const rows = db.prepare('SELECT * FROM member_enrollments WHERE id = ?').all(id) as unknown[];
  return rows.length ? mapRow(rows[0]) : null;
}

export function rejectMemberEnrollment(id: string, rejectedBy: string, note: string): MemberEnrollment | null {
  const now = new Date().toISOString();
  db.prepare(`UPDATE member_enrollments SET status = 'rejected', publication_note = ?, published_by = ?, updated_at = ? WHERE id = ?`)
    .run(note, rejectedBy, now, id);
  const rows = db.prepare('SELECT * FROM member_enrollments WHERE id = ?').all(id) as unknown[];
  return rows.length ? mapRow(rows[0]) : null;
}

export function publishMemberEnrollment(id: string, note: string, publishedBy: string): MemberEnrollment | null {
  const now = new Date().toISOString();
  db.prepare(`UPDATE member_enrollments SET status = 'actif', publication_note = ?, published_by = ?, published_at = ?, updated_at = ? WHERE id = ? AND status = 'zone_validated'`)
    .run(note, publishedBy, now, now, id);
  const rows = db.prepare('SELECT * FROM member_enrollments WHERE id = ?').all(id) as unknown[];
  return rows.length ? mapRow(rows[0]) : null;
}
