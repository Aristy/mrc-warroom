import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { TerritorySelect } from '../../components/TerritorySelect.js';
import { GpsCapture } from '../../components/GpsCapture.js';
import { useLocation } from '../../hooks/useLocation.js';
import { enqueue } from '../../services/offlineQueue.js';
import { postRecord } from '../../services/api.js';
import type { TerritoryDepartment } from '../../types/domain.js';

interface TerritorySelection { department?: string; arrondissement?: string; zone?: string; center?: string; }

const VOTE_INTENTIONS = ['MRC / Denis Sassou', 'Opposition principale', 'Candidat indépendant', 'Abstention', 'Indécis'];

interface Props {
  token: string;
  departments: TerritoryDepartment[];
  onBack: () => void;
  onSubmitted: () => void;
}

export function SondageScreen({ token, departments, onBack, onSubmitted }: Props) {
  const [respondentCount, setRespondentCount] = useState('');
  const [intentions, setIntentions] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [territory, setTerritory] = useState<TerritorySelection>({});
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const totalIntentions = Object.values(intentions).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);

  const submit = async () => {
    if (!respondentCount || parseInt(respondentCount, 10) < 1) {
      Alert.alert('Erreur', 'Nombre de répondants requis (min 1)');
      return;
    }
    if (!territory.department) {
      Alert.alert('Erreur', 'Département requis');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: 'sondage',
        respondentCount: parseInt(respondentCount, 10),
        intentions,
        totalIntentions,
        notes: notes.trim(),
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
        Alert.alert('Mis en file', 'Sondage sauvegardé hors-ligne.');
        onSubmitted();
        return;
      }
      Alert.alert('Succès', 'Sondage enregistré.');
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={styles.topTitle}>Sondage terrain</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Nombre de répondants <Text style={styles.req}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={respondentCount}
          onChangeText={setRespondentCount}
          keyboardType="numeric"
          placeholder="Ex: 25"
          placeholderTextColor="#6b7280"
        />

        <Text style={styles.label}>Intentions de vote</Text>
        {VOTE_INTENTIONS.map(opt => (
          <View key={opt} style={styles.intentionRow}>
            <Text style={styles.intentionLabel}>{opt}</Text>
            <TextInput
              style={styles.intentionInput}
              value={intentions[opt] ?? ''}
              onChangeText={v => setIntentions(prev => ({ ...prev, [opt]: v }))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#6b7280"
            />
          </View>
        ))}
        {totalIntentions > 0 && (
          <Text style={styles.total}>Total saisi : {totalIntentions} / {respondentCount || '?'}</Text>
        )}

        <TerritorySelect departments={departments} value={territory} onChange={setTerritory} required />
        <GpsCapture value={location.coords} loading={location.loading} error={location.error} onCapture={location.capture} onClear={location.clear} />

        <Text style={styles.label}>Notes additionnelles</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholder="Observations…"
          placeholderTextColor="#6b7280"
          textAlignVertical="top"
        />

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>📊 Enregistrer le sondage</Text>}
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
  input: { backgroundColor: '#1c1f2e', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  textarea: { height: 100 },
  intentionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  intentionLabel: { flex: 1, color: '#d1d5db', fontSize: 14 },
  intentionInput: { width: 70, backgroundColor: '#1c1f2e', borderRadius: 8, padding: 10, color: '#fff', fontSize: 14, textAlign: 'center', borderWidth: 1, borderColor: '#374151' },
  total: { color: '#60a5fa', fontSize: 13, marginBottom: 16 },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
