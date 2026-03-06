import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { systemApi } from '../api/dashboard.api.js';
import { usersApi, type UserCreatePayload } from '../api/users.api.js';
import { useTheme } from '../context/ThemeContext.js';
import type { User } from '../types/domain.js';

type Tab = 'general' | 'candidates' | 'users' | 'appearance' | 'danger';

const ROLE_LABELS: Record<string, string> = {
  war_room: 'War Room', regional_coordinator: 'Coordinateur', zone_leader: 'Chef de Zone',
  field_agent: 'Agent Terrain', membership_data_entry: 'Saisie Adhésion',
  candidate: 'Candidat', direction: 'Direction',
};
const ROLE_COLORS: Record<string, string> = {
  war_room: '#dc2626', regional_coordinator: '#d97706', zone_leader: '#2563eb',
  field_agent: '#16a34a', membership_data_entry: '#7c3aed', candidate: '#9a1f1f', direction: '#0891b2',
};

const VIS_KEYS: Array<{ key: keyof User['candidateVisibility']; label: string }> = [
  { key: 'showAdhesion', label: 'Adhésion' },
  { key: 'showPolling', label: 'Sondages' },
  { key: 'showIncidents', label: 'Incidents' },
  { key: 'showEvents', label: 'Événements' },
  { key: 'showMedia', label: 'Médias' },
  { key: 'showDigital', label: 'Digital' },
  { key: 'showTerrain', label: 'Terrain' },
];

const DEFAULT_VIS: User['candidateVisibility'] = {
  showAdhesion: true, showPolling: true, showIncidents: true,
  showEvents: true, showMedia: true, showDigital: true, showTerrain: true,
};

export default function SystemAdmin() {
  const [tab, setTab] = useState<Tab>('general');
  const { theme, fontSize, setFontSize, toggleTheme } = useTheme();

  return (
    <div style={{ padding: '24px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #f1f5f9)', margin: '0 0 16px' }}>
          Administration système
        </h1>
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border, #2a2d3a)', paddingBottom: 0 }}>
          {(['general', 'candidates', 'users', 'appearance', 'danger'] as Tab[]).map(t => {
            const labels: Record<Tab, string> = { general: 'Général', candidates: 'Candidats', users: 'Utilisateurs', appearance: 'Apparence', danger: 'Danger' };
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                borderBottom: tab === t ? '2px solid #9a1f1f' : '2px solid transparent',
                background: 'transparent',
                color: tab === t ? '#9a1f1f' : 'var(--text-muted, #8b8fa8)',
                marginBottom: -1,
              }}>
                {labels[t]}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'general' && <TabGeneral />}
      {tab === 'candidates' && <TabCandidates />}
      {tab === 'users' && <TabUsers />}
      {tab === 'appearance' && <TabAppearance theme={theme} fontSize={fontSize} setFontSize={setFontSize} toggleTheme={toggleTheme} />}
      {tab === 'danger' && <TabDanger />}

      <style>{`
        .sa-card { background: var(--surface2, #1c2333); border-radius: 12px; border: 1px solid var(--border, #1f2937); padding: 20px; margin-bottom: 20px; }
        .sa-label { font-size: 11px; font-weight: 700; color: var(--text-muted, #6b7280); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .sa-input { background: var(--bg, #0f1117); border: 1px solid var(--border, #374151); border-radius: 8px; padding: 9px 12px; color: var(--text, #f1f5f9); font-size: 13px; width: 100%; box-sizing: border-box; }
        .sa-btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 13px; }
        .sa-btn-primary { background: #2563eb; color: #fff; }
        .sa-btn-danger { background: #7f1d1d; color: #fca5a5; }
        .sa-btn-confirm { background: #dc2626; color: #fff; }
        .sa-btn-ghost { background: transparent; border: 1px solid var(--border, #374151); color: var(--text-muted, #9ca3af); cursor: pointer; padding: 5px 10px; border-radius: 6px; font-size: 12px; }
        .sa-table { width: 100%; border-collapse: collapse; }
        .sa-table th { text-align: left; color: var(--text-muted, #6b7280); font-size: 11px; text-transform: uppercase; padding: 8px 12px; border-bottom: 1px solid var(--border, #2a2d3a); }
        .sa-table td { padding: 10px 12px; border-bottom: 1px solid var(--border, #1f2937); color: var(--text, #e8eaf0); font-size: 13px; }
        .sa-table tr:last-child td { border-bottom: none; }
        .role-pill { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
        .vis-chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 10px; font-size: 11px; border: 1px solid; cursor: pointer; user-select: none; }
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
        .overview-card { background: var(--surface2, #1c2333); border-radius: 10px; padding: 12px; border: 1px solid var(--border, #1f2937); }
        .overview-label { color: var(--text-muted, #6b7280); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .overview-value { font-size: 20px; font-weight: 700; color: var(--text, #f1f5f9); }
        .form-modal { background: var(--surface2, #1c2333); border: 1px solid #9a1f1f44; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .form-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .form-row label { width: 140px; color: var(--text-muted, #9ca3af); font-size: 12px; flex-shrink: 0; }
        .theme-option { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border, #374151); cursor: pointer; margin-bottom: 8px; }
        .theme-option.active { border-color: #9a1f1f; background: #9a1f1f14; }
      `}</style>
    </div>
  );
}

