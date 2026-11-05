import { useThemeColor } from '@/hooks/use-theme-color';
import { Link } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginService } from '@/src/services/loginService';
import { Button } from '@/src/components/ui/Button';

export default function CommunitiesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

// TEMPORÁRIO: exibe o JWT salvo no SecureStore
  const handlePrintJwt = async () => {
    await loginService.getValueFor();
  };

  // TEMPORÁRIO: remove o JWT do SecureStore
  const handleClearJwt = async () => {
    await loginService.removeToken();
    Alert.alert('JWT removido', 'O token foi apagado do armazenamento seguro.');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Comunidades</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          Em breve você poderá explorar e participar de grupos da comunidade aqui!
        </Text>
        {/* LINK DE TESTE */}
        <Link href="/login">IR PARA PAGINA LOGIN DIOGO TESTE JOINHA</Link>
        <Link href="/(community)/newCommunity">TESTEEEEE</Link>        

        {/* BOTÕES DE DEBUG DO JWT */}
        <View style={styles.debugButtons}>
          <Button title="Printar JWT" onPress={handlePrintJwt} />
          <Button title="Limpar JWT" onPress={handleClearJwt} />
        </View>
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
   debugButtons: {
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
});
