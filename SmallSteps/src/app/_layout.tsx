import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProfileProvider } from '../context/ProfileContext';
import { loginService } from '../services/loginService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    async function verificarAutenticacao() {
      const token = await loginService.getToken();
      const inAuthGroup = segments[0] === '(auth)';
      // Se não tem token e não está na tela de login/cadastro, manda pro login
      if (!token && !inAuthGroup) {        
        router.replace('/login');
      }
      setLoading(false);
    }

        verificarAutenticacao();
  }, []);

  // Exibe um loading rápido enquanto confere o SecureStore
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#34c759" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ProfileProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="goal/view/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="goal/edit/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="goal/add/index" options={{ headerShown: false }} />
          <Stack.Screen name="(community)/addCommunity" options={{ headerShown: false }} />
          <Stack.Screen name="(community)/newCommunity" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ProfileProvider>
    </ThemeProvider>
  );
}
