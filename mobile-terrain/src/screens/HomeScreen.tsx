import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { QueueBadge } from '../components/QueueBadge.js';
import type { MobileUser, ModuleKey } from '../types/domain.js';

interface Module {
  key: ModuleKey;
  label: string;
  icon: string;
  color: string;
}

interface Props {
  user: MobileUser;
  modules: Module[];
  queueCount: number;
  syncing: boolean;
  onSync: () => void;
  onNavigate: (module: ModuleKey) => void;
  onSettings: () => void;
  onLogout: () => void;
}

export function HomeScreen({ user, modules, queueCount, syncing, onSync, onNavigate, onSettings, onLogout }: Props) {
  const scope = user.geographicScope ?? user.zone ?? user.arrondissement ?? user.department ?? 'National';

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bonjour, {user.name?.split(' ')[0] ?? user.login}</Text>
            <Text style={styles.scope}>{scope}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={onSettings} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Queue badge */}
        {(queueCount > 0 || syncing) && (
          <View style={styles.queueRow}>
            <QueueBadge count={queueCount} syncing={syncing} onSync={onSync} />
          </View>
        )}

        {/* Modules grid */}
        <Text style={styles.sectionTitle}>Mes modules</Text>
        {modules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Aucun module assigné</Text>
            <Text style={styles.emptyHint}>Contactez votre coordinateur</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {modules.map(mod => (
              <TouchableOpacity
                key={mod.key}
                style={[styles.moduleCard, { borderTopColor: mod.color }]}
                onPress={() => onNavigate(mod.key)}
              >
                <Text style={styles.moduleIcon}>{mod.icon}</Text>
                <Text style={styles.moduleLabel}>{mod.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Rôle : {user.role} · {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1117' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  scope: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#1c1f2e',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 20 },
  queueRow: { alignItems: 'flex-start', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#9ca3af', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  moduleCard: {
    width: '47%',
    backgroundColor: '#1c1f2e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 4,
  },
  moduleIcon: { fontSize: 32 },
  moduleLabel: { fontSize: 14, fontWeight: '600', color: '#e5e7eb', textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#e5e7eb' },
  emptyHint: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  footer: { alignItems: 'center', paddingTop: 16 },
  footerText: { color: '#374151', fontSize: 12 },
});
