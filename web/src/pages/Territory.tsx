import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { territoryApi } from '../api/campaign.api.js';
import type { TerritoryDepartment } from '../types/domain.js';

export default function Territory() {
  const { data, loading } = useApi(() => territoryApi.departments(), []);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const departments: TerritoryDepartment[] = data?.departments ?? [];

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalArrondissements = departments.reduce((s, d) => s + (d.arrondissements?.length ?? 0), 0);
  const totalZones = departments.reduce((s, d) => s + (d.arrondissements ?? []).reduce((a, arr) => a + (arr.zones?.length ?? 0), 0), 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Territoire</h1>
        <div className="stats-row">
          <span className="stat-chip">{departments.length} départements</span>
          <span className="stat-chip">{totalArrondissements} arrondissements</span>
          <span className="stat-chip">{totalZones} zones</span>
        </div>
      </div>

      {loading ? <div className="loading">Chargement…</div> : (
        <div className="dep-list">
          {departments.map(dep => (
            <div key={dep.id ?? dep.name} className="dep-card">
              <button className="dep-header" onClick={() => toggle(dep.id ?? dep.name)}>
                <span className="dep-flag">🗺️</span>
                <span className="dep-name">{dep.name}</span>
                <span className="dep-count">{dep.arrondissements?.length ?? 0} arrondissements</span>
                <span className="expand-icon">{expanded.has(dep.id ?? dep.name) ? '▼' : '›'}</span>
              </button>
              {expanded.has(dep.id ?? dep.name) && dep.arrondissements && (
                <div className="arr-list">
                  {dep.arrondissements.map(arr => (
                    <div key={arr.id ?? arr.name} className="arr-item">
                      <span className="arr-name">{arr.name}</span>
                      {arr.zones && arr.zones.length > 0 && (
                        <div className="zones-list">
                          {arr.zones.map(z => (
                            <span key={z.id ?? z.name} className="zone-chip">{z.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .page-content { padding: 24px; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0 0 12px; }
        .stats-row { display: flex; gap: 8px; }
        .stat-chip { background: #1c2333; border: 1px solid #374151; color: #9ca3af; padding: 4px 12px; border-radius: 20px; font-size: 13px; }
        .loading { color: #9ca3af; padding: 40px; text-align: center; }
        .dep-list { display: flex; flex-direction: column; gap: 8px; }
        .dep-card { background: #1c2333; border-radius: 10px; border: 1px solid #1f2937; overflow: hidden; }
        .dep-header { width: 100%; display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: none; border: none; cursor: pointer; text-align: left; }
        .dep-header:hover { background: #1f2937; }
        .dep-flag { font-size: 18px; }
        .dep-name { flex: 1; font-weight: 600; color: #f1f5f9; font-size: 15px; }
        .dep-count { color: #6b7280; font-size: 12px; }
        .expand-icon { color: #6b7280; font-size: 16px; }
        .arr-list { padding: 0 16px 16px 44px; display: flex; flex-direction: column; gap: 10px; }
        .arr-item { }
        .arr-name { color: #93c5fd; font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px; }
        .zones-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .zone-chip { background: #1f2937; color: #9ca3af; padding: 2px 10px; border-radius: 10px; font-size: 11px; }
      `}</style>
    </div>
  );
}
