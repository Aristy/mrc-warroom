import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';

interface PollRegion {
  departmentId: string;
  departmentName?: string;
  respondents: number;
  breakdown?: Record<string, number>;
}

interface PollingReview {
  totalRespondents?: number;
  lastUpdated?: string;
  breakdown?: Record<string, number>;
  regions?: PollRegion[];
  summary?: string;
}

export default function PollingReview() {
  const { data: rawData, loading } = useApi(() => dashboardApi.pollingReview(), []);
  const data = rawData as PollingReview | null;

  const regions = data?.regions ?? [];
  const breakdown = data?.breakdown ?? {};

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Sondages</h1>
        {data?.lastUpdated && (
          <span className="updated">Mis à jour : {new Date(data.lastUpdated).toLocaleString('fr-FR')}</span>
        )}
      </div>

      {loading ? <div className="loading">Chargement…</div> : (
        <>
          {data?.summary && <div className="summary-box">{data.summary}</div>}

          {data?.totalRespondents !== undefined && (
            <div className="total-box">
              <span className="total-label">Total répondants :</span>
              <span className="total-value">{data.totalRespondents.toLocaleString('fr-FR')}</span>
            </div>
          )}

          {Object.keys(breakdown).length > 0 && (
            <>
              <h2 className="section-title">Intentions de vote — National</h2>
              <div className="breakdown-list">
                {Object.entries(breakdown).map(([option, count]) => {
                  const pct = data?.totalRespondents ? Math.round((count / data.totalRespondents) * 100) : 0;
                  return (
                    <div key={option} className="breakdown-row">
                      <span className="option-label">{option}</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="pct-label">{pct}%</span>
                      <span className="count-label">({count})</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {regions.length > 0 && (
            <>
              <h2 className="section-title">Par département</h2>
              <div className="regions-grid">
                {regions.map((r, i) => (
                  <div key={i} className="region-card">
                    <div className="region-name">{r.departmentName ?? r.departmentId}</div>
                    <div className="region-respondents">{r.respondents} répondants</div>
                    {r.breakdown && (
                      <div className="region-breakdown">
                        {Object.entries(r.breakdown).map(([opt, n]) => (
                          <div key={opt} className="region-row">
                            <span>{opt}</span>
                            <strong>{n}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {regions.length === 0 && Object.keys(breakdown).length === 0 && (
            <div className="empty-state">Aucune donnée de sondage disponible.</div>
          )}
        </>
      )}

      <style>{`
        .page-content { padding: 24px; }
        .page-header { display: flex; align-items: baseline; gap: 16px; margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .updated { color: #6b7280; font-size: 13px; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .summary-box { background: #1c2333; border-left: 3px solid #7c3aed; padding: 12px 16px; color: #d1d5db; font-size: 14px; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
        .total-box { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .total-label { color: #9ca3af; font-size: 14px; }
        .total-value { font-size: 20px; font-weight: 700; color: #f1f5f9; }
        .section-title { font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; }
        .breakdown-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .breakdown-row { display: flex; align-items: center; gap: 10px; }
        .option-label { width: 180px; color: #d1d5db; font-size: 14px; flex-shrink: 0; }
        .bar-container { flex: 1; height: 8px; background: #1f2937; border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; background: #7c3aed; border-radius: 4px; transition: width 0.3s; }
        .pct-label { width: 40px; text-align: right; color: #f1f5f9; font-weight: 700; font-size: 14px; }
        .count-label { color: #6b7280; font-size: 12px; width: 60px; }
        .regions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .region-card { background: #1c2333; border-radius: 10px; padding: 14px; border: 1px solid #1f2937; }
        .region-name { font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
        .region-respondents { color: #6b7280; font-size: 12px; margin-bottom: 10px; }
        .region-breakdown { display: flex; flex-direction: column; gap: 4px; }
        .region-row { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; }
        .region-row strong { color: #f1f5f9; }
      `}</style>
    </div>
  );
}
