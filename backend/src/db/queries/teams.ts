import { db } from '../index.js';

export interface TeamMember {
  id: string; teamId: string; userId: string;
  username: string; email: string; name: string;
  role: string; teamRole: string; assignedAt: string;
}

export interface Team {
  id: string; name: string; cellType: string;
  departmentId: string; departmentName: string;
  arrondissementName: string; zoneName: string;
  status: string; notes: string;
  createdBy: string; createdAt: string; updatedAt: string;
  members: TeamMember[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTeamRow(row: any): Omit<Team, 'members'> {
  return {
    id: row.id, name: row.name, cellType: row.cell_type,
    departmentId: row.department_id || '', departmentName: row.department_name || '',
    arrondissementName: row.arrondissement_name || '', zoneName: row.zone_name || '',
    status: row.status || 'active', notes: row.notes || '',
    createdBy: row.created_by, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function loadMembers(teamId: string): TeamMember[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db.prepare(`
    SELECT tm.id, tm.team_id, tm.user_id, tm.team_role, tm.assigned_at,
      u.username, u.email, u.display_name, u.role_id
    FROM team_members tm
    INNER JOIN users u ON u.id = tm.user_id
    WHERE tm.team_id = ? ORDER BY tm.assigned_at ASC
  `).all(teamId) as any[]).map(r => ({
    id: r.id, teamId: r.team_id, userId: r.user_id,
    username: r.username, email: r.email, name: r.display_name,
    role: r.role_id, teamRole: r.team_role, assignedAt: r.assigned_at,
  }));
}

export function readTeams(): Team[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = db.prepare('SELECT * FROM teams ORDER BY created_at DESC').all() as any[];
  return rows.map(r => ({ ...mapTeamRow(r), members: loadMembers(r.id) }));
}

export function upsertTeam(item: Omit<Team, 'members'> & { members: { userId: string; teamRole: string }[] }, existingId?: string): Team {
  const now = new Date().toISOString();
  if (existingId) {
    db.prepare(`UPDATE teams SET name=?, cell_type=?, department_id=?, department_name=?, arrondissement_name=?, zone_name=?, status=?, notes=?, updated_at=? WHERE id=?`)
      .run(item.name, item.cellType, item.departmentId, item.departmentName, item.arrondissementName, item.zoneName, item.status, item.notes, now, existingId);
    db.prepare('DELETE FROM team_members WHERE team_id = ?').run(existingId);
  } else {
    db.prepare(`INSERT INTO teams (id, name, cell_type, department_id, department_name, arrondissement_name, zone_name, status, notes, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(item.id, item.name, item.cellType, item.departmentId, item.departmentName, item.arrondissementName, item.zoneName, item.status, item.notes, item.createdBy, now, now);
  }
  const teamId = existingId || item.id;
  item.members.forEach((m, i) => {
    db.prepare('INSERT INTO team_members (id, team_id, user_id, team_role, assigned_at) VALUES (?,?,?,?,?)')
      .run(`${teamId}-MEM-${i + 1}-${Date.now()}`, teamId, m.userId, m.teamRole, now);
  });
  const row = db.prepare('SELECT * FROM teams WHERE id = ? LIMIT 1').get(teamId) as unknown;
  return { ...mapTeamRow(row), members: loadMembers(teamId) };
}
