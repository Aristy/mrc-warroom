import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, StyleSheet, SafeAreaView,
} from 'react-native';
import { GpsCapture } from '../../components/GpsCapture.js';
import { MediaPicker } from '../../components/MediaPicker.js';
import { TerritorySelect } from '../../components/TerritorySelect.js';
import { useLocation } from '../../hooks/useLocation.js';
import { enqueue } from '../../services/offlineQueue.js';
import { postRecord } from '../../services/api.js';
import type { TerritoryDepartment, GpsSnapshot } from '../../types/domain.js';

interface PickedMedia { uri: string; type: 'image' | 'video'; name: string; }
interface TerritorySelection { department?: string; arrondissement?: string; zone?: string; center?: string; }

const INCIDENT_TYPES = ['Intimidation', 'Violence physique', 'Matériel détruit', 'Arrestation', 'Fraude électorale', 'Blocage meeting', 'Autre'];
const SEVERITY_LEVELS = [
  { key: 'low', label: 'Faible', color: '#059669' },
  { key: 'medium', label: 'Moyen', color: '#d97706' },
  { key: 'high', label: 'Élevé', color: '#dc2626' },
  { key: 'critical', label: 'Critique', color: '#7f1d1d' },
];

interface Props {
  token: string;
  departments: TerritoryDepartment[];
  onBack: () => void;
  onSubmitted: () => void;
}

export function IncidentScreen({ token, departments, onBack, onSubmitted }: Props) {
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [territory, setTerritory] = useState<TerritorySelection>({});
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const validate = () => {
    if (!type) return 'Sélectionnez un type d\'incident';
    if (!title.trim()) return 'Titre requis';
    if (!description.trim()) return 'Description requise';
    if (!territory.department) return 'Département requis';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { Alert.alert('Champ manquant', err); return; }

    setSubmitting(true);
    try {
      const payload = {
        type: 'incident',
        incidentType: type,
        severity,
        title: title.trim(),
        description: description.trim(),
        department: territory.department,
        arrondissement: territory.arrondissement,
        zone: territory.zone,
        center: territory.center,
        gps: location.coords,
        mediaCount: media.length,
        timestamp: new Date().toISOString(),
      };

      try {
        await postRecord(token, '/api/campaign-records', payload);
      } catch {
        await enqueue({ url: '/api/campaign-records', body: JSON.stringify(payload) });
        Alert.alert('Mis en file', 'Incident sauvegardé hors-ligne, sera synchronisé à la reconnexion.');
        onSubmitted();
        return;
      }

      Alert.alert('Succès', 'Incident signalé avec succès.');
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Signaler un incident</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type d'incident */}
        <Text style={styles.label}>Type d'incident <Text style={styles.req}>*</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {INCIDENT_TYPES.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
              <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sévérité */}
        <Text style={styles.label}>Sévérité <Text style={styles.req}>*</Text></Text>
        <View style={styles.severityRow}>
          {SEVERITY_LEVELS.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.severityBtn, severity === s.key && { backgroundColor: s.color }]}
              onPress={() => setSeverity(s.key)}
            >
              <Text style={[styles.severityText, severity === s.key && styles.severityTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Titre */}
        <Text style={styles.label}>Titre <Text style={styles.req}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Titre court de l'incident"
          placeholderTextColor="#6b7280"
        />

        {/* Description */}
        <Text style={styles.label}>Description <Text style={styles.req}>*</Text></Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          placeholder="Décrivez l'incident en détail…"
          placeholderTextColor="#6b7280"
          textAlignVertical="top"
        />

        {/* Territoire */}
        <TerritorySelect
          departments={departments}
          value={territory}
          onChange={setTerritory}
          required
        />

        {/* GPS */}
        <GpsCapture
          value={location.coords}
          loading={location.loading}
          error={location.error}
          onCapture={location.capture}
          onClear={location.clear}
        />

        {/* Photos */}
        <MediaPicker files={media} onChange={setMedia} max={5} />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>⚠️ Signaler l'incident</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f1117' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
  },
  backText: { color: '#60a5fa', fontSize: 15, width: 60 },
  topTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#d1d5db', marginBottom: 8 },
  req: { color: '#f87171' },
  chipScroll: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 8,
    backgroundColor: '#1c1f2e',
  },
  chipActive: { backgroundColor: '#9a1f1f', borderColor: '#9a1f1f' },
  chipText: { color: '#9ca3af', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  severityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  severityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1c1f2e',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  severityText: { color: '#9ca3af', fontSize: 12, fontWeight: '600' },
  severityTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#1c1f2e',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textarea: { height: 120 },
  submitBtn: {
    backgroundColor: '#9a1f1f',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
