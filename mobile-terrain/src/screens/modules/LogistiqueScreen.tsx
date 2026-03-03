import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { TerritorySelect } from '../../components/TerritorySelect.js';
import { GpsCapture } from '../../components/GpsCapture.js';
import { useLocation } from '../../hooks/useLocation.js';
import { enqueue } from '../../services/offlineQueue.js';
import { postRecord } from '../../services/api.js';
import type { TerritoryDepartment } from '../../types/domain.js';

interface TerritorySelection { department?: string; arrondissement?: string; zone?: string; center?: string; }

const RESOURCE_TYPES = ['Véhicule', 'Matériel campagne', 'Équipement son/image', 'Nourriture', 'Hébergement', 'Carburant', 'Autre'];
const REQUEST_STATUS = [
  { key: 'needed', label: 'Besoin signalé' },
  { key: 'in_transit', label: 'En acheminement' },
  { key: 'received', label: 'Reçu' },
  { key: 'issue', label: 'Problème' },
];

interface Props {
  token: string;
  departments: TerritoryDepartment[];
  onBack: () => void;
  onSubmitted: () => void;
}

export function LogistiqueScreen({ token, departments, onBack, onSubmitted }: Props) {
  const [resourceType, setResourceType] = useState('');
  const [requestStatus, setRequestStatus] = useState('needed');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [territory, setTerritory] = useState<TerritorySelection>({});
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const submit = async () => {
    if (!resourceType) { Alert.alert('Erreur', 'Type de ressource requis'); return; }
    if (!territory.department) { Alert.alert('Erreur', 'Département requis'); return; }

    setSubmitting(true);
    try {
      const payload = {
        type: 'logistique',
        resourceType,
        requestStatus,
        quantity: parseInt(quantity, 10) || 1,
        description: description.trim(),
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
        Alert.alert('Mis en file', 'Rapport logistique sauvegardé hors-ligne.');
        onSubmitted(); return;
      }
      Alert.alert('Succès', 'Rapport logistique enregistré.');
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={styles.topTitle}>Logistique</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Ressource <Text style={styles.req}>*</Text></Text>
        <View style={styles.grid}>
          {RESOURCE_TYPES.map(r => (
            <TouchableOpacity key={r} style={[styles.chip, resourceType === r && styles.chipActive]} onPress={() => setResourceType(r)}>
              <Text style={[styles.chipText, resourceType === r && styles.chipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Statut</Text>
        <View style={styles.statusRow}>
          {REQUEST_STATUS.map(s => (
            <TouchableOpacity key={s.key} style={[styles.statusBtn, requestStatus === s.key && styles.statusBtnActive]} onPress={() => setRequestStatus(s.key)}>
              <Text style={[styles.statusText, requestStatus === s.key && styles.statusTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Quantité</Text>
        <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="1" placeholderTextColor="#6b7280" />

        <Text style={styles.label}>Description / Remarques</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholder="Détails sur la ressource, urgence…" placeholderTextColor="#6b7280" textAlignVertical="top" />

        <TerritorySelect departments={departments} value={territory} onChange={setTerritory} required />
        <GpsCapture value={location.coords} loading={location.loading} error={location.error} onCapture={location.capture} onClear={location.clear} />

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>🚛 Enregistrer</Text>}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#374151', marginBottom: 4, backgroundColor: '#1c1f2e' },
  chipActive: { backgroundColor: '#65a30d', borderColor: '#65a30d' },
  chipText: { color: '#9ca3af', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#374151', backgroundColor: '#1c1f2e' },
  statusBtnActive: { backgroundColor: '#65a30d', borderColor: '#65a30d' },
  statusText: { color: '#9ca3af', fontSize: 12 },
  statusTextActive: { color: '#fff', fontWeight: '600' },
  input: { backgroundColor: '#1c1f2e', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  textarea: { height: 100 },
  submitBtn: { backgroundColor: '#65a30d', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
