import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWS } from '../hooks/useWS.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
import CongoSVGMap from '../components/map/CongoSVGMap.js';
const ALERT_COLOR = {
    normal: '#22c55e', low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed',
};
const RISK_LABEL = { low: 'Bas', medium: 'Moyen', high: 'Haut', critical: 'Critique', normal: 'Bas' };
function nowFR() {
    const d = new Date();
    return {
        date: d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
}
function KpiMissions({ kpis }) {
    const pct = kpis.missions?.tauxRealisation ?? 0;
    return (_jsxs("div", { style: { background: 'linear-gradient(135deg,#0d2b1e,#0f3d28)', border: '1px solid #1a5c38', borderRadius: 10, padding: '14px 18px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }, children: [_jsx("span", { style: { fontSize: 16 }, children: "\uD83C\uDFAF" }), _jsx("span", { style: { fontWeight: 700, fontSize: 13, color: '#4ade80' }, children: "KPIs Missions" })] }), _jsxs("div", { style: { fontSize: 12, color: '#86efac', marginBottom: 2 }, children: ["Objectif jour : ", _jsx("strong", { style: { color: '#f0fdf4' }, children: kpis.missions?.objectifJour ?? 0 })] }), _jsxs("div", { style: { fontSize: 12, color: '#86efac', marginBottom: 8 }, children: ["Missions engag\u00E9es : ", _jsx("strong", { style: { color: '#f0fdf4' }, children: kpis.missions?.missionsEngagees ?? 0 })] }), _jsx("div", { style: { height: 6, background: '#1a5c38', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }, children: _jsx("div", { style: { height: '100%', width: `${Math.min(pct, 100)}%`, background: '#22c55e', borderRadius: 3 } }) }), _jsxs("div", { style: { fontSize: 26, fontWeight: 800, color: '#4ade80' }, children: [pct, "%"] })] }));
}
function KpiTerrain({ kpis }) {
    const done = kpis.terrain?.portesAPorte?.done ?? 0;
    const target = kpis.terrain?.portesAPorte?.target ?? 0;
    return (_jsxs("div", { style: { background: 'linear-gradient(135deg,#0d1f3c,#0f2d5c)', border: '1px solid #1a3a7c', borderRadius: 10, padding: '14px 18px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }, children: [_jsx("span", { style: { fontSize: 16 }, children: "\uD83D\uDEB6" }), _jsx("span", { style: { fontWeight: 700, fontSize: 13, color: '#60a5fa' }, children: "KPIs Terrain" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#93c5fd', marginBottom: 8 }, children: [_jsx("span", { children: "Portes-\u00E0-porte :" }), _jsxs("strong", { style: { color: '#fff', fontSize: 18 }, children: [done, "/", target || '—'] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#93c5fd' }, children: [_jsx("span", { children: "Meetings confirm\u00E9s :" }), _jsx("strong", { style: { color: '#fff', fontSize: 18 }, children: kpis.terrain?.meetingsConfirmes ?? 0 })] })] }));
}
function KpiDigital({ kpis }) {
    return (_jsxs("div", { style: { background: 'linear-gradient(135deg,#0d2d3c,#0f3d4c)', border: '1px solid #1a5c6c', borderRadius: 10, padding: '14px 18px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }, children: [_jsx("span", { style: { fontSize: 16 }, children: "\uD83D\uDCF1" }), _jsx("span", { style: { fontWeight: 700, fontSize: 13, color: '#22d3ee' }, children: "KPIs Digital" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#67e8f9', marginBottom: 8 }, children: [_jsx("span", { children: "Vues vid\u00E9o :" }), _jsx("strong", { style: { color: '#fff', fontSize: 18 }, children: (kpis.digital?.vuesVideo || 0).toLocaleString('fr-FR') })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#67e8f9' }, children: [_jsx("span", { children: "WhatsApp relay :" }), _jsx("strong", { style: { color: '#fff', fontSize: 18 }, children: kpis.digital?.whatsappRelay ?? 0 })] })] }));
}
function KpiLogistique({ kpis }) {
    return (_jsxs("div", { style: { background: 'linear-gradient(135deg,#2d1a00,#3d2600)', border: '1px solid #7c4a00', borderRadius: 10, padding: '14px 18px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }, children: [_jsx("span", { style: { fontSize: 16 }, children: "\uD83D\uDE9A" }), _jsx("span", { style: { fontWeight: 700, fontSize: 13, color: '#fb923c' }, children: "KPIs Logistique" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#fdba74', marginBottom: 8 }, children: [_jsx("span", { children: "Transport pr\u00E9vu :" }), _jsxs("strong", { style: { color: '#fff', fontSize: 18 }, children: [kpis.logistique?.transportPrevuCamions ?? 0, " Camions"] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#fdba74' }, children: [_jsx("span", { children: "Risques (24h) :" }), _jsx("strong", { style: { color: '#fff', fontSize: 18 }, children: kpis.logistique?.risques24h ?? 0 })] })] }));
}
function TableauRegions({ priorities, regions }) {
    const rows = priorities.length > 0 ? priorities : regions.slice(0, 6).map(r => ({
        regionId: r.id, region: r.name, percent: 0, risk: r.stats?.risk ?? 'low', action: 'Suivi',
    }));
    return (_jsxs("div", { style: { background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 16 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 10 }, children: "Tableau R\u00E9gions (Top priorit\u00E9s)" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 }, children: [_jsx("thead", { children: _jsx("tr", { style: { borderBottom: '1px solid #1f2937' }, children: ['Region', 'Actifs', 'Objectif', '%', 'Risque', 'Action'].map(h => (_jsx("th", { style: { padding: '5px 6px', textAlign: h === 'Region' ? 'left' : 'center', color: '#6b7280', fontWeight: 600 }, children: h }, h))) }) }), _jsx("tbody", { children: rows.length === 0
                            ? _jsx("tr", { children: _jsx("td", { colSpan: 6, style: { padding: 16, textAlign: 'center', color: '#4b5563' }, children: "Aucune donn\u00E9e" }) })
                            : rows.map((p, i) => {
                                const rc = ALERT_COLOR[p.risk] || '#22c55e';
                                const reg = regions.find(r => r.id === p.regionId || r.name === p.region);
                                return (_jsxs("tr", { style: { borderBottom: '1px solid #1f293760' }, children: [_jsx("td", { style: { padding: '7px 6px', color: '#d1d5db', fontWeight: 500 }, children: p.region }), _jsx("td", { style: { padding: '7px 6px', textAlign: 'center', color: '#9ca3af' }, children: reg?.stats?.agents ?? '—' }), _jsx("td", { style: { padding: '7px 6px', textAlign: 'center', color: '#9ca3af' }, children: reg?.stats?.missions ?? '—' }), _jsxs("td", { style: { padding: '7px 6px', textAlign: 'center', fontWeight: 700, color: '#e8eaf0' }, children: [p.percent, "%"] }), _jsx("td", { style: { padding: '7px 6px', textAlign: 'center' }, children: _jsx("span", { style: { background: rc + '22', color: rc, borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 600 }, children: RISK_LABEL[p.risk] || p.risk }) }), _jsx("td", { style: { padding: '7px 6px', textAlign: 'center' }, children: _jsx("button", { style: { background: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e', borderRadius: 5, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }, children: p.action || 'Voir' }) })] }, i));
                            }) })] })] }));
}
function JournalIncidents({ incidents }) {
    return (_jsxs("div", { style: { background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 16 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 10 }, children: "Journal Incidents & R\u00E9ponse (24h)" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 }, children: [_jsx("thead", { children: _jsx("tr", { style: { borderBottom: '1px solid #1f2937' }, children: ['Heure', 'Lieu', 'Type', 'Gravité', 'Statut'].map(h => (_jsx("th", { style: { padding: '5px 6px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }, children: h }, h))) }) }), _jsx("tbody", { children: incidents.length === 0
                            ? _jsx("tr", { children: _jsx("td", { colSpan: 5, style: { padding: 16, textAlign: 'center', color: '#4b5563' }, children: "Aucun incident (24h)" }) })
                            : incidents.slice(0, 6).map((inc, i) => {
                                const gc = ALERT_COLOR[(inc.gravite || '').toLowerCase()] || '#f59e0b';
                                return (_jsxs("tr", { style: { borderBottom: '1px solid #1f293760' }, children: [_jsx("td", { style: { padding: '6px 6px', color: '#9ca3af' }, children: inc.heure }), _jsx("td", { style: { padding: '6px 6px', color: '#d1d5db' }, children: inc.lieu }), _jsx("td", { style: { padding: '6px 6px', color: '#d1d5db' }, children: inc.type }), _jsx("td", { style: { padding: '6px 6px' }, children: _jsx("span", { style: { background: gc + '22', color: gc, borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 600 }, children: inc.gravite }) }), _jsx("td", { style: { padding: '6px 6px' }, children: _jsx("span", { style: { background: '#22c55e22', color: '#22c55e', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 600 }, children: inc.statut }) })] }, i));
                            }) })] })] }));
}
function Calendrier({ items }) {
    return (_jsxs("div", { style: { background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 16 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 10 }, children: "Calendrier Contenu (Aujourd'hui)" }), items.length === 0
                ? _jsx("div", { style: { color: '#4b5563', fontSize: 13, textAlign: 'center', padding: 16 }, children: "Aucun \u00E9l\u00E9ment planifi\u00E9" })
                : items.map((it, i) => (_jsxs("div", { style: { display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid #1f293760', alignItems: 'flex-start' }, children: [_jsx("span", { style: { color: '#60a5fa', fontWeight: 700, fontSize: 13, flexShrink: 0, minWidth: 42 }, children: it.time }), _jsxs("div", { children: [_jsx("div", { style: { color: '#d1d5db', fontSize: 13 }, children: it.type }), it.lieu && _jsxs("div", { style: { color: '#6b7280', fontSize: 11 }, children: [it.lieu, it.responsable ? ` · ${it.responsable}` : ''] })] })] }, i)))] }));
}
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
        return (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#8b8fa8' }, children: "Chargement du War Room\u2026" }));
    const { kpis, map, priorities = [], incidents24h = [], calendarToday = [], alert } = data;
    if (!kpis || !map || !alert)
        return (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#8b8fa8' }, children: "Initialisation des donn\u00E9es\u2026" }));
    const alertLevel = alert.level ?? 'normal';
    const PILLS = [
        { level: 'normal', label: 'Normal' },
        { level: 'medium', label: 'Vigilance' },
        { level: 'critical', label: 'Crise' },
    ];
    return (_jsxs("div", { style: { padding: '0 20px 32px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px', borderBottom: '1px solid #1f2937', marginBottom: 16 }, children: [_jsxs("div", { children: [_jsxs("div", { style: { fontSize: 18, fontWeight: 800, color: '#e8eaf0' }, children: ["OPERATIONS WAR ROOM ", _jsx("span", { style: { color: '#60a5fa' }, children: "DASHBOARD" }), _jsx("span", { style: { color: '#6b7280', fontWeight: 400, fontSize: 13 }, children: " (Vue nationale)" })] }), _jsxs("div", { style: { fontSize: 11, color: '#6b7280', marginTop: 3 }, children: ["Date : ", clock.date, " \u00A0|\u00A0 Heure : ", clock.time] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 12, color: '#6b7280' }, children: "Alerte :" }), PILLS.map(({ level, label }) => {
                                const c = ALERT_COLOR[level];
                                const active = alertLevel === level;
                                return (_jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: `1px solid ${active ? c : '#3a3d4a'}`, background: active ? c + '22' : 'transparent', color: active ? c : '#8b8fa8', fontSize: 12, fontWeight: 600 }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: '50%', background: active ? c : '#3a3d4a', display: 'inline-block' } }), label] }, level));
                            }), _jsxs("span", { style: { marginLeft: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: wsConnected ? '#22c55e' : '#f59e0b' }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: '50%', background: wsConnected ? '#22c55e' : '#f59e0b', display: 'inline-block' } }), wsConnected ? 'Temps réel' : 'Hors-ligne'] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }, children: [_jsx(KpiMissions, { kpis: kpis }), _jsx(KpiTerrain, { kpis: kpis }), _jsx(KpiDigital, { kpis: kpis }), _jsx(KpiLogistique, { kpis: kpis })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12, marginBottom: 12 }, children: [_jsx(CongoSVGMap, { regions: map.regions ?? [], actionDuJour: map.actionDuJour, zonesChaudes: map.zonesChaudes, zonesFaibles: map.zonesFaibles }), _jsx(TableauRegions, { priorities: priorities, regions: map.regions ?? [] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }, children: [_jsx(JournalIncidents, { incidents: incidents24h }), _jsx(Calendrier, { items: calendarToday })] }), map.regions && map.regions.length > 0 && (_jsxs("div", { style: { background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 16, marginBottom: 14 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 14 }, children: "Analyse R\u00E9gionale \u2014 Missions & Incidents" }), _jsx(ResponsiveContainer, { width: "100%", height: 160, children: _jsxs(BarChart, { data: map.regions.map(r => ({ name: r.name.split(' ')[0], missions: r.stats?.missions ?? 0, incidents: r.stats?.incidents ?? 0 })), barGap: 4, barCategoryGap: "25%", children: [_jsx(XAxis, { dataKey: "name", tick: { fill: '#6b7280', fontSize: 10 }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fill: '#6b7280', fontSize: 10 }, axisLine: false, tickLine: false, width: 24 }), _jsx(Tooltip, { contentStyle: { background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 6, fontSize: 12, color: '#e8eaf0' }, cursor: { fill: '#ffffff08' } }), _jsx(Bar, { dataKey: "missions", name: "Missions", fill: "#2563eb", radius: [3, 3, 0, 0] }), _jsx(Bar, { dataKey: "incidents", name: "Incidents", fill: "#dc2626", radius: [3, 3, 0, 0] })] }) })] })), _jsxs("div", { style: { background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { style: { fontSize: 13, fontWeight: 600, color: '#e8eaf0', display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("span", { children: "Activit\u00E9s Priorit\u00E9 & War Room" }), calendarToday.slice(0, 3).map((it, i) => (_jsxs("span", { style: { fontSize: 11, color: '#6b7280' }, children: ["\u23F1 ", it.time, " ", it.type] }, i)))] }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: [
                            { label: '▶ Créer alerte', bg: '#166534', color: '#4ade80', border: '#166534' },
                            { label: '▶ Valider réponse', bg: '#1e3a5f', color: '#60a5fa', border: '#2d5a8e' },
                            { label: 'Exporter rapport', bg: '#7c2d12', color: '#fb923c', border: '#9a3412' },
                            { label: 'Voir détail (Incidents)', bg: 'transparent', color: '#9ca3af', border: '#374151' },
                        ].map(btn => (_jsx("button", { style: { background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`, borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }, children: btn.label }, btn.label))) })] })] }));
}
