import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useAuth } from './src/hooks/useAuth.js';
import { useOfflineQueue } from './src/hooks/useOfflineQueue.js';
import { useTerritory } from './src/hooks/useTerritory.js';
import { useModules } from './src/hooks/useModules.js';

import { LoginScreen } from './src/screens/LoginScreen.js';
import { HomeScreen } from './src/screens/HomeScreen.js';
import { SettingsScreen } from './src/screens/SettingsScreen.js';
import { IncidentScreen } from './src/screens/modules/IncidentScreen.js';
import { SondageScreen } from './src/screens/modules/SondageScreen.js';
import { CampaignScreen } from './src/screens/modules/CampaignScreen.js';
import { EventScreen } from './src/screens/modules/EventScreen.js';
import { MissionScreen } from './src/screens/modules/MissionScreen.js';
import { DigitalScreen } from './src/screens/modules/DigitalScreen.js';
import { LogistiqueScreen } from './src/screens/modules/LogistiqueScreen.js';
import { AdherentScreen } from './src/screens/modules/AdherentScreen.js';
import type { ModuleKey } from './src/types/domain.js';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Settings: undefined;
  Module: { module: ModuleKey };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const auth = useAuth();
  const { queueCount, syncing, sync } = useOfflineQueue(auth.token);
  const { departments } = useTerritory(auth.token);
  const modules = useModules(auth.user);

  if (auth.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9a1f1f" />
      </View>
    );
  }

  if (!auth.user || !auth.token) {
    return <LoginScreen onLogin={auth.login} />;
  }

  const moduleScreenProps = {
    token: auth.token,
    departments,
    onBack: () => { /* handled by navigation */ },
    onSubmitted: () => { /* handled by navigation */ },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f1117' } }}
      >
        <Stack.Screen name="Home">
          {({ navigation }) => (
            <HomeScreen
              user={auth.user!}
              modules={modules}
              queueCount={queueCount}
              syncing={syncing}
              onSync={sync}
              onNavigate={mod => navigation.navigate('Module', { module: mod })}
              onSettings={() => navigation.navigate('Settings')}
              onLogout={auth.logout}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Settings">
          {({ navigation }) => (
            <SettingsScreen
              user={auth.user!}
              onBack={() => navigation.goBack()}
              onLogout={auth.logout}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Module">
          {({ navigation, route }) => {
            const mod = route.params.module;
            const back = () => navigation.goBack();
            const submitted = () => navigation.goBack();
            const baseProps = { token: auth.token!, departments, onBack: back, onSubmitted: submitted };

            switch (mod) {
              case 'incident': return <IncidentScreen {...baseProps} />;
              case 'sondage': return <SondageScreen {...baseProps} />;
              case 'campaign': return <CampaignScreen {...baseProps} />;
              case 'events': return <EventScreen {...baseProps} />;
              case 'mission': return <MissionScreen {...baseProps} />;
              case 'digital': return <DigitalScreen token={auth.token!} onBack={back} onSubmitted={submitted} />;
              case 'logistique': return <LogistiqueScreen {...baseProps} />;
              case 'adherent': return <AdherentScreen {...baseProps} />;
              default: return <HomeScreen user={auth.user!} modules={modules} queueCount={queueCount} syncing={syncing} onSync={sync} onNavigate={m => navigation.navigate('Module', { module: m })} onSettings={() => navigation.navigate('Settings')} onLogout={auth.logout} />;
            }
          }}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0f1117" />
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f1117',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
