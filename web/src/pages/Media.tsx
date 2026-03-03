import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { mediaApi } from '../api/campaign.api.js';
import { useAuth } from '../context/AuthContext.js';
import type { MediaItem } from '../types/domain.js';

const SOURCE_ICONS: Record<string, string> = {
  facebook: '👥', twitter: '🐦', youtube: '▶️', tiktok: '🎵',
  instagram: '📸', radio: '📻', television: '📺', other: '🔗',
};

export default function Media() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, refresh } = useApi(() => mediaApi.list(statusFilter ? { status: statusFilter } : {}), [statusFilter]);

  const items: MediaItem[] = data?.items ?? [];
  const canValidate = ['war_room', 'regional_coordinator', 'zone_leader'].includes(user?.role ?? '');
  const canPublish = ['war_room'].includes(user?.role ?? '');

  const handleValidate = async (id: string) => { await mediaApi.validate(id); refresh(); };
  const handlePublish = async (id: string) => { await mediaApi.publish(id); refresh(); };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Veille médias</h1>
        <span className="badge">{data?.total ?? 0}</span>
      </div>

      <div className="filter-bar">
        {[{ val: '', label: 'Tous' }, { val: 'pending', label: 'En attente' }, { val: 'validated', label: 'Validés' }, { val: 'published', label: 'Publiés' }].map(f => (
          <button key={f.val} className={`filter-btn ${statusFilter === f.val ? 'active' : ''}`} onClick={() => setStatusFilter(f.val)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Chargement…</div> : (
        <div className="media-grid">
          {items.length === 0 ? <div className="empty-state">Aucun média pour ce filtre.</div> : items.map(item => (
            <div key={item.id} className="media-card">
              <div className="media-header">
                <span className="source-icon">{SOURCE_ICONS[item.sourceType] ?? '🔗'}</span>
                <span className="source-type">{item.sourceType}</span>
                <span className={`status-pill ${item.status}`}>{item.status}</span>
              </div>
              <div className="media-title">{item.title}</div>
              {item.summary && <div className="media-summary">{item.summary.slice(0, 120)}…</div>}
              {item.sourceUrl && (
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="media-link">
                  Voir la source ↗
                </a>
              )}
              <div className="media-meta">{item.departmentId ?? 'National'} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}</div>
              <div className="media-actions">
                {canValidate && item.status === 'pending' && (
                  <button className="btn btn-validate" onClick={() => handleValidate(item.id)}>✓ Valider</button>
                )}
                {canPublish && item.status === 'validated' && (
                  <button className="btn btn-publish" onClick={() => handlePublish(item.id)}>🌐 Publier</button>
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
        .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .media-card { background: #1c2333; border-radius: 12px; padding: 16px; border: 1px solid #1f2937; }
        .media-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .source-icon { font-size: 20px; }
        .source-type { color: #9ca3af; font-size: 12px; flex: 1; text-transform: capitalize; }
        .status-pill { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; background: #374151; color: #d1d5db; }
        .status-pill.published { background: #064e3b; color: #34d399; }
        .status-pill.validated { background: #1e3a5f; color: #60a5fa; }
        .media-title { font-weight: 600; color: #f1f5f9; margin-bottom: 6px; }
        .media-summary { color: #9ca3af; font-size: 13px; margin-bottom: 8px; }
        .media-link { color: #60a5fa; font-size: 12px; text-decoration: none; display: block; margin-bottom: 8px; }
        .media-meta { color: #6b7280; font-size: 11px; margin-bottom: 10px; }
        .media-actions { display: flex; gap: 8px; }
        .btn { padding: 5px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; }
        .btn-validate { background: #059669; color: #fff; }
        .btn-publish { background: #2563eb; color: #fff; }
      `}</style>
    </div>
  );
}
