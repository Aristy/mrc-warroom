import { useState } from 'react';
import type { WarRoomRegion, AlertLevel } from '../../types/domain.js';

// Approximate SVG path data for Republic of Congo departments
// ViewBox: 0 0 1000 1100 — based on map-config.json city coordinate space
const DEPT_PATHS: Record<string, string> = {
  // Likouala (NE, large) — Impfondo at 810,230
  CG7:  'M 685,2 L 998,2 L 998,445 L 862,452 L 840,374 L 800,300 L 758,256 L 799,220 L 810,158 L 782,76 L 724,36 Z',
  // Sangha (NW, large) — Ouesso at 665,290
  CG13: 'M 320,2 L 685,2 L 724,36 L 782,76 L 810,158 L 799,220 L 758,256 L 800,300 L 840,374 L 862,452 L 788,464 L 712,490 L 652,470 L 588,438 L 486,424 L 398,388 L 356,305 L 318,188 Z',
  // Cuvette (center-N, E side) — Owando at 615,560
  CG8:  'M 862,452 L 998,445 L 998,740 L 820,742 L 772,712 L 720,686 L 678,628 L 647,568 L 652,470 L 712,490 L 788,464 Z',
  // Cuvette-Ouest (center-N, W side) — Ewo at 540,560
  CG15: 'M 398,388 L 486,424 L 588,438 L 652,470 L 647,568 L 622,626 L 558,650 L 496,664 L 440,644 L 392,598 L 362,514 L 356,428 Z',
  // Plateaux (center-E) — Djambala at 560,800
  CG14: 'M 820,742 L 998,740 L 984,910 L 922,950 L 860,965 L 801,950 L 762,924 L 730,877 L 703,845 L 720,786 L 772,712 Z',
  // Pool (SE) — Kinkala at 600,940
  CG12: 'M 801,950 L 860,965 L 922,950 L 984,910 L 998,1012 L 998,1100 L 796,1100 L 717,1063 L 662,1028 L 646,983 L 662,961 Z',
  // Brazzaville (tiny city SE) — BZV at 655,905
  CGBZV:'M 662,961 L 719,957 L 762,924 L 801,950 L 781,978 L 740,993 L 677,1006 Z',
  // Bouenza (S-center) — Madingou at 450,875
  CG11: 'M 562,844 L 659,844 L 703,845 L 730,877 L 762,924 L 719,957 L 662,961 L 646,983 L 601,1003 L 541,1023 L 481,1008 L 441,968 L 441,908 L 476,868 Z',
  // Lékoumou (SW-center) — Sibiti at 450,870
  CG2:  'M 440,644 L 496,664 L 558,650 L 622,626 L 647,568 L 678,628 L 720,686 L 703,845 L 659,844 L 562,844 L 476,868 L 441,908 L 401,889 L 378,829 L 381,749 L 396,690 Z',
  // Niari (SW) — Dolisie at 330,875
  CG9:  'M 278,790 L 381,787 L 381,829 L 401,889 L 441,968 L 401,989 L 360,1009 L 300,1009 L 241,970 L 221,931 L 241,890 L 260,851 Z',
  // Kouilou (SW coast) — Hinda at 250,920
  CG5:  'M 221,931 L 241,970 L 300,1009 L 360,1009 L 380,1050 L 322,1090 L 222,1100 L 142,1072 L 140,1008 Z',
  // Pointe-Noire (W coast city, tiny) — PteNoire at 210,940
  CG16: 'M 140,950 L 221,931 L 140,1008 L 116,973 Z',
};

// Label anchor points (in SVG space) for each department name
const DEPT_LABEL: Record<string, [number, number, string]> = {
  CG7:   [848, 220,  'Likouala'],
  CG13:  [555, 240,  'Sangha'],
  CG8:   [838, 588,  'Cuvette'],
  CG15:  [503, 528,  'Cuvette\nOuest'],
  CG14:  [862, 838,  'Plateaux'],
  CG12:  [845, 1028, 'Pool'],
  CGBZV: [724, 975,  'BZV'],
  CG11:  [592, 948,  'Bouenza'],
  CG2:   [535, 748,  'Lékoumou'],
  CG9:   [328, 898,  'Niari'],
  CG5:   [258, 1022, 'Kouilou'],
  CG16:  [148, 975,  'PN'],
};

