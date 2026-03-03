import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useApi } from '../hooks/useApi.js';
import { teamsApi } from '../api/campaign.api.js';
export default function Teams() {
    const { data: teamsData, loading: teamsLoading } = useApi(() => teamsApi.list(), []);
    const { data: usersData, loading: usersLoading } = useApi(() => teamsApi.users(), []);
    const teams = teamsData?.teams ?? [];
    const users = usersData?.users ?? [];
    return (_jsxs("div", { className: "page-content", children: [_jsx("div", { className: "page-header", children: _jsx("h1", { children: "\u00C9quipes & Utilisateurs" }) }), _jsxs("div", { className: "two-col", children: [_jsxs("section", { children: [_jsxs("h2", { className: "section-title", children: ["\u00C9quipes (", teams.length, ")"] }), teamsLoading ? _jsx("div", { className: "loading", children: "Chargement\u2026" }) : (_jsxs("div", { className: "teams-list", children: [teams.map(t => (_jsxs("div", { className: "team-card", children: [_jsx("div", { className: "team-name", children: t.name }), _jsxs("div", { className: "team-meta", children: [t.departmentId, " \u00B7 ", t.members?.length ?? 0, " membres"] }), t.members && t.members.length > 0 && (_jsx("div", { className: "members-list", children: t.members.map((m, i) => (_jsx("span", { className: "member-chip", children: m.name ?? m.username ?? m.userId }, i))) }))] }, t.id))), teams.length === 0 && _jsx("div", { className: "empty-state", children: "Aucune \u00E9quipe." })] }))] }), _jsxs("section", { children: [_jsxs("h2", { className: "section-title", children: ["Utilisateurs (", users.length, ")"] }), usersLoading ? _jsx("div", { className: "loading", children: "Chargement\u2026" }) : (_jsxs("div", { className: "users-list", children: [users.map(u => (_jsxs("div", { className: "user-card", children: [_jsx("div", { className: "user-avatar", children: (u.name ?? u.username ?? '?')[0].toUpperCase() }), _jsxs("div", { className: "user-info", children: [_jsx("div", { className: "user-name", children: u.name ?? u.username }), _jsx("div", { className: "user-role", children: u.roleName ?? u.role }), u.scopeDepartmentName && _jsx("div", { className: "user-scope", children: u.scopeDepartmentName })] }), _jsx("div", { className: "user-modules", children: (u.terrainModules ?? []).slice(0, 3).map(m => (_jsx("span", { className: "module-chip", children: m }, m))) })] }, u.id))), users.length === 0 && _jsx("div", { className: "empty-state", children: "Aucun utilisateur." })] }))] })] }), _jsx("style", { children: `
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
      ` })] }));
}
