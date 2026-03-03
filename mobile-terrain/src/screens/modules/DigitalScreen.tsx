import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { enqueue } from '../../services/offlineQueue.js';
import { postRecord } from '../../services/api.js';

const PLATFORMS = ['Facebook', 'Twitter/X', 'WhatsApp', 'TikTok', 'YouTube', 'Instagram', 'Telegram', 'Autre'];
const CONTENT_TYPES = ['Post partagé', 'Vidéo publiée', 'Message de groupe', 'Commentaire', 'Story/Réels', 'Autre'];

interface Props {
  token: string;
  onBack: () => void;
  onSubmitted: () => void;
}

export function DigitalScreen({ token, onBack, onSubmitted }: Props) {
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [reach, setReach] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!platform) { Alert.alert('Erreur', 'Plateforme requise'); return; }
    if (!content.trim()) { Alert.alert('Erreur', 'Contenu requis'); return; }

    setSubmitting(true);
    try {
      const payload = {
        type: 'digital',
        platform,
        contentType,
        content: content.trim(),
        url: url.trim(),
        estimatedReach: parseInt(reach, 10) || 0,
        timestamp: new Date().toISOString(),
      };
      try {
        await postRecord(token, '/api/campaign-records', payload);
      } catch {
        await enqueue({ url: '/api/campaign-records', body: JSON.stringify(payload) });
        Alert.alert('Mis en file', 'Rapport digital sauvegardé hors-ligne.');
        onSubmitted(); return;
      }
      Alert.alert('Succès', 'Rapport digital enregistré.');
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← Retour</Text></TouchableOpacity>
        <Text style={styles.topTitle}>Activité digitale</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Plateforme <Text style={styles.req}>*</Text></Text>
        <View style={styles.grid}>
          {PLATFORMS.map(p => (
            <TouchableOpacity key={p} style={[styles.chip, platform === p && styles.chipActive]} onPress={() => setPlatform(p)}>
              <Text style={[styles.chipText, platform === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Type de contenu</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {CONTENT_TYPES.map(t => (
            <TouchableOpacity key={t} style={[styles.chip, contentType === t && styles.chipActive]} onPress={() => setContentType(t)}>
              <Text style={[styles.chipText, contentType === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Résumé du contenu <Text style={styles.req}>*</Text></Text>
        <TextInput style={[styles.input, styles.textarea]} value={content} onChangeText={setContent} multiline numberOfLines={4} placeholder="Décrivez ou copiez le contenu publié…" placeholderTextColor="#6b7280" textAlignVertical="top" />

        <Text style={styles.label}>Lien URL (optionnel)</Text>
        <TextInput style={styles.input} value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} placeholder="https://…" placeholderTextColor="#6b7280" />

        <Text style={styles.label}>Portée estimée</Text>
        <TextInput style={styles.input} value={reach} onChangeText={setReach} keyboardType="numeric" placeholder="Nombre de personnes touchées" placeholderTextColor="#6b7280" />

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>📱 Enregistrer</Text>}
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
  chipRow: { marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#374151', marginRight: 4, marginBottom: 4, backgroundColor: '#1c1f2e' },
  chipActive: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
  chipText: { color: '#9ca3af', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  input: { backgroundColor: '#1c1f2e', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  textarea: { height: 100 },
  submitBtn: { backgroundColor: '#0891b2', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
