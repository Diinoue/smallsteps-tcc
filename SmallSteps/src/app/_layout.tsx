import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProfileProvider } from '../context/ProfileContext';
import { authSession } from '../services/authSession';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 1. Verifica token inicial e escuta mudanças de autenticação / 401
  useEffect(() => {
    let mounted = true;

    async function verificarAutenticacao() {
      try {
        const token = await authSession.getToken();
        if (mounted) {
          setIsAuthenticated(Boolean(token));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    verificarAutenticacao();

    const unsubscribeAuth = authSession.subscribeAuthState((authenticated) => {
      if (mounted) {
        setIsAuthenticated(authenticated);
      }
    });

    const unsubscribeUnauthorized = authSession.subscribeUnauthorized(() => {
      if (mounted) {
        setIsAuthenticated(false);
        router.replace('/(auth)/login');
      }
    });

    return () => {
      mounted = false;
      unsubscribeAuth();
      unsubscribeUnauthorized();
    };
  }, [router]);

  // 2. Guard de rotas: redireciona para login se não autenticado, ou para tabs se já autenticado no grupo (auth)
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments, router]);

  // Exibe um loading rápido enquanto confere o armazenamento da sessão
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
          <Stack.Screen name="(community)/findCommunity" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/goals" options={{ headerShown: false }} />
          <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ProfileProvider>
    </ThemeProvider>
  );
}
