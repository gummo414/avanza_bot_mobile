import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';

const STATUSBAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

const PERIODS = ['Idag', '1M', '1Å', '5Å', 'Totalt'];

const MOCK = {
  totalValue: 100000,
  periods: {
    'Idag': { change: 320,  pct: 0.32  },
    '1M':   { change: 2100, pct: 2.14  },
    '1Å':   { change: 3200, pct: 3.20  },
    '5Å':   { change: 8400, pct: 9.17  },
    'Totalt':{ change: 3200, pct: 3.20 },
  },
  positions: [
    { name: 'Likvida medel',      value: 50000, pct: null },
    { name: 'NVIDIA (NVDA)',       value: 16800, pct: +12.0 },
    { name: 'MICRON (MU)',         value: 11200, pct:  -4.5 },
    { name: 'CROWDSTRIKE (CRWD)', value: 14500, pct:  +8.3 },
    { name: 'SALESFORCE (CRM)',    value:  7500, pct:  -1.2 },
  ],
};

const fmt = (n) => n.toLocaleString('sv-SE');

export default function HomeScreen() {
  const [period, setPeriod] = useState('1Å');
  const perf = MOCK.periods[period];
  const isPos = perf.change >= 0;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F6F2" />
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Portföljvärde */}
        <View style={s.heroBox}>
          <Text style={s.heroLabel}>Totalt värde</Text>
          <Text style={s.heroValue}>{fmt(MOCK.totalValue)} kr</Text>
          <Text style={[s.heroPct, { color: isPos ? '#1A7A45' : '#B0281E' }]}>
            {isPos ? '+' : ''}{fmt(perf.change)} kr ({isPos ? '+' : ''}{perf.pct.toFixed(2)} %)
          </Text>
        </View>

        {/* Tidsfilter */}
        <View style={s.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[s.periodBtn, period === p && s.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.periodText, period === p && s.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Innehav */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Innehav</Text>
          {MOCK.positions.map((pos, i) => (
            <View key={i} style={[s.posRow, i < MOCK.positions.length - 1 && s.posRowBorder]}>
              <Text style={s.posName}>{pos.name}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.posValue}>{fmt(pos.value)} kr</Text>
                {pos.pct != null && (
                  <Text style={[s.posPct, { color: pos.pct >= 0 ? '#1A7A45' : '#B0281E' }]}>
                    {pos.pct >= 0 ? '+' : ''}{pos.pct.toFixed(1)} %
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F7F6F2', paddingTop: STATUSBAR_H },
  scroll:        { padding: 16, paddingBottom: 32 },

  heroBox:       { paddingVertical: 24, paddingHorizontal: 4, marginBottom: 8 },
  heroLabel:     { fontSize: 12, color: '#AEAB9E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  heroValue:     { fontSize: 38, fontWeight: '600', color: '#1A1A1A', letterSpacing: -1, marginBottom: 4 },
  heroPct:       { fontSize: 15 },

  periodRow:     { flexDirection: 'row', gap: 6, marginBottom: 16 },
  periodBtn:     { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E3DC' },
  periodBtnActive:{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  periodText:    { fontSize: 12, fontWeight: '500', color: '#6E6A60' },
  periodTextActive:{ color: '#FFFFFF' },

  card:          { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E3DC', padding: 18 },
  cardLabel:     { fontSize: 11, color: '#AEAB9E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  posRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  posRowBorder:  { borderBottomWidth: 1, borderColor: '#E5E3DC' },
  posName:       { fontSize: 14, color: '#1A1A1A', flex: 1, marginRight: 8 },
  posValue:      { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  posPct:        { fontSize: 12, marginTop: 2 },
});
