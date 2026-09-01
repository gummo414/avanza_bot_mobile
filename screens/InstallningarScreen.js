import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Platform, Switch, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import { useTheme } from '../ThemeContext';

const STATUSBAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

function SettingsCard({ icon, title, subtitle, children, theme }) {
  return (
    <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={s.cardHeader}>
        <View style={[s.iconWrap, { backgroundColor: theme.bg }]}>
          <Text style={s.iconText}>{icon}</Text>
        </View>
        <View style={s.cardMeta}>
          <Text style={[s.cardTitle, { color: theme.text }]}>{title}</Text>
          {subtitle ? <Text style={[s.cardSub, { color: theme.text2 }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {children && <View style={s.cardFooter}>{children}</View>}
    </View>
  );
}

export default function InstallningarScreen() {
  const { theme, isDark, setOverride, override, chartSource, setChartSource } = useTheme();

  // Toggle: null = system, 'dark' = forced dark, 'light' = forced light
  const toggleDark = (val) => {
    if (val) setOverride('dark');
    else setOverride('light');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, paddingTop: STATUSBAR_H }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <View style={[s.profile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[s.avatar, { backgroundColor: theme.text }]}>
            <Text style={[s.avatarText, { color: theme.bg }]}>J</Text>
          </View>
          <View>
            <Text style={[s.profileName, { color: theme.text }]}>Mitt konto</Text>
            <Text style={[s.profileSub, { color: theme.text3 }]}>Avanza-portfölj ej ansluten</Text>
          </View>
        </View>

        {/* Utseende */}
        <Text style={[s.sectionLabel, { color: theme.text3 }]}>Utseende</Text>
        <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={s.cardHeader}>
            <View style={[s.iconWrap, { backgroundColor: theme.bg }]}>
              <Text style={s.iconText}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <View style={[s.cardMeta, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
              <View>
                <Text style={[s.cardTitle, { color: theme.text }]}>Mörkt tema</Text>
                <Text style={[s.cardSub, { color: theme.text2 }]}>
                  {override === null ? 'Följer systemet' : isDark ? 'På' : 'Av'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleDark}
                trackColor={{ false: theme.border, true: theme.text }}
                thumbColor={theme.surface}
              />
            </View>
          </View>
        </View>

        {/* Värdeutveckling */}
        <Text style={[s.sectionLabel, { color: theme.text3 }]}>Värdeutveckling</Text>
        <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={s.cardHeader}>
            <View style={[s.iconWrap, { backgroundColor: theme.bg }]}>
              <Text style={s.iconText}>📈</Text>
            </View>
            <View style={s.cardMeta}>
              <Text style={[s.cardTitle, { color: theme.text }]}>Källa för historik</Text>
              <Text style={[s.cardSub, { color: theme.text2 }]}>
                {chartSource === 'api' ? 'Avanza historisk data' : 'Sedan du kopplade appen'}
              </Text>
            </View>
          </View>
          {/* Segmented picker */}
          <View style={[s.segmentWrap, { borderColor: theme.border }]}>
            {[
              { val: 'api',    label: 'Avanza historik' },
              { val: 'import', label: 'Sedan import' },
            ].map(({ val, label }) => {
              const active = chartSource === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[
                    s.segment,
                    active && { backgroundColor: theme.text },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => setChartSource(val)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.segmentText, { color: active ? theme.bg : theme.text2 }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Importera */}
        <Text style={[s.sectionLabel, { color: theme.text3 }]}>Importera portfölj</Text>

        <SettingsCard icon="🔗" title="Koppla Avanza" subtitle="Hämta portföljdata direkt via Avanza-API." theme={theme}>
          <Button title="Koppla Avanza" onPress={() => {}} theme={theme} />
        </SettingsCard>

        <SettingsCard icon="📷" title="Ladda upp screenshot" subtitle="Ta en skärmbild av din Avanza-portfölj och analysera den." theme={theme}>
          <Button title="Välj bild" onPress={() => {}} variant="secondary" theme={theme} />
        </SettingsCard>

        {/* Analys */}
        <Text style={[s.sectionLabel, { color: theme.text3 }]}>Analys</Text>
        <SettingsCard icon="🤖" title="AI-analys" subtitle="Automatisk analys körs varje dag kl 08:00." theme={theme} />

        {/* Konto */}
        <Text style={[s.sectionLabel, { color: theme.text3 }]}>Konto</Text>
        <SettingsCard icon="🚪" title="Logga ut" theme={theme}>
          <Button title="Logga ut" onPress={() => {}} variant="secondary" theme={theme} />
        </SettingsCard>

        <Text style={[s.version, { color: theme.text3 }]}>Avanza Bot v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll:       { padding: 16, paddingBottom: 48, gap: 8 },
  profile:      { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 8 },
  avatar:       { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 20, fontWeight: '700' },
  profileName:  { fontSize: 16, fontWeight: '600' },
  profileSub:   { fontSize: 12, marginTop: 2 },
  sectionLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 4, marginTop: 8 },
  card:         { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  iconWrap:     { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconText:     { fontSize: 18 },
  cardMeta:     { flex: 1 },
  cardTitle:    { fontSize: 15, fontWeight: '600' },
  cardSub:      { fontSize: 12, marginTop: 2, lineHeight: 18 },
  cardFooter:   { paddingHorizontal: 16, paddingBottom: 16 },
  version:      { textAlign: 'center', fontSize: 11, marginTop: 16 },

  // Segmented control
  segmentWrap:  { flexDirection: 'row', margin: 16, marginTop: 0, borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  segment:      { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  segmentText:  { fontSize: 13, fontWeight: '500' },
});
