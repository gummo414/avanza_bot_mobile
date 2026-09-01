import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, theme }) {
  const isPrimary = variant === 'primary';

  const bg     = isPrimary
    ? (theme ? theme.text    : '#1A1A1A')
    : (theme ? theme.surface : '#F0EFE9');
  const border = isPrimary
    ? 'transparent'
    : (theme ? theme.border  : '#E5E3DC');
  const textColor = isPrimary
    ? (theme ? theme.bg  : '#FFFFFF')
    : (theme ? theme.text : '#1A1A1A');

  return (
    <TouchableOpacity
      style={[s.base, { backgroundColor: bg, borderColor: border }, disabled && s.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator color={textColor} />
        : <Text style={[s.text, { color: textColor }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base:    { borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1 },
  disabled:{ opacity: 0.4 },
  text:    { fontSize: 15, fontWeight: '600' },
});
