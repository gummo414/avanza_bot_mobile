import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform, Animated, KeyboardAvoidingView,
  Image, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { API } from '../config';

const STATUSBAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

export default function LoginScreen({ onLogin }) {
  const { theme, isDark } = useTheme();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const shakeAnim               = useRef(new Animated.Value(0)).current;
  const passwordRef             = useRef(null);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Fyll i både e-post och lösenord.');
      shake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res  = await fetch(API.login, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.token) {
        setError(data.error ?? 'Fel e-post eller lösenord.');
        shake();
        return;
      }

      await AsyncStorage.setItem('@auth/token', data.token);
      onLogin(data.token);
    } catch (_) {
      setError('Kunde inte nå servern. Kontrollera din anslutning.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, paddingTop: STATUSBAR_H }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.inner}>

          {/* Ikon + namn */}
          <View style={s.top}>
            <Image
              source={require('../assets/icon.png')}
              style={s.icon}
              resizeMode="contain"
            />
            <Text style={[s.appName, { color: theme.text }]}>AVA Bot</Text>
            <Text style={[s.tagline, { color: theme.text3 }]}>Privat beta</Text>
          </View>

          {/* Formulär */}
          <Animated.View style={[s.form, { transform: [{ translateX: shakeAnim }] }]}>
            <TextInput
              style={[s.input, {
                backgroundColor: theme.surface,
                borderColor: error ? theme.sellBorder : theme.border,
                color: theme.text,
              }]}
              placeholder="E-postadress"
              placeholderTextColor={theme.text3}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <TextInput
              ref={passwordRef}
              style={[s.input, {
                backgroundColor: theme.surface,
                borderColor: error ? theme.sellBorder : theme.border,
                color: theme.text,
              }]}
              placeholder="Lösenord"
              placeholderTextColor={theme.text3}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {error ? (
              <Text style={[s.error, { color: theme.sell }]}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[s.btn, { backgroundColor: theme.text }, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={theme.bg} />
                : <Text style={[s.btnText, { color: theme.bg }]}>Logga in</Text>
              }
            </TouchableOpacity>
          </Animated.View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  inner:   { flex: 1, justifyContent: 'center', paddingHorizontal: 32, gap: 32 },
  top:     { alignItems: 'center', gap: 8 },
  icon:    { width: 80, height: 80, borderRadius: 18 },
  appName: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  tagline: { fontSize: 13 },
  form:    { gap: 12 },
  input:   { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16,
             paddingVertical: 14, fontSize: 16 },
  error:   { fontSize: 13, textAlign: 'center' },
  btn:     { borderRadius: 14, paddingVertical: 16, alignItems: 'center',
             marginTop: 4 },
  btnText: { fontSize: 16, fontWeight: '700' },
});
