import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { eventsApi } from '../api/campaign.api.js';
import { useAuth } from '../context/AuthContext.js';
import type { EventItem } from '../types/domain.js';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', zone_approved: 'Approuvé zone', zone_rejected: 'Rejeté zone',
  war_room_approved: 'Approuvé WR', published: 'Publié',
};
const STATUS_COLORS: Record<string, string> = {
  pending: '#6b7280', zone_approved: '#2563eb', zone_rejected: '#dc2626',
  war_room_approved: '#059669', published: '#10b981',
};

export default function Events() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, refresh } = useApi(() => eventsApi.list(statusFilter ? { status: statusFilter } : {}), [statusFilter]);
  const events: EventItem[] = data?.items ?? [];

  const canValidateZone = ['war_room', 'regional_coordinator'].includes(user?.role ?? '');
  const canPublish = user?.role === 'war_room';

  const handleValidateZone = async (id: string, decision: 'approve' | 'reject') => {
    await eventsApi.validateZone(id, decision);
    refresh();
  };

  const handlePublish = async (id: string) => {
    await eventsApi.publish(id);
    refresh();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Événements</h1>
        <span className="badge">{data?.total ?? 0}</span>
      </div>

      <div className="filter-bar">
        {['', 'pending', 'zone_approved', 'war_room_approved', 'published'].map(s => (
          <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s ? STATUS_LABELS[s] : 'Tous'}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Chargement…</div> : (
        <div className="events-list">
          {events.length === 0 ? <div className="empty-state">Aucun événement.</div> : events.map(e => (
            <div key={e.id} className="event-card">
              <div className="event-header">
                <span className="status-badge" style={{ background: STATUS_COLORS[e.status] ?? '#6b7280' }}>
                  {STATUS_LABELS[e.status] ?? e.status}
                </span>
                <span className="event-date">{new Date(e.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="event-title">{e.title}</div>
              <div className="event-meta">{e.eventType} · {e.departmentName}</div>
              {e.description && <div className="event-desc">{e.description.slice(0, 150)}</div>}
              <div className="event-actions">
                {canValidateZone && e.status === 'pending' && (
                  <>
                    <button className="btn btn-approve" onClick={() => handleValidateZone(e.id, 'approve')}>✓ Approuver</button>
                    <button className="btn btn-reject" onClick={() => handleValidateZone(e.id, 'reject')}>✗ Rejeter</button>
                  </>
                )}
                {canPublish && e.status === 'war_room_approved' && (
                  <button className="btn btn-publish" onClick={() => handlePublish(e.id)}>🌐 Publier</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .page-content { padding: 24px; }
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .badge { background: #1e3a5f; color: #60a5fa; border-radius: 20px; padding: 2px 10px; font-size: 13px; }
        .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #374151; background: #1c2333; color: #9ca3af; cursor: pointer; font-size: 13px; }
        .filter-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .events-list { display: grid; gap: 12px; }
        .event-card { background: #1c2333; border-radius: 12px; padding: 16px; border: 1px solid #1f2937; }
        .event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #fff; font-weight: 600; }
        .event-date { color: #6b7280; font-size: 12px; }
        .event-title { font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
        .event-meta { color: #6b7280; font-size: 12px; margin-bottom: 8px; }
        .event-desc { color: #9ca3af; font-size: 13px; margin-bottom: 10px; }
        .event-actions { display: flex; gap: 8px; }
        .btn { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; }
        .btn-approve { background: #059669; color: #fff; }
        .btn-reject { background: #dc2626; color: #fff; }
        .btn-publish { background: #2563eb; color: #fff; }
      `}</style>
    </div>
  );
}
