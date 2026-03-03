import { useApi } from '../hooks/useApi.js';
import { teamsApi } from '../api/campaign.api.js';
import type { Team, User } from '../types/domain.js';

export default function Teams() {
  const { data: teamsData, loading: teamsLoading } = useApi(() => teamsApi.list(), []);
  const { data: usersData, loading: usersLoading } = useApi(() => teamsApi.users(), []);

  const teams: Team[] = teamsData?.teams ?? [];
  const users: User[] = usersData?.users ?? [];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Équipes & Utilisateurs</h1>
      </div>

      <div className="two-col">
        {/* Teams */}
        <section>
          <h2 className="section-title">Équipes ({teams.length})</h2>
          {teamsLoading ? <div className="loading">Chargement…</div> : (
            <div className="teams-list">
              {teams.map(t => (
                <div key={t.id} className="team-card">
                  <div className="team-name">{t.name}</div>
                  <div className="team-meta">{t.departmentId} · {t.members?.length ?? 0} membres</div>
                  {t.members && t.members.length > 0 && (
                    <div className="members-list">
                      {t.members.map((m, i) => (
                        <span key={i} className="member-chip">{m.name ?? m.username ?? m.userId}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {teams.length === 0 && <div className="empty-state">Aucune équipe.</div>}
            </div>
          )}
        </section>

        {/* Users */}
        <section>
          <h2 className="section-title">Utilisateurs ({users.length})</h2>
          {usersLoading ? <div className="loading">Chargement…</div> : (
            <div className="users-list">
              {users.map(u => (
                <div key={u.id} className="user-card">
                  <div className="user-avatar">{(u.name ?? u.username ?? '?')[0].toUpperCase()}</div>
                  <div className="user-info">
                    <div className="user-name">{u.name ?? u.username}</div>
                    <div className="user-role">{u.roleName ?? u.role}</div>
                    {u.scopeDepartmentName && <div className="user-scope">{u.scopeDepartmentName}</div>}
                  </div>
                  <div className="user-modules">
                    {(u.terrainModules ?? []).slice(0, 3).map(m => (
                      <span key={m} className="module-chip">{m}</span>
                    ))}
                  </div>
                </div>
              ))}
              {users.length === 0 && <div className="empty-state">Aucun utilisateur.</div>}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .page-content { padding: 24px; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
        .section-title { font-size: 15px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .loading, .empty-state { color: #9ca3af; padding: 20px; text-align: center; font-size: 13px; }
        .teams-list, .users-list { display: flex; flex-direction: column; gap: 10px; }
        .team-card { background: #1c2333; border-radius: 10px; padding: 14px; border: 1px solid #1f2937; }
        .team-name { font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
        .team-meta { color: #6b7280; font-size: 12px; margin-bottom: 8px; }
        .members-list { display: flex; flex-wrap: wrap; gap: 4px; }
        .member-chip { background: #1e3a5f; color: #93c5fd; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
        .user-card { background: #1c2333; border-radius: 10px; padding: 12px; border: 1px solid #1f2937; display: flex; align-items: center; gap: 12px; }
        .user-avatar { width: 38px; height: 38px; border-radius: 50%; background: #374151; color: #d1d5db; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
        .user-info { flex: 1; }
        .user-name { font-weight: 600; color: #f1f5f9; font-size: 14px; }
        .user-role { color: #6b7280; font-size: 12px; }
        .user-scope { color: #60a5fa; font-size: 11px; }
        .user-modules { display: flex; flex-direction: column; gap: 3px; }
        .module-chip { background: #1f2937; color: #9ca3af; padding: 1px 6px; border-radius: 4px; font-size: 10px; }
      `}</style>
    </div>
  );
}
