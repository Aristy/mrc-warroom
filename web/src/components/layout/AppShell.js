import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
const NAV = [
    { label: 'War Room', path: '/dashboard', roles: ['war_room', 'regional_coordinator'] },
    { label: 'Candidat', path: '/candidate', roles: ['candidate', 'direction', 'war_room'] },
    { label: 'Campagne', path: '/campaign', roles: ['war_room', 'regional_coordinator', 'zone_leader', 'field_agent'] },
    { label: 'Événements', path: '/events', roles: ['war_room', 'regional_coordinator', 'zone_leader', 'field_agent', 'direction'] },
    { label: 'Adhésions', path: '/members', roles: ['war_room', 'regional_coordinator', 'zone_leader', 'membership_data_entry'] },
    { label: 'Médias', path: '/media', roles: ['war_room', 'regional_coordinator', 'zone_leader', 'direction'] },
    { label: 'Sondages', path: '/polling', roles: ['war_room', 'regional_coordinator'] },
    { label: 'Réseaux sociaux', path: '/social', roles: ['war_room', 'regional_coordinator', 'direction'] },
    { label: 'Territoire', path: '/territory', roles: ['war_room', 'regional_coordinator', 'direction'] },
    { label: 'Équipes', path: '/teams', roles: ['war_room', 'regional_coordinator', 'direction'] },
    { label: 'Administration', path: '/admin', roles: ['war_room', 'direction'] },
];
export default function AppShell({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const visible = NAV.filter(n => user && n.roles.includes(user.role));
    async function handleLogout() { await logout(); navigate('/login'); }
    return (_jsxs("div", { style: { display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#0f1117', color: '#e8eaf0' }, children: [_jsxs("nav", { style: { width: 220, background: '#1a1d27', borderRight: '1px solid #2a2d3a', display: 'flex', flexDirection: 'column', flexShrink: 0 }, children: [_jsxs("div", { style: { padding: '20px 16px 16px', borderBottom: '1px solid #2a2d3a' }, children: [_jsx("div", { style: { fontSize: 16, fontWeight: 700, color: '#9a1f1f' }, children: "MRC War Room" }), _jsx("div", { style: { fontSize: 11, color: '#8b8fa8', marginTop: 2 }, children: "2026" })] }), _jsx("div", { style: { flex: 1, padding: '12px 0', overflowY: 'auto' }, children: visible.map(n => (_jsx(Link, { to: n.path, style: { display: 'block', padding: '9px 16px', fontSize: 13, fontWeight: 500, textDecoration: 'none', color: location.pathname === n.path ? '#e8eaf0' : '#8b8fa8', background: location.pathname === n.path ? '#9a1f1f22' : 'transparent', borderLeft: location.pathname === n.path ? '3px solid #9a1f1f' : '3px solid transparent', transition: 'all 0.15s' }, children: n.label }, n.path))) }), user && (_jsxs("div", { style: { padding: '12px 16px', borderTop: '1px solid #2a2d3a' }, children: [_jsx("div", { style: { fontSize: 12, color: '#e8eaf0', fontWeight: 500, marginBottom: 2 }, children: user.name }), _jsx("div", { style: { fontSize: 11, color: '#8b8fa8', marginBottom: 10 }, children: user.roleName }), _jsx("button", { onClick: handleLogout, style: { background: 'transparent', border: '1px solid #2a2d3a', borderRadius: 6, color: '#8b8fa8', cursor: 'pointer', fontSize: 12, padding: '6px 10px', width: '100%' }, children: "D\u00E9connexion" })] }))] }), _jsx("main", { style: { flex: 1, overflowY: 'auto' }, children: _jsx("div", { style: { padding: '20px 0 0' }, children: children }) })] }));
}