// Default base colors from map-config
const BASE_COLORS: Record<string, string> = {
  CG7: '#b38d43', CG8: '#3f9b8c', CG14: '#567cc2', CG12: '#6f78b8',
  CGBZV: '#cc6772', CG11: '#b87846', CG9: '#8a4761', CG5: '#486a8f',
  CG13: '#5a9150', CG15: '#9b7a3f', CG2: '#7660a8', CG16: '#d6a23b',
};

// Risk overlay colors
const RISK_FILL: Record<AlertLevel | string, string> = {
  normal: '#1a6b3c', low: '#1a6b3c', medium: '#b45309', high: '#991b1b', critical: '#5b21b6',
};

// Subdivision data (from map-config)
const SUBDIVISIONS: Record<string, { name: string; items: string[] }> = {
  CGBZV: { name: 'Brazzaville', items: ['Makélékélé', 'Bacongo', 'Poto-Poto', 'Moungali', 'Ouenzé', 'Talangaï', 'Mfilou', 'Madibou', 'Djiri'] },
  CG16:  { name: 'Pointe-Noire', items: ['Lumumba', 'Mvoumvou', 'Tié-Tié', 'Loandjili'] },
  CG11:  { name: 'Bouenza', items: ['Madingou', 'Mouyondzi', 'Nkayi', 'Loudima'] },
  CG8:   { name: 'Cuvette', items: ['Owando', 'Makoua', 'Oyo', 'Mossaka'] },
  CG15:  { name: 'Cuvette-Ouest', items: ['Ewo', 'Boundji', 'Kellé', 'Etoumbi'] },
  CG5:   { name: 'Kouilou', items: ['Loango', 'Hinda', 'Madingo-Kayes'] },
  CG2:   { name: 'Lékoumou', items: ['Sibiti', 'Zanaga', 'Bambama', 'Komono'] },
  CG9:   { name: 'Niari', items: ['Dolisie', 'Mossendjo', 'Kibangou', 'Nkola'] },
  CG14:  { name: 'Plateaux', items: ['Djambala', 'Gamboma', 'Lekana', 'Ngo'] },
  CG7:   { name: 'Likouala', items: ['Impfondo', 'Betou', 'Dongou', 'Enyelle'] },
  CG13:  { name: 'Sangha', items: ['Ouesso', 'Sembé', 'Souanké'] },
  CG12:  { name: 'Pool', items: ['Kinkala', 'Boko', 'Mayama', 'Ngabe', 'Mindouli'] },
};

const RISK_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  normal:   { bg: '#14532d22', color: '#4ade80',  label: 'Normal' },
  low:      { bg: '#14532d22', color: '#4ade80',  label: 'Bas' },
  medium:   { bg: '#92400e22', color: '#fbbf24',  label: 'Moyen' },
  high:     { bg: '#7f1d1d22', color: '#f87171',  label: 'Élevé' },
  critical: { bg: '#4c1d9522', color: '#c084fc',  label: 'Critique' },
};

interface Props {
  regions?: WarRoomRegion[];
  actionDuJour?: string;
  zonesChaudes?: number;
  zonesFaibles?: number;
}

