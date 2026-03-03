import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useCandidateBrief } from '../hooks/useCandidateBrief.js';

const C = { bg: '#0f1117', surface: '#1a1d27', border: '#2a2d3a', text: '#e8eaf0', muted: '#8b8fa8', red: '#9a1f1f', gold: '#c9a84c', green: '#22c55e', yellow: '#f59e0b', danger: '#ef4444' };

const ALERT_COLORS: Record<string, string> = { normal: C.green, low: C.green, medium: C.yellow, high: C.danger, critical: '#7c3aed' };
const RISK_LABELS: Record<string, string> = { low: 'Faible', medium: 'Modéré', high: 'Élevé', normal: 'Normal', critical: 'Critique' };

function KpiCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={[styles.kpiValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { data, loading, error, stale, lastUpdated, refresh } = useCandidateBrief();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() { setRefreshing(true); await refresh(); setRefreshing(false); }

  if (loading && !data) return (
    <View style={styles.center}><ActivityIndicator color={C.red} size="large" /><Text style={styles.muted}>Chargement du briefing...</Text></View>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  if (!d) return <View style={styles.center}><Text style={{ color: C.danger }}>Données indisponibles</Text><TouchableOpacity onPress={onOpenSettings}><Text style={{ color: C.gold, marginTop: 12 }}>Configurer l'URL serveur</Text></TouchableOpacity></View>;

  const alertColor = ALERT_COLORS[d.headline?.alertLevel] || C.green;
  const visibility = d.visibility || {};

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} />}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>DSN 2026</Text>
          {lastUpdated && <Text style={styles.updateTime}>MàJ {lastUpdated.toLocaleTimeString('fr-FR')}{stale ? ' · En cache' : ''}</Text>}
        </View>
        <TouchableOpacity onPress={onOpenSettings} style={styles.settingsBtn}>
          <Text style={{ color: C.muted, fontSize: 18 }}>⚙</Text>
        </TouchableOpacity>
      </View>

      {error && <View style={styles.errorBanner}><Text style={{ color: C.danger, fontSize: 13 }}>⚠ {error}</Text></View>}

      {/* Alert banner */}
      <View style={[styles.alertBanner, { borderColor: alertColor + '55', backgroundColor: alertColor + '18' }]}>
        <View style={[styles.alertDot, { backgroundColor: alertColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.alertTitle, { color: alertColor }]}>{d.headline?.actionDuJour || 'Suivi national'}</Text>
          {d.headline?.note ? <Text style={styles.alertNote}>{d.headline.note}</Text> : null}
        </View>
      </View>

      {/* KPIs */}
      <Text style={styles.sectionTitle}>INDICATEURS NATIONAUX</Text>
      <View style={styles.kpiGrid}>
        {visibility.showPolling && <KpiCard label="Sondage moyen" value={`${d.national?.pollingAverage || 0}%`} color={C.gold} />}
        {visibility.showAdhesion && <KpiCard label="Adhérents" value={d.national?.adherents || 0} color={C.green} />}
        {visibility.showEvents && <KpiCard label="Évts publiés" value={d.national?.publishedEvents || 0} />}
        {visibility.showEvents && <KpiCard label="Stratégiques" value={d.national?.strategicEvents || 0} color={C.gold} />}
        {visibility.showIncidents && <KpiCard label="Incidents 24h" value={d.national?.incidents24h || 0} color={(d.national?.incidents24h || 0) > 5 ? C.danger : C.text} />}
        {visibility.showMedia && <KpiCard label="Médias publiés" value={d.national?.mediaPublished || 0} />}
        {visibility.showMedia && <KpiCard label="Sensibles" value={d.national?.sensitiveMentions || 0} color={(d.national?.sensitiveMentions || 0) > 0 ? C.yellow : C.text} />}
        <KpiCard label="Publié aujourd'hui" value={d.national?.publishedToday || 0} color={C.green} />
      </View>

      {/* Priorités */}
      {d.priorities?.length > 0 && <>
        <Text style={styles.sectionTitle}>PRIORITÉS RÉGIONALES</Text>
        <View style={styles.card}>
          {d.priorities.map((p: { region: string; percent: number; risk: string; action?: string }, i: number) => (
            <View key={i} style={[styles.listRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{p.region}</Text>
                {p.action ? <Text style={styles.listSub}>{p.action}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: C.gold, fontWeight: '700', fontSize: 14 }}>{p.percent}%</Text>
                <Text style={{ color: ALERT_COLORS[p.risk] || C.muted, fontSize: 11 }}>{RISK_LABELS[p.risk] || p.risk}</Text>
              </View>
            </View>
          ))}
        </View>
      </>}

      {/* Événements récents */}
      {visibility.showEvents && d.publishedEvents?.length > 0 && <>
        <Text style={styles.sectionTitle}>ÉVÉNEMENTS RÉCENTS</Text>
        {d.publishedEvents.slice(0, 5).map((e: { id: string; title: string; departmentName: string; participantEstimate: number; isStrategic: boolean; impactLevel: string; eventDate?: string }, i: number) => (
          <View key={e.id || i} style={[styles.card, styles.eventCard, e.isStrategic && { borderColor: C.gold + '55' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={[styles.listTitle, { flex: 1 }]}>{e.isStrategic ? '⭐ ' : ''}{e.title}</Text>
              <Text style={styles.chip}>{e.impactLevel}</Text>
            </View>
            <Text style={styles.listSub}>{e.departmentName} · {e.participantEstimate?.toLocaleString('fr-FR')} pers. · {e.eventDate || ''}</Text>
          </View>
        ))}
      </>}

      {/* Médias publiés */}
      {visibility.showMedia && d.publishedMedia?.length > 0 && <>
        <Text style={styles.sectionTitle}>MÉDIAS PUBLIÉS</Text>
        {d.publishedMedia.slice(0, 5).map((m: { id: string; title: string; departmentName: string; sourceType: string; tone: string; reachEstimate: number }, i: number) => (
          <View key={m.id || i} style={[styles.card, { marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.listTitle, { flex: 1 }]}>{m.title}</Text>
              <Text style={{ color: m.tone === 'sensible' ? C.yellow : m.tone === 'positif' ? C.green : C.muted, fontSize: 12, fontWeight: '600' }}>{m.tone}</Text>
            </View>
            <Text style={styles.listSub}>{m.departmentName} · {m.sourceType} · {(m.reachEstimate || 0).toLocaleString('fr-FR')} portée</Text>
          </View>
        ))}
      </>}

      {/* Adhésions récentes */}
      {visibility.showAdhesion && d.recentAdhesions?.length > 0 && <>
        <Text style={styles.sectionTitle}>ADHÉSIONS RÉCENTES</Text>
        <View style={styles.card}>
          {d.recentAdhesions.slice(0, 6).map((a: { id: string; fullName: string; departmentName: string; submittedAt: string }, i: number) => (
            <View key={a.id || i} style={[styles.listRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.border }]}>
              <Text style={[styles.listTitle, { flex: 1 }]}>{a.fullName}</Text>
              <Text style={styles.listSub}>{a.departmentName}</Text>
            </View>
          ))}
        </View>
      </>}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  muted: { color: C.muted, marginTop: 12, fontSize: 14 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  appTitle: { fontSize: 18, fontWeight: '700', color: C.red },
  updateTime: { fontSize: 11, color: C.muted, marginTop: 2 },
  settingsBtn: { padding: 6 },
  errorBanner: { margin: 12, padding: 10, backgroundColor: C.danger + '18', borderRadius: 6, borderWidth: 1, borderColor: C.danger + '44' },
  alertBanner: { margin: 12, padding: 14, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  alertDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  alertTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  alertNote: { fontSize: 12, color: C.muted, marginTop: 4 },
  sectionTitle: { fontSize: 11, color: C.muted, fontWeight: '600', letterSpacing: 0.5, paddingHorizontal: 12, marginTop: 20, marginBottom: 10 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, gap: 8 },
  kpiCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, alignItems: 'center', minWidth: 90, flex: 1 },
  kpiValue: { fontSize: 22, fontWeight: '700', color: C.text },
  kpiLabel: { fontSize: 10, color: C.muted, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, marginHorizontal: 12 },
  eventCard: { marginBottom: 8 },
  listRow: { paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontSize: 13, fontWeight: '500', color: C.text },
  listSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  chip: { fontSize: 10, color: C.muted, backgroundColor: '#0f1117', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});
