import type Database from 'better-sqlite3';
import type { ROLE_SEED } from '../constants/roles.js';

export function applySchema(db: Database.Database, roleSeed: typeof ROLE_SEED): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      home_path TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role_id TEXT NOT NULL,
      scope_department_id TEXT NOT NULL DEFAULT '',
      scope_department_name TEXT NOT NULL DEFAULT '',
      scope_arrondissement_name TEXT NOT NULL DEFAULT '',
      scope_zone_name TEXT NOT NULL DEFAULT '',
      candidate_visibility_json TEXT NOT NULL DEFAULT '{}',
      terrain_modules_json TEXT NOT NULL DEFAULT '[]',
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS campaign_records (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      region_id TEXT NOT NULL,
      region_name TEXT NOT NULL,
      zone TEXT NOT NULL,
      center_name TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      submitted_by TEXT NOT NULL,
      submitted_by_role TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS member_enrollments (
      id TEXT PRIMARY KEY,
      department_id TEXT NOT NULL,
      department_name TEXT NOT NULL,
      arrondissement_name TEXT NOT NULL,
      zone_name TEXT NOT NULL,
      locality_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      last_name TEXT NOT NULL DEFAULT '',
      first_names TEXT NOT NULL DEFAULT '',
      birth_date TEXT NOT NULL DEFAULT '',
      birth_place TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      gender TEXT NOT NULL,
      age_range TEXT NOT NULL,
      occupation TEXT NOT NULL,
      identity_document_number TEXT NOT NULL DEFAULT '',
      constituency_quarter TEXT NOT NULL DEFAULT '',
      address_line TEXT NOT NULL DEFAULT '',
      membership_type TEXT NOT NULL DEFAULT 'Membre actif',
      membership_type_other TEXT NOT NULL DEFAULT '',
      motivation TEXT NOT NULL DEFAULT '',
      skills TEXT NOT NULL DEFAULT '',
      declaration_name TEXT NOT NULL DEFAULT '',
      signed_at_place TEXT NOT NULL DEFAULT '',
      signed_at_date TEXT NOT NULL DEFAULT '',
      consent_given INTEGER NOT NULL,
      notes TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_review',
      publication_note TEXT NOT NULL DEFAULT '',
      published_by TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL DEFAULT '',
      submitted_by_username TEXT NOT NULL DEFAULT '',
      submitted_by TEXT NOT NULL,
      submitted_by_role TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL DEFAULT '',
      start_time TEXT NOT NULL DEFAULT '',
      end_time TEXT NOT NULL DEFAULT '',
      department_id TEXT NOT NULL,
      department_name TEXT NOT NULL,
      arrondissement_name TEXT NOT NULL DEFAULT '',
      zone_name TEXT NOT NULL DEFAULT '',
      locality_name TEXT NOT NULL DEFAULT '',
      gps_lat REAL,
      gps_lon REAL,
      participant_estimate INTEGER NOT NULL DEFAULT 0,
      impact_level TEXT NOT NULL,
      tone TEXT NOT NULL,
      marker_level TEXT NOT NULL DEFAULT 'blue',
      source_url TEXT NOT NULL DEFAULT '',
      source_type TEXT NOT NULL DEFAULT 'terrain',
      status TEXT NOT NULL DEFAULT 'en_attente',
      is_strategic INTEGER NOT NULL DEFAULT 0,
      publication_note TEXT NOT NULL DEFAULT '',
      created_by_username TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_by_role TEXT NOT NULL,
      validated_by TEXT NOT NULL DEFAULT '',
      validated_at TEXT NOT NULL DEFAULT '',
      published_by TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS event_media (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      media_type TEXT NOT NULL,
      file_path TEXT NOT NULL DEFAULT '',
      external_url TEXT NOT NULL DEFAULT '',
      caption TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
    CREATE TABLE IF NOT EXISTS event_validations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      level TEXT NOT NULL,
      decision TEXT NOT NULL,
      comment TEXT NOT NULL DEFAULT '',
      decided_by TEXT NOT NULL,
      decided_by_role TEXT NOT NULL,
      decided_at TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cell_type TEXT NOT NULL,
      department_id TEXT NOT NULL DEFAULT '',
      department_name TEXT NOT NULL DEFAULT '',
      arrondissement_name TEXT NOT NULL DEFAULT '',
      zone_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      team_role TEXT NOT NULL,
      assigned_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS media_monitoring (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      department_id TEXT NOT NULL,
      department_name TEXT NOT NULL,
      arrondissement_name TEXT NOT NULL DEFAULT '',
      zone_name TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL DEFAULT '',
      source_type TEXT NOT NULL DEFAULT 'presse',
      tone TEXT NOT NULL DEFAULT 'neutre',
      reach_estimate INTEGER NOT NULL DEFAULT 0,
      screenshot_path TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'en_attente',
      crisis_level TEXT NOT NULL DEFAULT 'niveau_1',
      publication_note TEXT NOT NULL DEFAULT '',
      created_by_username TEXT NOT NULL,
      created_by TEXT NOT NULL,
      validated_by TEXT NOT NULL DEFAULT '',
      validated_at TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const insertRole = db.prepare('INSERT OR IGNORE INTO roles (id, name, home_path) VALUES (?, ?, ?)');
  roleSeed.forEach(role => insertRole.run(role.id, role.name, role.homePath));
}
