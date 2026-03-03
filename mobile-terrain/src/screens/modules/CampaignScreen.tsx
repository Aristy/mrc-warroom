import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { TerritorySelect } from '../../components/TerritorySelect.js';
import { GpsCapture } from '../../components/GpsCapture.js';
import { MediaPicker } from '../../components/MediaPicker.js';
import { useLocation } from '../../hooks/useLocation.js';
import { enqueue } from '../../services/offlineQueue.js';
import { postRecord } from '../../services/api.js';
import type { TerritoryDepartment } from '../../types/domain.js';

interface TerritorySelection { department?: string; arrondissement?: string; zone?: string; center?: string; }
interface PickedMedia { uri: string; type: 'image' | 'video'; name: string; }

const ACTIVITY_TYPES = ['Meeting', 'Porte-à-porte', 'Distribution tracts', 'Caravane', 'Conférence de presse', 'Réunion communauté', 'Collage affiche', 'Autre'];

interface Props {
  token: string;
  departments: TerritoryDepartment[];
  onBack: () => void;
  onSubmitted: () => void;
}

export function CampaignScreen({ token, departments, onBack, onSubmitted }: Props) {
  const [activityType, setActivityType] = useState('');
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState('');
  const [notes, setNotes] = useState('');
  const [territory, setTerritory] = useState<TerritorySelection>({});
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const submit = async () => {
    if (!activityType) { Alert.alert('Erreur', 'Type d\'activité requis'); return; }
    if (!title.trim()) { Alert.alert('Erreur', 'Titre requis'); return; }
    if (!territory.department) { Alert.alert('Erreur', 'Département requis'); return; }

    setSubmitting(true);
    try {
      const payload = {
        type: 'campaign',
        activityType,
        title: title.trim(),
        participantCount: parseInt(participants, 10) || 0,
        notes: notes.trim(),
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
        Alert.alert('Mis en file', 'Activité sauvegardée hors-ligne.');
        onSubmitted(); return;
      }
      Alert.alert('Succès', 'Activité campagne enregistrée.');
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={styles.topTitle}>Activité campagne</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Type d'activité <Text style={styles.req}>*</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {ACTIVITY_TYPES.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, activityType === t && styles.chipActive]} onPress={() => setActivityType(t)}>
              <Text style={[styles.chipText, activityType === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Titre <Text style={styles.req}>*</Text></Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Titre de l'activité" placeholderTextColor="#6b7280" />

        <Text style={styles.label}>Participants</Text>
        <TextInput style={styles.input} value={participants} onChangeText={setParticipants} keyboardType="numeric" placeholder="Nombre estimé" placeholderTextColor="#6b7280" />

        <TerritorySelect departments={departments} value={territory} onChange={setTerritory} required />
        <GpsCapture value={location.coords} loading={location.loading} error={location.error} onCapture={location.capture} onClear={location.clear} />
        <MediaPicker files={media} onChange={setMedia} max={5} />

        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} multiline numberOfLines={4} placeholder="Observations…" placeholderTextColor="#6b7280" textAlignVertical="top" />

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>📣 Enregistrer l'activité</Text>}
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
  chipRow: { marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#374151', marginRight: 8, backgroundColor: '#1c1f2e' },
  chipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipText: { color: '#9ca3af', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  input: { backgroundColor: '#1c1f2e', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  textarea: { height: 100 },
  submitBtn: { backgroundColor: '#7c3aed', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
