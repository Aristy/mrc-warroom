import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
// Risk-based fill colors matching reference dashboard CSS
const RISK_FILL = {
    low: 'rgba(37, 131, 150, 0.70)',
    normal: 'rgba(37, 131, 150, 0.70)',
    medium: 'rgba(184, 145, 44, 0.78)',
    high: 'rgba(178, 52, 66, 0.80)',
    critical: 'rgba(120, 40, 140, 0.82)',
};
const DEFAULT_FILL = 'rgba(31, 120, 141, 0.68)';
const RISK_STROKE = {
    low: 'rgba(94, 196, 128, 0.72)',
    normal: 'rgba(214, 239, 255, 0.46)',
    medium: 'rgba(255, 183, 77, 0.82)',
    high: 'rgba(255, 120, 120, 0.92)',
    critical: 'rgba(200, 100, 255, 0.92)',
};
const DEFAULT_STROKE = 'rgba(214, 239, 255, 0.46)';
const RISK_BADGE = {
    normal: { bg: '#14532d22', color: '#4ade80', label: 'Normal' },
    low: { bg: '#14532d22', color: '#4ade80', label: 'Bas' },
    medium: { bg: '#92400e22', color: '#fbbf24', label: 'Moyen' },
    high: { bg: '#7f1d1d22', color: '#f87171', label: 'Élevé' },
    critical: { bg: '#4c1d9522', color: '#c084fc', label: 'Critique' },
};
const SUBDIVISIONS = {
    CGBZV: { name: 'Brazzaville', items: ['Makélékélé', 'Bacongo', 'Poto-Poto', 'Moungali', 'Ouenzé', 'Talangaï', 'Mfilou', 'Madibou', 'Djiri'] },
    CG16: { name: 'Pointe-Noire', items: ['Lumumba', 'Mvoumvou', 'Tié-Tié', 'Loandjili'] },
    CG11: { name: 'Bouenza', items: ['Madingou', 'Mouyondzi', 'Nkayi', 'Loudima'] },
    CG8: { name: 'Cuvette', items: ['Owando', 'Makoua', 'Oyo', 'Mossaka'] },
    CG15: { name: 'Cuvette-Ouest', items: ['Ewo', 'Boundji', 'Kellé', 'Etoumbi'] },
    CG5: { name: 'Kouilou', items: ['Loango', 'Hinda', 'Madingo-Kayes'] },
    CG2: { name: 'Lékoumou', items: ['Sibiti', 'Zanaga', 'Bambama', 'Komono'] },
    CG9: { name: 'Niari', items: ['Dolisie', 'Mossendjo', 'Kibangou', 'Nkola'] },
    CG14: { name: 'Plateaux', items: ['Djambala', 'Gamboma', 'Lekana', 'Ngo'] },
    CG7: { name: 'Likouala', items: ['Impfondo', 'Betou', 'Dongou', 'Enyelle'] },
    CG13: { name: 'Sangha', items: ['Ouesso', 'Sembé', 'Souanké'] },
    CG12: { name: 'Pool', items: ['Kinkala', 'Boko', 'Mayama', 'Ngabe', 'Mindouli'] },
};
export default function CongoSVGMap({ regions = [], actionDuJour, zonesChaudes = 0, zonesFaibles = 0 }) {
    const [paths, setPaths] = useState([]);
    const [viewBox, setViewBox] = useState('0 0 1000 1000');
    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);
    const [filter, setFilter] = useState('tout');
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [loadError, setLoadError] = useState(false);
    const svgRef = useRef(null);
    useEffect(() => {
        fetch('/carte_congo.svg')
            .then(r => r.text())
            .then(raw => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(raw, 'image/svg+xml');
            const svg = doc.querySelector('svg');
            if (!svg)
                throw new Error('No SVG');
            const vb = svg.getAttribute('viewBox') || svg.getAttribute('viewbox') || '0 0 1000 1000';
            setViewBox(vb);
            const regionLayer = doc.querySelector('#regions') || doc.querySelector('#features');
            if (!regionLayer)
                throw new Error('No regions layer');
            const extracted = [];
            regionLayer.querySelectorAll('path[id]').forEach(path => {
                const id = path.getAttribute('id') || '';
                const d = path.getAttribute('d') || '';
                const name = path.getAttribute('data-name') || path.getAttribute('name') || id;
                if (id && d)
                    extracted.push({ id, d, name });
            });
            setPaths(extracted);
        })
            .catch(() => setLoadError(true));
    }, []);
    const regionById = {};
    regions.forEach(r => { regionById[r.id] = r; });
    const selectedRegion = selected ? regionById[selected] : null;
    const selectedSub = selected ? SUBDIVISIONS[selected] : null;
    // Compute viewBox with zoom/pan
    const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);
    const zoomedW = vbW / zoom;
    const zoomedH = vbH / zoom;
    const computedViewBox = `${vbX + panX} ${vbY + panY} ${zoomedW} ${zoomedH}`;
    function handleZoomIn() { setZoom(z => Math.min(z + 0.4, 4)); }
    function handleZoomOut() { setZoom(z => { const nz = Math.max(z - 0.4, 0.5); if (nz <= 1) {
        setPanX(0);
        setPanY(0);
    } return nz; }); }
    function handleReset() { setZoom(1); setPanX(0); setPanY(0); setSelected(null); }
    function pathFill(id) {
        const reg = regionById[id];
        if (!reg?.stats?.risk)
            return DEFAULT_FILL;
        return RISK_FILL[reg.stats.risk] || DEFAULT_FILL;
    }
    function pathStroke(id, isSelected, isHovered) {
        if (isSelected)
            return '#ffd740';
        if (isHovered)
            return '#00d4ff';
        const reg = regionById[id];
        if (!reg?.stats?.risk)
            return DEFAULT_STROKE;
        return RISK_STROKE[reg.stats.risk] || DEFAULT_STROKE;
    }
    function pathStrokeWidth(isSelected, isHovered) {
        if (isSelected)
            return 3;
        if (isHovered)
            return 2.5;
        return 1.35;
    }
    function pathFilter(isSelected, isHovered) {
        if (isSelected)
            return 'brightness(1.15) drop-shadow(0 0 18px rgba(74,229,255,0.42))';
        if (isHovered)
            return 'brightness(1.12) drop-shadow(0 0 12px rgba(0,212,255,0.48))';
        return 'none';
    }
    function pathOpacity(id) {
        if (filter === 'evenements')
            return 0.35;
        if (selected && selected !== id && hovered !== id)
            return 0.7;
        return 1;
    }
    const btnStyle = (active) => ({
        padding: '4px 11px', fontSize: 11, fontWeight: 600, borderRadius: 5, border: '1px solid',
        borderColor: active ? '#00c8ff' : '#374151',
        background: active ? 'rgba(0,200,255,0.12)' : 'transparent',
        color: active ? '#00c8ff' : '#6b7280', cursor: 'pointer',
    });
    const iconBtn = {
        padding: '3px 10px', fontSize: 13, fontWeight: 700, borderRadius: 5,
        background: '#1a2535', border: '1px solid #2a3d55', color: '#89a4c3', cursor: 'pointer',
    };
    return (_jsxs("div", { style: { background: '#07111f', border: '1px solid rgba(41,74,108,0.82)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 16, color: '#00c8ff', letterSpacing: '0.5px', fontFamily: '"Bebas Neue", sans-serif' }, children: "\u2014 CARTE / HEATMAP (R\u00C9GIONS & ZONES)" }), _jsxs("div", { style: { display: 'flex', gap: 12, fontSize: 11, color: '#89a4c3' }, children: [_jsxs("span", { children: ["\uD83D\uDD34 Zones chaudes : ", _jsx("strong", { style: { color: '#ef4444' }, children: zonesChaudes })] }), _jsxs("span", { children: ["\uD83D\uDFE2 Zones faibles : ", _jsx("strong", { style: { color: '#22c55e' }, children: zonesFaibles })] })] })] }), actionDuJour && (_jsxs("div", { style: { background: 'rgba(0,200,255,0.07)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: 5, padding: '5px 10px', fontSize: 11, color: '#00c8ff' }, children: ["Action du jour : ", actionDuJour] })), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, children: [_jsx("div", { style: { display: 'flex', gap: 4 }, children: ['tout', 'regions', 'evenements'].map(f => (_jsx("button", { onClick: () => setFilter(f), style: btnStyle(filter === f), children: f === 'tout' ? 'TOUT' : f === 'regions' ? 'RÉGIONS' : 'ÉVÉNEMENTS' }, f))) }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: handleZoomOut, style: iconBtn, children: "\u2212" }), _jsx("button", { onClick: handleZoomIn, style: iconBtn, children: "+" }), _jsx("button", { onClick: handleReset, style: iconBtn, children: "\u21BA" })] })] }), _jsxs("div", { style: { display: 'flex', gap: 12, flex: 1, minHeight: 0 }, children: [_jsx("div", { style: {
                            flex: '0 0 auto', width: 260, position: 'relative',
                            background: `linear-gradient(180deg, rgba(7,17,31,0.3), rgba(7,17,31,0.5)), url('/bg-map.png') center/cover no-repeat`,
                            borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(41,74,108,0.5)',
                        }, children: loadError ? (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 420, color: '#6b7280', fontSize: 12 }, children: "Carte non disponible" })) : paths.length === 0 ? (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 420, color: '#6b7280', fontSize: 12 }, children: "Chargement..." })) : (_jsxs("svg", { ref: svgRef, viewBox: computedViewBox, style: { width: '100%', height: 420, display: 'block', cursor: 'grab' }, preserveAspectRatio: "xMidYMid meet", children: [_jsx("rect", { x: vbX, y: vbY, width: vbW, height: vbH, fill: "rgba(7,17,31,0.28)" }), paths.map(({ id, d }) => {
                                    const isSel = selected === id;
                                    const isHov = hovered === id;
                                    return (_jsx("path", { d: d, fill: pathFill(id), fillOpacity: pathOpacity(id), stroke: pathStroke(id, isSel, isHov), strokeWidth: pathStrokeWidth(isSel, isHov), strokeLinejoin: "round", style: {
                                            cursor: 'pointer',
                                            filter: pathFilter(isSel, isHov),
                                            transition: 'fill 0.22s ease, stroke 0.22s ease, filter 0.22s ease',
                                        }, onClick: () => setSelected(isSel ? null : id), onMouseEnter: () => setHovered(id), onMouseLeave: () => setHovered(null), children: _jsx("title", { children: SUBDIVISIONS[id]?.name || id }) }, id));
                                }), filter !== 'evenements' && paths.map(({ id }) => {
                                    const sub = SUBDIVISIONS[id];
                                    if (!sub)
                                        return null;
                                    // Single set of coords — dot sits above dept name, all co-located
                                    const anchors = {
                                        CG7: [765, 226], CG13: [590, 317], CG8: [642, 494],
                                        CG15: [453, 421], CG14: [555, 657], CG12: [488, 798],
                                        CGBZV: [553, 837], CG11: [392, 849], CG2: [370, 742],
                                        CG9: [240, 732], CG5: [194, 869], CG16: [187, 931],
                                    };
                                    const [cx, cy] = anchors[id] || [500, 500];
                                    const reg = regionById[id];
                                    const isHighRisk = reg?.stats?.risk === 'high' || reg?.stats?.risk === 'critical';
                                    const isSel = selected === id;
                                    const dotColor = isSel ? '#ffd740' : isHighRisk ? '#ef4444' : '#00c8ff';
                                    const small = id === 'CGBZV' || id === 'CG16' || id === 'CG5';
                                    const fontSize = small ? 15 : 19;
                                    const label = sub.name;
                                    const lines = label.length > 10 ? label.split('-') : [label];
                                    return (_jsxs("g", { style: { pointerEvents: 'none' }, children: [_jsx("circle", { cx: cx, cy: cy - 18, r: small ? 5 : 7, fill: dotColor, opacity: 0.93 }), _jsx("circle", { cx: cx, cy: cy - 18, r: small ? 8 : 11, fill: "none", stroke: dotColor, strokeWidth: 1.1, opacity: 0.38 }), lines.map((line, i) => (_jsx("text", { x: cx, y: cy + i * 20, textAnchor: "middle", fontSize: fontSize, fill: isSel ? '#ffd740' : isHighRisk ? '#fca5a5' : 'rgba(255,255,255,0.9)', fontWeight: "700", fontFamily: '"DM Sans", sans-serif', stroke: "rgba(7,17,31,0.88)", strokeWidth: 3.5, paintOrder: "stroke", children: line.trim() }, i)))] }, `lbl-${id}`));
                                })] })) }), _jsxs("div", { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(26,35,55,0.9)', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(41,74,108,0.4)' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }, children: selected ? 'Département sélectionné' : 'Vue nationale' }), _jsx("div", { style: { fontWeight: 700, color: '#ecf3fb', fontSize: 14, marginTop: 2 }, children: selected ? (selectedSub?.name || selected) : 'République du Congo' })] }), _jsx("button", { onClick: handleReset, style: { background: '#1a2535', border: '1px solid #2a3d55', color: '#89a4c3', padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11 }, children: "Vue nationale" })] }), selected && selectedRegion ? (_jsxs(_Fragment, { children: [_jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }, children: [
                                            { label: 'Agents', val: selectedRegion.stats?.agents ?? 0, color: '#00c8ff' },
                                            { label: 'Missions', val: selectedRegion.stats?.missions ?? 0, color: '#00c853' },
                                            { label: 'Incidents', val: selectedRegion.stats?.incidents ?? 0, color: '#f87171' },
                                        ].map(s => (_jsxs("div", { style: { background: 'rgba(26,35,55,0.9)', border: '1px solid rgba(41,74,108,0.4)', borderRadius: 7, padding: '8px 10px', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 20, fontWeight: 700, color: s.color, fontFamily: '"Bebas Neue", sans-serif' }, children: s.val }), _jsx("div", { style: { fontSize: 10, color: '#6b7280', marginTop: 2 }, children: s.label })] }, s.label))) }), selectedRegion.stats?.risk && (() => {
                                        const rb = RISK_BADGE[selectedRegion.stats.risk] || RISK_BADGE.normal;
                                        return (_jsxs("div", { style: { background: rb.bg, border: `1px solid ${rb.color}44`, borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: '50%', background: rb.color, display: 'inline-block' } }), _jsxs("span", { style: { color: rb.color, fontWeight: 600, fontSize: 12 }, children: ["Risque : ", rb.label] })] }));
                                    })()] })) : (
                            // National risk overview
                            _jsxs("div", { style: { background: 'rgba(26,35,55,0.9)', border: '1px solid rgba(41,74,108,0.4)', borderRadius: 8, padding: 12, flex: 1 }, children: [_jsx("div", { style: { fontSize: 10, color: '#6b7280', marginBottom: 8 }, children: "Cliquez sur un d\u00E9partement pour afficher ses informations et ses arrondissements." }), regions.length > 0 && (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: regions.slice(0, 6).map(r => {
                                            const rb = RISK_BADGE[r.stats?.risk || 'normal'];
                                            return (_jsxs("div", { onClick: () => setSelected(r.id), style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 6px', borderBottom: '1px solid rgba(41,74,108,0.3)', cursor: 'pointer', borderRadius: 4 }, children: [_jsx("span", { style: { fontSize: 12, color: '#bfd0e4' }, children: r.name }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsxs("span", { style: { fontSize: 10, color: '#6b7280' }, children: [r.stats?.agents ?? 0, " agents"] }), _jsx("span", { style: { fontSize: 10, color: rb.color, fontWeight: 600, background: rb.bg, padding: '1px 6px', borderRadius: 4 }, children: rb.label })] })] }, r.id));
                                        }) }))] })), selected && selectedSub && (_jsxs("div", { style: { background: 'rgba(26,35,55,0.9)', border: '1px solid rgba(41,74,108,0.4)', borderRadius: 8, padding: '10px 12px', flex: 1, overflowY: 'auto' }, children: [_jsx("div", { style: { fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }, children: "ARRONDISSEMENTS" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 5 }, children: selectedSub.items.map(item => (_jsx("span", { style: { background: 'rgba(0,200,255,0.08)', color: '#bfd0e4', border: '1px solid rgba(0,200,255,0.2)', padding: '3px 8px', borderRadius: 8, fontSize: 11 }, children: item }, item))) }), _jsx("button", { onClick: () => window.location.assign('/territory'), style: { marginTop: 12, background: 'rgba(0,200,255,0.08)', color: '#00c8ff', border: '1px solid rgba(0,200,255,0.3)', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', width: '100%' }, children: "Voir zones & territoire \u2192" })] }))] })] })] }));
}
