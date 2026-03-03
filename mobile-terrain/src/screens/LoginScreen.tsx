import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { getBackendUrl, setBackendUrl } from '../services/storage.js';

interface Props {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUrlEdit, setShowUrlEdit] = useState(false);
  const [backendUrl, setBackendUrlState] = useState('');

  React.useEffect(() => {
    getBackendUrl().then(url => setBackendUrlState(url ?? ''));
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Identifiant et mot de passe obligatoires.');
      return;
    }
    setLoading(true);
    try {
      await onLogin(username.trim(), password);
    } catch (e) {
      Alert.alert('Échec connexion', e instanceof Error ? e.message : 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const saveUrl = async () => {
    await setBackendUrl(backendUrl.trim());
    setShowUrlEdit(false);
    Alert.alert('Enregistré', 'URL backend mise à jour.');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.flag}>🇨🇩</Text>
          <Text style={styles.title}>MRC Terrain</Text>
          <Text style={styles.subtitle}>Application agents de terrain</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>

          <Text style={styles.fieldLabel}>Identifiant</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Votre identifiant"
            placeholderTextColor="#9ca3af"
            editable={!loading}
          />

          <Text style={styles.fieldLabel}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.urlToggle} onPress={() => setShowUrlEdit(v => !v)}>
          <Text style={styles.urlToggleText}>⚙️ Configurer le serveur</Text>
        </TouchableOpacity>

        {showUrlEdit && (
          <View style={styles.urlCard}>
            <Text style={styles.fieldLabel}>URL Backend</Text>
            <TextInput
              style={styles.input}
              value={backendUrl}
              onChangeText={setBackendUrlState}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://192.168.1.100:8787"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveUrl}>
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.version}>MRC War Room · v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  flag: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  card: {
    backgroundColor: '#1c1f2e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 20 },
  fieldLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#2a2d3e',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  loginBtn: {
    backgroundColor: '#9a1f1f',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  urlToggle: { alignItems: 'center', paddingVertical: 8 },
  urlToggleText: { color: '#6b7280', fontSize: 13 },
  urlCard: {
    backgroundColor: '#1c1f2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  version: { color: '#374151', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
