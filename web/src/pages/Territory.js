import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { territoryApi } from '../api/campaign.api.js';
export default function Territory() {
    const { data, loading } = useApi(() => territoryApi.departments(), []);
    const [expanded, setExpanded] = useState(new Set());
    const departments = data?.departments ?? [];
    const toggle = (id) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    const totalArrondissements = departments.reduce((s, d) => s + (d.arrondissements?.length ?? 0), 0);
    const totalZones = departments.reduce((s, d) => s + (d.arrondissements ?? []).reduce((a, arr) => a + (arr.zones?.length ?? 0), 0), 0);
    return (_jsxs("div", { className: "page-content", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "Territoire" }), _jsxs("div", { className: "stats-row", children: [_jsxs("span", { className: "stat-chip", children: [departments.length, " d\u00E9partements"] }), _jsxs("span", { className: "stat-chip", children: [totalArrondissements, " arrondissements"] }), _jsxs("span", { className: "stat-chip", children: [totalZones, " zones"] })] })] }), loading ? _jsx("div", { className: "loading", children: "Chargement\u2026" }) : (_jsx("div", { className: "dep-list", children: departments.map(dep => (_jsxs("div", { className: "dep-card", children: [_jsxs("button", { className: "dep-header", onClick: () => toggle(dep.id ?? dep.name), children: [_jsx("span", { className: "dep-flag", children: "\uD83D\uDDFA\uFE0F" }), _jsx("span", { className: "dep-name", children: dep.name }), _jsxs("span", { className: "dep-count", children: [dep.arrondissements?.length ?? 0, " arrondissements"] }), _jsx("span", { className: "expand-icon", children: expanded.has(dep.id ?? dep.name) ? '▼' : '›' })] }), expanded.has(dep.id ?? dep.name) && dep.arrondissements && (_jsx("div", { className: "arr-list", children: dep.arrondissements.map(arr => (_jsxs("div", { className: "arr-item", children: [_jsx("span", { className: "arr-name", children: arr.name }), arr.zones && arr.zones.length > 0 && (_jsx("div", { className: "zones-list", children: arr.zones.map(z => (_jsx("span", { className: "zone-chip", children: z.name }, z.id ?? z.name))) }))] }, arr.id ?? arr.name))) }))] }, dep.id ?? dep.name))) })), _jsx("style", { children: `
        .page-content { padding: 24px; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0 0 12px; }
        .stats-row { display: flex; gap: 8px; }
        .stat-chip { background: #1c2333; border: 1px solid #374151; color: #9ca3af; padding: 4px 12px; border-radius: 20px; font-size: 13px; }
        .loading { color: #9ca3af; padding: 40px; text-align: center; }
        .dep-list { display: flex; flex-direction: column; gap: 8px; }
        .dep-card { background: #1c2333; border-radius: 10px; border: 1px solid #1f2937; overflow: hidden; }
        .dep-header { width: 100%; display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: none; border: none; cursor: pointer; text-align: left; }
        .dep-header:hover { background: #1f2937; }
        .dep-flag { font-size: 18px; }
        .dep-name { flex: 1; font-weight: 600; color: #f1f5f9; font-size: 15px; }
        .dep-count { color: #6b7280; font-size: 12px; }
        .expand-icon { color: #6b7280; font-size: 16px; }
        .arr-list { padding: 0 16px 16px 44px; display: flex; flex-direction: column; gap: 10px; }
        .arr-item { }
        .arr-name { color: #93c5fd; font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px; }
        .zones-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .zone-chip { background: #1f2937; color: #9ca3af; padding: 2px 10px; border-radius: 10px; font-size: 11px; }
      ` })] }));
}
