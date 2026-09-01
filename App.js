import 'react-native-gesture-handler';
import React from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ThemeProvider, useTheme } from './ThemeContext';
import HomeScreen          from './screens/HomeScreen';
import AnalysScreen        from './screens/AnalysScreen';
import InstallningarScreen from './screens/InstallningarScreen';

const Tab = createBottomTabNavigator();

const ICONS = { Hem: '⌂', Analys: '↗', Inställningar: '⚙' };

function TabIcon({ label, active, theme }) {
  return (
    <Text style={{ fontSize: 20, color: active ? theme.text : theme.text3 }}>
      {ICONS[label]}
    </Text>
  );
}

function Navigator() {
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
        <Tab.Screen name="Inställningar" component={InstallningarScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Navigator />
    </ThemeProvider>
  );
}
