import { useApi } from '../hooks/useApi.js';
import { apiFetch } from '../api/client.js';
import { useTheme } from '../context/ThemeContext.js';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vehicule {
  id: string; type: string; immatriculation: string; chauffeur: string;
  statut: 'deploye' | 'disponible' | 'maintenance'; regionId: string; region: string; mission: string;
}
interface Materiel {
  id: string; nom: string; categorie: string;
  quantite: number; disponible: number; statut: 'ok' | 'partiel' | 'critique'; lieu: string;
}
interface Risque {
  id: string; date: string; heure: string; region: string; type: string;
  description: string; gravite: 'low' | 'medium' | 'high' | 'critical'; statut: 'en_cours' | 'resolu';
}
interface Budget { total: number; depense: number; reserve: number; devise: string; }
interface LogistiqueData {
  budget: Budget;
  vehicules: Vehicule[];
  materiel: Materiel[];
  risques: Risque[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUT_V = {
  deploye:     { label: 'Déployé',     color: '#22c55e' },
  disponible:  { label: 'Disponible',  color: '#3b82f6' },
  maintenance: { label: 'Maintenance', color: '#f59e0b' },
};
const STATUT_M = {
  ok:       { label: 'OK',       color: '#22c55e' },
  partiel:  { label: 'Partiel',  color: '#f59e0b' },
  critique: { label: 'Critique', color: '#ef4444' },
};
const GRAVITE = {
  low:      { label: 'Faible',    color: '#6b7280' },
  medium:   { label: 'Moyen',     color: '#f59e0b' },
  high:     { label: 'Élevé',     color: '#ef4444' },
  critical: { label: 'Critique',  color: '#7c3aed' },
};
const TYPE_V_ICON: Record<string, string> = { '4x4': '🚙', minibus: '🚐', camion: '🚛' };
const CAT_ICON: Record<string, string> = {
  technique: '🔧', com: '📢', infrastructure: '⛺', securite: '🔐', carburant: '⛽',
};

function fmt(n: number, devise = 'FCFA') {
  return n.toLocaleString('fr-FR') + ' ' + devise;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, isDark }: { label: string; value: string; sub?: string; color: string; isDark: boolean }) {
  const surface = isDark ? '#1a1d27' : '#ffffff';
  const border  = isDark ? '#2a2d3a' : '#e5e7eb';
  const text    = isDark ? '#e8eaf0' : '#1a1d27';
  const muted   = isDark ? '#8b8fa8' : '#6b7280';
  return (
    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '16px 20px', flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 11, color: muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'Bebas Neue, sans-serif' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <h2 style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#e8eaf0' : '#1a1d27', margin: '28px 0 14px', textTransform: 'uppercase', letterSpacing: 1, borderLeft: '3px solid #9a1f1f', paddingLeft: 10 }}>
      {title}
    </h2>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Logistique() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { data, loading } = useApi<LogistiqueData>(() => apiFetch<LogistiqueData>('/api/logistics'), []);

  const bg      = isDark ? '#0f1117' : '#f0f2f8';
  const surface = isDark ? '#1a1d27' : '#ffffff';
  const border  = isDark ? '#2a2d3a' : '#e5e7eb';
  const text    = isDark ? '#e8eaf0' : '#1a1d27';
  const muted   = isDark ? '#8b8fa8' : '#6b7280';
  const th      = isDark ? '#4b5280' : '#9ca3af';

  if (loading) return <div style={{ padding: 40, color: muted, fontFamily: 'Inter, sans-serif' }}>Chargement…</div>;
  if (!data)   return <div style={{ padding: 40, color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>Erreur de chargement.</div>;

  const { budget, vehicules = [], materiel = [], risques = [] } = data;

  // KPIs from vehicules
  const deployes    = vehicules.filter(v => v.statut === 'deploye').length;
  const dispos      = vehicules.filter(v => v.statut === 'disponible').length;
  const maintenance = vehicules.filter(v => v.statut === 'maintenance').length;
  const risquesActifs = risques.filter(r => r.statut === 'en_cours').length;
  const critique = materiel.filter(m => m.statut === 'critique').length;

  const budgetPct = budget ? Math.round((budget.depense / budget.total) * 100) : 0;

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', background: bg, minHeight: '100vh', color: text }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: text, margin: 0 }}>Logistique</h1>
        <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>Véhicules · Matériel · Budget · Risques</div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <KpiCard label="Véhicules déployés"  value={`${deployes}/${vehicules.length}`}  sub={`${dispos} dispo · ${maintenance} maint.`} color="#22c55e" isDark={isDark} />
        <KpiCard label="Budget utilisé"      value={`${budgetPct}%`}   sub={budget ? `${fmt(budget.depense, budget.devise)} / ${fmt(budget.total, budget.devise)}` : ''} color="#c9a84c" isDark={isDark} />
        <KpiCard label="Risques actifs"      value={String(risquesActifs)}  sub={`${risques.length - risquesActifs} résolus`} color={risquesActifs > 0 ? '#ef4444' : '#22c55e'} isDark={isDark} />
        <KpiCard label="Matériel critique"   value={String(critique)}   sub={`${materiel.length} références total`} color={critique > 0 ? '#f59e0b' : '#22c55e'} isDark={isDark} />
      </div>

      {/* Budget bar */}
      {budget && (
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 20px', marginTop: 16, marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: muted, marginBottom: 8 }}>
            <span>Budget total : <strong style={{ color: text }}>{fmt(budget.total, budget.devise)}</strong></span>
            <span>Réserve : <strong style={{ color: '#c9a84c' }}>{fmt(budget.reserve, budget.devise)}</strong></span>
            <span>Dépensé : <strong style={{ color: '#ef4444' }}>{fmt(budget.depense, budget.devise)}</strong></span>
          </div>
          <div style={{ background: isDark ? '#0f1117' : '#f0f2f8', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${budgetPct}%`, height: '100%', background: `linear-gradient(90deg, #9a1f1f, #c9a84c)`, borderRadius: 4, transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {/* ── Véhicules ── */}
      <SectionTitle title={`Flotte véhicules (${vehicules.length})`} isDark={isDark} />
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${border}` }}>
              {['Type', 'Immatriculation', 'Chauffeur', 'Statut', 'Région', 'Mission'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: th, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicules.map((v, i) => {
              const s = STATUT_V[v.statut] ?? STATUT_V.disponible;
              return (
                <tr key={v.id} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? 'transparent' : (isDark ? '#ffffff08' : '#f9fafb') }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: text }}>{TYPE_V_ICON[v.type] ?? '🚗'} {v.type}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: text, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{v.immatriculation}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: text }}>{v.chauffeur}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}44`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: muted }}>{v.region}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: muted }}>{v.mission}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Matériel ── */}
      <SectionTitle title={`Inventaire matériel (${materiel.length})`} isDark={isDark} />
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${border}` }}>
              {['Matériel', 'Catégorie', 'Qté totale', 'Disponible', 'Statut', 'Lieu'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: th, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {materiel.map((m, i) => {
              const s = STATUT_M[m.statut] ?? STATUT_M.partiel;
              const pct = Math.round((m.disponible / m.quantite) * 100);
              return (
                <tr key={m.id} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? 'transparent' : (isDark ? '#ffffff08' : '#f9fafb') }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: text, fontWeight: 500 }}>{m.nom}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: muted }}>{CAT_ICON[m.categorie] ?? '📦'} {m.categorie}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: text }}>{m.quantite.toLocaleString('fr-FR')}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: isDark ? '#0f1117' : '#e5e7eb', borderRadius: 3, height: 5 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: text, minWidth: 36 }}>{m.disponible.toLocaleString('fr-FR')}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}44`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: muted }}>{m.lieu}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Risques ── */}
      <SectionTitle title={`Risques & incidents logistiques (${risques.length})`} isDark={isDark} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {risques.length === 0 ? (
          <div style={{ color: muted, fontSize: 13, padding: '20px 0' }}>Aucun risque enregistré.</div>
        ) : risques.map(r => {
          const g = GRAVITE[r.gravite] ?? GRAVITE.medium;
          const resolu = r.statut === 'resolu';
          return (
            <div key={r.id} style={{ background: surface, border: `1px solid ${resolu ? border : g.color + '44'}`, borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 16, alignItems: 'flex-start', opacity: resolu ? 0.65 : 1 }}>
              <div style={{ minWidth: 8, width: 8, height: 8, borderRadius: '50%', background: g.color, marginTop: 5 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{g.label}</span>
                  <span style={{ fontSize: 11, color: muted }}>·</span>
                  <span style={{ fontSize: 11, color: muted }}>{r.type}</span>
                  <span style={{ fontSize: 11, color: muted }}>·</span>
                  <span style={{ fontSize: 11, color: muted }}>{r.region}</span>
                  <span style={{ fontSize: 11, color: muted }}>·</span>
                  <span style={{ fontSize: 11, color: muted }}>{r.date} {r.heure}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: resolu ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                    {resolu ? '✓ Résolu' : '⚠ En cours'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: text }}>{r.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
