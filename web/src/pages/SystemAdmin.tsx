import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { systemApi } from '../api/dashboard.api.js';

export default function SystemAdmin() {
  const { data: overview, loading: overviewLoading } = useApi(() => systemApi.overview(), []);
  const { data: settings, loading: settingsLoading, refresh } = useApi(() => systemApi.settings(), []);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const updated: Record<string, unknown> = {};
      fd.forEach((val, key) => { updated[key] = val; });
      await systemApi.updateSettings(updated);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleClearTestData = async () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    await systemApi.clearTestData();
    setConfirmClear(false);
    window.location.reload();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Administration système</h1>
      </div>

      {/* Overview */}
      {overviewLoading ? <div className="loading">Chargement…</div> : overview != null && (
        <section className="section">
          <h2 className="section-title">Vue d'ensemble</h2>
          <div className="overview-grid">
            {Object.entries(overview as Record<string, unknown>).map(([key, val]) => (
              <div key={key} className="overview-card">
                <div className="overview-label">{key}</div>
                <div className="overview-value">{String(val)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Settings */}
      {!settingsLoading && settings && (
        <section className="section">
          <h2 className="section-title">Paramètres</h2>
          <form className="settings-form" onSubmit={handleSaveSettings}>
            {Object.entries(settings as unknown as Record<string, unknown>).map(([key, val]) => (
              <div key={key} className="form-row">
                <label className="form-label">{key}</label>
                <input
                  className="form-input"
                  name={key}
                  defaultValue={String(val)}
                />
              </div>
            ))}
            <button type="submit" className="btn btn-save" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </section>
      )}

      {/* Danger zone */}
      <section className="section danger-section">
        <h2 className="section-title danger">Zone dangereuse</h2>
        <div className="danger-card">
          <div>
            <div className="danger-title">Effacer données de test</div>
            <div className="danger-desc">Supprime toutes les entrées marquées comme données de test.</div>
          </div>
          <button
            className={`btn ${confirmClear ? 'btn-confirm' : 'btn-danger'}`}
            onClick={handleClearTestData}
          >
            {confirmClear ? '⚠️ Confirmer' : 'Effacer test'}
          </button>
        </div>
      </section>

      <style>{`
        .page-content { padding: 24px; max-width: 900px; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .loading { color: #9ca3af; padding: 40px; text-align: center; }
        .section { margin-bottom: 32px; }
        .section-title { font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .section-title.danger { color: #dc2626; }
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        .overview-card { background: #1c2333; border-radius: 10px; padding: 14px; border: 1px solid #1f2937; }
        .overview-label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .overview-value { font-size: 20px; font-weight: 700; color: #f1f5f9; }
        .settings-form { background: #1c2333; border-radius: 12px; padding: 20px; border: 1px solid #1f2937; }
        .form-row { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
        .form-label { width: 200px; color: #9ca3af; font-size: 14px; flex-shrink: 0; }
        .form-input { flex: 1; background: #0f1117; border: 1px solid #374151; border-radius: 8px; padding: 10px 12px; color: #f1f5f9; font-size: 14px; }
        .btn { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; }
        .btn-save { background: #2563eb; color: #fff; margin-top: 8px; }
        .danger-section { }
        .danger-card { background: #1c1212; border: 1px solid #7f1d1d; border-radius: 12px; padding: 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .danger-title { font-weight: 600; color: #fca5a5; margin-bottom: 4px; }
        .danger-desc { color: #9ca3af; font-size: 13px; }
        .btn-danger { background: #7f1d1d; color: #fca5a5; }
        .btn-confirm { background: #dc2626; color: #fff; }
      `}</style>
    </div>
  );
}
