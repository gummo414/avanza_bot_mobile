import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform } from 'react-native';

import HomeScreen        from './screens/HomeScreen';
import AnalysScreen      from './screens/AnalysScreen';
import InstallningarScreen from './screens/InstallningarScreen';

const Tab = createBottomTabNavigator();

const C = {
  active:   '#1A1A1A',
  inactive: '#AEAB9E',
  bg:       '#FFFFFF',
  border:   '#E5E3DC',
};

function TabIcon({ label, active }) {
  const icons = { Hem: '⌂', Analys: '↗', Inställningar: '⚙' };
  return (
    <Text style={{ fontSize: 20, color: active ? C.active : C.inactive }}>
      {icons[label]}
    </Text>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} active={focused} />,
          tabBarActiveTintColor: C.active,
          tabBarInactiveTintColor: C.inactive,
          tabBarStyle: {
            backgroundColor: C.bg,
            borderTopColor: C.border,
            borderTopWidth: 1,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 80 : 60,
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
