import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { campaignApi } from '../api/campaign.api.js';
import type { CampaignRecord } from '../types/domain.js';

const CATEGORY_LABELS: Record<string, string> = {
  terrain: 'Terrain', sondage: 'Sondage', incident: 'Incident',
  adherent: 'Adhérent', digital: 'Digital', mission: 'Mission', logistique: 'Logistique',
};

const CATEGORY_COLORS: Record<string, string> = {
  terrain: '#2563eb', sondage: '#7c3aed', incident: '#dc2626',
  adherent: '#db2777', digital: '#0891b2', mission: '#d97706', logistique: '#65a30d',
};

export default function Campaign() {
  const [category, setCategory] = useState('');
  const { data, loading } = useApi(() => campaignApi.list(category ? { category } : {}), [category]);

  const records: CampaignRecord[] = data?.items ?? [];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Campagne terrain</h1>
        <span className="badge">{data?.total ?? 0} entrées</span>
      </div>

      <div className="filter-bar">
        {['', ...Object.keys(CATEGORY_LABELS)].map(cat => (
          <button
            key={cat}
            className={`filter-btn ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat ? CATEGORY_LABELS[cat] : 'Tous'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Chargement…</div>
      ) : records.length === 0 ? (
        <div className="empty-state">Aucun rapport pour ce filtre.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Département</th>
                <th>Agent</th>
                <th>Date</th>
                <th>Données</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className="category-tag" style={{ backgroundColor: CATEGORY_COLORS[r.category] ?? '#6b7280' }}>
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </span>
                  </td>
                  <td>{r.regionName ?? r.regionId ?? '—'}</td>
                  <td>{r.submittedBy ?? '—'}</td>
                  <td>{new Date(r.submittedAt).toLocaleDateString('fr-FR')}</td>
                  <td className="data-preview">
                    <pre>{r.summary?.slice(0, 120) ?? r.title ?? '—'}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 10px 12px; color: #6b7280; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #1f2937; }
        .data-table td { padding: 12px; border-bottom: 1px solid #1f2937; color: #d1d5db; font-size: 14px; }
        .category-tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #fff; font-weight: 600; }
        .data-preview pre { font-size: 11px; color: #6b7280; max-width: 300px; white-space: pre-wrap; }
      `}</style>
    </div>
  );
}
