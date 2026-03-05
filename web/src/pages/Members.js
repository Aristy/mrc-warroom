import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { membersApi } from '../api/campaign.api.js';
import { useAuth } from '../context/AuthContext.js';
const STATUS_LABELS = { pending: 'En attente', published: 'Publié' };
export default function Members() {
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState('');
    const { data, loading, refresh } = useApi(() => membersApi.list(statusFilter ? { status: statusFilter } : {}), [statusFilter]);
    const members = data?.items ?? [];
    const canPublish = ['war_room'].includes(user?.role ?? '');
    const handlePublish = async (id) => {
        await membersApi.publish(id);
        refresh();
    };
    return (_jsxs("div", { className: "page-content", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "Adh\u00E9sions" }), _jsx("span", { className: "badge", children: data?.total ?? 0 })] }), _jsx("div", { className: "filter-bar", children: [{ val: '', label: 'Tous' }, { val: 'pending', label: 'En attente' }, { val: 'published', label: 'Publiés' }].map(f => (_jsx("button", { className: `filter-btn ${statusFilter === f.val ? 'active' : ''}`, onClick: () => setStatusFilter(f.val), children: f.label }, f.val))) }), loading ? _jsx("div", { className: "loading", children: "Chargement\u2026" }) : (_jsx("div", { className: "table-wrapper", children: members.length === 0 ? _jsx("div", { className: "empty-state", children: "Aucune adh\u00E9sion." }) : (_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nom" }), _jsx("th", { children: "T\u00E9l\u00E9phone" }), _jsx("th", { children: "D\u00E9partement" }), _jsx("th", { children: "Statut" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Action" })] }) }), _jsx("tbody", { children: members.map(m => (_jsxs("tr", { children: [_jsx("td", { children: m.fullName ?? `${m.lastName} ${m.firstNames}` }), _jsx("td", { children: m.phone ?? '—' }), _jsx("td", { children: m.departmentId ?? '—' }), _jsx("td", { children: _jsx("span", { className: `status-pill ${m.status}`, children: STATUS_LABELS[m.status] ?? m.status }) }), _jsx("td", { children: new Date(m.submittedAt).toLocaleDateString('fr-FR') }), _jsx("td", { children: canPublish && m.status === 'pending' && (_jsx("button", { className: "btn-publish", onClick: () => handlePublish(m.id), children: "Publier" })) })] }, m.id))) })] })) })), _jsx("style", { children: `
        .page-content { padding: 24px; }
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .badge { background: #1e3a5f; color: #60a5fa; border-radius: 20px; padding: 2px 10px; font-size: 13px; }
        .filter-bar { display: flex; gap: 8px; margin-bottom: 20px; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #374151; background: #1c2333; color: #9ca3af; cursor: pointer; font-size: 13px; }
        .filter-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 10px 12px; color: #6b7280; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1f2937; }
        .data-table td { padding: 12px; border-bottom: 1px solid #1f2937; color: #d1d5db; font-size: 14px; }
        .status-pill { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
        .status-pill.pending { background: #1e3a5f; color: #60a5fa; }
        .status-pill.published { background: #064e3b; color: #34d399; }
        .btn-publish { padding: 4px 10px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; }
      ` })] }));
}
