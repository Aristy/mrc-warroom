import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { mediaApi } from '../api/campaign.api.js';
import { useAuth } from '../context/AuthContext.js';
const SOURCE_ICONS = {
    facebook: '👥', twitter: '🐦', youtube: '▶️', tiktok: '🎵',
    instagram: '📸', radio: '📻', television: '📺', other: '🔗',
};
export default function Media() {
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState('');
    const { data, loading, refresh } = useApi(() => mediaApi.list(statusFilter ? { status: statusFilter } : {}), [statusFilter]);
    const items = data?.items ?? [];
    const canValidate = ['war_room', 'regional_coordinator', 'zone_leader'].includes(user?.role ?? '');
    const canPublish = ['war_room'].includes(user?.role ?? '');
    const handleValidate = async (id) => { await mediaApi.validate(id); refresh(); };
    const handlePublish = async (id) => { await mediaApi.publish(id); refresh(); };
    return (_jsxs("div", { className: "page-content", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "Veille m\u00E9dias" }), _jsx("span", { className: "badge", children: data?.total ?? 0 })] }), _jsx("div", { className: "filter-bar", children: [{ val: '', label: 'Tous' }, { val: 'pending', label: 'En attente' }, { val: 'validated', label: 'Validés' }, { val: 'published', label: 'Publiés' }].map(f => (_jsx("button", { className: `filter-btn ${statusFilter === f.val ? 'active' : ''}`, onClick: () => setStatusFilter(f.val), children: f.label }, f.val))) }), loading ? _jsx("div", { className: "loading", children: "Chargement\u2026" }) : (_jsx("div", { className: "media-grid", children: items.length === 0 ? _jsx("div", { className: "empty-state", children: "Aucun m\u00E9dia pour ce filtre." }) : items.map(item => (_jsxs("div", { className: "media-card", children: [_jsxs("div", { className: "media-header", children: [_jsx("span", { className: "source-icon", children: SOURCE_ICONS[item.sourceType] ?? '🔗' }), _jsx("span", { className: "source-type", children: item.sourceType }), _jsx("span", { className: `status-pill ${item.status}`, children: item.status })] }), _jsx("div", { className: "media-title", children: item.title }), item.summary && _jsxs("div", { className: "media-summary", children: [item.summary.slice(0, 120), "\u2026"] }), item.sourceUrl && (_jsx("a", { href: item.sourceUrl, target: "_blank", rel: "noopener noreferrer", className: "media-link", children: "Voir la source \u2197" })), _jsxs("div", { className: "media-meta", children: [item.departmentId ?? 'National', " \u00B7 ", new Date(item.createdAt).toLocaleDateString('fr-FR')] }), _jsxs("div", { className: "media-actions", children: [canValidate && item.status === 'pending' && (_jsx("button", { className: "btn btn-validate", onClick: () => handleValidate(item.id), children: "\u2713 Valider" })), canPublish && item.status === 'validated' && (_jsx("button", { className: "btn btn-publish", onClick: () => handlePublish(item.id), children: "\uD83C\uDF10 Publier" }))] })] }, item.id))) })), _jsx("style", { children: `
        .page-content { padding: 24px; }
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .badge { background: #1e3a5f; color: #60a5fa; border-radius: 20px; padding: 2px 10px; font-size: 13px; }
        .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #374151; background: #1c2333; color: #9ca3af; cursor: pointer; font-size: 13px; }
        .filter-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .media-card { background: #1c2333; border-radius: 12px; padding: 16px; border: 1px solid #1f2937; }
        .media-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .source-icon { font-size: 20px; }
        .source-type { color: #9ca3af; font-size: 12px; flex: 1; text-transform: capitalize; }
        .status-pill { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; background: #374151; color: #d1d5db; }
        .status-pill.published { background: #064e3b; color: #34d399; }
        .status-pill.validated { background: #1e3a5f; color: #60a5fa; }
        .media-title { font-weight: 600; color: #f1f5f9; margin-bottom: 6px; }
        .media-summary { color: #9ca3af; font-size: 13px; margin-bottom: 8px; }
        .media-link { color: #60a5fa; font-size: 12px; text-decoration: none; display: block; margin-bottom: 8px; }
        .media-meta { color: #6b7280; font-size: 11px; margin-bottom: 10px; }
        .media-actions { display: flex; gap: 8px; }
        .btn { padding: 5px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; }
        .btn-validate { background: #059669; color: #fff; }
        .btn-publish { background: #2563eb; color: #fff; }
      ` })] }));
}
