import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { light, dark } from './theme';

const ThemeContext = createContext();

const STORAGE_KEYS = {
  THEME_OVERRIDE: '@settings/theme_override',
  CHART_SOURCE:   '@settings/chart_source',
};

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [override, setOverrideState]       = useState(null);   // null | 'dark' | 'light'
  const [chartSource, setChartSourceState] = useState('api');  // 'api' | 'import'
  const [loaded, setLoaded]                = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedTheme, savedChart] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME_OVERRIDE),
          AsyncStorage.getItem(STORAGE_KEYS.CHART_SOURCE),
        ]);
        if (savedTheme) setOverrideState(savedTheme);
        if (savedChart) setChartSourceState(savedChart);
      } catch (_) { /* AsyncStorage ej tillgänglig */ }
      setLoaded(true);
    })();
  }, []);

  const setOverride = async (val) => {
    setOverrideState(val);
    try { await AsyncStorage.setItem(STORAGE_KEYS.THEME_OVERRIDE, val ?? ''); } catch (_) { /* ignore */ }
  };

  const setChartSource = async (val) => {
    setChartSourceState(val);
    try { await AsyncStorage.setItem(STORAGE_KEYS.CHART_SOURCE, val); } catch (_) { /* ignore */ }
  };

  const isDark = override !== null ? override === 'dark' : system === 'dark';
  const theme  = isDark ? dark : light;

  if (!loaded) return null; // Vänta tills settings är laddade

  return (
    <ThemeContext.Provider value={{ theme, isDark, setOverride, override, chartSource, setChartSource }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
