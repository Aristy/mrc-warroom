import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { useWS } from '../hooks/useWS.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
const ALERT_COLORS = { normal: '#22c55e', low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };
function KpiCard({ label, value, sub }) {
    return (_jsxs("div", { style: { background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '16px 20px' }, children: [_jsx("div", { style: { fontSize: 12, color: '#8b8fa8', marginBottom: 6 }, children: label }), _jsx("div", { style: { fontSize: 28, fontWeight: 700, color: '#e8eaf0' }, children: value }), sub && _jsx("div", { style: { fontSize: 12, color: '#8b8fa8', marginTop: 4 }, children: sub })] }));
}
function AlertBanner({ level }) {
    const color = ALERT_COLORS[level] || '#22c55e';
    const labels = { normal: 'Opérations normales', low: 'Alerte basse', medium: 'Alerte modérée', high: 'Alerte haute', critical: 'Alerte critique' };
    return (_jsxs("div", { style: { background: color + '18', border: `1px solid ${color}44`, borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }, children: [_jsx("div", { style: { width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 } }), _jsx("span", { style: { color, fontWeight: 600, fontSize: 14 }, children: labels[level] || level })] }));
}
export default function Dashboard() {
    const { data: initial } = useApi(() => dashboardApi.warRoom());
    const [live, setLive] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
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
    const data = live || initial;
    if (!data)
        return _jsx("div", { style: { color: '#8b8fa8', padding: 32 }, children: "Chargement du War Room..." });
    const { kpis, map, priorities, incidents24h, campaign, alert } = data;
    return (_jsxs("div", { style: { padding: '0 24px 32px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700 }, children: "War Room" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: wsConnected ? '#22c55e' : '#f59e0b' }, children: [_jsx("div", { style: { width: 8, height: 8, borderRadius: '50%', background: wsConnected ? '#22c55e' : '#f59e0b' } }), wsConnected ? 'Temps réel' : 'Reconnexion...'] })] }), _jsx(AlertBanner, { level: alert.level }), map.actionDuJour && (_jsxs("div", { style: { background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#c9a84c', fontWeight: 500 }, children: ["\uD83C\uDFAF Action du jour : ", map.actionDuJour] })), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }, children: [_jsx(KpiCard, { label: "Taux de r\u00E9alisation", value: `${kpis.missions.tauxRealisation}%`, sub: `${kpis.missions.missionsEngagees} missions` }), _jsx(KpiCard, { label: "Portes \u00E0 portes", value: kpis.terrain.portesAPorte.done }), _jsx(KpiCard, { label: "Meetings confirm\u00E9s", value: kpis.terrain.meetingsConfirmes }), _jsx(KpiCard, { label: "Vues vid\u00E9o", value: (kpis.digital.vuesVideo || 0).toLocaleString('fr-FR') }), _jsx(KpiCard, { label: "WhatsApp relay", value: kpis.digital.whatsappRelay }), _jsx(KpiCard, { label: "Adherents publi\u00E9s", value: campaign?.newAdherents || 0 }), _jsx(KpiCard, { label: "Rapports terrain", value: campaign?.terrainReports || 0 }), _jsx(KpiCard, { label: "Incidents 24h", value: incidents24h?.length || 0 })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }, children: [_jsxs("div", { style: { background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: 16 }, children: [_jsx("h2", { style: { fontSize: 15, fontWeight: 600, marginBottom: 12 }, children: "R\u00E9gions prioritaires" }), priorities?.length === 0 && _jsx("p", { style: { color: '#8b8fa8', fontSize: 13 }, children: "Aucune priorit\u00E9 d\u00E9finie" }), priorities?.map((p, i) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2a2d3a' }, children: [_jsx("span", { style: { fontSize: 13 }, children: p.region }), _jsxs("span", { style: { fontSize: 12, color: ALERT_COLORS[p.risk] || '#8b8fa8', fontWeight: 600 }, children: [p.percent, "% \u00B7 ", p.risk] })] }, i)))] }), _jsxs("div", { style: { background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: 16 }, children: [_jsx("h2", { style: { fontSize: 15, fontWeight: 600, marginBottom: 12 }, children: "Incidents 24h" }), incidents24h?.length === 0 && _jsx("p", { style: { color: '#8b8fa8', fontSize: 13 }, children: "Aucun incident" }), incidents24h?.slice(0, 6).map((inc, i) => (_jsxs("div", { style: { padding: '8px 0', borderBottom: '1px solid #2a2d3a' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: inc.type }), _jsx("span", { style: { fontSize: 11, color: '#8b8fa8' }, children: inc.heure })] }), _jsxs("div", { style: { fontSize: 12, color: '#8b8fa8' }, children: [inc.lieu, " \u00B7 ", inc.statut] })] }, i)))] })] })] }));
}
