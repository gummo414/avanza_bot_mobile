import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, Platform, Animated, TouchableOpacity, Alert,
} from 'react-native';
import { useTheme } from '../ThemeContext';

const STATUSBAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

const MOCK_RECS = [
  { instrument: 'SALESFORCE (CRM)', action: 'sälj', score: 9,
    reason: 'Agentforce-narrativet tappar fart. Frigör kapital till starkare positioner.' },
  { instrument: 'PALANTIR (PLTR)',  action: 'köp',  score: 8,
    reason: 'AI-plattform med ökande statliga kontrakt. Stark kursmometum.', amount_sek: 30000 },
  { instrument: 'BROADCOM (AVGO)', action: 'köp',  score: 6,
    reason: 'Custom AI-chip-affären med hyperscalers accelererar.', amount_sek: 20000 },
  { instrument: 'NVIDIA (NVDA)',   action: 'behåll', score: 4,
    reason: 'Stark position — låt löpa. Överväg att öka vid dippar.' },
  { instrument: 'CROWDSTRIKE (CRWD)', action: 'behåll', score: 3,
    reason: 'Utmärkt momentum efter senaste earnings. Ingenting att göra.' },
  { instrument: 'MICRON (MU)',     action: 'behåll', score: 2,
    reason: 'Kortsiktig svaghet i minnespriser — behåll men öka inte.' },
];

// ── Schema-logik ─────────────────────────────────────────────────────────────
const RUNS = [{ h: 9, m: 5 }, { h: 16, m: 5 }];

function getScheduleInfo() {
  const now        = new Date();
  const swe        = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }));
  const nowMin     = swe.getHours() * 60 + swe.getMinutes();
  const morningM   = RUNS[0].h * 60 + RUNS[0].m;
  const afternoonM = RUNS[1].h * 60 + RUNS[1].m;

  let lastLabel, ageMin, nextMin;
  if (nowMin < morningM) {
    lastLabel = 'Igår 16:05'; ageMin = nowMin + (24 * 60 - afternoonM); nextMin = morningM;
  } else if (nowMin < afternoonM) {
    lastLabel = 'Idag 09:05'; ageMin = nowMin - morningM; nextMin = afternoonM;
  } else {
    lastLabel = 'Idag 16:05'; ageMin = nowMin - afternoonM; nextMin = 24 * 60 + morningM;
  }

  const remaining     = nextMin - nowMin;
  const ageLabel      = ageMin < 1 ? 'Nyss' : ageMin < 60 ? `för ${ageMin}m sedan` : lastLabel;
  const showCountdown = remaining <= 60;
  const countdownSec  = now.getSeconds() ? 60 - now.getSeconds() : 0;
  const countdownLabel= `${String(remaining).padStart(2,'0')}:${String(countdownSec).padStart(2,'0')}`;
  const fresh         = ageMin < 30;

  return { ageLabel, showCountdown, countdownLabel, fresh };
}

// ── Hjälp ─────────────────────────────────────────────────────────────────────
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const fmt = (n) => n.toLocaleString('sv-SE');
const scoreSection = (score) => score >= 8 ? 'action' : score >= 5 ? 'watch' : 'hold';

const SECTION_META = {
  action: { label: 'Kräver åtgärd',        emoji: '⚠️' },
  watch:  { label: 'Håll koll',             emoji: '👀' },
  hold:   { label: 'Inga åtgärder behövs',  emoji: '✓'  },
};

function ScoreDots({ score, color }) {
  const filled = Math.round(score / 2);
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <View key={i} style={{
          width: 5, height: 5, borderRadius: 3,
          backgroundColor: i <= filled ? color : color + '30',
        }} />
      ))}
    </View>
  );
}

function PulseDot({ color }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1,   duration: 900, useNativeDriver: true }),
    ])).start();
  }, [anim]);
  return <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, opacity: anim }} />;
}

