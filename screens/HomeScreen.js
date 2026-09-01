import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, Platform, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../ThemeContext';

const STATUSBAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;
const CHART_H     = 140;
const PADDING     = 16;

const PERIODS = [
  { label: '1D', change: 320,  pct: 0.32  },
  { label: '1V', change: 890,  pct: 0.89  },
  { label: '1M', change: 2100, pct: 2.14  },
  { label: '3M', change: 4200, pct: 4.38  },
  { label: '1Y', change: 3200, pct: 3.20  },
  { label: 'Max',change: 8400, pct: 9.17  },
];

const SPARK = {
  '1D':  [99.8,100.1,99.7,100.2,99.9,100.0,99.8,100.3,100.1,100.4,100.2,100.5,100.3,100.2,100.4,100.3,100.5,100.3,100.4,100.32],
  '1V':  [99.1,98.8,99.3,99.0,99.5,99.8,100.89],
  '1M':  [97.5,97.8,98.2,97.9,98.5,98.8,99.1,98.7,99.3,99.6,100.0,99.5,100.2,100.5,100.1,100.8,101.0,100.6,101.2,101.5,101.1,101.8,102.0,101.6,102.14],
  '3M':  [95,96,94,97,95,98,96,99,97,100,98,101,99,102,100,103,101,104,102,104.38],
  '1Y':  [96.5,95,97,94,98,96,100,98,102,100,103,103.2],
  'Max': [91,88,93,90,95,92,97,94,99,96,101,98,103,100,105,102,107,104,108,109.17],
};

const TOTAL = 100000;
const fmt = (n) => n.toLocaleString('sv-SE');

