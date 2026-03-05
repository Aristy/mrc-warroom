import crypto from 'crypto';
import { db } from '../index.js';
import type { Role, TerrainModuleId } from '../../constants/roles.js';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: Role;
  roleName: string;
  homePath: string;
  scopeDepartmentId: string;
  scopeDepartmentName: string;
  scopeArrondissementName: string;
  scopeZoneName: string;
  candidateVisibility: Record<string, boolean>;
  terrainModules: TerrainModuleId[];
  passwordSalt?: string;
  passwordHash?: string;
}

interface UserRow {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role_id: string;
  scope_department_id: string;
  scope_department_name: string;
  scope_arrondissement_name: string;
  scope_zone_name: string;
  candidate_visibility_json: string;
  terrain_modules_json: string;
  password_salt: string;
  password_hash: string;
  role_name: string;
  home_path: string;
}

function defaultTerrainModulesForRole(role: string): TerrainModuleId[] {
  if (role === 'field_agent') return ['campaign', 'sondage', 'incident'];
  if (role === 'zone_leader') return ['campaign', 'sondage', 'incident', 'events', 'mission'];
  if (role === 'regional_coordinator') return ['campaign', 'sondage', 'incident', 'events', 'mission', 'digital', 'logistique'];
  if (role === 'war_room') return ['campaign', 'sondage', 'incident', 'events', 'mission', 'digital', 'logistique', 'adherent'];
  return [];
}

function mapRow(row: UserRow): User {
  let candidateVisibility: Record<string, boolean> = {};
  let terrainModules: TerrainModuleId[] = [];
  try { candidateVisibility = JSON.parse(row.candidate_visibility_json || '{}'); } catch { /* empty */ }
  try { terrainModules = JSON.parse(row.terrain_modules_json || '[]'); } catch { /* empty */ }
  if (!terrainModules.length) terrainModules = defaultTerrainModulesForRole(row.role_id);
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    name: row.display_name,
    role: row.role_id as Role,
    roleName: row.role_name,
    homePath: row.home_path,
    scopeDepartmentId: row.scope_department_id || '',
    scopeDepartmentName: row.scope_department_name || '',
    scopeArrondissementName: row.scope_arrondissement_name || '',
    scopeZoneName: row.scope_zone_name || '',
    candidateVisibility,
    terrainModules,
    passwordSalt: row.password_salt,
    passwordHash: row.password_hash,
  };
}

const SELECT_USER = `
  SELECT u.id, u.username, u.email, u.display_name, u.role_id,
    u.scope_department_id, u.scope_department_name, u.scope_arrondissement_name, u.scope_zone_name,
    u.candidate_visibility_json, u.terrain_modules_json, u.password_salt, u.password_hash,
    r.name AS role_name, r.home_path
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
`;

export function findUserByLogin(login: string): User | null {
  const normalized = login.trim().toLowerCase();
  const row = db.prepare(`${SELECT_USER} WHERE lower(u.username) = ? OR lower(u.email) = ? LIMIT 1`).get(normalized, normalized) as UserRow | undefined;
  return row ? mapRow(row) : null;
}

export function findUserById(id: string): User | null {
  const row = db.prepare(`${SELECT_USER} WHERE u.id = ? LIMIT 1`).get(id) as UserRow | undefined;
  return row ? mapRow(row) : null;
}

export function readUsers(): User[] {
  const rows = db.prepare(`${SELECT_USER} ORDER BY u.username ASC`).all() as UserRow[];
  return rows.map(mapRow);
}

export function updateTerrainModules(userId: string, modules: string[]): void {
  db.prepare(`UPDATE users SET terrain_modules_json = ?, updated_at = ? WHERE id = ?`)
    .run(JSON.stringify(modules), new Date().toISOString(), userId);
}

export interface CreateUserData {
  username: string;
  email: string;
  name: string;
  role: Role;
  passwordSalt: string;
  passwordHash: string;
  scopeDepartmentId?: string;
  scopeDepartmentName?: string;
  scopeArrondissementName?: string;
  scopeZoneName?: string;
  candidateVisibility?: Record<string, boolean>;
  terrainModules?: TerrainModuleId[];
}

export function createUser(data: CreateUserData): User {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const candidateVisibility = JSON.stringify(data.candidateVisibility ?? {});
  const terrainModules = JSON.stringify(data.terrainModules ?? defaultTerrainModulesForRole(data.role));
  db.prepare(`
    INSERT INTO users (id, username, email, display_name, role_id, scope_department_id, scope_department_name,
      scope_arrondissement_name, scope_zone_name, candidate_visibility_json, terrain_modules_json,
      password_salt, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.username.trim().toLowerCase(), data.email.trim().toLowerCase(), data.name,
    data.role,
    data.scopeDepartmentId ?? '', data.scopeDepartmentName ?? '',
    data.scopeArrondissementName ?? '', data.scopeZoneName ?? '',
    candidateVisibility, terrainModules,
    data.passwordSalt, data.passwordHash,
    now, now
  );
  return findUserById(id)!;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: Role;
  scopeDepartmentId?: string;
  scopeDepartmentName?: string;
  scopeArrondissementName?: string;
  scopeZoneName?: string;
  candidateVisibility?: Record<string, boolean>;
  terrainModules?: TerrainModuleId[];
  passwordSalt?: string;
  passwordHash?: string;
}

export function updateUser(id: string, data: UpdateUserData): User | null {
  const existing = findUserById(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const sets: string[] = [];
  const vals: unknown[] = [];

  if (data.name !== undefined) { sets.push('display_name = ?'); vals.push(data.name); }
  if (data.email !== undefined) { sets.push('email = ?'); vals.push(data.email.trim().toLowerCase()); }
  if (data.role !== undefined) { sets.push('role_id = ?'); vals.push(data.role); }
  if (data.scopeDepartmentId !== undefined) { sets.push('scope_department_id = ?'); vals.push(data.scopeDepartmentId); }
  if (data.scopeDepartmentName !== undefined) { sets.push('scope_department_name = ?'); vals.push(data.scopeDepartmentName); }
  if (data.scopeArrondissementName !== undefined) { sets.push('scope_arrondissement_name = ?'); vals.push(data.scopeArrondissementName); }
  if (data.scopeZoneName !== undefined) { sets.push('scope_zone_name = ?'); vals.push(data.scopeZoneName); }
  if (data.candidateVisibility !== undefined) { sets.push('candidate_visibility_json = ?'); vals.push(JSON.stringify(data.candidateVisibility)); }
  if (data.terrainModules !== undefined) { sets.push('terrain_modules_json = ?'); vals.push(JSON.stringify(data.terrainModules)); }
  if (data.passwordSalt !== undefined) { sets.push('password_salt = ?'); vals.push(data.passwordSalt); }
  if (data.passwordHash !== undefined) { sets.push('password_hash = ?'); vals.push(data.passwordHash); }

  if (sets.length === 0) return existing;
  sets.push('updated_at = ?');
  vals.push(now);
  vals.push(id);
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return findUserById(id);
}

export function deleteUser(id: string): boolean {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return result.changes > 0;
}

export function sanitizeUser(user: User): Omit<User, 'passwordSalt' | 'passwordHash'> {
  const { passwordSalt: _s, passwordHash: _h, ...safe } = user;
  return safe;
}
