import { useState, useCallback } from 'react';
import { useWS } from '../hooks/useWS.js';
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
import type { WarRoomData, AlertLevel } from '../types/domain.js';
import type { WSMessage as WSMsg } from '../types/ws.js';

const ALERT_COLORS: Record<AlertLevel, string> = { normal: '#22c55e', low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '16px 20px' }}>
      <div style={{ fontSize: 12, color: '#8b8fa8', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#e8eaf0' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#8b8fa8', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function AlertBanner({ level }: { level: AlertLevel }) {
  const color = ALERT_COLORS[level] || '#22c55e';
  const labels: Record<string, string> = { normal: 'Opérations normales', low: 'Alerte basse', medium: 'Alerte modérée', high: 'Alerte haute', critical: 'Alerte critique' };
  return (
    <div style={{ background: color + '18', border: `1px solid ${color}44`, borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ color, fontWeight: 600, fontSize: 14 }}>{labels[level] || level}</span>
    </div>
  );
}

export default function Dashboard() {
  const { data: initial } = useApi(() => dashboardApi.warRoom());
  const [live, setLive] = useState<WarRoomData | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const handleMsg = useCallback((msg: WSMsg) => {
    if (msg.type === 'connected') { setWsConnected(true); return; }
    if (msg.type === 'war-room-update') { setLive(msg.payload); }
  }, []);

  useWS('war-room', handleMsg);

  const data = live || initial;

  if (!data) return <div style={{ color: '#8b8fa8', padding: 32 }}>Chargement du War Room...</div>;

  const { kpis, map, priorities, incidents24h, campaign, alert } = data;

  return (
    <div style={{ padding: '0 24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>War Room</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: wsConnected ? '#22c55e' : '#f59e0b' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: wsConnected ? '#22c55e' : '#f59e0b' }} />
          {wsConnected ? 'Temps réel' : 'Reconnexion...'}
        </div>
      </div>

      <AlertBanner level={alert.level} />

      {map.actionDuJour && (
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#c9a84c', fontWeight: 500 }}>
          🎯 Action du jour : {map.actionDuJour}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Taux de réalisation" value={`${kpis.missions.tauxRealisation}%`} sub={`${kpis.missions.missionsEngagees} missions`} />
        <KpiCard label="Portes à portes" value={kpis.terrain.portesAPorte.done} />
        <KpiCard label="Meetings confirmés" value={kpis.terrain.meetingsConfirmes} />
        <KpiCard label="Vues vidéo" value={(kpis.digital.vuesVideo || 0).toLocaleString('fr-FR')} />
        <KpiCard label="WhatsApp relay" value={kpis.digital.whatsappRelay} />
        <KpiCard label="Adherents publiés" value={campaign?.newAdherents || 0} />
        <KpiCard label="Rapports terrain" value={campaign?.terrainReports || 0} />
        <KpiCard label="Incidents 24h" value={incidents24h?.length || 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Régions prioritaires</h2>
          {priorities?.length === 0 && <p style={{ color: '#8b8fa8', fontSize: 13 }}>Aucune priorité définie</p>}
          {priorities?.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2a2d3a' }}>
              <span style={{ fontSize: 13 }}>{p.region}</span>
              <span style={{ fontSize: 12, color: ALERT_COLORS[p.risk] || '#8b8fa8', fontWeight: 600 }}>{p.percent}% · {p.risk}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Incidents 24h</h2>
          {incidents24h?.length === 0 && <p style={{ color: '#8b8fa8', fontSize: 13 }}>Aucun incident</p>}
          {incidents24h?.slice(0, 6).map((inc, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #2a2d3a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{inc.type}</span>
                <span style={{ fontSize: 11, color: '#8b8fa8' }}>{inc.heure}</span>
              </div>
              <div style={{ fontSize: 12, color: '#8b8fa8' }}>{inc.lieu} · {inc.statut}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
