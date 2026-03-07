import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useApi } from '../hooks/useApi.js';
import { eventsApi } from '../api/campaign.api.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import type { EventItem } from '../types/domain.js';

const STATUS: Record<string, { label: string; color: string }> = {
  pending:           { label: 'En attente',       color: '#f59e0b' },
  zone_approved:     { label: 'Validé N1 (Zone)', color: '#3b82f6' },
  zone_rejected:     { label: 'Rejeté zone',      color: '#ef4444' },
  war_room_approved: { label: 'Validé N2 (WR)',   color: '#8b5cf6' },
  published:         { label: 'Publié',           color: '#22c55e' },
};

const FILTERS = [
  { val: '',                 label: 'Tous' },
  { val: 'pending',          label: 'En attente' },
  { val: 'zone_approved',    label: 'Validé N1' },
  { val: 'war_room_approved',label: 'Validé N2' },
  { val: 'published',        label: 'Publiés' },
  { val: 'zone_rejected',    label: 'Rejetés' },
];

function Btn({ color, children, onClick }: { color: string; children: React.ReactNode; onClick: () => void }) {
  const s: CSSProperties = {
    background: color + '22', color, border: `1px solid ${color}55`,
    borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap',
  };
  return <button style={s} onClick={onClick}>{children}</button>;
}

export default function Events() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, refresh } = useApi(
    () => eventsApi.list(statusFilter ? { status: statusFilter } : {}),
    [statusFilter],
  );
  const events: EventItem[] = data?.items ?? [];

  const canN1 = ['zone_leader', 'regional_coordinator', 'war_room'].includes(user?.role ?? '');
  const canN2 = user?.role === 'war_room';

  const doN1Approve = async (id: string) => {
    const comment = prompt('Commentaire (optionnel) :') ?? '';
    await eventsApi.validateZone(id, 'approve', comment || undefined);
    refresh();
  };
  const doN1Reject = async (id: string) => {
    const comment = prompt('Motif du rejet :') ?? '';
    await eventsApi.validateZone(id, 'reject', comment || undefined);
    refresh();
  };
  const doN2Approve = async (id: string) => {
    const comment = prompt('Commentaire War Room (optionnel) :') ?? '';
    await eventsApi.validateWarRoom(id, 'approve', comment || undefined);
    refresh();
  };
  const doN2Reject = async (id: string) => {
    const comment = prompt('Motif du rejet War Room :') ?? '';
    await eventsApi.validateWarRoom(id, 'reject', comment || undefined);
    refresh();
  };
  const doPublish = async (id: string) => {
    await eventsApi.publish(id);
    refresh();
  };

  const bg      = isDark ? '#0f1117' : '#f0f2f8';
  const surface = isDark ? '#1a1d27' : '#ffffff';
  const border  = isDark ? '#2a2d3a' : '#e5e7eb';
  const text    = isDark ? '#e8eaf0' : '#1a1d27';
  const muted   = isDark ? '#8b8fa8' : '#6b7280';

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', background: bg, minHeight: '100vh', color: text }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Événements</h1>
        <span style={{ background: isDark ? '#1e3a5f' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', borderRadius: 20, padding: '2px 12px', fontSize: 13 }}>
          {data?.total ?? 0}
        </span>
      </div>

      {/* Workflow legend */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Workflow</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>Soumis</span>
          <span style={{ color: muted }}>→</span>
          <span style={{ background: '#3b82f622', color: '#3b82f6', border: '1px solid #3b82f644', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>N1 Zone</span>
          <span style={{ fontSize: 11, color: muted }}>(zone_leader / regional_coordinator)</span>
          <span style={{ color: muted }}>→</span>
          <span style={{ background: '#8b5cf622', color: '#8b5cf6', border: '1px solid #8b5cf644', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>N2 War Room</span>
          <span style={{ color: muted }}>→</span>
          <span style={{ background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e44', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>Publié</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {FILTERS.map(f => {
          const active = statusFilter === f.val;
          return (
            <button key={f.val} onClick={() => setStatusFilter(f.val)} style={{
              padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? '#9a1f1f' : border}`,
              background: active ? '#9a1f1f' : surface, color: active ? '#fff' : muted,
              cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
            }}>
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ color: muted, padding: 40, textAlign: 'center' }}>Chargement…</div>
      ) : events.length === 0 ? (
        <div style={{ color: muted, padding: 40, textAlign: 'center' }}>Aucun événement pour ce filtre.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {events.map(e => {
            const st = STATUS[e.status] ?? { label: e.status, color: '#6b7280' };
            return (
              <div key={e.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: st.color + '22', color: st.color, border: `1px solid ${st.color}44`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                      {st.label}
                    </span>
                    <span style={{ fontSize: 11, color: muted }}>{e.eventType}</span>
                  </div>
                  <span style={{ fontSize: 11, color: muted }}>{new Date(e.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>

                {/* Title & meta */}
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: muted, marginBottom: e.description ? 8 : 0 }}>
                  {e.departmentName}{e.arrondissementName ? ` · ${e.arrondissementName}` : ''}
                  {e.zoneName ? ` · ${e.zoneName}` : ''}
                </div>
                {e.description && (
                  <div style={{ fontSize: 13, color: muted, marginBottom: 10, lineHeight: 1.5 }}>
                    {e.description.slice(0, 200)}{e.description.length > 200 ? '…' : ''}
                  </div>
                )}

                {/* Validation history */}
                {e.validations && e.validations.length > 0 && (
                  <div style={{ background: isDark ? '#ffffff08' : '#f9fafb', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                    {e.validations.map((v, i) => (
                      <div key={i} style={{ fontSize: 11, color: muted, marginBottom: i < e.validations!.length - 1 ? 4 : 0 }}>
                        <span style={{ color: v.decision === 'approve' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                          {v.decision === 'approve' ? '✓' : '✗'}
                        </span>
                        {' '}<strong>{v.level === 'zone' ? 'N1 Zone' : 'N2 WR'}</strong>
                        {' par '}{v.by}
                        {v.comment ? ` — ${v.comment}` : ''}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {canN1 && e.status === 'pending' && (
                    <>
                      <Btn color="#3b82f6" onClick={() => doN1Approve(e.id)}>✓ Valider N1</Btn>
                      <Btn color="#ef4444" onClick={() => doN1Reject(e.id)}>✗ Rejeter N1</Btn>
                    </>
                  )}
                  {canN2 && e.status === 'zone_approved' && (
                    <>
                      <Btn color="#8b5cf6" onClick={() => doN2Approve(e.id)}>✓ Valider N2</Btn>
                      <Btn color="#ef4444" onClick={() => doN2Reject(e.id)}>✗ Rejeter N2</Btn>
                    </>
                  )}
                  {canN2 && e.status === 'war_room_approved' && (
                    <Btn color="#22c55e" onClick={() => doPublish(e.id)}>Publier</Btn>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
