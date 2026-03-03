import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
export default function PollingReview() {
    const { data: rawData, loading } = useApi(() => dashboardApi.pollingReview(), []);
    const data = rawData;
    const regions = data?.regions ?? [];
    const breakdown = data?.breakdown ?? {};
    return (_jsxs("div", { className: "page-content", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "Sondages" }), data?.lastUpdated && (_jsxs("span", { className: "updated", children: ["Mis \u00E0 jour : ", new Date(data.lastUpdated).toLocaleString('fr-FR')] }))] }), loading ? _jsx("div", { className: "loading", children: "Chargement\u2026" }) : (_jsxs(_Fragment, { children: [data?.summary && _jsx("div", { className: "summary-box", children: data.summary }), data?.totalRespondents !== undefined && (_jsxs("div", { className: "total-box", children: [_jsx("span", { className: "total-label", children: "Total r\u00E9pondants :" }), _jsx("span", { className: "total-value", children: data.totalRespondents.toLocaleString('fr-FR') })] })), Object.keys(breakdown).length > 0 && (_jsxs(_Fragment, { children: [_jsx("h2", { className: "section-title", children: "Intentions de vote \u2014 National" }), _jsx("div", { className: "breakdown-list", children: Object.entries(breakdown).map(([option, count]) => {
                                    const pct = data?.totalRespondents ? Math.round((count / data.totalRespondents) * 100) : 0;
                                    return (_jsxs("div", { className: "breakdown-row", children: [_jsx("span", { className: "option-label", children: option }), _jsx("div", { className: "bar-container", children: _jsx("div", { className: "bar-fill", style: { width: `${pct}%` } }) }), _jsxs("span", { className: "pct-label", children: [pct, "%"] }), _jsxs("span", { className: "count-label", children: ["(", count, ")"] })] }, option));
                                }) })] })), regions.length > 0 && (_jsxs(_Fragment, { children: [_jsx("h2", { className: "section-title", children: "Par d\u00E9partement" }), _jsx("div", { className: "regions-grid", children: regions.map((r, i) => (_jsxs("div", { className: "region-card", children: [_jsx("div", { className: "region-name", children: r.departmentName ?? r.departmentId }), _jsxs("div", { className: "region-respondents", children: [r.respondents, " r\u00E9pondants"] }), r.breakdown && (_jsx("div", { className: "region-breakdown", children: Object.entries(r.breakdown).map(([opt, n]) => (_jsxs("div", { className: "region-row", children: [_jsx("span", { children: opt }), _jsx("strong", { children: n })] }, opt))) }))] }, i))) })] })), regions.length === 0 && Object.keys(breakdown).length === 0 && (_jsx("div", { className: "empty-state", children: "Aucune donn\u00E9e de sondage disponible." }))] })), _jsx("style", { children: `
        .page-content { padding: 24px; }
        .page-header { display: flex; align-items: baseline; gap: 16px; margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .updated { color: #6b7280; font-size: 13px; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .summary-box { background: #1c2333; border-left: 3px solid #7c3aed; padding: 12px 16px; color: #d1d5db; font-size: 14px; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
        .total-box { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .total-label { color: #9ca3af; font-size: 14px; }
        .total-value { font-size: 20px; font-weight: 700; color: #f1f5f9; }
        .section-title { font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; }
        .breakdown-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .breakdown-row { display: flex; align-items: center; gap: 10px; }
        .option-label { width: 180px; color: #d1d5db; font-size: 14px; flex-shrink: 0; }
        .bar-container { flex: 1; height: 8px; background: #1f2937; border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; background: #7c3aed; border-radius: 4px; transition: width 0.3s; }
        .pct-label { width: 40px; text-align: right; color: #f1f5f9; font-weight: 700; font-size: 14px; }
        .count-label { color: #6b7280; font-size: 12px; width: 60px; }
        .regions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .region-card { background: #1c2333; border-radius: 10px; padding: 14px; border: 1px solid #1f2937; }
        .region-name { font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
        .region-respondents { color: #6b7280; font-size: 12px; margin-bottom: 10px; }
        .region-breakdown { display: flex; flex-direction: column; gap: 4px; }
        .region-row { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; }
        .region-row strong { color: #f1f5f9; }
      ` })] }));
}
