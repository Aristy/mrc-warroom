import { useState, type ReactNode, type CSSProperties } from 'react';
import { useApi } from '../hooks/useApi.js';
import { territoryApi, eventsApi, campaignApi, membersApi, mediaApi } from '../api/campaign.api.js';
import type { TerritoryDepartment, EventItem, CampaignRecord, MemberEnrollment, MediaItem } from '../types/domain.js';

const SOURCE_ICONS: Record<string, string> = {
  youtube: '▶', facebook: 'f', instagram: '📷', 'twitter/x': '𝕏', tiktok: '♪',
  whatsapp: '💬', presse: '📰', tv: '📺', radio: '📻',
};
const TONE_COLORS: Record<string, string> = { positif: '#16a34a', neutre: '#6b7280', negatif: '#dc2626', critique: '#f59e0b' };
const CAT_COLORS: Record<string, string> = { terrain: '#2563eb', sondage: '#7c3aed', incident: '#dc2626', adherent: '#16a34a', digital: '#0891b2', mission: '#d97706', logistique: '#6b7280' };

interface DeptDetail {
  events: EventItem[];
  campaign: CampaignRecord[];
  members: MemberEnrollment[];
  media: MediaItem[];
  loading: boolean;
}

export default function Territory() {
  const { data, loading } = useApi(() => territoryApi.departments(), []);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedDept, setSelectedDept] = useState<TerritoryDepartment | null>(null);
  const [detail, setDetail] = useState<DeptDetail>({ events: [], campaign: [], members: [], media: [], loading: false });

  const departments: TerritoryDepartment[] = data?.departments ?? [];
  const totalArrondissements = departments.reduce((s, d) => s + (d.arrondissements?.length ?? 0), 0);
  const totalZones = departments.reduce((s, d) => s + (d.arrondissements ?? []).reduce((a, arr) => a + (arr.zones?.length ?? 0), 0), 0);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openDetail = async (dep: TerritoryDepartment) => {
    setSelectedDept(dep);
    setDetail({ events: [], campaign: [], members: [], media: [], loading: true });
    const deptId = dep.id ?? dep.name;
    const [ev, camp, mem, med] = await Promise.allSettled([
      eventsApi.list({ departmentId: deptId, status: 'publie' }),
      campaignApi.list({ regionId: deptId }),
      membersApi.list({ departmentId: deptId }),
      mediaApi.list({ departmentId: deptId, status: 'publie' }),
    ]);
    setDetail({
      events: ev.status === 'fulfilled' ? ev.value.items : [],
      campaign: camp.status === 'fulfilled' ? camp.value.items : [],
      members: mem.status === 'fulfilled' ? mem.value.items : [],
      media: med.status === 'fulfilled' ? med.value.items : [],
      loading: false,
    });
  };

  const closeDetail = () => setSelectedDept(null);

  return (
    <div style={{ padding: 24, display: 'flex', gap: 24, position: 'relative' }}>
      {/* Main territory list */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #f1f5f9)', margin: '0 0 12px' }}>Territoire</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={chipStyle}>{departments.length} départements</span>
            <span style={chipStyle}>{totalArrondissements} arrondissements</span>
            <span style={chipStyle}>{totalZones} zones</span>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted, #9ca3af)', padding: 40, textAlign: 'center' }}>Chargement…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {departments.map(dep => {
              const dId = dep.id ?? dep.name;
              const isOpen = expanded.has(dId);
              const isSelected = selectedDept?.id === dep.id;
              return (
                <div key={dId} style={{
                  background: isSelected ? '#9a1f1f14' : 'var(--surface2, #1c2333)',
                  borderRadius: 10, border: `1px solid ${isSelected ? '#9a1f1f66' : 'var(--border, #1f2937)'}`, overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <button style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => toggle(dId)}>
                      <span style={{ fontSize: 18 }}>🗺️</span>
                      <span style={{ flex: 1, fontWeight: 600, color: 'var(--text, #f1f5f9)', fontSize: 15 }}>{dep.name}</span>
                      <span style={{ color: 'var(--text-muted, #6b7280)', fontSize: 12 }}>{dep.arrondissements?.length ?? 0} arrondissements</span>
                      <span style={{ color: 'var(--text-muted, #6b7280)', fontSize: 16, marginLeft: 8 }}>{isOpen ? '▼' : '›'}</span>
                    </button>
                    <button onClick={() => isSelected ? closeDetail() : openDetail(dep)} style={{
                      margin: '0 12px', padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      background: isSelected ? '#9a1f1f' : '#2563eb22', color: isSelected ? '#fff' : '#93c5fd',
                    }}>
                      {isSelected ? '✕ Fermer' : 'Voir détail'}
                    </button>
                  </div>
                  {isOpen && dep.arrondissements && (
                    <div style={{ padding: '0 16px 16px 44px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {dep.arrondissements.map(arr => (
                        <div key={arr.id ?? arr.name}>
                          <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{arr.name}</span>
                          {arr.zones && arr.zones.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {arr.zones.map(z => (
                                <span key={z.id ?? z.name} style={{ background: 'var(--surface, #1f2937)', color: 'var(--text-muted, #9ca3af)', padding: '2px 10px', borderRadius: 10, fontSize: 11 }}>{z.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedDept && (
        <div style={{
          width: 420, flexShrink: 0, background: 'var(--surface, #1a1d27)', border: '1px solid var(--border, #2a2d3a)',
          borderRadius: 12, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)', position: 'sticky', top: 0,
        }}>
          {/* Panel header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, #2a2d3a)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text, #f1f5f9)', fontSize: 16 }}>{selectedDept.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted, #8b8fa8)', marginTop: 2 }}>Situation globale du département</div>
            </div>
            <button onClick={closeDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #8b8fa8)', fontSize: 20, lineHeight: 1 }}>×</button>
          </div>

          {detail.loading ? (
            <div style={{ color: 'var(--text-muted, #9ca3af)', padding: 40, textAlign: 'center' }}>Chargement des données…</div>
          ) : (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Stats pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Événements', val: detail.events.length, color: '#2563eb' },
                  { label: 'Membres', val: detail.members.length, color: '#16a34a' },
                  { label: 'Médias', val: detail.media.length, color: '#7c3aed' },
                  { label: 'Rapports', val: detail.campaign.length, color: '#d97706' },
                ].map(s => (
                  <div key={s.label} style={{ background: `${s.color}14`, border: `1px solid ${s.color}44`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted, #9ca3af)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Events */}
              <DetailSection title="Événements récents" count={detail.events.length}>
                {detail.events.slice(0, 6).map(ev => (
                  <div key={ev.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border, #1f2937)' }}>
                    {ev.media?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        {ev.media.slice(0, 3).map(m => (
                          m.mediaType === 'image' && m.filePath ? (
                            <img key={m.id} src={`/uploads/events/${m.filePath.split('/').pop()}`}
                              style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border, #2a2d3a)' }}
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : m.mediaType === 'video' ? (
                            <div key={m.id} style={{ width: 60, height: 45, background: '#000', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>▶</div>
                          ) : null
                        ))}
                      </div>
                    )}
                    <div style={{ fontWeight: 600, color: 'var(--text, #e8eaf0)', fontSize: 13 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted, #8b8fa8)', marginTop: 2 }}>
                      {ev.eventType} · {ev.zoneName || ev.arrondissementName} · {new Date(ev.eventDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
                {detail.events.length === 0 && <EmptyMsg text="Aucun événement publié" />}
              </DetailSection>

              {/* Media */}
              <DetailSection title="Médias publiés" count={detail.media.length}>
                {detail.media.slice(0, 5).map(m => (
                  <div key={m.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border, #1f2937)', alignItems: 'flex-start' }}>
                    {m.screenshotPath ? (
                      <img src={`/uploads/events/${m.screenshotPath.split('/').pop()}`}
                        style={{ width: 50, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: 50, height: 36, background: 'var(--surface2, #1c2333)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {SOURCE_ICONS[m.sourceType] || '📄'}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text, #e8eaf0)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted, #8b8fa8)' }}>{m.sourceType}</span>
                        {m.tone && (
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: `${TONE_COLORS[m.tone] || '#6b7280'}22`, color: TONE_COLORS[m.tone] || '#9ca3af', border: `1px solid ${TONE_COLORS[m.tone] || '#6b7280'}44` }}>{m.tone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {detail.media.length === 0 && <EmptyMsg text="Aucun média publié" />}
              </DetailSection>

              {/* Members */}
              <DetailSection title="Adhésions récentes" count={detail.members.length}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                  {['soumis', 'publie', 'rejete'].map(st => {
                    const count = detail.members.filter(m => m.status === st).length;
                    return (
                      <div key={st} style={{ padding: '6px 10px', background: 'var(--surface2, #1c2333)', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted, #9ca3af)', textTransform: 'capitalize' }}>{st}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text, #f1f5f9)' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
                {detail.members.slice(0, 5).map(mem => (
                  <div key={mem.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border, #1f2937)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text, #e8eaf0)', fontWeight: 500 }}>{mem.fullName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted, #8b8fa8)' }}>{mem.arrondissementName || '—'}</span>
                  </div>
                ))}
                {detail.members.length === 0 && <EmptyMsg text="Aucune adhésion" />}
              </DetailSection>

              {/* Campaign records */}
              <DetailSection title="Rapports terrain" count={detail.campaign.length}>
                {detail.campaign.slice(0, 6).map(rec => (
                  <div key={rec.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border, #1f2937)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 8, background: `${CAT_COLORS[rec.category] || '#6b7280'}22`, color: CAT_COLORS[rec.category] || '#9ca3af', border: `1px solid ${CAT_COLORS[rec.category] || '#6b7280'}44`, fontWeight: 600 }}>
                        {rec.category}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted, #8b8fa8)' }}>{rec.zone}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text, #e8eaf0)' }}>{rec.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted, #8b8fa8)', marginTop: 2 }}>{new Date(rec.submittedAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                ))}
                {detail.campaign.length === 0 && <EmptyMsg text="Aucun rapport terrain" />}
              </DetailSection>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        <span style={{ fontSize: 11, background: 'var(--surface2, #1c2333)', padding: '1px 8px', borderRadius: 10, color: 'var(--text-muted, #9ca3af)' }}>{count}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return <div style={{ color: 'var(--text-muted, #6b7280)', fontSize: 12, padding: '8px 0', textAlign: 'center', fontStyle: 'italic' }}>{text}</div>;
}

const chipStyle: CSSProperties = {
  background: 'var(--surface2, #1c2333)', border: '1px solid var(--border, #374151)',
  color: 'var(--text-muted, #9ca3af)', padding: '4px 12px', borderRadius: 20, fontSize: 13,
};
