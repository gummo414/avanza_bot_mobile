import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import Button from '../components/Button';

const STATUSBAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

const MOCK_RECS = [
  { instrument: 'NVIDIA (NVDA)',      action: 'behåll', reason: 'Stark position — låt löpa. Överväg att öka vid dippar.' },
  { instrument: 'MICRON (MU)',        action: 'behåll', reason: 'Kortsiktig svaghet i minnespriser — behåll men öka inte.' },
  { instrument: 'CROWDSTRIKE (CRWD)',action: 'behåll', reason: 'Utmärkt momentum efter senaste earnings.' },
  { instrument: 'SALESFORCE (CRM)',  action: 'sälj',   reason: 'Agentforce-narrativet tappar fart. Frigör kapital.' },
  { instrument: 'PALANTIR (PLTR)',   action: 'köp',    reason: 'AI-plattform med ökande statliga kontrakt.', amount_sek: 30000 },
  { instrument: 'BROADCOM (AVGO)',   action: 'köp',    reason: 'Custom AI-chip-affären med hyperscalers accelererar.', amount_sek: 20000 },
];

const BADGE = {
  köp:    { color: '#1A7A45', bg: '#E6F5EE', border: '#B8DFC9' },
  sälj:   { color: '#B0281E', bg: '#FDECEA', border: '#F5C0BB' },
  behåll: { color: '#8A6200', bg: '#FEF6E0', border: '#EDD98A' },
};

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const fmt = (n) => n.toLocaleString('sv-SE');

export default function AnalysScreen() {
  const [loading, setLoading] = useState(false);

  const runAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Klar', 'Analysen är uppdaterad.');
    }, 2000);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F6F2" />
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.header}>
          <Text style={s.title}>Analys</Text>
          <Text style={s.updated}>Uppdaterad idag 08:32</Text>
        </View>

        <Button title="Kör ny analys" onPress={runAnalysis} loading={loading} />

        <Text style={s.sectionLabel}>Rekommendationer</Text>
        {MOCK_RECS.map((r, i) => {
          const c = BADGE[r.action] ?? BADGE.behåll;
          return (
            <View key={i} style={s.recCard}>
              <View style={s.recTop}>
                <Text style={s.recName}>{r.instrument}</Text>
                <View style={[s.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
                  <Text style={[s.badgeText, { color: c.color }]}>{cap(r.action)}</Text>
                </View>
              </View>
              <Text style={s.recReason}>{r.reason}</Text>
              {r.amount_sek != null && (
                <Text style={s.recAmount}>{fmt(r.amount_sek)} kr</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#F7F6F2', paddingTop: STATUSBAR_H },
  scroll:      { padding: 16, paddingBottom: 32 },
  header:      { marginBottom: 16 },
  title:       { fontSize: 28, fontWeight: '600', color: '#1A1A1A', letterSpacing: -0.5 },
  updated:     { fontSize: 12, color: '#AEAB9E', marginTop: 4 },
  sectionLabel:{ fontSize: 11, color: '#AEAB9E', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 10 },
  recCard:     { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E3DC', padding: 16, marginBottom: 10 },
  recTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recName:     { fontSize: 15, fontWeight: '600', color: '#1A1A1A', flex: 1, marginRight: 8 },
  recReason:   { fontSize: 13, color: '#6E6A60', lineHeight: 20 },
  recAmount:   { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginTop: 6 },
  badge:       { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText:   { fontSize: 12, fontWeight: '600' },
});
