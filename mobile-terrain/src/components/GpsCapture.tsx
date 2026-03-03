import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import type { GpsSnapshot } from '../types/domain.js';

interface Props {
  value: GpsSnapshot | null;
  loading: boolean;
  error: string | null;
  onCapture: () => void;
  onClear: () => void;
}

export function GpsCapture({ value, loading, error, onCapture, onClear }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Localisation GPS</Text>
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.hint}>Acquisition GPS…</Text>
        </View>
      ) : value ? (
        <View style={styles.result}>
          <Text style={styles.coords}>
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </Text>
          {value.accuracy !== undefined && (
            <Text style={styles.accuracy}>± {Math.round(value.accuracy)} m</Text>
          )}
          <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>Effacer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={onCapture} style={styles.captureBtn}>
          <Text style={styles.captureText}>📍 Capturer position</Text>
        </TouchableOpacity>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hint: { color: '#6b7280', fontSize: 13 },
  result: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  coords: { fontSize: 13, fontFamily: 'monospace', color: '#166534', marginBottom: 2 },
  accuracy: { fontSize: 12, color: '#6b7280' },
  clearBtn: { marginTop: 8, alignSelf: 'flex-start' },
  clearText: { color: '#dc2626', fontSize: 13 },
  captureBtn: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
  },
  captureText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  error: { color: '#dc2626', fontSize: 12, marginTop: 4 },
});
