import type Database from 'better-sqlite3';

function addColumnIfMissing(db: Database.Database, table: string, column: string, definition: string): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.find(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function applyMigrations(db: Database.Database): void {
  // users extras
  addColumnIfMissing(db, 'users', 'scope_department_id', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'users', 'scope_department_name', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'users', 'scope_arrondissement_name', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'users', 'scope_zone_name', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'users', 'candidate_visibility_json', "TEXT NOT NULL DEFAULT '{}'");
  addColumnIfMissing(db, 'users', 'terrain_modules_json', "TEXT NOT NULL DEFAULT '[]'");

  // member_enrollments extras
  addColumnIfMissing(db, 'member_enrollments', 'last_name', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'first_names', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'birth_date', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'birth_place', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'email', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'identity_document_number', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'constituency_quarter', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'address_line', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'membership_type', "TEXT NOT NULL DEFAULT 'Membre actif'");
  addColumnIfMissing(db, 'member_enrollments', 'membership_type_other', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'motivation', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'skills', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'declaration_name', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'signed_at_place', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'signed_at_date', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'status', "TEXT NOT NULL DEFAULT 'pending_review'");
  addColumnIfMissing(db, 'member_enrollments', 'publication_note', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'published_by', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'published_at', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'member_enrollments', 'submitted_by_username', "TEXT NOT NULL DEFAULT ''");

  // events extras
  addColumnIfMissing(db, 'events', 'description', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'event_date', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'start_time', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'end_time', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'arrondissement_name', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'zone_name', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'locality_name', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'gps_lat', 'REAL');
  addColumnIfMissing(db, 'events', 'gps_lon', 'REAL');
  addColumnIfMissing(db, 'events', 'participant_estimate', 'INTEGER NOT NULL DEFAULT 0');
  addColumnIfMissing(db, 'events', 'marker_level', "TEXT NOT NULL DEFAULT 'blue'");
  addColumnIfMissing(db, 'events', 'source_url', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'source_type', "TEXT NOT NULL DEFAULT 'terrain'");
  addColumnIfMissing(db, 'events', 'status', "TEXT NOT NULL DEFAULT 'en_attente'");
  addColumnIfMissing(db, 'events', 'is_strategic', 'INTEGER NOT NULL DEFAULT 0');
  addColumnIfMissing(db, 'events', 'publication_note', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'created_by_username', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'validated_by', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'validated_at', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'published_by', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, 'events', 'published_at', "TEXT NOT NULL DEFAULT ''");
}