// ─── TAB: GÉNÉRAL ────────────────────────────────────────────────────────────
function TabGeneral() {
  const { data: overview, loading: overviewLoading } = useApi(() => systemApi.overview(), []);
  const { data: settings, loading: settingsLoading, refresh } = useApi(() => systemApi.settings(), []);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const updated: Record<string, unknown> = {};
      fd.forEach((val, key) => { updated[key] = val; });
      await systemApi.updateSettings(updated);
      refresh();
    } finally { setSaving(false); }
  };

  const FIELD_LABELS: Record<string, string> = {
    platformName: 'Nom de la plateforme', candidateName: 'Nom du candidat',
    mobileAppName: 'App mobile', mobileDefaultBackendUrl: 'URL backend mobile',
    operationalMessage: 'Message opérationnel', environmentMode: 'Mode environnement',
    candidateDashboardPath: 'Chemin tableau candidat',
  };

  return (
    <>
      {!overviewLoading && overview && (
        <div className="sa-card">
          <div className="sa-label">Vue d'ensemble</div>
          <div className="overview-grid">
            {overview && Object.entries(
              (overview as { modules?: Record<string, unknown>; dashboards?: Record<string, unknown> })?.modules || {}
            ).map(([k, v]) => (
              <div key={k} className="overview-card">
                <div className="overview-label">{k}</div>
                <div className="overview-value">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!settingsLoading && settings && (
        <div className="sa-card">
          <div className="sa-label">Paramètres de la plateforme</div>
          <form onSubmit={handleSave}>
            {Object.entries(settings as unknown as Record<string, unknown>)
              .filter(([k]) => k !== 'updatedAt')
              .map(([key, val]) => (
                <div key={key} className="form-row">
                  <label>{FIELD_LABELS[key] || key}</label>
                  <input className="sa-input" name={key} defaultValue={String(val)} />
                </div>
              ))}
            <div style={{ marginTop: 16 }}>
              <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

// ─── TAB: CANDIDATS ───────────────────────────────────────────────────────────
function TabCandidates() {
  const { data: allUsers, loading, refresh } = useApi(() => usersApi.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [err, setErr] = useState('');

  const candidates = (allUsers as User[] | null)?.filter(u => u.role === 'candidate') ?? [];

  const handleCreate = async (payload: UserCreatePayload) => {
    setErr('');
    try {
      await usersApi.create(payload);
      refresh(); setShowForm(false);
    } catch (e: unknown) {
      const msg = (e as { body?: { error?: string } })?.body?.error || 'Erreur lors de la création';
      setErr(msg);
    }
  };

  const handleUpdate = async (id: string, payload: Parameters<typeof usersApi.update>[1]) => {
    setErr('');
    try {
      await usersApi.update(id, payload);
      refresh(); setEditing(null);
    } catch { setErr('Erreur lors de la mise à jour'); }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Supprimer le candidat "${u.name}" ?`)) return;
    await usersApi.delete(u.id);
    refresh();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: 'var(--text-muted, #9ca3af)', fontSize: 13 }}>{candidates.length} candidat(s)</div>
        <button className="sa-btn sa-btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + Nouveau candidat
        </button>
      </div>

      {err && <div style={{ color: '#fca5a5', background: '#7f1d1d33', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{err}</div>}

      {(showForm && !editing) && (
        <CandidateForm
          onSubmit={p => handleCreate({ ...p, role: 'candidate' })}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <CandidateForm
          initial={editing}
          onSubmit={p => handleUpdate(editing.id, p)}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <div className="sa-card" style={{ padding: 0 }}>
          {candidates.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted, #9ca3af)', fontSize: 13 }}>
              Aucun candidat. Créez-en un avec le bouton ci-dessus.
            </div>
          ) : (
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Identifiant</th>
                  <th>Visibilité</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted, #9ca3af)' }}>{u.email}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted, #9ca3af)' }}>{u.username}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {VIS_KEYS.map(({ key, label }) => {
                          const on = u.candidateVisibility?.[key];
                          return (
                            <span key={key} className="vis-chip" style={{
                              background: on ? '#16a34a22' : '#6b728022',
                              borderColor: on ? '#16a34a66' : '#6b728066',
                              color: on ? '#4ade80' : '#9ca3af',
                            }}>{label}</span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="sa-btn-ghost" onClick={() => { setEditing(u); setShowForm(false); }}>Modifier</button>
                        <button className="sa-btn-ghost" style={{ color: '#fca5a5', borderColor: '#7f1d1d' }} onClick={() => handleDelete(u)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}

function CandidateForm({
  initial, onSubmit, onCancel,
}: {
  initial?: User;
  onSubmit: (data: Omit<UserCreatePayload, 'role'>) => void;
  onCancel: () => void;
}) {
  const [vis, setVis] = useState<User['candidateVisibility']>(
    initial?.candidateVisibility ?? { ...DEFAULT_VIS }
  );
  const [username, setUsername] = useState(initial?.username ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');

  const toggleVis = (key: keyof User['candidateVisibility']) => {
    setVis(v => ({ ...v, [key]: !v[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, name, email, password, candidateVisibility: vis });
  };

  return (
    <div className="form-modal" style={{ marginBottom: 20 }}>
      <div className="sa-label">{initial ? 'Modifier le candidat' : 'Nouveau candidat'}</div>
      <form onSubmit={handleSubmit}>
        {!initial && (
          <div className="form-row">
            <label>Identifiant *</label>
            <input className="sa-input" value={username} onChange={e => setUsername(e.target.value)} required placeholder="ex: candidat.dupont" />
          </div>
        )}
        <div className="form-row">
          <label>Nom complet *</label>
          <input className="sa-input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input className="sa-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label>{initial ? 'Nouveau mot de passe' : 'Mot de passe *'}</label>
          <input className="sa-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required={!initial} placeholder={initial ? 'Laisser vide pour ne pas changer' : ''} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted, #9ca3af)', marginBottom: 8 }}>Modules visibles par ce candidat :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VIS_KEYS.map(({ key, label }) => {
              const on = vis[key];
              return (
                <button type="button" key={key} onClick={() => toggleVis(key)} className="vis-chip" style={{
                  background: on ? '#16a34a22' : 'transparent',
                  borderColor: on ? '#16a34a' : 'var(--border, #374151)',
                  color: on ? '#4ade80' : 'var(--text-muted, #9ca3af)',
                  padding: '4px 10px', fontSize: 12,
                }}>
                  {on ? '✓ ' : ''}{label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="sa-btn sa-btn-primary">{initial ? 'Enregistrer' : 'Créer'}</button>
          <button type="button" className="sa-btn-ghost" onClick={onCancel}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

// ─── TAB: UTILISATEURS ────────────────────────────────────────────────────────
const ALL_ROLES: Array<{ value: string; label: string }> = [
  { value: 'war_room',              label: 'War Room Admin' },
  { value: 'direction',             label: 'Direction' },
  { value: 'regional_coordinator',  label: 'Coordinateur régional' },
  { value: 'zone_leader',           label: 'Chef de Zone' },
  { value: 'field_agent',           label: 'Agent Terrain' },
  { value: 'membership_data_entry', label: 'Saisie Adhésion' },
  { value: 'candidate',             label: 'Candidat' },
];

function UserForm({
  initial, onSubmit, onCancel,
}: {
  initial?: User;
  onSubmit: (data: Partial<UserCreatePayload>) => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState(initial?.username ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState(initial?.role ?? 'field_agent');
  const [dept, setDept] = useState(initial?.scopeDepartmentName ?? '');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<UserCreatePayload> = { name, email, role: role as UserCreatePayload['role'] };
    if (!initial) payload.username = username;
    if (password) payload.password = password;
    if (dept) payload.scopeDepartmentName = dept;
    onSubmit(payload);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg, #0f1117)', border: '1px solid var(--border, #374151)',
    borderRadius: 8, padding: '9px 12px', color: 'var(--text, #f1f5f9)', fontSize: 13,
    width: '100%', boxSizing: 'border-box',
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

  return (
    <div className="form-modal" style={{ marginBottom: 20 }}>
      <div className="sa-label">{initial ? `Modifier — ${initial.name}` : 'Nouvel utilisateur'}</div>
      <form onSubmit={handleSubmit}>
        {!initial && (
          <div className="form-row">
            <label>Identifiant *</label>
            <div style={{ flex: 1 }}>
              <input style={inputStyle} value={username} onChange={e => setUsername(e.target.value)}
                required placeholder="ex: zone.likouala" />
              <div style={{ fontSize: 11, color: 'var(--text-muted, #6b7280)', marginTop: 4 }}>
                Ne peut pas être modifié après création. Minuscules, chiffres et points uniquement.
              </div>
            </div>
          </div>
        )}
        {initial && (
          <div className="form-row">
            <label>Identifiant</label>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted, #9ca3af)',
              background: 'var(--surface2, #1c2333)', borderRadius: 8, padding: '9px 12px',
              border: '1px solid var(--border, #374151)' }}>
              {initial.username}
              <span style={{ marginLeft: 8, fontSize: 10, color: '#6b7280' }}>(immuable)</span>
            </div>
          </div>
        )}
        <div className="form-row">
          <label>Nom complet *</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Rôle *</label>
          <select style={selectStyle} value={role} onChange={e => setRole(e.target.value as User['role'])} required>
            {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Département</label>
          <input style={inputStyle} value={dept} onChange={e => setDept(e.target.value)}
            placeholder="ex: Brazzaville, Pointe-Noire…" />
        </div>
        <div className="form-row">
          <label>{initial ? 'Nouveau mot de passe' : 'Mot de passe *'}</label>
          <div style={{ flex: 1, position: 'relative' }}>
            <input style={{ ...inputStyle, paddingRight: 80 }}
              type={showPwd ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)}
              required={!initial}
              placeholder={initial ? 'Laisser vide pour ne pas changer' : 'Min. 8 caractères'} />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', color: 'var(--text-muted, #9ca3af)',
                cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
              {showPwd ? 'Masquer' : 'Voir'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button type="submit" className="sa-btn sa-btn-primary">{initial ? 'Enregistrer' : 'Créer'}</button>
          <button type="button" className="sa-btn-ghost" onClick={onCancel}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

function TabUsers() {
  const { data: users, loading, refresh } = useApi(() => usersApi.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [err, setErr] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const userList = (users as User[] | null) ?? [];
  const filtered = filterRole ? userList.filter(u => u.role === filterRole) : userList;

  const handleCreate = async (payload: Partial<UserCreatePayload>) => {
    setErr('');
    try {
      await usersApi.create(payload as UserCreatePayload);
      refresh(); setShowForm(false);
    } catch (e: unknown) {
      setErr((e as { body?: { error?: string } })?.body?.error || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (id: string, payload: Partial<UserCreatePayload>) => {
    setErr('');
    try {
      await usersApi.update(id, payload);
      refresh(); setEditing(null);
    } catch { setErr('Erreur lors de la mise à jour'); }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Supprimer l'utilisateur "${u.name}" (${u.username}) ?\n\nSes sessions seront révoquées.`)) return;
    try {
      await usersApi.delete(u.id);
      refresh();
    } catch { setErr('Erreur lors de la suppression'); }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>Chargement…</div>;

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted, #9ca3af)' }}>{filtered.length} utilisateur(s)</span>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{
            background: 'var(--surface2, #1c2333)', border: '1px solid var(--border, #374151)',
            borderRadius: 7, padding: '5px 10px', color: 'var(--text-muted, #9ca3af)', fontSize: 12, cursor: 'pointer',
          }}>
            <option value="">Tous les rôles</option>
            {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <button className="sa-btn sa-btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + Nouvel utilisateur
        </button>
      </div>

      {err && <div style={{ color: '#fca5a5', background: '#7f1d1d33', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{err}</div>}

      {showForm && !editing && (
        <UserForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      {editing && (
        <UserForm initial={editing} onSubmit={p => handleUpdate(editing.id, p)} onCancel={() => setEditing(null)} />
      )}

      <div className="sa-card" style={{ padding: 0 }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Nom / Email</th>
              <th>Identifiant</th>
              <th>Rôle</th>
              <th>Département</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted, #9ca3af)', padding: 32 }}>Aucun utilisateur</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted, #9ca3af)' }}>{u.email || '—'}</div>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 5, color: 'var(--text-muted, #c0cfe4)' }}>
                    {u.username}
                  </span>
                </td>
                <td>
                  <span className="role-pill" style={{
                    background: `${ROLE_COLORS[u.role] || '#6b7280'}22`,
                    color: ROLE_COLORS[u.role] || '#9ca3af',
                    border: `1px solid ${ROLE_COLORS[u.role] || '#6b7280'}55`,
                  }}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted, #9ca3af)', fontSize: 12 }}>
                  {u.scopeDepartmentName || '—'}
                  {u.scopeArrondissementName ? ` / ${u.scopeArrondissementName}` : ''}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="sa-btn-ghost" onClick={() => { setEditing(u); setShowForm(false); }}>Modifier</button>
                    <button className="sa-btn-ghost" style={{ color: '#fca5a5', borderColor: '#7f1d1d55' }} onClick={() => handleDelete(u)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALL_ROLES.map(r => (
          <span key={r.value} style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
            background: `${ROLE_COLORS[r.value] || '#6b7280'}22`,
            color: ROLE_COLORS[r.value] || '#9ca3af',
            border: `1px solid ${ROLE_COLORS[r.value] || '#6b7280'}44`,
          }}>{r.label}</span>
        ))}
      </div>
    </>
  );
}

// ─── TAB: APPARENCE ───────────────────────────────────────────────────────────
function TabAppearance({ theme, fontSize, setFontSize, toggleTheme }: {
  theme: string; fontSize: string;
  setFontSize: (s: 'normal' | 'large') => void;
  toggleTheme: () => void;
}) {
  return (
    <>
      <div className="sa-card">
        <div className="sa-label">Thème</div>
        <div
          className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => theme !== 'dark' && toggleTheme()}
        >
          <span style={{ fontSize: 22 }}>🌙</span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text, #f1f5f9)', fontSize: 14 }}>Mode sombre</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9ca3af)' }}>Fond noir, interface optimisée pour les opérations nocturnes</div>
          </div>
        </div>
        <div
          className={`theme-option ${theme === 'light' ? 'active' : ''}`}
          onClick={() => theme !== 'light' && toggleTheme()}
        >
          <span style={{ fontSize: 22 }}>☀️</span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text, #f1f5f9)', fontSize: 14 }}>Mode clair</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #9ca3af)' }}>Interface claire, idéale pour les présentations et réunions</div>
          </div>
        </div>
      </div>

      <div className="sa-card">
        <div className="sa-label">Taille du texte</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['normal', 'large'] as const).map(s => (
            <button key={s} onClick={() => setFontSize(s)} style={{
              padding: '10px 24px', borderRadius: 8, border: '1px solid',
              borderColor: fontSize === s ? '#9a1f1f' : 'var(--border, #374151)',
              background: fontSize === s ? '#9a1f1f22' : 'transparent',
              color: fontSize === s ? '#fca5a5' : 'var(--text-muted, #9ca3af)',
              cursor: 'pointer', fontWeight: 600, fontSize: s === 'large' ? 16 : 14,
            }}>
              {s === 'normal' ? 'Normal' : 'Grand'}
            </button>
          ))}
        </div>
      </div>

      <div className="sa-card">
        <div className="sa-label">Export &amp; Impression</div>
        <div style={{ color: 'var(--text-muted, #9ca3af)', fontSize: 13, marginBottom: 12 }}>
          Imprimez la page courante ou exportez les données affichées.
        </div>
        <button className="sa-btn sa-btn-primary" onClick={() => window.print()}>
          🖨️ Imprimer la page
        </button>
      </div>
    </>
  );
}

// ─── TAB: DANGER ──────────────────────────────────────────────────────────────
function TabDanger() {
  const [confirm1, setConfirm1] = useState(false);
  const [confirm2, setConfirm2] = useState(false);

  const handleClearTest = async () => {
    if (!confirm1) { setConfirm1(true); return; }
    await systemApi.clearTestData();
    window.location.reload();
  };

  const handleClearAll = async () => {
    if (!confirm2) { setConfirm2(true); return; }
    await systemApi.clearAllData();
    window.location.reload();
  };

  return (
    <>
      <div style={{ background: '#1c1212', border: '1px solid #7f1d1d', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, color: '#fca5a5', marginBottom: 4 }}>Effacer données de test</div>
            <div style={{ color: '#9ca3af', fontSize: 13 }}>Supprime toutes les entrées opérationnelles (campagne, membres, événements, médias, équipes). Conserve les utilisateurs et paramètres.</div>
          </div>
          <button className={`sa-btn ${confirm1 ? 'sa-btn-confirm' : 'sa-btn-danger'}`} onClick={handleClearTest}>
            {confirm1 ? '⚠️ Confirmer' : 'Effacer test'}
          </button>
        </div>
      </div>

      <div style={{ background: '#1c1212', border: '1px solid #7f1d1d', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, color: '#fca5a5', marginBottom: 4 }}>Réinitialisation complète</div>
            <div style={{ color: '#9ca3af', fontSize: 13 }}>Supprime TOUTES les données opérationnelles ET réinitialise les paramètres système aux valeurs par défaut. Action irréversible.</div>
          </div>
          <button className={`sa-btn ${confirm2 ? 'sa-btn-confirm' : 'sa-btn-danger'}`} onClick={handleClearAll}>
            {confirm2 ? '⚠️ CONFIRMER' : 'Reset total'}
          </button>
        </div>
      </div>
    </>
  );
}
