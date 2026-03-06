import { useState, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useWS } from '../hooks/useWS.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
import CongoSVGMap from '../components/map/CongoSVGMap.js';
import type { WarRoomData, AlertLevel, Priority, Incident24h, CalendarItem, WarRoomRegion, ProgrammeStop } from '../types/domain.js';
import type { WSMessage as WSMsg } from '../types/ws.js';

/* ─── Design tokens matching reference ─────────────────────────────── */
const T = {
  bg:      '#07111f',
  bgAlt:   '#0d1e30',
  panel:   'rgba(15,30,47,0.9)',
  border:  'rgba(41,74,108,0.82)',
  accent:  '#00c8ff',
  green:   '#00c853',
  orange:  '#f0b429',
  red:     '#e53935',
  text:    '#ecf3fb',
  soft:    '#bfd0e4',
  dim:     '#89a4c3',
  fontDisplay: '"Bebas Neue", sans-serif',
  fontBody:    '"DM Sans", sans-serif',
  fontMono:    '"JetBrains Mono", monospace',
};

const RISK_COLOR: Record<string, string> = {
  normal: T.green, low: T.green, medium: T.orange, high: T.red, critical: '#7c3aed',
};
const RISK_LABEL: Record<string, string> = { low: 'Bas', medium: 'Moyen', high: 'Élevé', critical: 'Critique', normal: 'Bas' };

const panel = (extra?: object) => ({
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
  textTransform: 'uppercase' as const,
  color: '#e0eeff',
  display: 'flex' as const,
  alignItems: 'center' as const,
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
function KpiCard({ title, color, bg, icon, children }: {
  title: string; color: string; bg: string; icon: string; children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: bg, border: `1px solid ${T.border}`, borderRadius: 18, padding: '18px 18px 16px', minHeight: 156 }}>
      <div style={{ position: 'absolute', inset: 0, top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${color} 24%,transparent)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color }}>{title}</span>
        <span style={{ opacity: 0.75, fontSize: 16 }}>{icon}</span>
      </div>
      {children}
    </div>
  );
}

function KpiLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, margin: '8px 0' }}>
      <span style={{ color: T.soft, fontSize: 12 }}>{label}</span>
      <strong style={{ color: '#f7fbff', fontFamily: T.fontDisplay, fontSize: 'clamp(1.8rem,2.1vw,2.3rem)', lineHeight: 1, letterSpacing: '0.03em' }}>{value}</strong>
    </div>
  );
}

function KpiMissions({ kpis }: { kpis: WarRoomData['kpis'] }) {
  const pct = kpis.missions?.tauxRealisation ?? 0;
  return (
    <KpiCard title="KPIs Missions" color={T.green} bg="linear-gradient(180deg,rgba(13,43,31,0.96),rgba(11,28,25,0.96))" icon="✦">
      <KpiLine label="Objectif jour :" value={kpis.missions?.objectifJour ?? 0} />
      <KpiLine label="Missions engagées :" value={kpis.missions?.missionsEngagees ?? 0} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: T.green, borderRadius: 999, boxShadow: '0 0 12px rgba(0,200,83,0.42)' }} />
        </div>
        <span style={{ color: T.green, fontFamily: T.fontMono, fontSize: 11 }}>{pct}%</span>
      </div>
    </KpiCard>
  );
}

function KpiTerrain({ kpis }: { kpis: WarRoomData['kpis'] }) {
  const done = kpis.terrain?.portesAPorte?.done ?? 0;
  const target = kpis.terrain?.portesAPorte?.target ?? 0;
  return (
    <KpiCard title="KPIs Terrain" color={T.accent} bg="linear-gradient(180deg,rgba(11,33,49,0.96),rgba(10,25,39,0.96))" icon="⚑">
      <KpiLine label="Portes-à-porte :" value={`${done}/${target || '—'}`} />
      <KpiLine label="Meetings confirmés :" value={kpis.terrain?.meetingsConfirmes ?? 0} />
    </KpiCard>
  );
}

