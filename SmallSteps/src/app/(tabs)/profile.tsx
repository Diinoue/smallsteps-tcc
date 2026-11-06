import { useThemeColor } from '@/hooks/use-theme-color';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Meu Perfil</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          Seu perfil, conquistas e configurações da conta aparecerão aqui.
        </Text>

        {/* LINK DE TESTE / AUTENTICAÇÃO */}
        <Link href="/login" style={styles.authLink}>
          IR PARA PAGINA LOGIN DIOGO TESTE JOINHA
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  authLink: {
    marginTop: 24,
    fontSize: 15,
    fontWeight: '600',
    color: '#34C759',
    textDecorationLine: 'underline',
  },
});
