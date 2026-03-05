import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { eventsApi } from '../api/campaign.api.js';
import { useAuth } from '../context/AuthContext.js';
const STATUS_LABELS = {
    pending: 'En attente', zone_approved: 'Approuvé zone', zone_rejected: 'Rejeté zone',
    war_room_approved: 'Approuvé WR', published: 'Publié',
};
const STATUS_COLORS = {
    pending: '#6b7280', zone_approved: '#2563eb', zone_rejected: '#dc2626',
    war_room_approved: '#059669', published: '#10b981',
};
export default function Events() {
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState('');
    const { data, loading, refresh } = useApi(() => eventsApi.list(statusFilter ? { status: statusFilter } : {}), [statusFilter]);
    const events = data?.items ?? [];
    const canValidateZone = ['war_room', 'regional_coordinator'].includes(user?.role ?? '');
    const canPublish = user?.role === 'war_room';
    const handleValidateZone = async (id, decision) => {
        await eventsApi.validateZone(id, decision);
        refresh();
    };
    const handlePublish = async (id) => {
        await eventsApi.publish(id);
        refresh();
    };
    return (_jsxs("div", { className: "page-content", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "\u00C9v\u00E9nements" }), _jsx("span", { className: "badge", children: data?.total ?? 0 })] }), _jsx("div", { className: "filter-bar", children: ['', 'pending', 'zone_approved', 'war_room_approved', 'published'].map(s => (_jsx("button", { className: `filter-btn ${statusFilter === s ? 'active' : ''}`, onClick: () => setStatusFilter(s), children: s ? STATUS_LABELS[s] : 'Tous' }, s))) }), loading ? _jsx("div", { className: "loading", children: "Chargement\u2026" }) : (_jsx("div", { className: "events-list", children: events.length === 0 ? _jsx("div", { className: "empty-state", children: "Aucun \u00E9v\u00E9nement." }) : events.map(e => (_jsxs("div", { className: "event-card", children: [_jsxs("div", { className: "event-header", children: [_jsx("span", { className: "status-badge", style: { background: STATUS_COLORS[e.status] ?? '#6b7280' }, children: STATUS_LABELS[e.status] ?? e.status }), _jsx("span", { className: "event-date", children: new Date(e.createdAt).toLocaleDateString('fr-FR') })] }), _jsx("div", { className: "event-title", children: e.title }), _jsxs("div", { className: "event-meta", children: [e.eventType, " \u00B7 ", e.departmentName] }), e.description && _jsx("div", { className: "event-desc", children: e.description.slice(0, 150) }), _jsxs("div", { className: "event-actions", children: [canValidateZone && e.status === 'pending' && (_jsxs(_Fragment, { children: [_jsx("button", { className: "btn btn-approve", onClick: () => handleValidateZone(e.id, 'approve'), children: "\u2713 Approuver" }), _jsx("button", { className: "btn btn-reject", onClick: () => handleValidateZone(e.id, 'reject'), children: "\u2717 Rejeter" })] })), canPublish && e.status === 'war_room_approved' && (_jsx("button", { className: "btn btn-publish", onClick: () => handlePublish(e.id), children: "\uD83C\uDF10 Publier" }))] })] }, e.id))) })), _jsx("style", { children: `
        .page-content { padding: 24px; }
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .badge { background: #1e3a5f; color: #60a5fa; border-radius: 20px; padding: 2px 10px; font-size: 13px; }
        .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #374151; background: #1c2333; color: #9ca3af; cursor: pointer; font-size: 13px; }
        .filter-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .events-list { display: grid; gap: 12px; }
        .event-card { background: #1c2333; border-radius: 12px; padding: 16px; border: 1px solid #1f2937; }
        .event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #fff; font-weight: 600; }
        .event-date { color: #6b7280; font-size: 12px; }
        .event-title { font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
        .event-meta { color: #6b7280; font-size: 12px; margin-bottom: 8px; }
        .event-desc { color: #9ca3af; font-size: 13px; margin-bottom: 10px; }
        .event-actions { display: flex; gap: 8px; }
        .btn { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; }
        .btn-approve { background: #059669; color: #fff; }
        .btn-reject { background: #dc2626; color: #fff; }
        .btn-publish { background: #2563eb; color: #fff; }
      ` })] }));
}
