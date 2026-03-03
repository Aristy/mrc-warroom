import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface PickedMedia {
  uri: string;
  type: 'image' | 'video';
  name: string;
}

interface Props {
  files: PickedMedia[];
  onChange: (files: PickedMedia[]) => void;
  max?: number;
}

export function MediaPicker({ files, onChange, max = 5 }: Props) {
  const pickImage = async () => {
    if (files.length >= max) {
      Alert.alert('Limite atteinte', `Maximum ${max} fichiers.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès à la galerie requis.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: max - files.length,
    });
    if (!result.canceled) {
      const newFiles: PickedMedia[] = result.assets.map(a => ({
        uri: a.uri,
        type: 'image',
        name: a.fileName ?? `photo_${Date.now()}.jpg`,
      }));
      onChange([...files, ...newFiles]);
    }
  };

  const takePhoto = async () => {
    if (files.length >= max) {
      Alert.alert('Limite atteinte', `Maximum ${max} fichiers.`);
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès à la caméra requis.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      onChange([...files, { uri: a.uri, type: 'image', name: `photo_${Date.now()}.jpg` }]);
    }
  };

  const remove = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photos ({files.length}/{max})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {files.map((f, i) => (
          <View key={i} style={styles.thumb}>
            <Image source={{ uri: f.uri }} style={styles.img} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => remove(i)}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {files.length < max && (
          <View style={styles.addBtns}>
            <TouchableOpacity style={styles.addBtn} onPress={takePhoto}>
              <Text style={styles.addIcon}>📷</Text>
              <Text style={styles.addText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
              <Text style={styles.addIcon}>🖼️</Text>
              <Text style={styles.addText}>Galerie</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  scroll: { flexDirection: 'row' },
  thumb: { position: 'relative', marginRight: 8 },
  img: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#e5e7eb' },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  addBtns: { flexDirection: 'row', gap: 8 },
  addBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginRight: 8,
  },
  addIcon: { fontSize: 24 },
  addText: { fontSize: 11, color: '#6b7280' },
});