function Chart({ data, color, surfaceColor, width }) {
  const w = width;
  const h = CHART_H;
  const pad = 8;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: pad + (1 - (v - min) / range) * (h - pad * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fill = `${line} L${w},${h} L0,${h} Z`;

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <Stop offset="100%" stopColor={color} stopOpacity="0"    />
        </LinearGradient>
      </Defs>
      <Path d={fill} fill="url(#g)" />
      <Path d={line} stroke={color} strokeWidth="2.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Mock benchmark-data per period (ersätts med API-anrop när Avanza är kopplat)
// Medianerna matchar seed-datan i scripts/seed_users.js (10 fiktiva användare).
// Sorterade avkastningar för median (mitt-värde vid jämnt antal = snitt av #5+#6):
//   1M:  -1.80 | 0.42 | 1.05 | 1.55 | 1.90 | 2.10 | 2.90 | 3.40 | 5.80 | 9.20  → median (1.90+2.10)/2 = 2.00
//   3M:  -1.80 | 1.10 | 2.65 | 3.70 | 4.30 | 5.10 | 6.80 | 9.40 | 13.20| 17.50 → median (4.30+5.10)/2 = 4.70
//   1Y:  -4.80 | 2.75 | 5.20 | 7.40 | 8.50 | 9.10 | 9.80 | 13.20| 19.80| 24.60 → median (8.50+9.10)/2 = 8.80
const MOCK_BENCHMARK = {
  '1D':  { omxReturn: +0.12, medianReturn: null  },   // < 3 dagars data → ingen median
  '1V':  { omxReturn: +0.45, medianReturn: null  },   // < 3 dagars data → ingen median
  '1M':  { omxReturn: +1.82, medianReturn: +2.00 },
  '3M':  { omxReturn: +3.21, medianReturn: +4.70 },
  '1Y':  { omxReturn: +1.82, medianReturn: +8.80 },
  'Max': null,
};

function BenchmarkCard({ period, userPct, theme }) {
  const data = MOCK_BENCHMARK[period];
  if (!data) return null; // Max-perioden — dölj kortet

  const { omxReturn, medianReturn } = data;
  const beatsIndex  = userPct > omxReturn;
  const beatsMedian = medianReturn !== null ? userPct > medianReturn : null;

  const rows = [
    { label: 'Din avkastning', value: userPct,     highlight: true },
    { label: 'OMXS30',         value: omxReturn,   highlight: false },
    ...(medianReturn !== null
      ? [{ label: 'Median, användare', value: medianReturn, highlight: false }]
      : []),
  ];

  return (
    <View style={[bc.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[bc.title, { color: theme.text3 }]}>Jämförelse</Text>
      {rows.map((row, i) => (
        <View key={i} style={[bc.row, i < rows.length - 1 && { borderBottomWidth: 1, borderColor: theme.border }]}>
          <Text style={[bc.label, { color: row.highlight ? theme.text : theme.text2 }]}>{row.label}</Text>
          <Text style={[bc.value, { color: row.value >= 0 ? theme.buy : theme.sell,
            fontWeight: row.highlight ? '700' : '500' }]}>
            {row.value >= 0 ? '+' : ''}{row.value.toFixed(2)} %
          </Text>
        </View>
      ))}
      {/* Sammanfattning */}
      <View style={[bc.summary, { backgroundColor: beatsIndex ? theme.buyBg : theme.sellBg,
        borderColor: beatsIndex ? theme.buyBorder : theme.sellBorder }]}>
        <Text style={[bc.summaryText, { color: beatsIndex ? theme.buy : theme.sell }]}>
          {beatsIndex
            ? beatsMedian === true  ? '🏆 Du slår index och medianen'
            : beatsMedian === false ? '✓ Du slår index'
            : '✓ Du slår index'
            : '📉 Under index den här perioden'}
        </Text>
      </View>
    </View>
  );
}

const bc = StyleSheet.create({
  card:        { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  title:       { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, padding: 16, paddingBottom: 8 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  label:       { fontSize: 14 },
  value:       { fontSize: 14, fontVariant: ['tabular-nums'] },
  summary:     { margin: 12, borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14 },
  summaryText: { fontSize: 13, fontWeight: '600' },
});

const POSITIONS = [
  { name: 'Likvida medel',      value: 50000, pct: null  },
  { name: 'NVIDIA (NVDA)',       value: 16800, pct: +12.0 },
  { name: 'MICRON (MU)',         value: 11200, pct:  -4.5 },
  { name: 'CROWDSTRIKE (CRWD)', value: 14500, pct:  +8.3 },
  { name: 'SALESFORCE (CRM)',    value:  7500, pct:  -1.2 },
];

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [idx, setIdx]     = useState(4);
  const { width }         = useWindowDimensions();
  const chartW            = width - PADDING * 2;
  const period            = PERIODS[idx];
  const isPos             = period.change >= 0;
  const color             = isPos ? theme.buy : theme.sell;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, paddingTop: STATUSBAR_H }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />
      <ScrollView contentContainerStyle={[s.scroll]} showsVerticalScrollIndicator={false}>

        {/* Value */}
        <View style={s.valueSection}>
          <Text style={[s.valueLabel, { color: theme.text3 }]}>Portföljvärde</Text>
          <Text style={[s.value, { color: theme.text }]}>{fmt(TOTAL)} kr</Text>
          <Text style={[s.change, { color }]}>
            {isPos ? '+' : ''}{fmt(period.change)} kr · {isPos ? '+' : ''}{period.pct.toFixed(2)} %
          </Text>
        </View>

        {/* Chart */}
        <View style={[s.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Chart data={SPARK[period.label]} color={color} surfaceColor={theme.surface} width={chartW} />
          <View style={[s.tabs, { borderTopColor: theme.border }]}>
            {PERIODS.map((p, i) => {
              const active = i === idx;
              return (
                <TouchableOpacity key={p.label} onPress={() => setIdx(i)} style={s.tab} activeOpacity={0.7}>
                  <Text style={[s.tabText, { color: active ? theme.text : theme.text3 },
                    active && { fontWeight: '700' }]}>{p.label}</Text>
                  {active && <View style={[s.tabLine, { backgroundColor: color }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Benchmark */}
        <BenchmarkCard period={period.label} userPct={period.pct} theme={theme} />

        {/* Holdings */}
        <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[s.sectionLabel, { color: theme.text3 }]}>Innehav</Text>
          {POSITIONS.map((pos, i) => {
            const c = pos.pct == null ? theme.text3 : pos.pct >= 0 ? theme.buy : theme.sell;
            return (
              <View key={i} style={[s.row, i < POSITIONS.length - 1 && { borderBottomWidth: 1, borderColor: theme.border }]}>
                <Text style={[s.rowName, { color: theme.text }]}>{pos.name}</Text>
                <View style={s.rowRight}>
                  <Text style={[s.rowValue, { color: theme.text }]}>{fmt(pos.value)} kr</Text>
                  {pos.pct != null && (
                    <Text style={[s.rowPct, { color: c }]}>
                      {pos.pct >= 0 ? '+' : ''}{pos.pct.toFixed(1)} %
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* AI teaser */}
        <TouchableOpacity
          style={[s.aiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigation?.navigate('Analys')}
          activeOpacity={0.8}
        >
          <View style={s.aiLeft}>
            <Text style={s.aiIcon}>🤖</Text>
            <View>
              <Text style={[s.aiTitle, { color: theme.text }]}>AI-analys tillgänglig</Text>
              <Text style={[s.aiSub, { color: theme.sell }]}>Sälj-signal: Salesforce (CRM)</Text>
            </View>
          </View>
          <Text style={[s.aiArrow, { color: theme.text3 }]}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll:       { padding: PADDING, paddingBottom: 32, gap: 12 },
  valueSection: { paddingVertical: 8 },
  valueLabel:   { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  value:        { fontSize: 38, fontWeight: '700', letterSpacing: -1.5, marginBottom: 6, fontVariant: ['tabular-nums'] },
  change:       { fontSize: 15, fontWeight: '500', fontVariant: ['tabular-nums'] },
  chartCard:    { borderRadius: 16, borderWidth: 1, overflow: 'hidden', paddingTop: 16 },
  tabs:         { flexDirection: 'row', borderTopWidth: 1, marginTop: 8 },
  tab:          { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText:      { fontSize: 13, fontWeight: '500' },
  tabLine:      { position: 'absolute', bottom: 0, height: 2, width: '60%', borderRadius: 1 },
  card:         { borderRadius: 16, borderWidth: 1 },
  sectionLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, padding: 16, paddingBottom: 8 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 },
  rowName:      { fontSize: 14, flex: 1, marginRight: 16 },
  rowRight:     { alignItems: 'flex-end' },
  rowValue:     { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  rowPct:       { fontSize: 12, marginTop: 2, fontVariant: ['tabular-nums'] },
  aiCard:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, borderWidth: 1, padding: 16 },
  aiLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIcon:       { fontSize: 22 },
  aiTitle:      { fontSize: 14, fontWeight: '600' },
  aiSub:        { fontSize: 12, marginTop: 2 },
  aiArrow:      { fontSize: 22 },
});
