import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  count: number;
  syncing: boolean;
  onSync: () => void;
}

export function QueueBadge({ count, syncing, onSync }: Props) {
  if (count === 0 && !syncing) return null;

  return (
    <TouchableOpacity style={styles.badge} onPress={onSync} disabled={syncing}>
      {syncing ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.icon}>☁️</Text>
      )}
      <Text style={styles.text}>
        {syncing ? 'Sync…' : `${count} en attente`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d97706',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  icon: { fontSize: 14 },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
