import type Database from 'better-sqlite3';
import fs from 'fs';

interface SeedUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  scopeDepartmentId?: string;
  scopeDepartmentName?: string;
  scopeArrondissementName?: string;
  scopeZoneName?: string;
  candidateVisibility?: Record<string, boolean>;
  terrainModules?: string[];
  passwordSalt: string;
  passwordHash: string;
}

export function seedUsers(db: Database.Database, usersFile: string): void {
  let users: SeedUser[] = [];
  try {
    const raw = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    users = raw.users || [];
  } catch {
    return;
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, username, email, display_name, role_id,
      scope_department_id, scope_department_name, scope_arrondissement_name, scope_zone_name,
      candidate_visibility_json, terrain_modules_json,
      password_salt, password_hash, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const update = db.prepare(`
    UPDATE users SET
      username = ?, email = ?, display_name = ?, role_id = ?,
      scope_department_id = ?, scope_department_name = ?,
      scope_arrondissement_name = ?, scope_zone_name = ?,
      candidate_visibility_json = ?, terrain_modules_json = ?,
      password_salt = ?, password_hash = ?, updated_at = ?
    WHERE id = ?
  `);

  const now = new Date().toISOString();
  for (const u of users) {
    const args = [
      u.id, u.username, u.email, u.name, u.role,
      u.scopeDepartmentId || '', u.scopeDepartmentName || '',
      u.scopeArrondissementName || '', u.scopeZoneName || '',
      JSON.stringify(u.candidateVisibility || {}),
      JSON.stringify(u.terrainModules || []),
      u.passwordSalt, u.passwordHash, now, now,
    ] as const;
    insert.run(...args);
    update.run(
      u.username, u.email, u.name, u.role,
      u.scopeDepartmentId || '', u.scopeDepartmentName || '',
      u.scopeArrondissementName || '', u.scopeZoneName || '',
      JSON.stringify(u.candidateVisibility || {}),
      JSON.stringify(u.terrainModules || []),
      u.passwordSalt, u.passwordHash, now, u.id,
    );
  }
}
