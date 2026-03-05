import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { campaignApi } from '../api/campaign.api.js';
const CATEGORY_LABELS = {
    terrain: 'Terrain', sondage: 'Sondage', incident: 'Incident',
    adherent: 'Adhérent', digital: 'Digital', mission: 'Mission', logistique: 'Logistique',
};
const CATEGORY_COLORS = {
    terrain: '#2563eb', sondage: '#7c3aed', incident: '#dc2626',
    adherent: '#db2777', digital: '#0891b2', mission: '#d97706', logistique: '#65a30d',
};
export default function Campaign() {
    const [category, setCategory] = useState('');
    const { data, loading } = useApi(() => campaignApi.list(category ? { category } : {}), [category]);
    const records = data?.items ?? [];
    return (_jsxs("div", { className: "page-content", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "Campagne terrain" }), _jsxs("span", { className: "badge", children: [data?.total ?? 0, " entr\u00E9es"] })] }), _jsx("div", { className: "filter-bar", children: ['', ...Object.keys(CATEGORY_LABELS)].map(cat => (_jsx("button", { className: `filter-btn ${category === cat ? 'active' : ''}`, onClick: () => setCategory(cat), children: cat ? CATEGORY_LABELS[cat] : 'Tous' }, cat))) }), loading ? (_jsx("div", { className: "loading", children: "Chargement\u2026" })) : records.length === 0 ? (_jsx("div", { className: "empty-state", children: "Aucun rapport pour ce filtre." })) : (_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Cat\u00E9gorie" }), _jsx("th", { children: "D\u00E9partement" }), _jsx("th", { children: "Agent" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Donn\u00E9es" })] }) }), _jsx("tbody", { children: records.map(r => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("span", { className: "category-tag", style: { backgroundColor: CATEGORY_COLORS[r.category] ?? '#6b7280' }, children: CATEGORY_LABELS[r.category] ?? r.category }) }), _jsx("td", { children: r.regionName ?? r.regionId ?? '—' }), _jsx("td", { children: r.submittedBy ?? '—' }), _jsx("td", { children: new Date(r.submittedAt).toLocaleDateString('fr-FR') }), _jsx("td", { className: "data-preview", children: _jsx("pre", { children: r.summary?.slice(0, 120) ?? r.title ?? '—' }) })] }, r.id))) })] }) })), _jsx("style", { children: `
        .page-content { padding: 24px; }
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .badge { background: #1e3a5f; color: #60a5fa; border-radius: 20px; padding: 2px 10px; font-size: 13px; }
        .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #374151; background: #1c2333; color: #9ca3af; cursor: pointer; font-size: 13px; }
        .filter-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 10px 12px; color: #6b7280; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1f2937; }
        .data-table td { padding: 12px; border-bottom: 1px solid #1f2937; color: #d1d5db; font-size: 14px; }
        .category-tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #fff; font-weight: 600; }
        .data-preview pre { font-size: 11px; color: #6b7280; max-width: 300px; white-space: pre-wrap; }
      ` })] }));
}
