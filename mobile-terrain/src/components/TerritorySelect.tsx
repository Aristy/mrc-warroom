import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import type { TerritoryDepartment } from '../types/domain.js';

interface TerritorySelection {
  department?: string;
  arrondissement?: string;
  zone?: string;
  center?: string;
}

interface Props {
  departments: TerritoryDepartment[];
  value: TerritorySelection;
  onChange: (val: TerritorySelection) => void;
  required?: boolean;
}

type Level = 'department' | 'arrondissement' | 'zone' | 'center';

export function TerritorySelect({ departments, value, onChange, required }: Props) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<Level>('department');
  const [search, setSearch] = useState('');

  const options = useMemo((): string[] => {
    if (level === 'department') return departments.map(d => d.name);
    if (level === 'arrondissement') {
      const dep = departments.find(d => d.name === value.department);
      return dep?.arrondissements?.map(a => a.name) ?? [];
    }
    if (level === 'zone') {
      const dep = departments.find(d => d.name === value.department);
      const arr = dep?.arrondissements?.find(a => a.name === value.arrondissement);
      return arr?.zones?.map(z => z.name) ?? [];
    }
    if (level === 'center') {
      const dep = departments.find(d => d.name === value.department);
      const arr = dep?.arrondissements?.find(a => a.name === value.arrondissement);
      const zone = arr?.zones?.find(z => z.name === value.zone);
      return zone?.centers ?? [];
    }
    return [];
  }, [level, departments, value]);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const levelLabels: Record<Level, string> = {
    department: 'Département',
    arrondissement: 'Arrondissement',
    zone: 'Zone',
    center: 'Centre',
  };

  const openLevel = (l: Level) => {
    setLevel(l);
    setSearch('');
    setOpen(true);
  };

  const select = (item: string) => {
    if (level === 'department') onChange({ department: item });
    else if (level === 'arrondissement') onChange({ ...value, arrondissement: item, zone: undefined, center: undefined });
    else if (level === 'zone') onChange({ ...value, zone: item, center: undefined });
    else onChange({ ...value, center: item });
    setOpen(false);
  };

  const getLevelState = (l: Level) => {
    if (l === 'department') return value.department;
    if (l === 'arrondissement') return value.arrondissement;
    if (l === 'zone') return value.zone;
    return value.center;
  };

  const isLevelEnabled = (l: Level) => {
    if (l === 'department') return true;
    if (l === 'arrondissement') return !!value.department;
    if (l === 'zone') return !!value.arrondissement;
    return !!value.zone;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Territoire {required && <Text style={styles.req}>*</Text>}</Text>
      {(['department', 'arrondissement', 'zone', 'center'] as Level[]).map(l => (
        <TouchableOpacity
          key={l}
          style={[styles.row, !isLevelEnabled(l) && styles.rowDisabled]}
          onPress={() => isLevelEnabled(l) && openLevel(l)}
          disabled={!isLevelEnabled(l)}
        >
          <Text style={styles.rowLabel}>{levelLabels[l]}</Text>
          <Text style={[styles.rowValue, !getLevelState(l) && styles.placeholder]}>
            {getLevelState(l) ?? `Sélectionner…`}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{levelLabels[level]}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.closeBtn}>Fermer</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.search}
            placeholder="Rechercher…"
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.option} onPress={() => select(item)}>
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  req: { color: '#dc2626' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  rowDisabled: { opacity: 0.4 },
  rowLabel: { width: 120, fontSize: 13, color: '#6b7280' },
  rowValue: { flex: 1, fontSize: 14, color: '#111827' },
  placeholder: { color: '#9ca3af' },
  chevron: { color: '#9ca3af', fontSize: 18 },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  closeBtn: { color: '#2563eb', fontSize: 15 },
  search: {
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    fontSize: 14,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  optionText: { fontSize: 15, color: '#111827' },
});
