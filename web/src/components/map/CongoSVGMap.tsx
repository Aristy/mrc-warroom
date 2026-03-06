import { useState, useEffect, useRef } from 'react';
import type { WarRoomRegion } from '../../types/domain.js';

// Risk-based fill colors matching reference dashboard CSS
const RISK_FILL: Record<string, string> = {
  low:      'rgba(37, 131, 150, 0.70)',
  normal:   'rgba(37, 131, 150, 0.70)',
  medium:   'rgba(184, 145, 44, 0.78)',
  high:     'rgba(178, 52, 66, 0.80)',
  critical: 'rgba(120, 40, 140, 0.82)',
};
const DEFAULT_FILL = 'rgba(31, 120, 141, 0.68)';

const RISK_STROKE: Record<string, string> = {
  low:      'rgba(94, 196, 128, 0.72)',
  normal:   'rgba(214, 239, 255, 0.46)',
  medium:   'rgba(255, 183, 77, 0.82)',
  high:     'rgba(255, 120, 120, 0.92)',
  critical: 'rgba(200, 100, 255, 0.92)',
};
const DEFAULT_STROKE = 'rgba(214, 239, 255, 0.46)';

const RISK_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  normal:   { bg: '#14532d22', color: '#4ade80',  label: 'Normal' },
  low:      { bg: '#14532d22', color: '#4ade80',  label: 'Bas' },
  medium:   { bg: '#92400e22', color: '#fbbf24',  label: 'Moyen' },
  high:     { bg: '#7f1d1d22', color: '#f87171',  label: 'Élevé' },
  critical: { bg: '#4c1d9522', color: '#c084fc',  label: 'Critique' },
};

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

interface ParsedPath { id: string; d: string; name: string; }

interface Props {
  regions?: WarRoomRegion[];
  actionDuJour?: string;
  zonesChaudes?: number;
  zonesFaibles?: number;
}

