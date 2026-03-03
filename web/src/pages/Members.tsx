import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { membersApi } from '../api/campaign.api.js';
import { useAuth } from '../context/AuthContext.js';
import type { MemberEnrollment } from '../types/domain.js';

const STATUS_LABELS: Record<string, string> = { pending: 'En attente', published: 'Publié' };

export default function Members() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, refresh } = useApi(() => membersApi.list(statusFilter ? { status: statusFilter } : {}), [statusFilter]);

  const members: MemberEnrollment[] = data?.items ?? [];
  const canPublish = ['war_room'].includes(user?.role ?? '');

  const handlePublish = async (id: string) => {
    await membersApi.publish(id);
    refresh();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Adhésions</h1>
        <span className="badge">{data?.total ?? 0}</span>
      </div>

      <div className="filter-bar">
        {[{ val: '', label: 'Tous' }, { val: 'pending', label: 'En attente' }, { val: 'published', label: 'Publiés' }].map(f => (
          <button key={f.val} className={`filter-btn ${statusFilter === f.val ? 'active' : ''}`} onClick={() => setStatusFilter(f.val)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Chargement…</div> : (
        <div className="table-wrapper">
          {members.length === 0 ? <div className="empty-state">Aucune adhésion.</div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th><th>Téléphone</th><th>Département</th><th>Statut</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td>{m.fullName ?? `${m.lastName} ${m.firstNames}`}</td>
                    <td>{m.phone ?? '—'}</td>
                    <td>{m.departmentId ?? '—'}</td>
                    <td>
                      <span className={`status-pill ${m.status}`}>{STATUS_LABELS[m.status] ?? m.status}</span>
                    </td>
                    <td>{new Date(m.submittedAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      {canPublish && m.status === 'pending' && (
                        <button className="btn-publish" onClick={() => handlePublish(m.id)}>Publier</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style>{`
        .page-content { padding: 24px; }
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .badge { background: #1e3a5f; color: #60a5fa; border-radius: 20px; padding: 2px 10px; font-size: 13px; }
        .filter-bar { display: flex; gap: 8px; margin-bottom: 20px; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #374151; background: #1c2333; color: #9ca3af; cursor: pointer; font-size: 13px; }
        .filter-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 10px 12px; color: #6b7280; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1f2937; }
        .data-table td { padding: 12px; border-bottom: 1px solid #1f2937; color: #d1d5db; font-size: 14px; }
        .status-pill { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
        .status-pill.pending { background: #1e3a5f; color: #60a5fa; }
        .status-pill.published { background: #064e3b; color: #34d399; }
        .btn-publish { padding: 4px 10px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; }
      `}</style>
    </div>
  );
}