function KpiDigital({ kpis }: { kpis: WarRoomData['kpis'] }) {
  return (
    <KpiCard title="KPIs Digital" color="#7fdcff" bg="linear-gradient(180deg,rgba(15,30,47,0.98),rgba(11,24,38,0.98))" icon="📱">
      <KpiLine label="Vues vidéo :" value={(kpis.digital?.vuesVideo || 0).toLocaleString('fr-FR')} />
      <KpiLine label="WhatsApp relay :" value={kpis.digital?.whatsappRelay ?? 0} />
    </KpiCard>
  );
}

function KpiLogistique({ kpis }: { kpis: WarRoomData['kpis'] }) {
  return (
    <KpiCard title="KPIs Logistique" color={T.orange} bg="linear-gradient(180deg,rgba(47,31,12,0.96),rgba(32,21,11,0.96))" icon="🚚">
      <KpiLine label="Transport prévu :" value={`${kpis.logistique?.transportPrevuCamions ?? 0} camions`} />
      <KpiLine label="Risques (24h) :" value={kpis.logistique?.risques24h ?? 0} />
    </KpiCard>
  );
}

/* ─── Priority Table ─────────────────────────────────────────────────── */
function TableauRegions({ priorities, regions }: { priorities: Priority[]; regions: WarRoomRegion[] }) {
  const rows = priorities.length > 0 ? priorities : regions.slice(0, 8).map(r => ({
    regionId: r.id, region: r.name, percent: 0, risk: r.stats?.risk ?? 'low' as AlertLevel, action: 'Suivi',
  }));
  return (
    <div style={panel({ padding: 0, overflow: 'hidden' })}>
      <div style={{ padding: '18px 20px 10px' }}>
        <h3 style={sectionTitle()}><span style={accentBar()} />Tableau Régions (Top priorités)</h3>
      </div>
      <div style={{ overflowX: 'auto', maxHeight: 400 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={{ background: 'rgba(16,34,53,0.9)' }}>
              {['Région', 'Resp.', 'Actifs', 'Obj.', '%', 'Risque', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: T.soft, fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={7} style={{ padding: 18, textAlign: 'center', color: T.dim, fontFamily: T.fontBody }}>Aucune donnée</td></tr>
              : rows.map((p, i) => {
                  const rc = RISK_COLOR[p.risk] || T.green;
                  const reg = regions.find(r => r.id === p.regionId || r.name === p.region);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid rgba(41,74,108,0.36)`, cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,200,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 14px', color: '#f0f8ff', fontSize: 12, fontWeight: 500 }}>{p.region}</td>
                      <td style={{ padding: '12px 14px', color: T.dim, fontSize: 12 }}>—</td>
                      <td style={{ padding: '12px 14px', color: T.soft, fontSize: 12 }}>{reg?.stats?.agents ?? '—'}</td>
                      <td style={{ padding: '12px 14px', color: T.soft, fontSize: 12 }}>{reg?.stats?.missions ?? '—'}</td>
                      <td style={{ padding: '12px 14px', color: '#fff', fontFamily: T.fontDisplay, fontSize: '1.1rem' }}>{p.percent}%</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: rc + '28', color: rc, border: `1px solid ${rc}55`, borderRadius: 999, padding: '4px 10px', fontSize: 10, fontWeight: 600, fontFamily: T.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{RISK_LABEL[p.risk] || p.risk}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button style={{ background: 'transparent', color: T.accent, border: `1px solid rgba(0,200,255,0.32)`, borderRadius: 999, padding: '5px 12px', fontSize: 10, fontFamily: T.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>{p.action || 'Voir'}</button>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Adhésion Summary ──────────────────────────────────────────────── */
function AdhesionPanel({ campaign }: { campaign: WarRoomData['campaign'] }) {
  const stats = [
    { label: 'Nouveaux adhérents', val: campaign.newAdherents, color: T.accent },
    { label: 'Rapports terrain', val: campaign.terrainReports, color: T.green },
    { label: 'Missions reportées', val: campaign.missionsReported, color: T.orange },
    { label: 'Sondage moyen', val: `${campaign.pollingAverage}%`, color: '#a78bfa' },
  ];
  return (
    <div style={panel({ padding: '18px 20px' })}>
      <h3 style={{ ...sectionTitle(), marginBottom: 14 }}><span style={accentBar()} />Adhésion MRC</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'rgba(16,34,53,0.7)', border: `1px solid rgba(41,74,108,0.45)`, borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 22, fontWeight: 400, color: s.color, fontFamily: T.fontDisplay }}>{s.val}</span>
            <span style={{ fontSize: 10, color: T.dim, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: T.dim, fontFamily: T.fontBody }}>Publié aujourd'hui : <strong style={{ color: T.soft }}>{campaign.publishedToday}</strong></span>
        <a href="/members" style={{ fontSize: 10, color: T.accent, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>Voir fiches →</a>
      </div>
    </div>
  );
}

/* ─── Analytics Charts ───────────────────────────────────────────────── */
const CHART_PANEL = {
  ...panel({ padding: '16px 18px' }),
  background: 'radial-gradient(circle at 78% 0%,rgba(0,200,255,0.08),transparent 40%), linear-gradient(180deg,rgba(17,30,50,0.92),rgba(11,22,39,0.96))',
};

function ChartActivite({ regions }: { regions: WarRoomRegion[] }) {
  const data = regions.slice(0, 8).map(r => ({ name: r.name.split(' ')[0], missions: r.stats?.missions ?? 0, incidents: r.stats?.incidents ?? 0 }));
  return (
    <div style={CHART_PANEL}>
      <h3 style={sectionTitle()}><span style={accentBar()} />Activité Régionale</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={2} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fill: T.dim, fontSize: 10, fontFamily: T.fontBody }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.dim, fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
            <Tooltip contentStyle={{ background: '#0d1e30', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text, fontFamily: T.fontBody }} cursor={{ fill: 'rgba(0,200,255,0.06)' }} />
            <Bar dataKey="missions" name="Missions" fill="#2563eb" radius={[3, 3, 0, 0]} />
            <Bar dataKey="incidents" name="Incidents" fill={T.red} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(135,164,202,0.24)', borderRadius: 14, color: T.dim, fontSize: 12 }}>Aucune donnée régionale</div>
      )}
    </div>
  );
}

function ChartRisques({ regions }: { regions: WarRoomRegion[] }) {
  const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  regions.forEach(r => { const k = r.stats?.risk ?? 'low'; counts[k] = (counts[k] ?? 0) + 1; });
  const data = [
    { name: 'Bas', value: counts.low + counts.normal, color: T.green },
    { name: 'Moyen', value: counts.medium, color: T.orange },
    { name: 'Élevé', value: counts.high, color: T.red },
    { name: 'Critique', value: counts.critical, color: '#7c3aed' },
  ].filter(d => d.value > 0);
  return (
    <div style={CHART_PANEL}>
      <h3 style={sectionTitle()}><span style={accentBar(T.orange)} />Répartition des Risques</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="45%" outerRadius={72} dataKey="value" strokeWidth={2} stroke={T.bgAlt}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0d1e30', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text }} />
            <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: T.soft, fontFamily: T.fontBody }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(135,164,202,0.24)', borderRadius: 14, color: T.dim, fontSize: 12 }}>Aucune donnée</div>
      )}
    </div>
  );
}

function ChartSondages({ regions }: { regions: WarRoomRegion[] }) {
  const data = regions.slice(0, 6).map(r => ({ name: r.name.split(' ')[0], score: Math.round(Math.random() * 40 + 30) }));
  return (
    <div style={CHART_PANEL}>
      <h3 style={sectionTitle()}><span style={accentBar('#a78bfa')} />Sondages Complets</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barCategoryGap="25%">
          <XAxis type="number" domain={[0, 100]} tick={{ fill: T.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: T.soft, fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip contentStyle={{ background: '#0d1e30', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text }} cursor={{ fill: 'rgba(167,139,250,0.07)' }} />
          <Bar dataKey="score" fill="#a78bfa" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartCanaux() {
  const data = [
    { name: 'Terrain', value: 38, color: T.green },
    { name: 'Digital', value: 27, color: T.accent },
    { name: 'Médias', value: 18, color: T.orange },
    { name: 'Meetings', value: 17, color: '#f472b6' },
  ];
  return (
    <div style={CHART_PANEL}>
      <h3 style={sectionTitle()}><span style={accentBar(T.green)} />Canaux de Campagne</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="45%" innerRadius={46} outerRadius={72} dataKey="value" strokeWidth={2} stroke={T.bgAlt}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#0d1e30', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, color: T.text }} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: T.soft, fontFamily: T.fontBody }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Incidents ──────────────────────────────────────────────────────── */
function JournalIncidents({ incidents }: { incidents: Incident24h[] }) {
  return (
    <div style={panel({ padding: 0, overflow: 'hidden' })}>
      <div style={{ padding: '18px 20px 10px' }}>
        <h3 style={sectionTitle()}><span style={accentBar(T.red)} />Journal Incidents &amp; Réponse (24h)</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr style={{ background: 'rgba(16,34,53,0.9)' }}>
              {['Heure', 'Lieu', 'Type', 'Gravité', 'Responsable', 'Statut'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', color: T.soft, fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0
              ? <tr><td colSpan={6} style={{ padding: 18, textAlign: 'center', color: T.dim, fontSize: 12 }}>Aucun incident (24h)</td></tr>
              : incidents.slice(0, 6).map((inc, i) => {
                  const gc = RISK_COLOR[(inc.gravite || '').toLowerCase()] || T.orange;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid rgba(41,74,108,0.3)` }}>
                      <td style={{ padding: '11px 14px', color: T.accent, fontFamily: T.fontMono, fontSize: 11 }}>{inc.heure}</td>
                      <td style={{ padding: '11px 14px', color: T.soft, fontSize: 12 }}>{inc.lieu}</td>
                      <td style={{ padding: '11px 14px', color: T.text, fontSize: 12 }}>{inc.type}</td>
                      <td style={{ padding: '11px 14px' }}><span style={{ background: gc + '28', color: gc, border: `1px solid ${gc}55`, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontFamily: T.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{inc.gravite}</span></td>
                      <td style={{ padding: '11px 14px', color: T.dim, fontSize: 12 }}>—</td>
                      <td style={{ padding: '11px 14px' }}><span style={{ background: 'rgba(0,200,83,0.16)', color: T.green, border: `1px solid rgba(0,200,83,0.32)`, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontFamily: T.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{inc.statut}</span></td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Calendrier ─────────────────────────────────────────────────────── */
function Calendrier({ items }: { items: CalendarItem[] }) {
  return (
    <div style={panel()}>
      <h3 style={sectionTitle()}><span style={accentBar(T.accent)} />Calendrier Contenu (Aujourd'hui)</h3>
      {items.length === 0
        ? <div style={{ color: T.dim, fontSize: 12, textAlign: 'center', padding: '16px 0' }}>Aucun élément planifié</div>
        : items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 10, padding: '9px 0', borderBottom: `1px solid rgba(30,58,95,0.4)`, alignItems: 'start' }}>
              <span style={{ color: T.accent, fontFamily: T.fontMono, fontSize: 11 }}>{it.time}</span>
              <div>
                <div style={{ color: '#e2efff', fontSize: 12 }}>{it.type}</div>
                {it.lieu && <div style={{ color: T.dim, fontSize: 11, marginTop: 2 }}>{it.lieu}{it.responsable ? ` · ${it.responsable}` : ''}</div>}
              </div>
            </div>
          ))}
    </div>
  );
}

/* ─── Programme Candidat ────────────────────────────────────────────── */
const TODAY = new Date().toISOString().slice(0, 10);

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  visite:  { icon: '📍', color: T.accent,  label: 'Visite' },
  nuit:    { icon: '🌙', color: '#a78bfa', label: 'Nuit' },
  retour:  { icon: '🏠', color: T.green,   label: 'Retour BZV' },
};

function ProgrammeCandidatPanel({ stops }: { stops: ProgrammeStop[] }) {
  // Group by date
  const byDate: Record<string, ProgrammeStop[]> = {};
  stops.forEach(s => { (byDate[s.date] ??= []).push(s); });
  const dates = Object.keys(byDate).sort();

  const fmtDate = (d: string) => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  return (
    <div style={panel({ padding: '18px 20px' })}>
      <h3 style={{ ...sectionTitle(), marginBottom: 14 }}>
        <span style={accentBar('#c9a84c')} />Programme Candidat — Tournée nationale
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {dates.map((date, di) => {
          const dayStops = byDate[date];
          const isToday = date === TODAY;
          const isPast  = date < TODAY;
          return (
            <div key={date} style={{ display: 'flex', gap: 0, position: 'relative' }}>
              {/* Timeline line + node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                <div style={{
                  width: isToday ? 14 : 10, height: isToday ? 14 : 10,
                  borderRadius: '50%', marginTop: 12, flexShrink: 0, zIndex: 1,
                  background: isToday ? '#c9a84c' : isPast ? T.dim : T.accent,
                  boxShadow: isToday ? '0 0 10px rgba(201,168,76,0.7)' : 'none',
                  border: isToday ? '2px solid #ffd740' : `2px solid ${isPast ? '#374151' : T.border}`,
                }} />
                {di < dates.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 20, background: isPast ? '#1f2d40' : 'rgba(41,74,108,0.5)', marginTop: 2 }} />
                )}
              </div>
              {/* Day content */}
              <div style={{ flex: 1, padding: '8px 0 10px 10px', borderBottom: di < dates.length - 1 ? '1px solid rgba(41,74,108,0.2)' : 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#c9a84c' : isPast ? T.dim : T.soft, fontFamily: T.fontMono, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {fmtDate(date)}
                  {isToday && <span style={{ background: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44', borderRadius: 4, padding: '1px 6px', fontSize: 9, letterSpacing: '0.1em' }}>AUJOURD'HUI</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {dayStops.map((s, si) => {
                    const meta = TYPE_META[s.type] || TYPE_META.visite;
                    return (
                      <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13 }}>{meta.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isPast ? T.dim : '#f0f8ff' }}>{s.lieu}</span>
                        <span style={{ fontSize: 11, color: T.dim }}>·</span>
                        <span style={{ fontSize: 11, color: T.dim }}>{s.departement}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: meta.color, fontFamily: T.fontMono, textTransform: 'uppercase', background: meta.color + '18', padding: '1px 7px', borderRadius: 4, border: `1px solid ${meta.color}33` }}>
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────── */
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: T.dim, fontFamily: T.fontBody }}>
      Chargement du War Room…
    </div>
  );

  const { kpis, map, priorities = [], incidents24h = [], calendarToday = [], alert } = data;
  if (!kpis || !map || !alert) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: T.dim, fontFamily: T.fontBody }}>
      Initialisation des données…
    </div>
  );

  const alertLevel = alert.level ?? 'normal';
  const ALERT_PILLS = [
    { level: 'normal', label: 'Normal', color: T.green },
    { level: 'medium', label: 'Vigilance', color: T.orange },
    { level: 'critical', label: 'Crise', color: T.red },
  ];

  return (
    <div style={{ padding: '0 20px 32px', fontFamily: T.fontBody, color: T.text }}>

      {/* ── Topbar ─────────────────────────────────────────────────── */}
      <div style={{
        ...panel({ borderRadius: 18, padding: '16px 22px', marginBottom: 14, marginTop: 4 }),
        background: 'linear-gradient(180deg,rgba(19,40,64,0.72),rgba(12,27,43,0.84))',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <img src="/flag.png" alt="Congo" style={{ width: 38, height: 26, borderRadius: 7, objectFit: 'cover', border: '1px solid rgba(164,202,255,0.28)', boxShadow: '0 10px 24px rgba(0,0,0,0.24)' }} />
            <span style={{ color: T.soft, fontFamily: T.fontMono, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Republique du Congo</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 'clamp(1.8rem,2.1vw,2.45rem)', fontWeight: 400, letterSpacing: '0.045em', color: '#e8f2ff', lineHeight: 0.95 }}>
            OPERATIONS WAR ROOM <span style={{ color: T.accent }}>DASHBOARD</span>
          </h1>
          <p style={{ margin: '8px 0 0', color: T.soft, fontFamily: T.fontMono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>(Vue nationale)</p>
        </div>

        <div style={{ display: 'grid', gap: 10, justifyItems: 'end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: T.soft, fontSize: 12 }}>Date: <strong style={{ color: T.accent, fontFamily: T.fontMono, fontWeight: 400 }}>{clock.date}</strong></span>
            <span style={{ color: T.soft, fontSize: 12 }}>Heure: <strong style={{ color: T.accent, fontFamily: T.fontMono, fontWeight: 400 }}>{clock.time}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: T.soft, fontSize: 12 }}>Alerte:</span>
            {ALERT_PILLS.map(({ level, label, color }) => {
              const active = alertLevel === level;
              return (
                <span key={level} style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${active ? color + '66' : 'rgba(82,122,168,0.24)'}`, background: active ? color + '22' : 'rgba(255,255,255,0.03)', color: active ? color : T.soft, fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: active ? `0 8px 20px ${color}22` : 'none' }}>
                  {label}
                </span>
              );
            })}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: wsConnected ? T.green : T.orange, marginLeft: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: wsConnected ? T.green : T.orange, display: 'inline-block' }} />
              {wsConnected ? 'Temps réel' : 'Hors-ligne'}
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 14 }}>
        <KpiMissions kpis={kpis} />
        <KpiTerrain kpis={kpis} />
        <KpiDigital kpis={kpis} />
        <KpiLogistique kpis={kpis} />
      </div>

      {/* ── Main Grid: Left rail + Right rail ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(360px,0.85fr)', gap: 14, alignItems: 'start' }}>

        {/* ── Left Rail ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Map */}
          <CongoSVGMap
            regions={map.regions ?? []}
            actionDuJour={map.actionDuJour}
            zonesChaudes={map.zonesChaudes}
            zonesFaibles={map.zonesFaibles}
          />
          {/* Priority table */}
          <TableauRegions priorities={priorities} regions={map.regions ?? []} />
          {/* Adhésion MRC summary */}
          <AdhesionPanel campaign={data.campaign ?? { newAdherents: 0, terrainReports: 0, missionsReported: 0, pollingAverage: 0, publishedToday: 0, totalPublished: 0, digitalEntries: 0, incidentEntries: 0 }} />
        </div>

        {/* ── Right Rail ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gap: 14 }}>
          {/* 4 analytics charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
            <ChartActivite regions={map.regions ?? []} />
            <ChartRisques regions={map.regions ?? []} />
            <ChartSondages regions={map.regions ?? []} />
            <ChartCanaux />
          </div>
          {/* Incidents + Calendar */}
          <JournalIncidents incidents={incidents24h} />
          <Calendrier items={calendarToday} />
          {/* Programme Candidat */}
          {data.candidateProgramme && data.candidateProgramme.length > 0 && (
            <ProgrammeCandidatPanel stops={data.candidateProgramme} />
          )}
        </div>
      </div>

      {/* ── Action Bar ─────────────────────────────────────────────── */}
      <div style={{
        ...panel({ padding: '14px 20px', marginTop: 14 }),
        background: 'linear-gradient(180deg,rgba(19,40,64,0.72),rgba(12,27,43,0.84))',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <strong style={{ color: '#e0eeff', fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Activités Priorité &amp; War Room</strong>
          {calendarToday.slice(0, 3).map((it, i) => (
            <span key={i} style={{ color: T.accent, fontFamily: T.fontMono, fontSize: 11 }}>⏱ {it.time} {it.type}</span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: 'Rapport terrain', href: '/territory' },
            { label: 'Évènements', href: '/events' },
            { label: 'Territoire', href: '/territory' },
            { label: 'Vue candidat', href: '/candidate' },
            { label: 'Système', href: '/admin' },
          ].map(btn => (
            <a key={btn.label} href={btn.href} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 16px', border: `1px solid rgba(0,200,255,0.28)`, borderRadius: 12, background: 'rgba(0,200,255,0.04)', color: '#d7ebfb', fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              {btn.label}
            </a>
          ))}
          <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 16px', border: '0', borderRadius: 12, background: T.green, color: '#02130a', fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 12px 26px rgba(0,200,83,0.22)` }}>
            Créer alerte
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 16px', border: '0', borderRadius: 12, background: T.orange, color: '#251500', fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 12px 26px rgba(240,180,41,0.22)` }}>
            Valider réponse
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 16px', border: '0', borderRadius: 12, background: '#e35a2f', color: '#fff', fontFamily: T.fontMono, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 12px 26px rgba(227,90,47,0.22)` }}>
            Exporter rapport
          </button>
        </div>
      </div>
    </div>
  );
}
