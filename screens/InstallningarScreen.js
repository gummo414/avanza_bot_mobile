import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import Button from '../components/Button';

const STATUSBAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

export default function InstallningarScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F6F2" />
      <ScrollView contentContainerStyle={s.scroll}>

        <Text style={s.title}>Inställningar</Text>

        <Text style={s.sectionLabel}>Importera portfölj</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>Koppla Avanza</Text>
          <Text style={s.cardSub}>Hämta portföljdata direkt via Avanza-API.</Text>
          <Button title="Koppla Avanza" onPress={() => {}} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Ladda upp screenshot</Text>
          <Text style={s.cardSub}>Ta en skärmbild av din Avanza-portfölj och analysera den.</Text>
          <Button title="Välj bild" onPress={() => {}} variant="secondary" />
        </View>

        <Text style={s.sectionLabel}>Konto</Text>
        <View style={s.card}>
          <Button title="Logga ut" onPress={() => {}} variant="secondary" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F7F6F2', paddingTop: STATUSBAR_H },
  scroll:       { padding: 16, paddingBottom: 32 },
  title:        { fontSize: 28, fontWeight: '600', color: '#1A1A1A', letterSpacing: -0.5, marginBottom: 24 },
  sectionLabel: { fontSize: 11, color: '#AEAB9E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  card:         { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E3DC', padding: 18, marginBottom: 12 },
  cardTitle:    { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  cardSub:      { fontSize: 13, color: '#6E6A60', lineHeight: 20, marginBottom: 14 },
});