// ── Screenshot-banner ─────────────────────────────────────────────────────────
function ScreenshotBanner({ pendingCount, theme, onPress }) {
  return (
    <TouchableOpacity
      style={[s.screenshotBanner, { backgroundColor: theme.holdBg, borderColor: theme.holdBorder }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={s.screenshotLeft}>
        <Text style={s.screenshotIcon}>📸</Text>
        <View>
          <Text style={[s.screenshotTitle, { color: theme.hold }]}>
            {pendingCount > 0
              ? `${pendingCount} trade${pendingCount > 1 ? 's' : ''} väntar på bekräftelse`
              : 'Portföljdata äldre än 30 dagar'}
          </Text>
          <Text style={[s.screenshotSub, { color: theme.text2 }]}>
            Ladda upp en skärmdump från Avanza
          </Text>
        </View>
      </View>
      <Text style={[s.screenshotArrow, { color: theme.text3 }]}>›</Text>
    </TouchableOpacity>
  );
}

// ── Markera som gjord — bekräftelsekort ──────────────────────────────────────
function DoneButton({ instrument, action, theme, onDone, isDone }) {
  if (action === 'behåll') return null;

  if (isDone) {
    return (
      <View style={[s.doneConfirm, { backgroundColor: theme.buyBg, borderColor: theme.buyBorder }]}>
        <Text style={[s.doneConfirmText, { color: theme.buy }]}>
          ✓ Utförd — GAV bekräftas vid nästa skärmdump
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[s.doneBtn, { borderColor: theme.border }]}
      onPress={onDone}
      activeOpacity={0.7}
    >
      <Text style={[s.doneBtnText, { color: theme.text2 }]}>
        Markera som gjord
      </Text>
    </TouchableOpacity>
  );
}

// ── Huvud-komponent ──────────────────────────────────────────────────────────
export default function AnalysScreen() {
  const { theme, isDark } = useTheme();
  const [schedule, setSchedule]   = useState(getScheduleInfo);
  const [doneTrades, setDoneTrades] = useState({});   // { instrument: true }
  const pendingCount = Object.keys(doneTrades).length;

  useEffect(() => {
    const tick = () => setSchedule(getScheduleInfo());
    const id = setInterval(tick, schedule.showCountdown ? 1000 : 60000);
    return () => clearInterval(id);
  }, [schedule.showCountdown]);

  const BADGE = {
    köp:    { color: theme.buy,  bg: theme.buyBg,  border: theme.buyBorder  },
    sälj:   { color: theme.sell, bg: theme.sellBg, border: theme.sellBorder },
    behåll: { color: theme.hold, bg: theme.holdBg, border: theme.holdBorder },
  };

  const sorted  = [...MOCK_RECS].sort((a, b) => b.score - a.score);
  const sections = ['action', 'watch', 'hold'];
  const grouped  = Object.fromEntries(
    sections.map(sec => [sec, sorted.filter(r => scoreSection(r.score) === sec)])
  );
  const allHold = grouped.action.length === 0 && grouped.watch.length === 0;

  const handleDone = (r) => {
    Alert.alert(
      cap(r.action) + ' ' + r.instrument,
      `Har du ${r.action === 'köp' ? 'köpt' : 'sålt'} ${r.instrument} i Avanza?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ja, gjord',
          onPress: () => setDoneTrades(prev => ({ ...prev, [r.instrument]: true })),
        },
      ]
    );
  };

  const handleScreenshotPress = () => {
    Alert.alert(
      'Uppdatera portfölj',
      'Öppna Avanza → ta en skärmdump av dina innehav → ladda upp den här.\n\nVi läser av GAV och bekräftar dina trades automatiskt.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, paddingTop: STATUSBAR_H }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={[s.title, { color: theme.text }]}>Analys</Text>
        </View>

        {/* Schema-kort */}
        <View style={[s.scheduleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {schedule.fresh && <PulseDot color={theme.buy} />}
            <Text style={[s.ageLabel, { color: schedule.fresh ? theme.buy : theme.text2 }]}>
              Analyserades {schedule.ageLabel}
            </Text>
          </View>
          {schedule.showCountdown && (
            <View style={[s.countdownRow, { borderTopColor: theme.border }]}>
              <Text style={[s.countdownHint, { color: theme.text3 }]}>Nästa analys om</Text>
              <Text style={[s.countdown, { color: theme.text }]}>{schedule.countdownLabel}</Text>
            </View>
          )}
        </View>

        {/* Screenshot-banner — visas om det finns pending trades */}
        {pendingCount > 0 && (
          <ScreenshotBanner
            pendingCount={pendingCount}
            theme={theme}
            onPress={handleScreenshotPress}
          />
        )}

        {/* Allt OK */}
        {allHold && pendingCount === 0 && (
          <View style={[s.allGoodCard, { backgroundColor: theme.buyBg, borderColor: theme.buyBorder }]}>
            <Text style={[s.allGoodText, { color: theme.buy }]}>
              ✓  Portföljen ser bra ut just nu — inga åtgärder behövs
            </Text>
          </View>
        )}

        {/* Rekommendationer */}
        {sections.map(sec => {
          const recs = grouped[sec];
          if (recs.length === 0) return null;
          const meta = SECTION_META[sec];
          return (
            <View key={sec}>
              <Text style={[s.sectionLabel, { color: theme.text3 }]}>
                {meta.emoji}  {meta.label}
              </Text>
              {recs.map((r, i) => {
                const c   = BADGE[r.action] ?? BADGE.behåll;
                const dim = sec === 'hold';
                const isDone = !!doneTrades[r.instrument];
                return (
                  <View
                    key={i}
                    style={[
                      s.recCard,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      sec === 'action' && !isDone && { borderColor: c.border },
                      isDone && { borderColor: theme.buyBorder },
                    ]}
                  >
                    <View style={[s.recAccent, {
                      backgroundColor: isDone ? theme.buy : c.color,
                      opacity: dim ? 0.4 : 1,
                      width: sec === 'action' ? 5 : 3,
                    }]} />

                    <View style={[s.recBody, { opacity: dim ? 0.65 : 1 }]}>
                      <View style={s.recTop}>
                        <Text style={[s.recName, { color: theme.text }]}>{r.instrument}</Text>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <View style={[s.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
                            <Text style={[s.badgeText, { color: c.color }]}>{cap(r.action)}</Text>
                          </View>
                          <ScoreDots score={r.score} color={isDone ? theme.buy : c.color} />
                        </View>
                      </View>
                      <Text style={[s.recReason, { color: theme.text2 }]}>{r.reason}</Text>
                      {r.amount_sek != null && !isDone && (
                        <Text style={[s.recAmount, { color: theme.text }]}>
                          Förslag: {fmt(r.amount_sek)} kr
                        </Text>
                      )}
                      <DoneButton
                        instrument={r.instrument}
                        action={r.action}
                        theme={theme}
                        isDone={isDone}
                        onDone={() => handleDone(r)}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        <Text style={[s.footer, { color: theme.text3 }]}>
          Körs automatiskt 09:05 och 16:05 varje dag
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll:           { padding: 16, paddingBottom: 40, gap: 12 },
  header:           { marginBottom: 4 },
  title:            { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },

  scheduleCard:     { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  ageLabel:         { fontSize: 14, fontWeight: '500' },
  countdownRow:     { borderTopWidth: 1, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countdownHint:    { fontSize: 13 },
  countdown:        { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -0.5 },

  // Screenshot-banner
  screenshotBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      borderRadius: 14, borderWidth: 1, padding: 14 },
  screenshotLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  screenshotIcon:   { fontSize: 22 },
  screenshotTitle:  { fontSize: 14, fontWeight: '600' },
  screenshotSub:    { fontSize: 12, marginTop: 2 },
  screenshotArrow:  { fontSize: 22 },

  allGoodCard:      { borderRadius: 12, borderWidth: 1, padding: 14 },
  allGoodText:      { fontSize: 14, fontWeight: '600' },

  sectionLabel:     { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },

  recCard:          { flexDirection: 'row', borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  recAccent:        { width: 3 },
  recBody:          { flex: 1, padding: 16 },
  recTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  recName:          { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 12 },
  recReason:        { fontSize: 13, lineHeight: 20 },
  recAmount:        { fontSize: 13, fontWeight: '600', marginTop: 8, fontVariant: ['tabular-nums'] },
  badge:            { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText:        { fontSize: 12, fontWeight: '600' },

  // Markera som gjord
  doneBtn:          { marginTop: 12, borderRadius: 8, borderWidth: 1, paddingVertical: 8,
                      alignItems: 'center' },
  doneBtnText:      { fontSize: 13, fontWeight: '500' },
  doneConfirm:      { marginTop: 12, borderRadius: 8, borderWidth: 1, paddingVertical: 8,
                      paddingHorizontal: 12 },
  doneConfirmText:  { fontSize: 12, fontWeight: '600' },

  footer:           { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
