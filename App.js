import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from './ThemeContext';
import HomeScreen          from './screens/HomeScreen';
import AnalysScreen        from './screens/AnalysScreen';
import InstallningarScreen from './screens/InstallningarScreen';
import LoginScreen         from './screens/LoginScreen';

const Tab = createBottomTabNavigator();
const ICONS = { Hem: '⌂', Analys: '↗', Inställningar: '⚙' };

function TabIcon({ label, active, theme }) {
  return (
    <Text style={{ fontSize: 20, color: active ? theme.text : theme.text3 }}>
      {ICONS[label]}
    </Text>
  );
}

function Navigator({ onLogout }) {
  const { theme } = useTheme();
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={route.name} active={focused} theme={theme} />
          ),
          tabBarActiveTintColor:   theme.text,
          tabBarInactiveTintColor: theme.text3,
          tabBarStyle: {
            backgroundColor: theme.tabBg,
            borderTopColor:  theme.border,
            borderTopWidth:  1,
            paddingBottom:   Platform.OS === 'ios' ? 20 : 8,
            paddingTop:      8,
            height:          Platform.OS === 'ios' ? 80 : 60,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        })}
      >
        <Tab.Screen name="Hem"           component={HomeScreen} />
        <Tab.Screen name="Analys"        component={AnalysScreen} />
        <Tab.Screen name="Inställningar">
          {() => <InstallningarScreen onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const [token, setToken]   = useState(null);
  const [checked, setChecked] = useState(false);

  // Kolla sparad token vid start
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@auth/token');
        if (saved) setToken(saved);
      } catch (_) { /* ignore */ }
      setChecked(true);
    })();
  }, []);

  const handleLogin  = (t) => setToken(t);
  const handleLogout = async () => {
    try { await AsyncStorage.removeItem('@auth/token'); } catch (_) { /* ignore */ }
    setToken(null);
  };

  // Vänta tills AsyncStorage är kontrollerad
  if (!checked) return null;

  if (!token) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Navigator onLogout={handleLogout} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