export default function CongoSVGMap({ regions = [], actionDuJour, zonesChaudes = 0, zonesFaibles = 0 }: Props) {
  const [paths, setPaths] = useState<ParsedPath[]>([]);
  const [viewBox, setViewBox] = useState('0 0 1000 1000');
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState<'tout' | 'regions' | 'evenements'>('tout');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch('/carte_congo.svg')
      .then(r => r.text())
      .then(raw => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(raw, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) throw new Error('No SVG');
        const vb = svg.getAttribute('viewBox') || svg.getAttribute('viewbox') || '0 0 1000 1000';
        setViewBox(vb);
        const regionLayer = doc.querySelector('#regions') || doc.querySelector('#features');
        if (!regionLayer) throw new Error('No regions layer');
        const extracted: ParsedPath[] = [];
        regionLayer.querySelectorAll('path[id]').forEach(path => {
          const id = path.getAttribute('id') || '';
          const d = path.getAttribute('d') || '';
          const name = path.getAttribute('data-name') || path.getAttribute('name') || id;
          if (id && d) extracted.push({ id, d, name });
        });
        setPaths(extracted);
      })
      .catch(() => setLoadError(true));
  }, []);

  const regionById: Record<string, WarRoomRegion> = {};
  regions.forEach(r => { regionById[r.id] = r; });

  const selectedRegion = selected ? regionById[selected] : null;
  const selectedSub    = selected ? SUBDIVISIONS[selected] : null;

  // Compute viewBox with zoom/pan
  const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);
  const zoomedW = vbW / zoom;
  const zoomedH = vbH / zoom;
  const computedViewBox = `${vbX + panX} ${vbY + panY} ${zoomedW} ${zoomedH}`;

  function handleZoomIn()  { setZoom(z => Math.min(z + 0.4, 4)); }
  function handleZoomOut() { setZoom(z => { const nz = Math.max(z - 0.4, 0.5); if (nz <= 1) { setPanX(0); setPanY(0); } return nz; }); }
  function handleReset()   { setZoom(1); setPanX(0); setPanY(0); setSelected(null); }

  function pathFill(id: string): string {
    const reg = regionById[id];
    if (!reg?.stats?.risk) return DEFAULT_FILL;
    return RISK_FILL[reg.stats.risk] || DEFAULT_FILL;
  }

  function pathStroke(id: string, isSelected: boolean, isHovered: boolean): string {
    if (isSelected) return '#ffd740';
    if (isHovered) return '#00d4ff';
    const reg = regionById[id];
    if (!reg?.stats?.risk) return DEFAULT_STROKE;
    return RISK_STROKE[reg.stats.risk] || DEFAULT_STROKE;
  }

  function pathStrokeWidth(isSelected: boolean, isHovered: boolean): number {
    if (isSelected) return 3;
    if (isHovered) return 2.5;
    return 1.35;
  }

  function pathFilter(isSelected: boolean, isHovered: boolean): string {
    if (isSelected) return 'brightness(1.15) drop-shadow(0 0 18px rgba(74,229,255,0.42))';
    if (isHovered)  return 'brightness(1.12) drop-shadow(0 0 12px rgba(0,212,255,0.48))';
    return 'none';
  }

  function pathOpacity(id: string): number {
    if (filter === 'evenements') return 0.35;
    if (selected && selected !== id && hovered !== id) return 0.7;
    return 1;
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 11px', fontSize: 11, fontWeight: 600, borderRadius: 5, border: '1px solid',
    borderColor: active ? '#00c8ff' : '#374151',
    background: active ? 'rgba(0,200,255,0.12)' : 'transparent',
    color: active ? '#00c8ff' : '#6b7280', cursor: 'pointer',
  });

  const iconBtn: React.CSSProperties = {
    padding: '3px 10px', fontSize: 13, fontWeight: 700, borderRadius: 5,
    background: '#1a2535', border: '1px solid #2a3d55', color: '#89a4c3', cursor: 'pointer',
  };

  return (
    <div style={{ background: '#07111f', border: '1px solid rgba(41,74,108,0.82)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#00c8ff', letterSpacing: '0.5px', fontFamily: '"Bebas Neue", sans-serif' }}>
          — CARTE / HEATMAP (RÉGIONS &amp; ZONES)
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#89a4c3' }}>
          <span>🔴 Zones chaudes : <strong style={{ color: '#ef4444' }}>{zonesChaudes}</strong></span>
          <span>🟢 Zones faibles : <strong style={{ color: '#22c55e' }}>{zonesFaibles}</strong></span>
        </div>
      </div>

      {/* Action du jour */}
      {actionDuJour && (
        <div style={{ background: 'rgba(0,200,255,0.07)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: 5, padding: '5px 10px', fontSize: 11, color: '#00c8ff' }}>
          Action du jour : {actionDuJour}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['tout', 'regions', 'evenements'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={btnStyle(filter === f)}>
              {f === 'tout' ? 'TOUT' : f === 'regions' ? 'RÉGIONS' : 'ÉVÉNEMENTS'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={handleZoomOut} style={iconBtn}>−</button>
          <button onClick={handleZoomIn}  style={iconBtn}>+</button>
          <button onClick={handleReset}   style={iconBtn}>↺</button>
        </div>
      </div>

      {/* Map + Detail Panel */}
      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>

        {/* SVG Map Container */}
        <div style={{
          flex: '0 0 auto', width: 260, position: 'relative',
          background: `linear-gradient(180deg, rgba(7,17,31,0.3), rgba(7,17,31,0.5)), url('/bg-map.png') center/cover no-repeat`,
          borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(41,74,108,0.5)',
        }}>
          {loadError ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 420, color: '#6b7280', fontSize: 12 }}>
              Carte non disponible
            </div>
          ) : paths.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 420, color: '#6b7280', fontSize: 12 }}>
              Chargement...
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox={computedViewBox}
              style={{ width: '100%', height: 420, display: 'block', cursor: 'grab' }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Semi-transparent overlay for depth */}
              <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="rgba(7,17,31,0.28)" />

              {/* Department paths from real SVG */}
              {paths.map(({ id, d }) => {
                const isSel = selected === id;
                const isHov = hovered === id;
                return (
                  <path
                    key={id}
                    d={d}
                    fill={pathFill(id)}
                    fillOpacity={pathOpacity(id)}
                    stroke={pathStroke(id, isSel, isHov)}
                    strokeWidth={pathStrokeWidth(isSel, isHov)}
                    strokeLinejoin="round"
                    style={{
                      cursor: 'pointer',
                      filter: pathFilter(isSel, isHov),
                      transition: 'fill 0.22s ease, stroke 0.22s ease, filter 0.22s ease',
                    }}
                    onClick={() => setSelected(isSel ? null : id)}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <title>{SUBDIVISIONS[id]?.name || id}</title>
                  </path>
                );
              })}

              {/* Dept label + dot: both at same anchor point, dot above text */}
              {filter !== 'evenements' && paths.map(({ id }) => {
                const sub = SUBDIVISIONS[id];
                if (!sub) return null;
                // Single set of coords — dot sits above dept name, all co-located
                const anchors: Record<string, [number, number]> = {
                  CG7:   [765, 226], CG13:  [590, 317], CG8:   [642, 494],
                  CG15:  [453, 421], CG14:  [555, 657], CG12:  [488, 798],
                  CGBZV: [553, 837], CG11:  [392, 849], CG2:   [370, 742],
                  CG9:   [240, 732], CG5:   [194, 869], CG16:  [187, 931],
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
                return (
                  <g key={`lbl-${id}`} style={{ pointerEvents: 'none' }}>
                    {/* Dot above the label */}
                    <circle cx={cx} cy={cy - 18} r={small ? 5 : 7} fill={dotColor} opacity={0.93} />
                    <circle cx={cx} cy={cy - 18} r={small ? 8 : 11} fill="none" stroke={dotColor} strokeWidth={1.1} opacity={0.38} />
                    {/* Dept name below dot */}
                    {lines.map((line, i) => (
                      <text
                        key={i}
                        x={cx} y={cy + i * 20}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fill={isSel ? '#ffd740' : isHighRisk ? '#fca5a5' : 'rgba(255,255,255,0.9)'}
                        fontWeight="700"
                        fontFamily='"DM Sans", sans-serif'
                        stroke="rgba(7,17,31,0.88)"
                        strokeWidth={3.5}
                        paintOrder="stroke"
                      >
                        {line.trim()}
                      </text>
                    ))}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Detail Panel */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(26,35,55,0.9)', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(41,74,108,0.4)' }}>
            <div>
              <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selected ? 'Département sélectionné' : 'Vue nationale'}
              </div>
              <div style={{ fontWeight: 700, color: '#ecf3fb', fontSize: 14, marginTop: 2 }}>
                {selected ? (selectedSub?.name || selected) : 'République du Congo'}
              </div>
            </div>
            <button onClick={handleReset} style={{ background: '#1a2535', border: '1px solid #2a3d55', color: '#89a4c3', padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>
              Vue nationale
            </button>
          </div>

          {/* Stats */}
          {selected && selectedRegion ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Agents',    val: selectedRegion.stats?.agents    ?? 0, color: '#00c8ff' },
                  { label: 'Missions',  val: selectedRegion.stats?.missions  ?? 0, color: '#00c853' },
                  { label: 'Incidents', val: selectedRegion.stats?.incidents ?? 0, color: '#f87171' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(26,35,55,0.9)', border: '1px solid rgba(41,74,108,0.4)', borderRadius: 7, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: '"Bebas Neue", sans-serif' }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {selectedRegion.stats?.risk && (() => {
                const rb = RISK_BADGE[selectedRegion.stats.risk] || RISK_BADGE.normal;
                return (
                  <div style={{ background: rb.bg, border: `1px solid ${rb.color}44`, borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: rb.color, display: 'inline-block' }} />
                    <span style={{ color: rb.color, fontWeight: 600, fontSize: 12 }}>Risque : {rb.label}</span>
                  </div>
                );
              })()}
            </>
          ) : (
            // National risk overview
            <div style={{ background: 'rgba(26,35,55,0.9)', border: '1px solid rgba(41,74,108,0.4)', borderRadius: 8, padding: 12, flex: 1 }}>
              <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 8 }}>Cliquez sur un département pour afficher ses informations et ses arrondissements.</div>
              {regions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {regions.slice(0, 6).map(r => {
                    const rb = RISK_BADGE[r.stats?.risk || 'normal'];
                    return (
                      <div key={r.id} onClick={() => setSelected(r.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 6px', borderBottom: '1px solid rgba(41,74,108,0.3)', cursor: 'pointer', borderRadius: 4 }}>
                        <span style={{ fontSize: 12, color: '#bfd0e4' }}>{r.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, color: '#6b7280' }}>{r.stats?.agents ?? 0} agents</span>
                          <span style={{ fontSize: 10, color: rb.color, fontWeight: 600, background: rb.bg, padding: '1px 6px', borderRadius: 4 }}>{rb.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Arrondissements */}
          {selected && selectedSub && (
            <div style={{ background: 'rgba(26,35,55,0.9)', border: '1px solid rgba(41,74,108,0.4)', borderRadius: 8, padding: '10px 12px', flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                ARRONDISSEMENTS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {selectedSub.items.map(item => (
                  <span key={item} style={{ background: 'rgba(0,200,255,0.08)', color: '#bfd0e4', border: '1px solid rgba(0,200,255,0.2)', padding: '3px 8px', borderRadius: 8, fontSize: 11 }}>
                    {item}
                  </span>
                ))}
              </div>
              <button
                onClick={() => window.location.assign('/territory')}
                style={{ marginTop: 12, background: 'rgba(0,200,255,0.08)', color: '#00c8ff', border: '1px solid rgba(0,200,255,0.3)', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', width: '100%' }}
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
