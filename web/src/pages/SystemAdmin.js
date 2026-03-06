import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { systemApi } from '../api/dashboard.api.js';
import { usersApi } from '../api/users.api.js';
import { useTheme } from '../context/ThemeContext.js';
const ROLE_LABELS = {
    war_room: 'War Room', regional_coordinator: 'Coordinateur', zone_leader: 'Chef de Zone',
    field_agent: 'Agent Terrain', membership_data_entry: 'Saisie Adhésion',
    candidate: 'Candidat', direction: 'Direction',
};
const ROLE_COLORS = {
    war_room: '#dc2626', regional_coordinator: '#d97706', zone_leader: '#2563eb',
    field_agent: '#16a34a', membership_data_entry: '#7c3aed', candidate: '#9a1f1f', direction: '#0891b2',
};
const VIS_KEYS = [
    { key: 'showAdhesion', label: 'Adhésion' },
    { key: 'showPolling', label: 'Sondages' },
    { key: 'showIncidents', label: 'Incidents' },
    { key: 'showEvents', label: 'Événements' },
    { key: 'showMedia', label: 'Médias' },
    { key: 'showDigital', label: 'Digital' },
    { key: 'showTerrain', label: 'Terrain' },
];
const DEFAULT_VIS = {
    showAdhesion: true, showPolling: true, showIncidents: true,
    showEvents: true, showMedia: true, showDigital: true, showTerrain: true,
};
export default function SystemAdmin() {
    const [tab, setTab] = useState('general');
    const { theme, fontSize, setFontSize, toggleTheme } = useTheme();
    return (_jsxs("div", { style: { padding: '24px', maxWidth: 1000 }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, color: 'var(--text, #f1f5f9)', margin: '0 0 16px' }, children: "Administration syst\u00E8me" }), _jsx("div", { style: { display: 'flex', gap: 4, borderBottom: '1px solid var(--border, #2a2d3a)', paddingBottom: 0 }, children: ['general', 'candidates', 'users', 'appearance', 'danger'].map(t => {
                            const labels = { general: 'Général', candidates: 'Candidats', users: 'Utilisateurs', appearance: 'Apparence', danger: 'Danger' };
                            return (_jsx("button", { onClick: () => setTab(t), style: {
                                    padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                                    borderBottom: tab === t ? '2px solid #9a1f1f' : '2px solid transparent',
                                    background: 'transparent',
                                    color: tab === t ? '#9a1f1f' : 'var(--text-muted, #8b8fa8)',
                                    marginBottom: -1,
                                }, children: labels[t] }, t));
                        }) })] }), tab === 'general' && _jsx(TabGeneral, {}), tab === 'candidates' && _jsx(TabCandidates, {}), tab === 'users' && _jsx(TabUsers, {}), tab === 'appearance' && _jsx(TabAppearance, { theme: theme, fontSize: fontSize, setFontSize: setFontSize, toggleTheme: toggleTheme }), tab === 'danger' && _jsx(TabDanger, {}), _jsx("style", { children: `
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
      ` })] }));
}
// ─── TAB: GÉNÉRAL ────────────────────────────────────────────────────────────
function TabGeneral() {
    const { data: overview, loading: overviewLoading } = useApi(() => systemApi.overview(), []);
    const { data: settings, loading: settingsLoading, refresh } = useApi(() => systemApi.settings(), []);
    const [saving, setSaving] = useState(false);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData(e.currentTarget);
            const updated = {};
            fd.forEach((val, key) => { updated[key] = val; });
            await systemApi.updateSettings(updated);
            refresh();
        }
        finally {
            setSaving(false);
        }
    };
    const FIELD_LABELS = {
        platformName: 'Nom de la plateforme', candidateName: 'Nom du candidat',
        mobileAppName: 'App mobile', mobileDefaultBackendUrl: 'URL backend mobile',
        operationalMessage: 'Message opérationnel', environmentMode: 'Mode environnement',
        candidateDashboardPath: 'Chemin tableau candidat',
    };
    return (_jsxs(_Fragment, { children: [!overviewLoading && overview && (_jsxs("div", { className: "sa-card", children: [_jsx("div", { className: "sa-label", children: "Vue d'ensemble" }), _jsx("div", { className: "overview-grid", children: overview && Object.entries(overview?.modules || {}).map(([k, v]) => (_jsxs("div", { className: "overview-card", children: [_jsx("div", { className: "overview-label", children: k }), _jsx("div", { className: "overview-value", children: String(v) })] }, k))) })] })), !settingsLoading && settings && (_jsxs("div", { className: "sa-card", children: [_jsx("div", { className: "sa-label", children: "Param\u00E8tres de la plateforme" }), _jsxs("form", { onSubmit: handleSave, children: [Object.entries(settings)
                                .filter(([k]) => k !== 'updatedAt')
                                .map(([key, val]) => (_jsxs("div", { className: "form-row", children: [_jsx("label", { children: FIELD_LABELS[key] || key }), _jsx("input", { className: "sa-input", name: key, defaultValue: String(val) })] }, key))), _jsx("div", { style: { marginTop: 16 }, children: _jsx("button", { type: "submit", className: "sa-btn sa-btn-primary", disabled: saving, children: saving ? 'Enregistrement…' : 'Enregistrer' }) })] })] }))] }));
}
// ─── TAB: CANDIDATS ───────────────────────────────────────────────────────────
function TabCandidates() {
    const { data: allUsers, loading, refresh } = useApi(() => usersApi.list(), []);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [err, setErr] = useState('');
    const candidates = allUsers?.filter(u => u.role === 'candidate') ?? [];
    const handleCreate = async (payload) => {
        setErr('');
        try {
            await usersApi.create(payload);
            refresh();
            setShowForm(false);
        }
        catch (e) {
            const msg = e?.body?.error || 'Erreur lors de la création';
            setErr(msg);
        }
    };
    const handleUpdate = async (id, payload) => {
        setErr('');
        try {
            await usersApi.update(id, payload);
            refresh();
            setEditing(null);
        }
        catch {
            setErr('Erreur lors de la mise à jour');
        }
    };
    const handleDelete = async (u) => {
        if (!confirm(`Supprimer le candidat "${u.name}" ?`))
            return;
        await usersApi.delete(u.id);
        refresh();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [_jsxs("div", { style: { color: 'var(--text-muted, #9ca3af)', fontSize: 13 }, children: [candidates.length, " candidat(s)"] }), _jsx("button", { className: "sa-btn sa-btn-primary", onClick: () => { setShowForm(true); setEditing(null); }, children: "+ Nouveau candidat" })] }), err && _jsx("div", { style: { color: '#fca5a5', background: '#7f1d1d33', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }, children: err }), (showForm && !editing) && (_jsx(CandidateForm, { onSubmit: p => handleCreate({ ...p, role: 'candidate' }), onCancel: () => setShowForm(false) })), editing && (_jsx(CandidateForm, { initial: editing, onSubmit: p => handleUpdate(editing.id, p), onCancel: () => setEditing(null) })), loading ? (_jsx("div", { style: { color: 'var(--text-muted)', padding: 40, textAlign: 'center' }, children: "Chargement\u2026" })) : (_jsx("div", { className: "sa-card", style: { padding: 0 }, children: candidates.length === 0 ? (_jsx("div", { style: { padding: 32, textAlign: 'center', color: 'var(--text-muted, #9ca3af)', fontSize: 13 }, children: "Aucun candidat. Cr\u00E9ez-en un avec le bouton ci-dessus." })) : (_jsxs("table", { className: "sa-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nom" }), _jsx("th", { children: "Identifiant" }), _jsx("th", { children: "Visibilit\u00E9" }), _jsx("th", { style: { textAlign: 'right' }, children: "Actions" })] }) }), _jsx("tbody", { children: candidates.map(u => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { style: { fontWeight: 600 }, children: u.name }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted, #9ca3af)' }, children: u.email })] }), _jsx("td", { style: { fontFamily: 'monospace', color: 'var(--text-muted, #9ca3af)' }, children: u.username }), _jsx("td", { children: _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 4 }, children: VIS_KEYS.map(({ key, label }) => {
                                                const on = u.candidateVisibility?.[key];
                                                return (_jsx("span", { className: "vis-chip", style: {
                                                        background: on ? '#16a34a22' : '#6b728022',
                                                        borderColor: on ? '#16a34a66' : '#6b728066',
                                                        color: on ? '#4ade80' : '#9ca3af',
                                                    }, children: label }, key));
                                            }) }) }), _jsx("td", { style: { textAlign: 'right' }, children: _jsxs("div", { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' }, children: [_jsx("button", { className: "sa-btn-ghost", onClick: () => { setEditing(u); setShowForm(false); }, children: "Modifier" }), _jsx("button", { className: "sa-btn-ghost", style: { color: '#fca5a5', borderColor: '#7f1d1d' }, onClick: () => handleDelete(u), children: "Supprimer" })] }) })] }, u.id))) })] })) }))] }));
}
function CandidateForm({ initial, onSubmit, onCancel, }) {
    const [vis, setVis] = useState(initial?.candidateVisibility ?? { ...DEFAULT_VIS });
    const [username, setUsername] = useState(initial?.username ?? '');
    const [name, setName] = useState(initial?.name ?? '');
    const [email, setEmail] = useState(initial?.email ?? '');
    const [password, setPassword] = useState('');
    const toggleVis = (key) => {
        setVis(v => ({ ...v, [key]: !v[key] }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ username, name, email, password, candidateVisibility: vis });
    };
    return (_jsxs("div", { className: "form-modal", style: { marginBottom: 20 }, children: [_jsx("div", { className: "sa-label", children: initial ? 'Modifier le candidat' : 'Nouveau candidat' }), _jsxs("form", { onSubmit: handleSubmit, children: [!initial && (_jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Identifiant *" }), _jsx("input", { className: "sa-input", value: username, onChange: e => setUsername(e.target.value), required: true, placeholder: "ex: candidat.dupont" })] })), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Nom complet *" }), _jsx("input", { className: "sa-input", value: name, onChange: e => setName(e.target.value), required: true })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Email" }), _jsx("input", { className: "sa-input", type: "email", value: email, onChange: e => setEmail(e.target.value) })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: initial ? 'Nouveau mot de passe' : 'Mot de passe *' }), _jsx("input", { className: "sa-input", type: "password", value: password, onChange: e => setPassword(e.target.value), required: !initial, placeholder: initial ? 'Laisser vide pour ne pas changer' : '' })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("div", { style: { fontSize: 12, color: 'var(--text-muted, #9ca3af)', marginBottom: 8 }, children: "Modules visibles par ce candidat :" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8 }, children: VIS_KEYS.map(({ key, label }) => {
                                    const on = vis[key];
                                    return (_jsxs("button", { type: "button", onClick: () => toggleVis(key), className: "vis-chip", style: {
                                            background: on ? '#16a34a22' : 'transparent',
                                            borderColor: on ? '#16a34a' : 'var(--border, #374151)',
                                            color: on ? '#4ade80' : 'var(--text-muted, #9ca3af)',
                                            padding: '4px 10px', fontSize: 12,
                                        }, children: [on ? '✓ ' : '', label] }, key));
                                }) })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { type: "submit", className: "sa-btn sa-btn-primary", children: initial ? 'Enregistrer' : 'Créer' }), _jsx("button", { type: "button", className: "sa-btn-ghost", onClick: onCancel, children: "Annuler" })] })] })] }));
}
// ─── TAB: UTILISATEURS ────────────────────────────────────────────────────────
const ALL_ROLES = [
    { value: 'war_room', label: 'War Room Admin' },
    { value: 'direction', label: 'Direction' },
    { value: 'regional_coordinator', label: 'Coordinateur régional' },
    { value: 'zone_leader', label: 'Chef de Zone' },
    { value: 'field_agent', label: 'Agent Terrain' },
    { value: 'membership_data_entry', label: 'Saisie Adhésion' },
    { value: 'candidate', label: 'Candidat' },
];
function UserForm({ initial, onSubmit, onCancel, }) {
    const [username, setUsername] = useState(initial?.username ?? '');
    const [name, setName] = useState(initial?.name ?? '');
    const [email, setEmail] = useState(initial?.email ?? '');
    const [role, setRole] = useState(initial?.role ?? 'field_agent');
    const [dept, setDept] = useState(initial?.scopeDepartmentName ?? '');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { name, email, role: role };
        if (!initial)
            payload.username = username;
        if (password)
            payload.password = password;
        if (dept)
            payload.scopeDepartmentName = dept;
        onSubmit(payload);
    };
    const inputStyle = {
        background: 'var(--bg, #0f1117)', border: '1px solid var(--border, #374151)',
        borderRadius: 8, padding: '9px 12px', color: 'var(--text, #f1f5f9)', fontSize: 13,
        width: '100%', boxSizing: 'border-box',
    };
    const selectStyle = { ...inputStyle, cursor: 'pointer' };
    return (_jsxs("div", { className: "form-modal", style: { marginBottom: 20 }, children: [_jsx("div", { className: "sa-label", children: initial ? `Modifier — ${initial.name}` : 'Nouvel utilisateur' }), _jsxs("form", { onSubmit: handleSubmit, children: [!initial && (_jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Identifiant *" }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("input", { style: inputStyle, value: username, onChange: e => setUsername(e.target.value), required: true, placeholder: "ex: zone.likouala" }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted, #6b7280)', marginTop: 4 }, children: "Ne peut pas \u00EAtre modifi\u00E9 apr\u00E8s cr\u00E9ation. Minuscules, chiffres et points uniquement." })] })] })), initial && (_jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Identifiant" }), _jsxs("div", { style: { flex: 1, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted, #9ca3af)',
                                    background: 'var(--surface2, #1c2333)', borderRadius: 8, padding: '9px 12px',
                                    border: '1px solid var(--border, #374151)' }, children: [initial.username, _jsx("span", { style: { marginLeft: 8, fontSize: 10, color: '#6b7280' }, children: "(immuable)" })] })] })), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Nom complet *" }), _jsx("input", { style: inputStyle, value: name, onChange: e => setName(e.target.value), required: true })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Email" }), _jsx("input", { style: inputStyle, type: "email", value: email, onChange: e => setEmail(e.target.value) })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "R\u00F4le *" }), _jsx("select", { style: selectStyle, value: role, onChange: e => setRole(e.target.value), required: true, children: ALL_ROLES.map(r => _jsx("option", { value: r.value, children: r.label }, r.value)) })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "D\u00E9partement" }), _jsx("input", { style: inputStyle, value: dept, onChange: e => setDept(e.target.value), placeholder: "ex: Brazzaville, Pointe-Noire\u2026" })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: initial ? 'Nouveau mot de passe' : 'Mot de passe *' }), _jsxs("div", { style: { flex: 1, position: 'relative' }, children: [_jsx("input", { style: { ...inputStyle, paddingRight: 80 }, type: showPwd ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), required: !initial, placeholder: initial ? 'Laisser vide pour ne pas changer' : 'Min. 8 caractères' }), _jsx("button", { type: "button", onClick: () => setShowPwd(v => !v), style: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                            background: 'transparent', border: 'none', color: 'var(--text-muted, #9ca3af)',
                                            cursor: 'pointer', fontSize: 11, fontWeight: 600 }, children: showPwd ? 'Masquer' : 'Voir' })] })] }), _jsxs("div", { style: { display: 'flex', gap: 8, marginTop: 4 }, children: [_jsx("button", { type: "submit", className: "sa-btn sa-btn-primary", children: initial ? 'Enregistrer' : 'Créer' }), _jsx("button", { type: "button", className: "sa-btn-ghost", onClick: onCancel, children: "Annuler" })] })] })] }));
}
function TabUsers() {
    const { data: users, loading, refresh } = useApi(() => usersApi.list(), []);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [err, setErr] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const userList = users ?? [];
    const filtered = filterRole ? userList.filter(u => u.role === filterRole) : userList;
    const handleCreate = async (payload) => {
        setErr('');
        try {
            await usersApi.create(payload);
            refresh();
            setShowForm(false);
        }
        catch (e) {
            setErr(e?.body?.error || 'Erreur lors de la création');
        }
    };
    const handleUpdate = async (id, payload) => {
        setErr('');
        try {
            await usersApi.update(id, payload);
            refresh();
            setEditing(null);
        }
        catch {
            setErr('Erreur lors de la mise à jour');
        }
    };
    const handleDelete = async (u) => {
        if (!confirm(`Supprimer l'utilisateur "${u.name}" (${u.username}) ?\n\nSes sessions seront révoquées.`))
            return;
        try {
            await usersApi.delete(u.id);
            refresh();
        }
        catch {
            setErr('Erreur lors de la suppression');
        }
    };
    if (loading)
        return _jsx("div", { style: { color: 'var(--text-muted)', padding: 40, textAlign: 'center' }, children: "Chargement\u2026" });
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [_jsxs("span", { style: { fontSize: 13, color: 'var(--text-muted, #9ca3af)' }, children: [filtered.length, " utilisateur(s)"] }), _jsxs("select", { value: filterRole, onChange: e => setFilterRole(e.target.value), style: {
                                    background: 'var(--surface2, #1c2333)', border: '1px solid var(--border, #374151)',
                                    borderRadius: 7, padding: '5px 10px', color: 'var(--text-muted, #9ca3af)', fontSize: 12, cursor: 'pointer',
                                }, children: [_jsx("option", { value: "", children: "Tous les r\u00F4les" }), ALL_ROLES.map(r => _jsx("option", { value: r.value, children: r.label }, r.value))] })] }), _jsx("button", { className: "sa-btn sa-btn-primary", onClick: () => { setShowForm(true); setEditing(null); }, children: "+ Nouvel utilisateur" })] }), err && _jsx("div", { style: { color: '#fca5a5', background: '#7f1d1d33', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }, children: err }), showForm && !editing && (_jsx(UserForm, { onSubmit: handleCreate, onCancel: () => setShowForm(false) })), editing && (_jsx(UserForm, { initial: editing, onSubmit: p => handleUpdate(editing.id, p), onCancel: () => setEditing(null) })), _jsx("div", { className: "sa-card", style: { padding: 0 }, children: _jsxs("table", { className: "sa-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nom / Email" }), _jsx("th", { children: "Identifiant" }), _jsx("th", { children: "R\u00F4le" }), _jsx("th", { children: "D\u00E9partement" }), _jsx("th", { style: { textAlign: 'right' }, children: "Actions" })] }) }), _jsx("tbody", { children: filtered.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, style: { textAlign: 'center', color: 'var(--text-muted, #9ca3af)', padding: 32 }, children: "Aucun utilisateur" }) })) : filtered.map(u => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { style: { fontWeight: 600 }, children: u.name }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted, #9ca3af)' }, children: u.email || '—' })] }), _jsx("td", { children: _jsx("span", { style: { fontFamily: 'monospace', fontSize: 12, background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 5, color: 'var(--text-muted, #c0cfe4)' }, children: u.username }) }), _jsx("td", { children: _jsx("span", { className: "role-pill", style: {
                                                background: `${ROLE_COLORS[u.role] || '#6b7280'}22`,
                                                color: ROLE_COLORS[u.role] || '#9ca3af',
                                                border: `1px solid ${ROLE_COLORS[u.role] || '#6b7280'}55`,
                                            }, children: ROLE_LABELS[u.role] || u.role }) }), _jsxs("td", { style: { color: 'var(--text-muted, #9ca3af)', fontSize: 12 }, children: [u.scopeDepartmentName || '—', u.scopeArrondissementName ? ` / ${u.scopeArrondissementName}` : ''] }), _jsx("td", { style: { textAlign: 'right' }, children: _jsxs("div", { style: { display: 'flex', gap: 6, justifyContent: 'flex-end' }, children: [_jsx("button", { className: "sa-btn-ghost", onClick: () => { setEditing(u); setShowForm(false); }, children: "Modifier" }), _jsx("button", { className: "sa-btn-ghost", style: { color: '#fca5a5', borderColor: '#7f1d1d55' }, onClick: () => handleDelete(u), children: "Supprimer" })] }) })] }, u.id))) })] }) }), _jsx("div", { style: { marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }, children: ALL_ROLES.map(r => (_jsx("span", { style: {
                        fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                        background: `${ROLE_COLORS[r.value] || '#6b7280'}22`,
                        color: ROLE_COLORS[r.value] || '#9ca3af',
                        border: `1px solid ${ROLE_COLORS[r.value] || '#6b7280'}44`,
                    }, children: r.label }, r.value))) })] }));
}
// ─── TAB: APPARENCE ───────────────────────────────────────────────────────────
function TabAppearance({ theme, fontSize, setFontSize, toggleTheme }) {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "sa-card", children: [_jsx("div", { className: "sa-label", children: "Th\u00E8me" }), _jsxs("div", { className: `theme-option ${theme === 'dark' ? 'active' : ''}`, onClick: () => theme !== 'dark' && toggleTheme(), children: [_jsx("span", { style: { fontSize: 22 }, children: "\uD83C\uDF19" }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, color: 'var(--text, #f1f5f9)', fontSize: 14 }, children: "Mode sombre" }), _jsx("div", { style: { fontSize: 12, color: 'var(--text-muted, #9ca3af)' }, children: "Fond noir, interface optimis\u00E9e pour les op\u00E9rations nocturnes" })] })] }), _jsxs("div", { className: `theme-option ${theme === 'light' ? 'active' : ''}`, onClick: () => theme !== 'light' && toggleTheme(), children: [_jsx("span", { style: { fontSize: 22 }, children: "\u2600\uFE0F" }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, color: 'var(--text, #f1f5f9)', fontSize: 14 }, children: "Mode clair" }), _jsx("div", { style: { fontSize: 12, color: 'var(--text-muted, #9ca3af)' }, children: "Interface claire, id\u00E9ale pour les pr\u00E9sentations et r\u00E9unions" })] })] })] }), _jsxs("div", { className: "sa-card", children: [_jsx("div", { className: "sa-label", children: "Taille du texte" }), _jsx("div", { style: { display: 'flex', gap: 12 }, children: ['normal', 'large'].map(s => (_jsx("button", { onClick: () => setFontSize(s), style: {
                                padding: '10px 24px', borderRadius: 8, border: '1px solid',
                                borderColor: fontSize === s ? '#9a1f1f' : 'var(--border, #374151)',
                                background: fontSize === s ? '#9a1f1f22' : 'transparent',
                                color: fontSize === s ? '#fca5a5' : 'var(--text-muted, #9ca3af)',
                                cursor: 'pointer', fontWeight: 600, fontSize: s === 'large' ? 16 : 14,
                            }, children: s === 'normal' ? 'Normal' : 'Grand' }, s))) })] }), _jsxs("div", { className: "sa-card", children: [_jsx("div", { className: "sa-label", children: "Export & Impression" }), _jsx("div", { style: { color: 'var(--text-muted, #9ca3af)', fontSize: 13, marginBottom: 12 }, children: "Imprimez la page courante ou exportez les donn\u00E9es affich\u00E9es." }), _jsx("button", { className: "sa-btn sa-btn-primary", onClick: () => window.print(), children: "\uD83D\uDDA8\uFE0F Imprimer la page" })] })] }));
}
// ─── TAB: DANGER ──────────────────────────────────────────────────────────────
function TabDanger() {
    const [confirm1, setConfirm1] = useState(false);
    const [confirm2, setConfirm2] = useState(false);
    const handleClearTest = async () => {
        if (!confirm1) {
            setConfirm1(true);
            return;
        }
        await systemApi.clearTestData();
        window.location.reload();
    };
    const handleClearAll = async () => {
        if (!confirm2) {
            setConfirm2(true);
            return;
        }
        await systemApi.clearAllData();
        window.location.reload();
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { style: { background: '#1c1212', border: '1px solid #7f1d1d', borderRadius: 12, padding: 20, marginBottom: 16 }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, color: '#fca5a5', marginBottom: 4 }, children: "Effacer donn\u00E9es de test" }), _jsx("div", { style: { color: '#9ca3af', fontSize: 13 }, children: "Supprime toutes les entr\u00E9es op\u00E9rationnelles (campagne, membres, \u00E9v\u00E9nements, m\u00E9dias, \u00E9quipes). Conserve les utilisateurs et param\u00E8tres." })] }), _jsx("button", { className: `sa-btn ${confirm1 ? 'sa-btn-confirm' : 'sa-btn-danger'}`, onClick: handleClearTest, children: confirm1 ? '⚠️ Confirmer' : 'Effacer test' })] }) }), _jsx("div", { style: { background: '#1c1212', border: '1px solid #7f1d1d', borderRadius: 12, padding: 20 }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, color: '#fca5a5', marginBottom: 4 }, children: "R\u00E9initialisation compl\u00E8te" }), _jsx("div", { style: { color: '#9ca3af', fontSize: 13 }, children: "Supprime TOUTES les donn\u00E9es op\u00E9rationnelles ET r\u00E9initialise les param\u00E8tres syst\u00E8me aux valeurs par d\u00E9faut. Action irr\u00E9versible." })] }), _jsx("button", { className: `sa-btn ${confirm2 ? 'sa-btn-confirm' : 'sa-btn-danger'}`, onClick: handleClearAll, children: confirm2 ? '⚠️ CONFIRMER' : 'Reset total' })] }) })] }));
}
