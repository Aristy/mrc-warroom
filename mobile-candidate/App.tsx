import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen.js';
import SettingsScreen from './src/screens/SettingsScreen.js';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0f1117" />
      {showSettings
        ? <SettingsScreen onBack={() => setShowSettings(false)} />
        : <DashboardScreen onOpenSettings={() => setShowSettings(true)} />
      }
    </SafeAreaProvider>
  );
}
