import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { territoryApi, eventsApi, campaignApi, membersApi, mediaApi } from '../api/campaign.api.js';
const SOURCE_ICONS = {
    youtube: '▶', facebook: 'f', instagram: '📷', 'twitter/x': '𝕏', tiktok: '♪',
    whatsapp: '💬', presse: '📰', tv: '📺', radio: '📻',
};
const TONE_COLORS = { positif: '#16a34a', neutre: '#6b7280', negatif: '#dc2626', critique: '#f59e0b' };
const CAT_COLORS = { terrain: '#2563eb', sondage: '#7c3aed', incident: '#dc2626', adherent: '#16a34a', digital: '#0891b2', mission: '#d97706', logistique: '#6b7280' };
export default function Territory() {
    const { data, loading } = useApi(() => territoryApi.departments(), []);
    const [expanded, setExpanded] = useState(new Set());
    const [selectedDept, setSelectedDept] = useState(null);
    const [detail, setDetail] = useState({ events: [], campaign: [], members: [], media: [], loading: false });
    const departments = data?.departments ?? [];
    const totalArrondissements = departments.reduce((s, d) => s + (d.arrondissements?.length ?? 0), 0);
    const totalZones = departments.reduce((s, d) => s + (d.arrondissements ?? []).reduce((a, arr) => a + (arr.zones?.length ?? 0), 0), 0);
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
    const openDetail = async (dep) => {
        setSelectedDept(dep);
        setDetail({ events: [], campaign: [], members: [], media: [], loading: true });
        const deptId = dep.id ?? dep.name;
        const [ev, camp, mem, med] = await Promise.allSettled([
            eventsApi.list({ departmentId: deptId, status: 'publie' }),
            campaignApi.list({ regionId: deptId }),
            membersApi.list({ departmentId: deptId }),
            mediaApi.list({ departmentId: deptId, status: 'publie' }),
        ]);
        setDetail({
            events: ev.status === 'fulfilled' ? ev.value.items : [],
            campaign: camp.status === 'fulfilled' ? camp.value.items : [],
            members: mem.status === 'fulfilled' ? mem.value.items : [],
            media: med.status === 'fulfilled' ? med.value.items : [],
            loading: false,
        });
    };
    const closeDetail = () => setSelectedDept(null);
    return (_jsxs("div", { style: { padding: 24, display: 'flex', gap: 24, position: 'relative' }, children: [_jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, color: 'var(--text, #f1f5f9)', margin: '0 0 12px' }, children: "Territoire" }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsxs("span", { style: chipStyle, children: [departments.length, " d\u00E9partements"] }), _jsxs("span", { style: chipStyle, children: [totalArrondissements, " arrondissements"] }), _jsxs("span", { style: chipStyle, children: [totalZones, " zones"] })] })] }), loading ? (_jsx("div", { style: { color: 'var(--text-muted, #9ca3af)', padding: 40, textAlign: 'center' }, children: "Chargement\u2026" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: departments.map(dep => {
                            const dId = dep.id ?? dep.name;
                            const isOpen = expanded.has(dId);
                            const isSelected = selectedDept?.id === dep.id;
                            return (_jsxs("div", { style: {
                                    background: isSelected ? '#9a1f1f14' : 'var(--surface2, #1c2333)',
                                    borderRadius: 10, border: `1px solid ${isSelected ? '#9a1f1f66' : 'var(--border, #1f2937)'}`, overflow: 'hidden',
                                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 0 }, children: [_jsxs("button", { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }, onClick: () => toggle(dId), children: [_jsx("span", { style: { fontSize: 18 }, children: "\uD83D\uDDFA\uFE0F" }), _jsx("span", { style: { flex: 1, fontWeight: 600, color: 'var(--text, #f1f5f9)', fontSize: 15 }, children: dep.name }), _jsxs("span", { style: { color: 'var(--text-muted, #6b7280)', fontSize: 12 }, children: [dep.arrondissements?.length ?? 0, " arrondissements"] }), _jsx("span", { style: { color: 'var(--text-muted, #6b7280)', fontSize: 16, marginLeft: 8 }, children: isOpen ? '▼' : '›' })] }), _jsx("button", { onClick: () => isSelected ? closeDetail() : openDetail(dep), style: {
                                                    margin: '0 12px', padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                                    background: isSelected ? '#9a1f1f' : '#2563eb22', color: isSelected ? '#fff' : '#93c5fd',
                                                }, children: isSelected ? '✕ Fermer' : 'Voir détail' })] }), isOpen && dep.arrondissements && (_jsx("div", { style: { padding: '0 16px 16px 44px', display: 'flex', flexDirection: 'column', gap: 10 }, children: dep.arrondissements.map(arr => (_jsxs("div", { children: [_jsx("span", { style: { color: '#93c5fd', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }, children: arr.name }), arr.zones && arr.zones.length > 0 && (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6 }, children: arr.zones.map(z => (_jsx("span", { style: { background: 'var(--surface, #1f2937)', color: 'var(--text-muted, #9ca3af)', padding: '2px 10px', borderRadius: 10, fontSize: 11 }, children: z.name }, z.id ?? z.name))) }))] }, arr.id ?? arr.name))) }))] }, dId));
                        }) }))] }), selectedDept && (_jsxs("div", { style: {
                    width: 420, flexShrink: 0, background: 'var(--surface, #1a1d27)', border: '1px solid var(--border, #2a2d3a)',
                    borderRadius: 12, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)', position: 'sticky', top: 0,
                }, children: [_jsxs("div", { style: { padding: '16px 20px', borderBottom: '1px solid var(--border, #2a2d3a)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, color: 'var(--text, #f1f5f9)', fontSize: 16 }, children: selectedDept.name }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted, #8b8fa8)', marginTop: 2 }, children: "Situation globale du d\u00E9partement" })] }), _jsx("button", { onClick: closeDetail, style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #8b8fa8)', fontSize: 20, lineHeight: 1 }, children: "\u00D7" })] }), detail.loading ? (_jsx("div", { style: { color: 'var(--text-muted, #9ca3af)', padding: 40, textAlign: 'center' }, children: "Chargement des donn\u00E9es\u2026" })) : (_jsxs("div", { style: { padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }, children: [
                                    { label: 'Événements', val: detail.events.length, color: '#2563eb' },
                                    { label: 'Membres', val: detail.members.length, color: '#16a34a' },
                                    { label: 'Médias', val: detail.media.length, color: '#7c3aed' },
                                    { label: 'Rapports', val: detail.campaign.length, color: '#d97706' },
                                ].map(s => (_jsxs("div", { style: { background: `${s.color}14`, border: `1px solid ${s.color}44`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 22, fontWeight: 700, color: s.color }, children: s.val }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted, #9ca3af)' }, children: s.label })] }, s.label))) }), _jsxs(DetailSection, { title: "\u00C9v\u00E9nements r\u00E9cents", count: detail.events.length, children: [detail.events.slice(0, 6).map(ev => (_jsxs("div", { style: { padding: '10px 0', borderBottom: '1px solid var(--border, #1f2937)' }, children: [ev.media?.length > 0 && (_jsx("div", { style: { display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }, children: ev.media.slice(0, 3).map(m => (m.mediaType === 'image' && m.filePath ? (_jsx("img", { src: `/uploads/events/${m.filePath.split('/').pop()}`, style: { width: 60, height: 45, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border, #2a2d3a)' }, onError: e => { e.target.style.display = 'none'; } }, m.id)) : m.mediaType === 'video' ? (_jsx("div", { style: { width: 60, height: 45, background: '#000', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }, children: "\u25B6" }, m.id)) : null)) })), _jsx("div", { style: { fontWeight: 600, color: 'var(--text, #e8eaf0)', fontSize: 13 }, children: ev.title }), _jsxs("div", { style: { fontSize: 11, color: 'var(--text-muted, #8b8fa8)', marginTop: 2 }, children: [ev.eventType, " \u00B7 ", ev.zoneName || ev.arrondissementName, " \u00B7 ", new Date(ev.eventDate).toLocaleDateString('fr-FR')] })] }, ev.id))), detail.events.length === 0 && _jsx(EmptyMsg, { text: "Aucun \u00E9v\u00E9nement publi\u00E9" })] }), _jsxs(DetailSection, { title: "M\u00E9dias publi\u00E9s", count: detail.media.length, children: [detail.media.slice(0, 5).map(m => (_jsxs("div", { style: { display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border, #1f2937)', alignItems: 'flex-start' }, children: [m.screenshotPath ? (_jsx("img", { src: `/uploads/events/${m.screenshotPath.split('/').pop()}`, style: { width: 50, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }, onError: e => { e.target.style.display = 'none'; } })) : (_jsx("div", { style: { width: 50, height: 36, background: 'var(--surface2, #1c2333)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }, children: SOURCE_ICONS[m.sourceType] || '📄' })), _jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 600, color: 'var(--text, #e8eaf0)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: m.title }), _jsxs("div", { style: { display: 'flex', gap: 6, marginTop: 4 }, children: [_jsx("span", { style: { fontSize: 10, color: 'var(--text-muted, #8b8fa8)' }, children: m.sourceType }), m.tone && (_jsx("span", { style: { fontSize: 10, padding: '1px 6px', borderRadius: 8, background: `${TONE_COLORS[m.tone] || '#6b7280'}22`, color: TONE_COLORS[m.tone] || '#9ca3af', border: `1px solid ${TONE_COLORS[m.tone] || '#6b7280'}44` }, children: m.tone }))] })] })] }, m.id))), detail.media.length === 0 && _jsx(EmptyMsg, { text: "Aucun m\u00E9dia publi\u00E9" })] }), _jsxs(DetailSection, { title: "Adh\u00E9sions r\u00E9centes", count: detail.members.length, children: [_jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }, children: ['soumis', 'publie', 'rejete'].map(st => {
                                            const count = detail.members.filter(m => m.status === st).length;
                                            return (_jsxs("div", { style: { padding: '6px 10px', background: 'var(--surface2, #1c2333)', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: 11, color: 'var(--text-muted, #9ca3af)', textTransform: 'capitalize' }, children: st }), _jsx("span", { style: { fontWeight: 700, color: 'var(--text, #f1f5f9)' }, children: count })] }, st));
                                        }) }), detail.members.slice(0, 5).map(mem => (_jsxs("div", { style: { padding: '6px 0', borderBottom: '1px solid var(--border, #1f2937)', display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: 12, color: 'var(--text, #e8eaf0)', fontWeight: 500 }, children: mem.fullName }), _jsx("span", { style: { fontSize: 11, color: 'var(--text-muted, #8b8fa8)' }, children: mem.arrondissementName || '—' })] }, mem.id))), detail.members.length === 0 && _jsx(EmptyMsg, { text: "Aucune adh\u00E9sion" })] }), _jsxs(DetailSection, { title: "Rapports terrain", count: detail.campaign.length, children: [detail.campaign.slice(0, 6).map(rec => (_jsxs("div", { style: { padding: '8px 0', borderBottom: '1px solid var(--border, #1f2937)' }, children: [_jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }, children: [_jsx("span", { style: { fontSize: 10, padding: '1px 7px', borderRadius: 8, background: `${CAT_COLORS[rec.category] || '#6b7280'}22`, color: CAT_COLORS[rec.category] || '#9ca3af', border: `1px solid ${CAT_COLORS[rec.category] || '#6b7280'}44`, fontWeight: 600 }, children: rec.category }), _jsx("span", { style: { fontSize: 11, color: 'var(--text-muted, #8b8fa8)' }, children: rec.zone })] }), _jsx("div", { style: { fontSize: 12, color: 'var(--text, #e8eaf0)' }, children: rec.title }), _jsx("div", { style: { fontSize: 11, color: 'var(--text-muted, #8b8fa8)', marginTop: 2 }, children: new Date(rec.submittedAt).toLocaleDateString('fr-FR') })] }, rec.id))), detail.campaign.length === 0 && _jsx(EmptyMsg, { text: "Aucun rapport terrain" })] })] }))] }))] }));
}
function DetailSection({ title, count, children }) {
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, children: [_jsx("div", { style: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px' }, children: title }), _jsx("span", { style: { fontSize: 11, background: 'var(--surface2, #1c2333)', padding: '1px 8px', borderRadius: 10, color: 'var(--text-muted, #9ca3af)' }, children: count })] }), children] }));
}
function EmptyMsg({ text }) {
    return _jsx("div", { style: { color: 'var(--text-muted, #6b7280)', fontSize: 12, padding: '8px 0', textAlign: 'center', fontStyle: 'italic' }, children: text });
}
const chipStyle = {
    background: 'var(--surface2, #1c2333)', border: '1px solid var(--border, #374151)',
    color: 'var(--text-muted, #9ca3af)', padding: '4px 12px', borderRadius: 20, fontSize: 13,
};
