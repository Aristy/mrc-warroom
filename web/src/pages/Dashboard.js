import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useWS } from '../hooks/useWS.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
import CongoSVGMap from '../components/map/CongoSVGMap.js';
/* ─── Design tokens matching reference ─────────────────────────────── */
const T = {
    bg: '#07111f',
    bgAlt: '#0d1e30',
    panel: 'rgba(15,30,47,0.9)',
    border: 'rgba(41,74,108,0.82)',
    accent: '#00c8ff',
    green: '#00c853',
    orange: '#f0b429',
    red: '#e53935',
    text: '#ecf3fb',
    soft: '#bfd0e4',
    dim: '#89a4c3',
    fontDisplay: '"Bebas Neue", sans-serif',
    fontBody: '"DM Sans", sans-serif',
    fontMono: '"JetBrains Mono", monospace',
};
const RISK_COLOR = {
    normal: T.green, low: T.green, medium: T.orange, high: T.red, critical: '#7c3aed',
};
const RISK_LABEL = { low: 'Bas', medium: 'Moyen', high: 'Élevé', critical: 'Critique', normal: 'Bas' };
const panel = (extra) => ({
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: 18,
    boxShadow: '0 0 0 1px rgba(0,200,255,0.08), 0 16px 36px rgba(0,0,0,0.26)',
    padding: '18px 20px',
    ...extra,
});
const sectionTitle = (_color = T.accent) => ({
    margin: 0,
    fontFamily: T.fontDisplay,
    fontSize: '1.4rem',
    fontWeight: 400,
    letterSpacing: '0.035em',
    textTransform: 'uppercase',
    color: '#e0eeff',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
});
const accentBar = (color = T.accent) => ({
    display: 'inline-block',
    width: 28,
    height: 3,
    borderRadius: 999,
    background: color,
    boxShadow: `0 0 10px ${color}55`,
    flexShrink: 0,
});
function nowFR() {
    const d = new Date();
    return {
        date: d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
}
/* ─── KPI Cards ─────────────────────────────────────────────────────── */
function KpiCard({ title, color, bg, icon, children }) {
    return (_jsxs("div", { style: { position: 'relative', overflow: 'hidden', background: bg, border: `1px solid ${T.border}`, borderRadius: 18, padding: '18px 18px 16px', minHeight: 156 }, children: [_jsx("div", { style: { position: 'absolute', inset: 0, top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${color} 24%,transparent)`, pointerEvents: 'none' } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, children: [_jsx("span", { style: { fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color }, children: title }), _jsx("span", { style: { opacity: 0.75, fontSize: 16 }, children: icon })] }), children] }));
}
function KpiLine({ label, value }) {
    return (_jsxs("div", { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, margin: '8px 0' }, children: [_jsx("span", { style: { color: T.soft, fontSize: 12 }, children: label }), _jsx("strong", { style: { color: '#f7fbff', fontFamily: T.fontDisplay, fontSize: 'clamp(1.8rem,2.1vw,2.3rem)', lineHeight: 1, letterSpacing: '0.03em' }, children: value })] }));
}
function KpiMissions({ kpis }) {
    const pct = kpis.missions?.tauxRealisation ?? 0;
    return (_jsxs(KpiCard, { title: "KPIs Missions", color: T.green, bg: "linear-gradient(180deg,rgba(13,43,31,0.96),rgba(11,28,25,0.96))", icon: "\u2726", children: [_jsx(KpiLine, { label: "Objectif jour :", value: kpis.missions?.objectifJour ?? 0 }), _jsx(KpiLine, { label: "Missions engag\u00E9es :", value: kpis.missions?.missionsEngagees ?? 0 }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }, children: [_jsx("div", { style: { flex: 1, height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', width: `${Math.min(pct, 100)}%`, background: T.green, borderRadius: 999, boxShadow: '0 0 12px rgba(0,200,83,0.42)' } }) }), _jsxs("span", { style: { color: T.green, fontFamily: T.fontMono, fontSize: 11 }, children: [pct, "%"] })] })] }));
}
function KpiTerrain({ kpis }) {
    const done = kpis.terrain?.portesAPorte?.done ?? 0;
    const target = kpis.terrain?.portesAPorte?.target ?? 0;
    return (_jsxs(KpiCard, { title: "KPIs Terrain", color: T.accent, bg: "linear-gradient(180deg,rgba(11,33,49,0.96),rgba(10,25,39,0.96))", icon: "\u2691", children: [_jsx(KpiLine, { label: "Portes-\u00E0-porte :", value: `${done}/${target || '—'}` }), _jsx(KpiLine, { label: "Meetings confirm\u00E9s :", value: kpis.terrain?.meetingsConfirmes ?? 0 })] }));
}
function KpiDigital({ kpis }) {
    return (_jsxs(KpiCard, { title: "KPIs Digital", color: "#7fdcff", bg: "linear-gradient(180deg,rgba(15,30,47,0.98),rgba(11,24,38,0.98))", icon: "\uD83D\uDCF1", children: [_jsx(KpiLine, { label: "Vues vid\u00E9o :", value: (kpis.digital?.vuesVideo || 0).toLocaleString('fr-FR') }), _jsx(KpiLine, { label: "WhatsApp relay :", value: kpis.digital?.whatsappRelay ?? 0 })] }));
}
function KpiLogistique({ kpis }) {
    return (_jsxs(KpiCard, { title: "KPIs Logistique", color: T.orange, bg: "linear-gradient(180deg,rgba(47,31,12,0.96),rgba(32,21,11,0.96))", icon: "\uD83D\uDE9A", children: [_jsx(KpiLine, { label: "Transport pr\u00E9vu :", value: `${kpis.logistique?.transportPrevuCamions ?? 0} camions` }), _jsx(KpiLine, { label: "Risques (24h) :", value: kpis.logistique?.risques24h ?? 0 })] }));
}
/* ─── Priority Table ─────────────────────────────────────────────────── */
function TableauRegions({ priorities, regions }) {
    const rows = priorities.length > 0 ? priorities : regions.slice(0, 8).map(r => ({
        regionId: r.id, region: r.name, percent: 0, risk: r.stats?.risk ?? 'low', action: 'Suivi',
    }));
    return (_jsxs("div", { style: panel({ padding: 0, overflow: 'hidden' }), children: [_jsx("div", { style: { padding: '18px 20px 10px' }, children: _jsxs("h3", { style: sectionTitle(), children: [_jsx("span", { style: accentBar() }), "Tableau R\u00E9gions (Top priorit\u00E9s)"] }) }), _jsx("div", { style: { overflowX: 'auto', maxHeight: 400 }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', minWidth: 560 }, children: [_jsx("thead", { children: _jsx("tr", { style: { background: 'rgba(16,34,53,0.9)' }, children: ['Région', 'Resp.', 'Actifs', 'Obj.', '%', 'Risque', 'Action'].map(h => (_jsx("th", { style: { padding: '12px 14px', textAlign: 'left', color: T.soft, fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 1 }, children: h }, h))) }) }), _jsx("tbody", { children: rows.length === 0
                                ? _jsx("tr", { children: _jsx("td", { colSpan: 7, style: { padding: 18, textAlign: 'center', color: T.dim, fontFamily: T.fontBody }, children: "Aucune donn\u00E9e" }) })
                                : rows.map((p, i) => {
                                    const rc = RISK_COLOR[p.risk] || T.green;
                                    const reg = regions.find(r => r.id === p.regionId || r.name === p.region);
                                    return (_jsxs("tr", { style: { borderBottom: `1px solid rgba(41,74,108,0.36)`, cursor: 'pointer' }, onMouseEnter: e => (e.currentTarget.style.background = 'rgba(0,200,255,0.06)'), onMouseLeave: e => (e.currentTarget.style.background = 'transparent'), children: [_jsx("td", { style: { padding: '12px 14px', color: '#f0f8ff', fontSize: 12, fontWeight: 500 }, children: p.region }), _jsx("td", { style: { padding: '12px 14px', color: T.dim, fontSize: 12 }, children: "\u2014" }), _jsx("td", { style: { padding: '12px 14px', color: T.soft, fontSize: 12 }, children: reg?.stats?.agents ?? '—' }), _jsx("td", { style: { padding: '12px 14px', color: T.soft, fontSize: 12 }, children: reg?.stats?.missions ?? '—' }), _jsxs("td", { style: { padding: '12px 14px', color: '#fff', fontFamily: T.fontDisplay, fontSize: '1.1rem' }, children: [p.percent, "%"] }), _jsx("td", { style: { padding: '12px 14px' }, children: _jsx("span", { style: { background: rc + '28', color: rc, border: `1px solid ${rc}55`, borderRadius: 999, padding: '4px 10px', fontSize: 10, fontWeight: 600, fontFamily: T.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase' }, children: RISK_LABEL[p.risk] || p.risk }) }), _jsx("td", { style: { padding: '12px 14px' }, children: _jsx("button", { style: { background: 'transparent', color: T.accent, border: `1px solid rgba(0,200,255,0.32)`, borderRadius: 999, padding: '5px 12px', fontSize: 10, fontFamily: T.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }, children: p.action || 'Voir' }) })] }, i));
                                }) })] }) })] }));
}
/* ─── Adhésion Summary ──────────────────────────────────────────────── */
function AdhesionPanel({ campaign }) {
    const stats = [
        { label: 'Nouveaux adhérents', val: campaign.newAdherents, color: T.accent },
        { label: 'Rapports terrain', val: campaign.terrainReports, color: T.green },
        { label: 'Missions reportées', val: campaign.missionsReported, color: T.orange },
        { label: 'Sondage moyen', val: `${campaign.pollingAverage}%`, color: '#a78bfa' },
    ];
    return (_jsxs("div", { style: panel({ padding: '18px 20px' }), children: [_jsxs("h3", { style: { ...sectionTitle(), marginBottom: 14 }, children: [_jsx("span", { style: accentBar() }), "Adh\u00E9sion MRC"] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }, children: stats.map(s => (_jsxs("div", { style: { background: 'rgba(16,34,53,0.7)', border: `1px solid rgba(41,74,108,0.45)`, borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 3 }, children: [_jsx("span", { style: { fontSize: 22, fontWeight: 400, color: s.color, fontFamily: T.fontDisplay }, children: s.val }), _jsx("span", { style: { fontSize: 10, color: T.dim, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.08em' }, children: s.label })] }, s.label))) }), _jsxs("div", { style: { marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("span", { style: { fontSize: 11, color: T.dim, fontFamily: T.fontBody }, children: ["Publi\u00E9 aujourd'hui : ", _jsx("strong", { style: { color: T.soft }, children: campaign.publishedToday })] }), _jsx("a", { href: "/members", style: { fontSize: 10, color: T.accent, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }, children: "Voir fiches \u2192" })] })] }));
}
/* ─── Analytics Charts ───────────────────────────────────────────────── */
const CHART_PANEL = {
    ...panel({ padding: '16px 18px' }),
    background: 'radial-gradient(circle at 78% 0%,rgba(0,200,255,0.08),transparent 40%), linear-gradient(180deg,rgba(17,30,50,0.92),rgba(11,22,39,0.96))',
};
function ChartActivite({ regions }) {
    const data = regions.slice(0, 8).map(r => ({ name: r.name.split(' ')[0], missions: r.stats?.missions ?? 0, incidents: r.stats?.incidents ?? 0 }));
    return (_jsxs("div", { style: CHART_PANEL, children: [_jsxs("h3", { style: sectionTitle(), children: [_jsx("span", { style: accentBar() }), "Activit\u00E9 R\u00E9gionale"] }), data.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: data, barGap: 2, barCategoryGap: "30%", children: [_jsx(XAxis, { dataKey: "name", tick: { fill: T.dim, fontSize: 10, fontFamily: T.fontBody }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fill: T.dim, fontSize: 10 }, axisLine: false, tickLine: false, width: 24 }), _jsx(Tooltip, { contentStyle: { background: '#0d1e30', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text, fontFamily: T.fontBody }, cursor: { fill: 'rgba(0,200,255,0.06)' } }), _jsx(Bar, { dataKey: "missions", name: "Missions", fill: "#2563eb", radius: [3, 3, 0, 0] }), _jsx(Bar, { dataKey: "incidents", name: "Incidents", fill: T.red, radius: [3, 3, 0, 0] })] }) })) : (_jsx("div", { style: { minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(135,164,202,0.24)', borderRadius: 14, color: T.dim, fontSize: 12 }, children: "Aucune donn\u00E9e r\u00E9gionale" }))] }));
}
function ChartRisques({ regions }) {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    regions.forEach(r => { const k = r.stats?.risk ?? 'low'; counts[k] = (counts[k] ?? 0) + 1; });
    const data = [
        { name: 'Bas', value: counts.low + counts.normal, color: T.green },
        { name: 'Moyen', value: counts.medium, color: T.orange },
        { name: 'Élevé', value: counts.high, color: T.red },
        { name: 'Critique', value: counts.critical, color: '#7c3aed' },
    ].filter(d => d.value > 0);
    return (_jsxs("div", { style: CHART_PANEL, children: [_jsxs("h3", { style: sectionTitle(), children: [_jsx("span", { style: accentBar(T.orange) }), "R\u00E9partition des Risques"] }), data.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "45%", outerRadius: 72, dataKey: "value", strokeWidth: 2, stroke: T.bgAlt, children: data.map((d, i) => _jsx(Cell, { fill: d.color }, i)) }), _jsx(Tooltip, { contentStyle: { background: '#0d1e30', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text } }), _jsx(Legend, { iconType: "circle", iconSize: 9, wrapperStyle: { fontSize: 11, color: T.soft, fontFamily: T.fontBody } })] }) })) : (_jsx("div", { style: { minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(135,164,202,0.24)', borderRadius: 14, color: T.dim, fontSize: 12 }, children: "Aucune donn\u00E9e" }))] }));
}
function ChartSondages({ regions }) {
    const data = regions.slice(0, 6).map(r => ({ name: r.name.split(' ')[0], score: Math.round(Math.random() * 40 + 30) }));
    return (_jsxs("div", { style: CHART_PANEL, children: [_jsxs("h3", { style: sectionTitle(), children: [_jsx("span", { style: accentBar('#a78bfa') }), "Sondages Complets"] }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: data, layout: "vertical", barCategoryGap: "25%", children: [_jsx(XAxis, { type: "number", domain: [0, 100], tick: { fill: T.dim, fontSize: 10 }, axisLine: false, tickLine: false }), _jsx(YAxis, { type: "category", dataKey: "name", tick: { fill: T.soft, fontSize: 10 }, axisLine: false, tickLine: false, width: 56 }), _jsx(Tooltip, { contentStyle: { background: '#0d1e30', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text }, cursor: { fill: 'rgba(167,139,250,0.07)' } }), _jsx(Bar, { dataKey: "score", fill: "#a78bfa", radius: [0, 3, 3, 0] })] }) })] }));
}
function ChartCanaux() {
    const data = [
        { name: 'Terrain', value: 38, color: T.green },
        { name: 'Digital', value: 27, color: T.accent },
        { name: 'Médias', value: 18, color: T.orange },
        { name: 'Meetings', value: 17, color: '#f472b6' },
    ];
    return (_jsxs("div", { style: CHART_PANEL, children: [_jsxs("h3", { style: sectionTitle(), children: [_jsx("span", { style: accentBar(T.green) }), "Canaux de Campagne"] }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "45%", innerRadius: 46, outerRadius: 72, dataKey: "value", strokeWidth: 2, stroke: T.bgAlt, children: data.map((d, i) => _jsx(Cell, { fill: d.color }, i)) }), _jsx(Tooltip, { contentStyle: { background: '#0d1e30', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text } }), _jsx(Legend, { iconType: "circle", iconSize: 9, wrapperStyle: { fontSize: 11, color: T.soft, fontFamily: T.fontBody } })] }) })] }));
}
/* ─── Incidents ──────────────────────────────────────────────────────── */
function JournalIncidents({ incidents }) {
    return (_jsxs("div", { style: panel({ padding: 0, overflow: 'hidden' }), children: [_jsx("div", { style: { padding: '18px 20px 10px' }, children: _jsxs("h3", { style: sectionTitle(), children: [_jsx("span", { style: accentBar(T.red) }), "Journal Incidents & R\u00E9ponse (24h)"] }) }), _jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', minWidth: 500 }, children: [_jsx("thead", { children: _jsx("tr", { style: { background: 'rgba(16,34,53,0.9)' }, children: ['Heure', 'Lieu', 'Type', 'Gravité', 'Responsable', 'Statut'].map(h => (_jsx("th", { style: { padding: '11px 14px', textAlign: 'left', color: T.soft, fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }, children: h }, h))) }) }), _jsx("tbody", { children: incidents.length === 0
                                ? _jsx("tr", { children: _jsx("td", { colSpan: 6, style: { padding: 18, textAlign: 'center', color: T.dim, fontSize: 12 }, children: "Aucun incident (24h)" }) })
                                : incidents.slice(0, 6).map((inc, i) => {
                                    const gc = RISK_COLOR[(inc.gravite || '').toLowerCase()] || T.orange;
                                    return (_jsxs("tr", { style: { borderBottom: `1px solid rgba(41,74,108,0.3)` }, children: [_jsx("td", { style: { padding: '11px 14px', color: T.accent, fontFamily: T.fontMono, fontSize: 11 }, children: inc.heure }), _jsx("td", { style: { padding: '11px 14px', color: T.soft, fontSize: 12 }, children: inc.lieu }), _jsx("td", { style: { padding: '11px 14px', color: T.text, fontSize: 12 }, children: inc.type }), _jsx("td", { style: { padding: '11px 14px' }, children: _jsx("span", { style: { background: gc + '28', color: gc, border: `1px solid ${gc}55`, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontFamily: T.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase' }, children: inc.gravite }) }), _jsx("td", { style: { padding: '11px 14px', color: T.dim, fontSize: 12 }, children: "\u2014" }), _jsx("td", { style: { padding: '11px 14px' }, children: _jsx("span", { style: { background: 'rgba(0,200,83,0.16)', color: T.green, border: `1px solid rgba(0,200,83,0.32)`, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontFamily: T.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase' }, children: inc.statut }) })] }, i));
                                }) })] }) })] }));
}
/* ─── Calendrier ─────────────────────────────────────────────────────── */
function Calendrier({ items }) {
    return (_jsxs("div", { style: panel(), children: [_jsxs("h3", { style: sectionTitle(), children: [_jsx("span", { style: accentBar(T.accent) }), "Calendrier Contenu (Aujourd'hui)"] }), items.length === 0
                ? _jsx("div", { style: { color: T.dim, fontSize: 12, textAlign: 'center', padding: '16px 0' }, children: "Aucun \u00E9l\u00E9ment planifi\u00E9" })
                : items.map((it, i) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 10, padding: '9px 0', borderBottom: `1px solid rgba(30,58,95,0.4)`, alignItems: 'start' }, children: [_jsx("span", { style: { color: T.accent, fontFamily: T.fontMono, fontSize: 11 }, children: it.time }), _jsxs("div", { children: [_jsx("div", { style: { color: '#e2efff', fontSize: 12 }, children: it.type }), it.lieu && _jsxs("div", { style: { color: T.dim, fontSize: 11, marginTop: 2 }, children: [it.lieu, it.responsable ? ` · ${it.responsable}` : ''] })] })] }, i)))] }));
}
/* ─── Programme Candidat ────────────────────────────────────────────── */
const TODAY = new Date().toISOString().slice(0, 10);
const TYPE_META = {
    visite: { icon: '📍', color: T.accent, label: 'Visite' },
    nuit: { icon: '🌙', color: '#a78bfa', label: 'Nuit' },
    retour: { icon: '🏠', color: T.green, label: 'Retour BZV' },
};
function ProgrammeCandidatPanel({ stops }) {
    // Group by date
    const byDate = {};
    stops.forEach(s => { var _a; (byDate[_a = s.date] ?? (byDate[_a] = [])).push(s); });
    const dates = Object.keys(byDate).sort();
    const fmtDate = (d) => {
        const dt = new Date(d + 'T12:00:00');
        return dt.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    };
    return (_jsxs("div", { style: panel({ padding: '18px 20px' }), children: [_jsxs("h3", { style: { ...sectionTitle(), marginBottom: 14 }, children: [_jsx("span", { style: accentBar('#c9a84c') }), "Programme Candidat \u2014 Tourn\u00E9e nationale"] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 0 }, children: dates.map((date, di) => {
                    const dayStops = byDate[date];
                    const isToday = date === TODAY;
                    const isPast = date < TODAY;
                    return (_jsxs("div", { style: { display: 'flex', gap: 0, position: 'relative' }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }, children: [_jsx("div", { style: {
                                            width: isToday ? 14 : 10, height: isToday ? 14 : 10,
                                            borderRadius: '50%', marginTop: 12, flexShrink: 0, zIndex: 1,
                                            background: isToday ? '#c9a84c' : isPast ? T.dim : T.accent,
                                            boxShadow: isToday ? '0 0 10px rgba(201,168,76,0.7)' : 'none',
                                            border: isToday ? '2px solid #ffd740' : `2px solid ${isPast ? '#374151' : T.border}`,
                                        } }), di < dates.length - 1 && (_jsx("div", { style: { width: 2, flex: 1, minHeight: 20, background: isPast ? '#1f2d40' : 'rgba(41,74,108,0.5)', marginTop: 2 } }))] }), _jsxs("div", { style: { flex: 1, padding: '8px 0 10px 10px', borderBottom: di < dates.length - 1 ? '1px solid rgba(41,74,108,0.2)' : 'none' }, children: [_jsxs("div", { style: { fontSize: 11, fontWeight: 700, color: isToday ? '#c9a84c' : isPast ? T.dim : T.soft, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }, children: [fmtDate(date), isToday && _jsx("span", { style: { background: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44', borderRadius: 4, padding: '1px 6px', fontSize: 9, letterSpacing: '0.1em' }, children: "AUJOURD'HUI" })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 3 }, children: dayStops.map((s, si) => {
                                            const meta = TYPE_META[s.type] || TYPE_META.visite;
                                            return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 13 }, children: meta.icon }), _jsx("span", { style: { fontSize: 13, fontWeight: 600, color: isPast ? T.dim : '#f0f8ff' }, children: s.lieu }), _jsx("span", { style: { fontSize: 11, color: T.dim }, children: "\u00B7" }), _jsx("span", { style: { fontSize: 11, color: T.dim }, children: s.departement }), _jsx("span", { style: { marginLeft: 'auto', fontSize: 10, color: meta.color, fontFamily: T.fontMono, textTransform: 'uppercase', background: meta.color + '18', padding: '1px 7px', borderRadius: 4, border: `1px solid ${meta.color}33` }, children: meta.label })] }, si));
                                        }) })] })] }, date));
                }) })] }));
}
/* ─── Main Dashboard ─────────────────────────────────────────────────── */
export default function Dashboard() {
    const { data: initial } = useApi(() => dashboardApi.warRoom(), []);
    const [live, setLive] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [clock, setClock] = useState(nowFR());
    useEffect(() => {
        const id = setInterval(() => setClock(nowFR()), 60000);
        return () => clearInterval(id);
    }, []);
    const handleMsg = useCallback((msg) => {
        if (msg.type === 'connected') {
            setWsConnected(true);
            return;
        }
        if (msg.type === 'war-room-update') {
            setLive(msg.payload);
        }
    }, []);
    useWS('war-room', handleMsg);
    const data = (live || initial);
    if (!data)
        return (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: T.dim, fontFamily: T.fontBody }, children: "Chargement du War Room\u2026" }));
    const { kpis, map, priorities = [], incidents24h = [], calendarToday = [], alert } = data;
    if (!kpis || !map || !alert)
        return (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: T.dim, fontFamily: T.fontBody }, children: "Initialisation des donn\u00E9es\u2026" }));
    const alertLevel = alert.level ?? 'normal';
    const ALERT_PILLS = [
        { level: 'normal', label: 'Normal', color: T.green },
        { level: 'medium', label: 'Vigilance', color: T.orange },
        { level: 'critical', label: 'Crise', color: T.red },
    ];
    return (_jsxs("div", { style: { padding: '0 20px 32px', fontFamily: T.fontBody, color: T.text }, children: [_jsxs("div", { style: {
                    ...panel({ borderRadius: 18, padding: '16px 22px', marginBottom: 14, marginTop: 4 }),
                    background: 'linear-gradient(180deg,rgba(19,40,64,0.72),rgba(12,27,43,0.84))',
                    backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap',
                }, children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }, children: [_jsx("img", { src: "/flag.png", alt: "Congo", style: { width: 38, height: 26, borderRadius: 7, objectFit: 'cover', border: '1px solid rgba(164,202,255,0.28)', boxShadow: '0 10px 24px rgba(0,0,0,0.24)' } }), _jsx("span", { style: { color: T.soft, fontFamily: T.fontMono, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }, children: "Republique du Congo" })] }), _jsxs("h1", { style: { margin: 0, fontFamily: T.fontDisplay, fontSize: 'clamp(1.8rem,2.1vw,2.45rem)', fontWeight: 400, letterSpacing: '0.045em', color: '#e8f2ff', lineHeight: 0.95 }, children: ["OPERATIONS WAR ROOM ", _jsx("span", { style: { color: T.accent }, children: "DASHBOARD" })] }), _jsx("p", { style: { margin: '8px 0 0', color: T.soft, fontFamily: T.fontMono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }, children: "(Vue nationale)" })] }), _jsxs("div", { style: { display: 'grid', gap: 10, justifyItems: 'end' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }, children: [_jsxs("span", { style: { color: T.soft, fontSize: 12 }, children: ["Date: ", _jsx("strong", { style: { color: T.accent, fontFamily: T.fontMono, fontWeight: 400 }, children: clock.date })] }), _jsxs("span", { style: { color: T.soft, fontSize: 12 }, children: ["Heure: ", _jsx("strong", { style: { color: T.accent, fontFamily: T.fontMono, fontWeight: 400 }, children: clock.time })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }, children: [_jsx("span", { style: { color: T.soft, fontSize: 12 }, children: "Alerte:" }), ALERT_PILLS.map(({ level, label, color }) => {
                                        const active = alertLevel === level;
                                        return (_jsx("span", { style: { padding: '6px 14px', borderRadius: 999, border: `1px solid ${active ? color + '66' : 'rgba(82,122,168,0.24)'}`, background: active ? color + '22' : 'rgba(255,255,255,0.03)', color: active ? color : T.soft, fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: active ? `0 8px 20px ${color}22` : 'none' }, children: label }, level));
                                    }), _jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: wsConnected ? T.green : T.orange, marginLeft: 6 }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: '50%', background: wsConnected ? T.green : T.orange, display: 'inline-block' } }), wsConnected ? 'Temps réel' : 'Hors-ligne'] })] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 14 }, children: [_jsx(KpiMissions, { kpis: kpis }), _jsx(KpiTerrain, { kpis: kpis }), _jsx(KpiDigital, { kpis: kpis }), _jsx(KpiLogistique, { kpis: kpis })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(360px,0.85fr)', gap: 14, alignItems: 'start' }, children: [_jsxs("div", { style: { display: 'grid', gap: 14 }, children: [_jsx(CongoSVGMap, { regions: map.regions ?? [], actionDuJour: map.actionDuJour, zonesChaudes: map.zonesChaudes, zonesFaibles: map.zonesFaibles }), _jsx(TableauRegions, { priorities: priorities, regions: map.regions ?? [] }), _jsx(AdhesionPanel, { campaign: data.campaign ?? { newAdherents: 0, terrainReports: 0, missionsReported: 0, pollingAverage: 0, publishedToday: 0, totalPublished: 0, digitalEntries: 0, incidentEntries: 0 } })] }), _jsxs("div", { style: { display: 'grid', gap: 14 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }, children: [_jsx(ChartActivite, { regions: map.regions ?? [] }), _jsx(ChartRisques, { regions: map.regions ?? [] }), _jsx(ChartSondages, { regions: map.regions ?? [] }), _jsx(ChartCanaux, {})] }), _jsx(JournalIncidents, { incidents: incidents24h }), _jsx(Calendrier, { items: calendarToday }), data.candidateProgramme && data.candidateProgramme.length > 0 && (_jsx(ProgrammeCandidatPanel, { stops: data.candidateProgramme }))] })] }), _jsxs("div", { style: {
                    ...panel({ padding: '14px 20px', marginTop: 14 }),
                    background: 'linear-gradient(180deg,rgba(19,40,64,0.72),rgba(12,27,43,0.84))',
                    backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap',
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }, children: [_jsx("strong", { style: { color: '#e0eeff', fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }, children: "Activit\u00E9s Priorit\u00E9 & War Room" }), calendarToday.slice(0, 3).map((it, i) => (_jsxs("span", { style: { color: T.accent, fontFamily: T.fontMono, fontSize: 11 }, children: ["\u23F1 ", it.time, " ", it.type] }, i)))] }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 10 }, children: [[
                                { label: 'Rapport terrain', href: '/territory' },
                                { label: 'Évènements', href: '/events' },
                                { label: 'Territoire', href: '/territory' },
                                { label: 'Vue candidat', href: '/candidate' },
                                { label: 'Système', href: '/admin' },
                            ].map(btn => (_jsx("a", { href: btn.href, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 16px', border: `1px solid rgba(0,200,255,0.28)`, borderRadius: 12, background: 'rgba(0,200,255,0.04)', color: '#d7ebfb', fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }, children: btn.label }, btn.label))), _jsx("button", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 16px', border: '0', borderRadius: 12, background: T.green, color: '#02130a', fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 12px 26px rgba(0,200,83,0.22)` }, children: "Cr\u00E9er alerte" }), _jsx("button", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 16px', border: '0', borderRadius: 12, background: T.orange, color: '#251500', fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 12px 26px rgba(240,180,41,0.22)` }, children: "Valider r\u00E9ponse" }), _jsx("button", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 16px', border: '0', borderRadius: 12, background: '#e35a2f', color: '#fff', fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 12px 26px rgba(227,90,47,0.22)` }, children: "Exporter rapport" })] })] })] }));
}
