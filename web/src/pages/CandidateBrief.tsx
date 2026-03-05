import { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWS } from '../hooks/useWS.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
import type { CandidateBrief, AlertLevel } from '../types/domain.js';
import type { WSMessage } from '../types/ws.js';

const ALERT_COLORS: Record<AlertLevel, string> = { normal: '#22c55e', low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };
const RISK_LABELS: Record<string, string> = { low: 'Faible', medium: 'Modéré', high: 'Élevé', normal: 'Normal', critical: 'Critique' };

function KpiBlock({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || '#e8eaf0' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8b8fa8', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function CandidateBriefPage() {
  const { data: initial, loading } = useApi(() => dashboardApi.candidateBrief());
  const [live, setLive] = useState<CandidateBrief | null>(null);

  const handleMsg = useCallback((msg: WSMessage) => {
    if (msg.type === 'candidate-brief-update') setLive(msg.payload);
  }, []);

  useWS('candidate-brief', handleMsg);

  const data = live || initial;

  if (loading && !data) return <div style={{ color: '#8b8fa8', padding: 32 }}>Chargement du briefing candidat...</div>;
  if (!data) return <div style={{ color: '#ef4444', padding: 32 }}>Données indisponibles</div>;

  const { headline, national, priorities, regions, timeline, publishedEvents, publishedMedia, visibility, recentAdhesions } = data;
  const alertColor = ALERT_COLORS[headline.alertLevel] || '#22c55e';

  return (
    <div style={{ padding: '0 24px 40px' }}>
      {/* Header */}
      <div style={{ background: alertColor + '18', border: `1px solid ${alertColor}44`, borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: alertColor }} />
              <span style={{ color: alertColor, fontWeight: 700, fontSize: 14 }}>Alerte : {RISK_LABELS[headline.alertLevel] || headline.alertLevel}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#e8eaf0' }}>{headline.actionDuJour}</div>
            {headline.note && <div style={{ fontSize: 13, color: '#8b8fa8', marginTop: 6 }}>{headline.note}</div>}
          </div>
          <div style={{ fontSize: 11, color: '#8b8fa8' }}>Mis à jour : {new Date(headline.generatedAt).toLocaleTimeString('fr-FR')}</div>
        </div>
      </div>

      {/* KPIs nationaux */}
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Indicateurs nationaux</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 28 }}>
        {visibility.showPolling && <KpiBlock label="Sondage moyen" value={`${national.pollingAverage}%`} color="#c9a84c" />}
        {visibility.showAdhesion && <KpiBlock label="Adhérents" value={national.adherents} color="#22c55e" />}
        {visibility.showEvents && <KpiBlock label="Évts publiés" value={national.publishedEvents} />}
        {visibility.showEvents && <KpiBlock label="Évts stratégiques" value={national.strategicEvents} color="#c9a84c" />}
        {visibility.showIncidents && <KpiBlock label="Incidents 24h" value={national.incidents24h} color={national.incidents24h > 5 ? '#ef4444' : '#e8eaf0'} />}
        {visibility.showMedia && <KpiBlock label="Médias publiés" value={national.mediaPublished} />}
        {visibility.showMedia && <KpiBlock label="Mentions sensibles" value={national.sensitiveMentions} color={national.sensitiveMentions > 0 ? '#f59e0b' : '#e8eaf0'} />}
        {visibility.showTerrain && <KpiBlock label="Rapports terrain" value={national.terrainReports} />}
        <KpiBlock label="Régions prioritaires" value={national.priorityRegions} />
        <KpiBlock label="Publié aujourd'hui" value={national.publishedToday} color="#22c55e" />
      </div>

      {/* Priorités régionales */}
      {priorities.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priorités régionales</h2>
          <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, marginBottom: 28, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0f1117' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: '#8b8fa8', fontWeight: 500 }}>Région</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', color: '#8b8fa8', fontWeight: 500 }}>%</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: '#8b8fa8', fontWeight: 500 }}>Risque</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: '#8b8fa8', fontWeight: 500 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {priorities.map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #2a2d3a' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 500 }}>{p.region}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', color: '#c9a84c', fontWeight: 600 }}>{p.percent}%</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ color: ALERT_COLORS[p.risk] || '#e8eaf0', fontSize: 12, fontWeight: 600 }}>{RISK_LABELS[p.risk] || p.risk}</span>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#8b8fa8' }}>{p.action || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Régions détail */}
      {regions.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Régions — synthèse</h2>
          {/* Mobilisation chart */}
          {visibility.showPolling && regions.some(r => r.mobilisation > 0 || r.pollingAverage > 0) && (
            <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#8b8fa8', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobilisation &amp; Sondage par région</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={regions.map(r => ({ name: r.name.split(' ')[0], Mobilisation: r.mobilisation, Sondage: r.pollingAverage }))} barGap={2} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={28} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 6, fontSize: 12, color: '#e8eaf0' }} cursor={{ fill: '#ffffff08' }} />
                  <Bar dataKey="Mobilisation" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Sondage" fill="#c9a84c" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 28 }}>
            {regions.map(r => (
              <div key={r.id} style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</span>
                  <span style={{ fontSize: 11, color: ALERT_COLORS[r.risk], fontWeight: 600 }}>{RISK_LABELS[r.risk] || r.risk}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12, color: '#8b8fa8' }}>
                  {visibility.showPolling && <span>Sondage: <strong style={{ color: '#c9a84c' }}>{r.pollingAverage}%</strong></span>}
                  {visibility.showAdhesion && <span>Adhérents: <strong style={{ color: '#e8eaf0' }}>{r.memberEnrollments}</strong></span>}
                  {visibility.showEvents && <span>Événements: <strong style={{ color: '#e8eaf0' }}>{r.eventsPublished}</strong></span>}
                  {visibility.showIncidents && <span>Incidents: <strong style={{ color: r.incidents > 3 ? '#ef4444' : '#e8eaf0' }}>{r.incidents}</strong></span>}
                  {visibility.showMedia && <span>Médias: <strong style={{ color: '#e8eaf0' }}>{r.mediaPublished}</strong></span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Événements récents */}
      {visibility.showEvents && publishedEvents.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Événements publiés</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {publishedEvents.slice(0, 5).map(e => (
              <div key={e.id} style={{ background: '#1a1d27', border: `1px solid ${e.isStrategic ? '#c9a84c44' : '#2a2d3a'}`, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                {e.isStrategic && <span style={{ fontSize: 16 }}>⭐</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: '#8b8fa8' }}>{e.departmentName} · {e.eventDate} · {e.participantEstimate?.toLocaleString('fr-FR')} pers.</div>
                </div>
                <span style={{ fontSize: 11, color: '#8b8fa8', background: '#0f1117', padding: '4px 8px', borderRadius: 4 }}>{e.impactLevel}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Médias récents */}
      {visibility.showMedia && publishedMedia.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Médias publiés</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {publishedMedia.slice(0, 5).map(m => (
              <div key={m.id} style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#8b8fa8' }}>{m.departmentName} · {m.sourceType}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: m.tone === 'sensible' ? '#f59e0b' : m.tone === 'positif' ? '#22c55e' : '#8b8fa8', fontWeight: 600 }}>{m.tone}</div>
                  <div style={{ fontSize: 11, color: '#8b8fa8' }}>{(m.reachEstimate || 0).toLocaleString('fr-FR')} portée</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Adhésions récentes */}
      {visibility.showAdhesion && recentAdhesions.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adhésions récentes</h2>
          <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, overflow: 'hidden', marginBottom: 28 }}>
            {recentAdhesions.map((a, i) => (
              <div key={a.id} style={{ padding: '10px 16px', borderBottom: i < recentAdhesions.length - 1 ? '1px solid #2a2d3a' : 'none', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ fontWeight: 500 }}>{a.fullName}</span>
                <span style={{ color: '#8b8fa8' }}>{a.departmentName} · {new Date(a.submittedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {timeline.map((t, i) => (
              <div key={i} style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 6, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.sourceType === 'incident' ? '#ef4444' : t.sourceType === 'event' ? '#22c55e' : '#8b8fa8', marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{t.summary}</div>
                  <div style={{ fontSize: 11, color: '#8b8fa8' }}>{t.region} · {t.zone} · {t.type}</div>
                </div>
                {t.time && <div style={{ fontSize: 11, color: '#8b8fa8', flexShrink: 0 }}>{t.time}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