export default function CongoSVGMap({ regions = [], actionDuJour, zonesChaudes = 0, zonesFaibles = 0 }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<'tout' | 'regions' | 'evenements'>('tout');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Build region lookup by ID
  const regionById: Record<string, WarRoomRegion> = {};
  regions.forEach(r => { regionById[r.id] = r; });

  const handleZoomIn  = () => setZoom(z => Math.min(z + 0.3, 3));
  const handleZoomOut = () => { setZoom(z => Math.max(z - 0.3, 0.5)); setPanX(0); setPanY(0); };
  const handleReset   = () => { setZoom(1); setPanX(0); setPanY(0); setSelected(null); };

  const selectedRegion = selected ? regionById[selected] : null;
  const selectedSub    = selected ? SUBDIVISIONS[selected] : null;

  // Color a department: use risk overlay if data exists, else base color
  function deptFill(id: string): string {
    const reg = regionById[id];
    if (reg?.stats?.risk) return RISK_FILL[reg.stats.risk] || BASE_COLORS[id] || '#374151';
    return BASE_COLORS[id] || '#374151';
  }

  function deptOpacity(id: string): number {
    if (filter === 'evenements') return 0.4;
    return selected && selected !== id ? 0.55 : 1;
  }

  const vbW = 1000, vbH = 1100;
  const viewBox = `${panX} ${panY} ${vbW / zoom} ${vbH / zoom}`;

  return (
    <div style={{ background: '#0d1525', border: '1px solid #1f2937', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#38bdf8', letterSpacing: '0.5px' }}>
          — CARTE / HEATMAP (RÉGIONS &amp; ZONES)
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#9ca3af' }}>
          <span>🔴 Zones chaudes : <strong style={{ color: '#ef4444' }}>{zonesChaudes}</strong></span>
          <span>🟢 Zones faibles : <strong style={{ color: '#22c55e' }}>{zonesFaibles}</strong></span>
        </div>
      </div>

      {/* Action du jour */}
      {actionDuJour && (
        <div style={{ background: '#1f2937', borderRadius: 5, padding: '5px 10px', fontSize: 11, color: '#38bdf8' }}>
          Action du jour : {actionDuJour}
        </div>
      )}

      {/* Filter + Zoom */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['tout', 'regions', 'evenements'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 5, border: '1px solid',
              borderColor: filter === f ? '#38bdf8' : '#374151',
              background: filter === f ? '#38bdf822' : 'transparent',
              color: filter === f ? '#38bdf8' : '#6b7280', cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {f === 'tout' ? 'TOUT' : f === 'regions' ? 'RÉGIONS' : 'ÉVÉNEMENTS'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['−', handleZoomOut], ['+', handleZoomIn], ['↺', handleReset]].map(([label, fn]) => (
            <button key={String(label)} onClick={fn as () => void} style={{
              padding: '3px 9px', fontSize: 12, fontWeight: 700, borderRadius: 5,
              background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', cursor: 'pointer',
            }}>
              {String(label)}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Panel */}
      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
        {/* SVG Map */}
        <div style={{ flex: '0 0 auto', width: 240, position: 'relative' }}>
          <svg
            viewBox={viewBox}
            style={{ width: '100%', height: 420, cursor: 'pointer', display: 'block' }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background */}
            <rect x={0} y={0} width={1000} height={1100} fill="#0d1525" />

            {/* Department paths */}
            {Object.entries(DEPT_PATHS).map(([id, d]) => {
              const isSelected = selected === id;
              return (
                <g key={id} onClick={() => setSelected(isSelected ? null : id)} style={{ cursor: 'pointer' }}>
                  <path
                    d={d}
                    fill={deptFill(id)}
                    fillOpacity={deptOpacity(id)}
                    stroke={isSelected ? '#ffffff' : '#0d1525'}
                    strokeWidth={isSelected ? 6 : 2.5}
                    strokeLinejoin="round"
                  />
                  {isSelected && (
                    <path d={d} fill="none" stroke="#38bdf8" strokeWidth={4} strokeLinejoin="round" strokeDasharray="12 6" opacity={0.8} />
                  )}
                </g>
              );
            })}

            {/* Department labels */}
            {(filter !== 'evenements') && Object.entries(DEPT_LABEL).map(([id, [x, y, label]]) => {
              const lines = label.split('\n');
              const reg = regionById[id];
              const hasCrisis = reg?.stats?.risk === 'high' || reg?.stats?.risk === 'critical';
              return (
                <g key={`lbl-${id}`} style={{ pointerEvents: 'none' }}>
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={x} y={y + i * 26}
                      textAnchor="middle"
                      fontSize={id === 'CGBZV' || id === 'CG16' ? 18 : 22}
                      fill={hasCrisis ? '#fca5a5' : '#ffffff'}
                      fillOpacity={0.9}
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                      stroke="#0d1525"
                      strokeWidth={3}
                      paintOrder="stroke"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

            {/* City dots (always shown) */}
            {(filter === 'tout' || filter === 'evenements') && [
              [810, 230, 'Impfondo', 'red'], [665, 290, 'Ouesso', 'red'],
              [540, 560, 'Ewo', 'red'], [615, 560, 'Owando', 'red'],
              [560, 800, 'Djambala', 'red'], [450, 870, 'Sibiti', 'red'],
              [330, 875, 'Dolisie', 'red'], [600, 940, 'Kinkala', 'red'],
              [655, 905, 'Brazzaville', 'red'], [210, 940, 'Pointe-Noire', 'red'],
            ].map(([cx, cy, name, dot]) => (
              <g key={String(name)} style={{ pointerEvents: 'none' }}>
                <circle cx={Number(cx)} cy={Number(cy)} r={14} fill={dot === 'red' ? '#ef4444' : '#9ca3af'} opacity={0.9} />
                <text x={Number(cx)} y={Number(cy) + 40} textAnchor="middle" fontSize={18} fill="#e5e7eb" fillOpacity={0.8} fontFamily="Inter, sans-serif" stroke="#0d1525" strokeWidth={2} paintOrder="stroke">
                  {String(name).split(' ')[0]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Detail Panel */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1f2937', borderRadius: 8, padding: '8px 12px' }}>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selected ? 'Département sélectionné' : 'Vue nationale'}
              </div>
              <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, marginTop: 2 }}>
                {selected ? (selectedSub?.name || selected) : 'Vue nationale'}
              </div>
            </div>
            <button onClick={handleReset} style={{ background: '#374151', border: 'none', color: '#9ca3af', padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
              Vue nationale
            </button>
          </div>

          {/* Stats */}
          {selected && selectedRegion ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Agents', val: selectedRegion.stats?.agents ?? 0, color: '#38bdf8' },
                  { label: 'Missions', val: selectedRegion.stats?.missions ?? 0, color: '#4ade80' },
                  { label: 'Incidents', val: selectedRegion.stats?.incidents ?? 0, color: '#f87171' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#1f2937', borderRadius: 7, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Risk badge */}
              {selectedRegion.stats?.risk && (() => {
                const rb = RISK_BADGE[selectedRegion.stats.risk] || RISK_BADGE.normal;
                return (
                  <div style={{ background: rb.bg, border: `1px solid ${rb.color}44`, borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: rb.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: rb.color, fontWeight: 600, fontSize: 12 }}>Risque : {rb.label}</span>
                  </div>
                );
              })()}
            </>
          ) : (
            // National summary when no dept selected
            <div style={{ background: '#1f2937', borderRadius: 8, padding: 12, flex: 1 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Cliquez sur un département de la carte pour afficher ses informations et ses arrondissements.</div>
              {regions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {regions.slice(0, 5).map(r => {
                    const rb = RISK_BADGE[r.stats?.risk || 'normal'];
                    return (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #374151' }}>
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>{r.name}</span>
                        <span style={{ fontSize: 10, color: rb.color, fontWeight: 600 }}>{rb.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Arrondissements */}
          {selected && selectedSub && (
            <div style={{ background: '#1f2937', borderRadius: 8, padding: '10px 12px', flex: 1, overflowY: 'auto', maxHeight: 200 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                ARRONDISSEMENTS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {selectedSub.items.map(item => (
                  <span key={item} style={{ background: '#374151', color: '#d1d5db', padding: '3px 8px', borderRadius: 8, fontSize: 11 }}>
                    {item}
                  </span>
                ))}
              </div>

              {/* Zones (action placeholder) */}
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '10px 0 6px' }}>
                ZONES
              </div>
              <button
                onClick={() => window.location.assign(`/territory`)}
                style={{ background: '#374151', color: '#60a5fa', border: '1px solid #4b5563', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', width: '100%' }}
              >
                Voir zones &amp; territoire →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
