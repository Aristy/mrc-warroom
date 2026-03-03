import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { TerritorySelect } from '../../components/TerritorySelect.js';
import { GpsCapture } from '../../components/GpsCapture.js';
import { useLocation } from '../../hooks/useLocation.js';
import { enqueue } from '../../services/offlineQueue.js';
import { postRecord } from '../../services/api.js';
import type { TerritoryDepartment } from '../../types/domain.js';

interface TerritorySelection { department?: string; arrondissement?: string; zone?: string; center?: string; }

const STATUS_OPTIONS = [
  { key: 'started', label: 'Démarrée', color: '#2563eb' },
  { key: 'in_progress', label: 'En cours', color: '#d97706' },
  { key: 'completed', label: 'Terminée', color: '#059669' },
  { key: 'blocked', label: 'Bloquée', color: '#dc2626' },
];

interface Props {
  token: string;
  departments: TerritoryDepartment[];
  onBack: () => void;
  onSubmitted: () => void;
}

export function MissionScreen({ token, departments, onBack, onSubmitted }: Props) {
  const [missionRef, setMissionRef] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [objective, setObjective] = useState('');
  const [result, setResult] = useState('');
  const [territory, setTerritory] = useState<TerritorySelection>({});
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const submit = async () => {
    if (!objective.trim()) { Alert.alert('Erreur', 'Objectif requis'); return; }
    if (!territory.department) { Alert.alert('Erreur', 'Département requis'); return; }

    setSubmitting(true);
    try {
      const payload = {
        type: 'mission',
        missionRef: missionRef.trim(),
        status,
        objective: objective.trim(),
        result: result.trim(),
        department: territory.department,
        arrondissement: territory.arrondissement,
        zone: territory.zone,
        center: territory.center,
        gps: location.coords,
        timestamp: new Date().toISOString(),
      };
      try {
        await postRecord(token, '/api/campaign-records', payload);
      } catch {
        await enqueue({ url: '/api/campaign-records', body: JSON.stringify(payload) });
        Alert.alert('Mis en file', 'Rapport mission sauvegardé hors-ligne.');
        onSubmitted(); return;
      }
      Alert.alert('Succès', 'Rapport mission enregistré.');
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={styles.topTitle}>Rapport mission</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Référence mission</Text>
        <TextInput style={styles.input} value={missionRef} onChangeText={setMissionRef} placeholder="Ex: M-2026-001" placeholderTextColor="#6b7280" />

        <Text style={styles.label}>Statut <Text style={styles.req}>*</Text></Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map(s => (
            <TouchableOpacity key={s.key} style={[styles.statusBtn, status === s.key && { backgroundColor: s.color, borderColor: s.color }]} onPress={() => setStatus(s.key)}>
              <Text style={[styles.statusText, status === s.key && styles.statusTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Objectif <Text style={styles.req}>*</Text></Text>
        <TextInput style={[styles.input, styles.textarea]} value={objective} onChangeText={setObjective} multiline numberOfLines={3} placeholder="Décrire l'objectif de la mission…" placeholderTextColor="#6b7280" textAlignVertical="top" />

        <Text style={styles.label}>Résultat / Compte-rendu</Text>
        <TextInput style={[styles.input, styles.textarea]} value={result} onChangeText={setResult} multiline numberOfLines={4} placeholder="Ce qui a été accompli…" placeholderTextColor="#6b7280" textAlignVertical="top" />

        <TerritorySelect departments={departments} value={territory} onChange={setTerritory} required />
        <GpsCapture value={location.coords} loading={location.loading} error={location.error} onCapture={location.capture} onClear={location.clear} />

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>🎯 Enregistrer le rapport</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1117' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#1f2937' },
  backText: { color: '#60a5fa', fontSize: 15, width: 60 },
  topTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#d1d5db', marginBottom: 8 },
  req: { color: '#f87171' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#374151', backgroundColor: '#1c1f2e' },
  statusText: { color: '#9ca3af', fontSize: 13 },
  statusTextActive: { color: '#fff', fontWeight: '600' },
  input: { backgroundColor: '#1c1f2e', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  textarea: { height: 90 },
  submitBtn: { backgroundColor: '#d97706', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
