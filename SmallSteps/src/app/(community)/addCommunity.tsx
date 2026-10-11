import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Visual constants based on prototype
const ACCENT_GREEN = '#34C759'; // Apple system green / prototype text & icon green
const ARROW_BUTTON_GREEN = '#28833F'; // Darker green for arrow circular button

export default function AddCommunity() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [communityLink, setCommunityLink] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = isDark ? '#1F2937' : '#F5F5F5';
  const cardBorderColor = isDark ? '#374151' : '#E5E7EB';
  const inputBackground = isDark ? '#1F2937' : '#FFFFFF';

  const handleBack = () => {
    router.back();
  };

  const handleJoinByLink = () => {
    const trimmed = communityLink.trim();
    if (!trimmed) {
      Alert.alert('Link necessário', 'Por favor, digite o link ou código da comunidade para entrar.');
      return;
    }
    Alert.alert('Entrar na comunidade', `Procurando comunidade com o código/link: "${trimmed}"...`);
  };

  const handleFindCommunity = () => {
    Alert.alert('Buscar Comunidade', 'Funcionalidade para explorar e buscar comunidades.');
  };

  const handleCreateCommunity = () => {
    Alert.alert('Criar Comunidade', 'Funcionalidade para criar uma nova comunidade.');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Top Header Bar with Back Arrow */}
      <View style={[styles.headerBar, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section: Use link */}
          <View style={styles.useLinkSection}>
            <Text style={[styles.useLinkLabel, { color: textColor }]}>Use link:</Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: inputBackground,
                  borderColor: cardBorderColor,
                },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="exemplo... #5b1c27"
                placeholderTextColor={textMuted}
                value={communityLink}
                onChangeText={setCommunityLink}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={handleJoinByLink}
              />
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={handleJoinByLink}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Card 1: Find Community */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorderColor,
              },
            ]}
            onPress={handleFindCommunity}
            activeOpacity={0.75}
          >
            <Text style={styles.cardTitle}>Find{'\n'}Community</Text>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="search" size={38} color={ACCENT_GREEN} />
            </View>
          </TouchableOpacity>

          {/* Card 2: Create Community */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorderColor,
              },
            ]}
            onPress={handleCreateCommunity}
            activeOpacity={0.75}
          >
            <Text style={styles.cardTitle}>Create{'\n'}Community</Text>
            <View style={styles.iconWrapper}>
              <View style={styles.plusSquareIcon}>
                <MaterialIcons name="add" size={22} color={ACCENT_GREEN} />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 36,
  },
  useLinkSection: {
    marginBottom: 24,
  },
  useLinkLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 25,
    height: 50,
    paddingLeft: 16,
    paddingRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ARROW_BUTTON_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCard: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 185,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: ACCENT_GREEN,
    textAlign: 'center',
    lineHeight: 38,
  },
  iconWrapper: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusSquareIcon: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: ACCENT_GREEN,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});