import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function Button({ title, onPress, variant = 'primary', disabled = false, loading = false }) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[s.base, isPrimary ? s.primary : s.secondary, disabled && s.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? '#fff' : '#1A1A1A'} />
        : <Text style={[s.text, isPrimary ? s.textPrimary : s.textSecondary]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base:          { borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 10 },
  primary:       { backgroundColor: '#1A1A1A' },
  secondary:     { backgroundColor: '#F0EFE9', borderWidth: 1, borderColor: '#E5E3DC' },
  disabled:      { opacity: 0.4 },
  text:          { fontSize: 15, fontWeight: '600' },
  textPrimary:   { color: '#FFFFFF' },
  textSecondary: { color: '#1A1A1A' },
});
