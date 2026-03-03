import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { getBackendUrl, setBackendUrl } from '../services/storage.js';
import type { MobileUser } from '../types/domain.js';

interface Props {
  user: MobileUser;
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsScreen({ user, onBack, onLogout }: Props) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    getBackendUrl().then(v => setUrl(v ?? ''));
  }, []);

  const save = async () => {
    if (!url.trim()) {
      Alert.alert('Erreur', 'URL ne peut pas être vide');
      return;
    }
    await setBackendUrl(url.trim());
    Alert.alert('Enregistré', 'URL backend mise à jour.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Paramètres</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Identifiant</Text>
            <Text style={styles.infoValue}>{user.login}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom</Text>
            <Text style={styles.infoValue}>{user.name ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rôle</Text>
            <Text style={styles.infoValue}>{user.role}</Text>
          </View>
          {user.department && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Département</Text>
              <Text style={styles.infoValue}>{user.department}</Text>
            </View>
          )}
          {user.zone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zone</Text>
              <Text style={styles.infoValue}>{user.zone}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connexion serveur</Text>
          <Text style={styles.fieldLabel}>URL Backend</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://192.168.1.100:8787"
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modules activés</Text>
          {(user.terrainModules ?? []).length === 0 ? (
            <Text style={styles.noModules}>Aucun module assigné</Text>
          ) : (
            (user.terrainModules ?? []).map(m => (
              <View key={m} style={styles.moduleChip}>
                <Text style={styles.moduleChipText}>{m}</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>MRC War Room · Mobile Terrain v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 20, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backText: { color: '#60a5fa', fontSize: 15 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  section: {
    backgroundColor: '#1c1f2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#374151' },
  infoLabel: { color: '#9ca3af', fontSize: 14 },
  infoValue: { color: '#e5e7eb', fontSize: 14, fontWeight: '500' },
  fieldLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 6 },
  input: {
    backgroundColor: '#2a2d3e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  noModules: { color: '#6b7280', fontSize: 13 },
  moduleChip: {
    backgroundColor: '#2a2d3e',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  moduleChipText: { color: '#e5e7eb', fontSize: 13 },
  logoutBtn: {
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: { color: '#fca5a5', fontWeight: '700', fontSize: 15 },
  version: { color: '#374151', fontSize: 12, textAlign: 'center' },
});
