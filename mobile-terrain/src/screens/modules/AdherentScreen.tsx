import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { TerritorySelect } from '../../components/TerritorySelect.js';
import { GpsCapture } from '../../components/GpsCapture.js';
import { useLocation } from '../../hooks/useLocation.js';
import { enqueue } from '../../services/offlineQueue.js';
import { postRecord } from '../../services/api.js';
import type { TerritoryDepartment } from '../../types/domain.js';

interface TerritorySelection { department?: string; arrondissement?: string; zone?: string; center?: string; }

interface Props {
  token: string;
  departments: TerritoryDepartment[];
  onBack: () => void;
  onSubmitted: () => void;
}

export function AdherentScreen({ token, departments, onBack, onSubmitted }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [profession, setProfession] = useState('');
  const [territory, setTerritory] = useState<TerritorySelection>({});
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim()) { Alert.alert('Erreur', 'Prénom et nom requis'); return; }
    if (!territory.department) { Alert.alert('Erreur', 'Département requis'); return; }

    setSubmitting(true);
    try {
      const payload = {
        category: 'adherent',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        gender,
        birthYear: parseInt(birthYear, 10) || undefined,
        profession: profession.trim(),
        department: territory.department,
        arrondissement: territory.arrondissement,
        zone: territory.zone,
        center: territory.center,
        gps: location.coords,
        timestamp: new Date().toISOString(),
      };
      try {
        await postRecord(token, '/api/member-enrollments', payload);
      } catch {
        await enqueue({ url: '/api/member-enrollments', body: JSON.stringify(payload) });
        Alert.alert('Mis en file', 'Adhérent sauvegardé hors-ligne.');
        onSubmitted(); return;
      }
      Alert.alert('Succès', 'Adhérent enregistré avec succès.');
      // Reset form
      setFirstName(''); setLastName(''); setPhone(''); setGender(''); setBirthYear(''); setProfession('');
      setTerritory({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={styles.topTitle}>Nouvel adhérent</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Prénom <Text style={styles.req}>*</Text></Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Jean" placeholderTextColor="#6b7280" />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Nom <Text style={styles.req}>*</Text></Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Dupont" placeholderTextColor="#6b7280" />
          </View>
        </View>

        <Text style={styles.label}>Téléphone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+242 06 xxx xxxx" placeholderTextColor="#6b7280" />

        <Text style={styles.label}>Genre</Text>
        <View style={styles.genderRow}>
          {['Homme', 'Femme', 'Autre'].map(g => (
            <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)}>
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Année naissance</Text>
            <TextInput style={styles.input} value={birthYear} onChangeText={setBirthYear} keyboardType="numeric" placeholder="1990" placeholderTextColor="#6b7280" />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Profession</Text>
            <TextInput style={styles.input} value={profession} onChangeText={setProfession} placeholder="Enseignant…" placeholderTextColor="#6b7280" />
          </View>
        </View>

        <TerritorySelect departments={departments} value={territory} onChange={setTerritory} required />
        <GpsCapture value={location.coords} loading={location.loading} error={location.error} onCapture={location.capture} onClear={location.clear} />

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>👥 Enregistrer l'adhérent</Text>}
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
  row: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  halfField: { flex: 1 },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  genderBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#374151', backgroundColor: '#1c1f2e', alignItems: 'center' },
  genderBtnActive: { backgroundColor: '#db2777', borderColor: '#db2777' },
  genderText: { color: '#9ca3af', fontSize: 13 },
  genderTextActive: { color: '#fff', fontWeight: '600' },
  input: { backgroundColor: '#1c1f2e', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  submitBtn: { backgroundColor: '#db2777', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
