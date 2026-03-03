import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getBackendUrl, setBackendUrl } from '../services/storage.js';

const C = { bg: '#0f1117', surface: '#1a1d27', border: '#2a2d3a', text: '#e8eaf0', muted: '#8b8fa8', red: '#9a1f1f', green: '#22c55e' };

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [url, setUrl] = useState('');

  useEffect(() => { getBackendUrl().then(setUrl); }, []);

  async function save() {
    if (!url.trim()) { Alert.alert('Erreur', 'URL requise'); return; }
    await setBackendUrl(url.trim());
    Alert.alert('Sauvegardé', 'URL du serveur mise à jour.', [{ text: 'OK', onPress: onBack }]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: C.red, fontSize: 14 }}>← Retour</Text></TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>URL du serveur War Room</Text>
        <TextInput style={styles.input} value={url} onChangeText={setUrl} placeholder="http://192.168.1.1:8787" placeholderTextColor={C.muted} autoCapitalize="none" keyboardType="url" />
        <TouchableOpacity onPress={save} style={styles.btn}><Text style={styles.btnText}>Sauvegarder</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, paddingTop: 48, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 17, fontWeight: '600', color: C.text },
  body: { padding: 20, gap: 12 },
  label: { fontSize: 13, color: C.muted, fontWeight: '500' },
  input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, color: C.text, padding: 12, fontSize: 14 },
  btn: { backgroundColor: C.red, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
