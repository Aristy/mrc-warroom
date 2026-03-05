import { useState, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWS } from '../hooks/useWS.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
import CongoSVGMap from '../components/map/CongoSVGMap.js';
import type { WarRoomData, AlertLevel, Priority, Incident24h, CalendarItem, WarRoomRegion } from '../types/domain.js';
import type { WSMessage as WSMsg } from '../types/ws.js';

const ALERT_COLOR: Record<string, string> = {
  normal: '#22c55e', low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed',
};
const RISK_LABEL: Record<string, string> = { low: 'Bas', medium: 'Moyen', high: 'Haut', critical: 'Critique', normal: 'Bas' };

function nowFR() {
  const d = new Date();
  return {
    date: d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

function KpiMissions({ kpis }: { kpis: WarRoomData['kpis'] }) {
  const pct = kpis.missions?.tauxRealisation ?? 0;
  return (
    <div style={{ background: 'linear-gradient(135deg,#0d2b1e,#0f3d28)', border: '1px solid #1a5c38', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#4ade80' }}>KPIs Missions</span>
      </div>
      <div style={{ fontSize: 12, color: '#86efac', marginBottom: 2 }}>Objectif jour : <strong style={{ color: '#f0fdf4' }}>{kpis.missions?.objectifJour ?? 0}</strong></div>
      <div style={{ fontSize: 12, color: '#86efac', marginBottom: 8 }}>Missions engagées : <strong style={{ color: '#f0fdf4' }}>{kpis.missions?.missionsEngagees ?? 0}</strong></div>
      <div style={{ height: 6, background: '#1a5c38', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: '#22c55e', borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#4ade80' }}>{pct}%</div>
    </div>
  );
}

function KpiTerrain({ kpis }: { kpis: WarRoomData['kpis'] }) {
  const done = kpis.terrain?.portesAPorte?.done ?? 0;
  const target = kpis.terrain?.portesAPorte?.target ?? 0;
  return (
    <div style={{ background: 'linear-gradient(135deg,#0d1f3c,#0f2d5c)', border: '1px solid #1a3a7c', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🚶</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#60a5fa' }}>KPIs Terrain</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#93c5fd', marginBottom: 8 }}>
        <span>Portes-à-porte :</span>
        <strong style={{ color: '#fff', fontSize: 18 }}>{done}/{target || '—'}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#93c5fd' }}>
        <span>Meetings confirmés :</span>
        <strong style={{ color: '#fff', fontSize: 18 }}>{kpis.terrain?.meetingsConfirmes ?? 0}</strong>
      </div>
    </div>
  );
}

function KpiDigital({ kpis }: { kpis: WarRoomData['kpis'] }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,#0d2d3c,#0f3d4c)', border: '1px solid #1a5c6c', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>📱</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#22d3ee' }}>KPIs Digital</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#67e8f9', marginBottom: 8 }}>
        <span>Vues vidéo :</span>
        <strong style={{ color: '#fff', fontSize: 18 }}>{(kpis.digital?.vuesVideo || 0).toLocaleString('fr-FR')}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#67e8f9' }}>
        <span>WhatsApp relay :</span>
        <strong style={{ color: '#fff', fontSize: 18 }}>{kpis.digital?.whatsappRelay ?? 0}</strong>
      </div>
    </div>
  );
}

function KpiLogistique({ kpis }: { kpis: WarRoomData['kpis'] }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,#2d1a00,#3d2600)', border: '1px solid #7c4a00', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🚚</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#fb923c' }}>KPIs Logistique</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#fdba74', marginBottom: 8 }}>
        <span>Transport prévu :</span>
        <strong style={{ color: '#fff', fontSize: 18 }}>{kpis.logistique?.transportPrevuCamions ?? 0} Camions</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#fdba74' }}>
        <span>Risques (24h) :</span>
        <strong style={{ color: '#fff', fontSize: 18 }}>{kpis.logistique?.risques24h ?? 0}</strong>
      </div>
    </div>
  );
}

function TableauRegions({ priorities, regions }: { priorities: Priority[]; regions: WarRoomRegion[] }) {
  const rows: Priority[] = priorities.length > 0 ? priorities : regions.slice(0, 6).map(r => ({
    regionId: r.id, region: r.name, percent: 0, risk: r.stats?.risk ?? 'low', action: 'Suivi',
  }));
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 10 }}>Tableau Régions (Top priorités)</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1f2937' }}>
            {['Region','Actifs','Objectif','%','Risque','Action'].map(h => (
              <th key={h} style={{ padding: '5px 6px', textAlign: h === 'Region' ? 'left' : 'center', color: '#6b7280', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center', color: '#4b5563' }}>Aucune donnée</td></tr>
            : rows.map((p, i) => {
                const rc = ALERT_COLOR[p.risk] || '#22c55e';
                const reg = regions.find(r => r.id === p.regionId || r.name === p.region);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #1f293760' }}>
                    <td style={{ padding: '7px 6px', color: '#d1d5db', fontWeight: 500 }}>{p.region}</td>
                    <td style={{ padding: '7px 6px', textAlign: 'center', color: '#9ca3af' }}>{reg?.stats?.agents ?? '—'}</td>
                    <td style={{ padding: '7px 6px', textAlign: 'center', color: '#9ca3af' }}>{reg?.stats?.missions ?? '—'}</td>
                    <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 700, color: '#e8eaf0' }}>{p.percent}%</td>
                    <td style={{ padding: '7px 6px', textAlign: 'center' }}>
                      <span style={{ background: rc + '22', color: rc, borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 600 }}>{RISK_LABEL[p.risk] || p.risk}</span>
                    </td>
                    <td style={{ padding: '7px 6px', textAlign: 'center' }}>
                      <button style={{ background: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e', borderRadius: 5, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>{p.action || 'Voir'}</button>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}

function JournalIncidents({ incidents }: { incidents: Incident24h[] }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 10 }}>Journal Incidents &amp; Réponse (24h)</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1f2937' }}>
            {['Heure','Lieu','Type','Gravité','Statut'].map(h => (
              <th key={h} style={{ padding: '5px 6px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {incidents.length === 0
            ? <tr><td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#4b5563' }}>Aucun incident (24h)</td></tr>
            : incidents.slice(0, 6).map((inc, i) => {
                const gc = ALERT_COLOR[(inc.gravite || '').toLowerCase()] || '#f59e0b';
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #1f293760' }}>
                    <td style={{ padding: '6px 6px', color: '#9ca3af' }}>{inc.heure}</td>
                    <td style={{ padding: '6px 6px', color: '#d1d5db' }}>{inc.lieu}</td>
                    <td style={{ padding: '6px 6px', color: '#d1d5db' }}>{inc.type}</td>
                    <td style={{ padding: '6px 6px' }}>
                      <span style={{ background: gc + '22', color: gc, borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 600 }}>{inc.gravite}</span>
                    </td>
                    <td style={{ padding: '6px 6px' }}>
                      <span style={{ background: '#22c55e22', color: '#22c55e', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 600 }}>{inc.statut}</span>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}

function Calendrier({ items }: { items: CalendarItem[] }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 10 }}>Calendrier Contenu (Aujourd'hui)</div>
      {items.length === 0
        ? <div style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: 16 }}>Aucun élément planifié</div>
        : items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid #1f293760', alignItems: 'flex-start' }}>
              <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 13, flexShrink: 0, minWidth: 42 }}>{it.time}</span>
              <div>
                <div style={{ color: '#d1d5db', fontSize: 13 }}>{it.type}</div>
                {it.lieu && <div style={{ color: '#6b7280', fontSize: 11 }}>{it.lieu}{it.responsable ? ` · ${it.responsable}` : ''}</div>}
              </div>
            </div>
          ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: initial } = useApi(() => dashboardApi.warRoom(), []);
  const [live, setLive] = useState<WarRoomData | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [clock, setClock] = useState(nowFR());

  useEffect(() => {
    const id = setInterval(() => setClock(nowFR()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleMsg = useCallback((msg: WSMsg) => {
    if (msg.type === 'connected') { setWsConnected(true); return; }
    if (msg.type === 'war-room-update') { setLive(msg.payload as WarRoomData); }
  }, []);

  useWS('war-room', handleMsg);

  const data = (live || initial) as WarRoomData | null;

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#8b8fa8' }}>
      Chargement du War Room…
    </div>
  );

  const { kpis, map, priorities = [], incidents24h = [], calendarToday = [], alert } = data;
  if (!kpis || !map || !alert) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#8b8fa8' }}>
      Initialisation des données…
    </div>
  );

  const alertLevel = alert.level ?? 'normal';
  const PILLS: { level: AlertLevel; label: string }[] = [
    { level: 'normal', label: 'Normal' },
    { level: 'medium', label: 'Vigilance' },
    { level: 'critical', label: 'Crise' },
  ];

  return (
    <div style={{ padding: '0 20px 32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px', borderBottom: '1px solid #1f2937', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e8eaf0' }}>
            OPERATIONS WAR ROOM <span style={{ color: '#60a5fa' }}>DASHBOARD</span>
            <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 13 }}> (Vue nationale)</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
            Date : {clock.date} &nbsp;|&nbsp; Heure : {clock.time}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Alerte :</span>
          {PILLS.map(({ level, label }) => {
            const c = ALERT_COLOR[level];
            const active = alertLevel === level;
            return (
              <span key={level} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: `1px solid ${active ? c : '#3a3d4a'}`, background: active ? c + '22' : 'transparent', color: active ? c : '#8b8fa8', fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? c : '#3a3d4a', display: 'inline-block' }} />
                {label}
              </span>
            );
          })}
          <span style={{ marginLeft: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: wsConnected ? '#22c55e' : '#f59e0b' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: wsConnected ? '#22c55e' : '#f59e0b', display: 'inline-block' }} />
            {wsConnected ? 'Temps réel' : 'Hors-ligne'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
        <KpiMissions kpis={kpis} />
        <KpiTerrain kpis={kpis} />
        <KpiDigital kpis={kpis} />
        <KpiLogistique kpis={kpis} />
      </div>

      {/* Map + Tableau */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12, marginBottom: 12 }}>
        <CongoSVGMap
          regions={map.regions ?? []}
          actionDuJour={map.actionDuJour}
          zonesChaudes={map.zonesChaudes}
          zonesFaibles={map.zonesFaibles}
        />
        <TableauRegions priorities={priorities} regions={map.regions ?? []} />
      </div>

      {/* Incidents + Calendrier */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <JournalIncidents incidents={incidents24h} />
        <Calendrier items={calendarToday} />
      </div>

      {/* Analyse régionale (recharts) */}
      {map.regions && map.regions.length > 0 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 14 }}>Analyse Régionale — Missions &amp; Incidents</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={map.regions.map(r => ({ name: r.name.split(' ')[0], missions: r.stats?.missions ?? 0, incidents: r.stats?.incidents ?? 0 }))} barGap={4} barCategoryGap="25%">
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 6, fontSize: 12, color: '#e8eaf0' }} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="missions" name="Missions" fill="#2563eb" radius={[3, 3, 0, 0]} />
              <Bar dataKey="incidents" name="Incidents" fill="#dc2626" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e8eaf0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>Activités Priorité &amp; War Room</span>
          {calendarToday.slice(0, 3).map((it, i) => (
            <span key={i} style={{ fontSize: 11, color: '#6b7280' }}>⏱ {it.time} {it.type}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {([
            { label: '▶ Créer alerte', bg: '#166534', color: '#4ade80', border: '#166534' },
            { label: '▶ Valider réponse', bg: '#1e3a5f', color: '#60a5fa', border: '#2d5a8e' },
            { label: 'Exporter rapport', bg: '#7c2d12', color: '#fb923c', border: '#9a3412' },
            { label: 'Voir détail (Incidents)', bg: 'transparent', color: '#9ca3af', border: '#374151' },
          ] as const).map(btn => (
            <button key={btn.label} style={{ background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`, borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
