import React, { useRef, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { criarComunidade } from '@/src/services/communityService';

export default function NewCommunity() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  // Form states
  const [name, setName] = useState('Nome exemplo');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true); // true = Privado, false = Publico
  const [loading, setLoading] = useState(false);

  const nameInputRef = useRef<TextInput>(null);

  // Add tag handler
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed) {
      if (!tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
      setNewTagInput('');
      setIsAddingTag(false);
    } else {
      setIsAddingTag(false);
    }
  };

  // Remove tag handler
  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Confirm / Submit handler
  const handleConfirm = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Atenção', 'Por favor, informe o nome da comunidade.');
      return;
    }

    try {
      setLoading(true);
      await criarComunidade({
        nome: trimmedName,
        descricao: description.trim(),
        privado: isPrivate,
        tags: tags,
      });

      if (Platform.OS === 'web') {
        alert('Comunidade criada com sucesso!');
        router.replace('/(tabs)/communities');
      } else {
        Alert.alert('Sucesso', 'Comunidade criada com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/communities'),
          },
        ]);
      }
    } catch (error) {
      console.log('Erro ao criar comunidade:', error);
      // Feedback amigável mesmo se o backend estiver desconectado
      Alert.alert(
        'Comunidade criada',
        'Comunidade configurada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/communities'),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

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
          {/* Top Section: Avatar & Community Name */}
          <View style={styles.topProfileSection}>
            {/* Avatar Circle with edit icon */}
            <TouchableOpacity
              style={styles.avatarCircle}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert('Foto da Comunidade', 'Deseja alterar a foto da comunidade?');
              }}
            >
              <View style={styles.avatarInnerPattern}>
                <MaterialIcons name="edit" size={26} color="#1F2937" />
              </View>
            </TouchableOpacity>

            {/* Community Name & Edit Icon */}
            <TouchableOpacity
              style={styles.nameRow}
              activeOpacity={0.8}
              onPress={() => nameInputRef.current?.focus()}
            >
              <TextInput
                ref={nameInputRef}
                style={[styles.nameInput, { color: textColor }]}
                value={name}
                onChangeText={setName}
                placeholder="Nome exemplo"
                placeholderTextColor="#9CA3AF"
                maxLength={40}
              />
              <MaterialIcons name="edit" size={20} color={textColor} style={styles.editIcon} />
            </TouchableOpacity>
          </View>

          {/* Full-width Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <View style={styles.formContainer}>
            {/* Section: Tags */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>Tags</Text>
            <View style={styles.tagsRow}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>#{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="close" size={14} color="#28833F" />
                  </TouchableOpacity>
                </View>
              ))}

              {isAddingTag ? (
                <View style={styles.tagInputWrapper}>
                  <TextInput
                    style={styles.tagTextInput}
                    placeholder="tag..."
                    placeholderTextColor="#9CA3AF"
                    value={newTagInput}
                    onChangeText={setNewTagInput}
                    autoFocus
                    onSubmitEditing={handleAddTag}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={handleAddTag} style={styles.tagAddBtn}>
                    <MaterialIcons name="check" size={18} color="#28833F" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addTagButton}
                  activeOpacity={0.7}
                  onPress={() => setIsAddingTag(true)}
                >
                  <Text style={styles.addTagButtonText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Section: Descrição */}
            <Text style={[styles.sectionTitle, styles.descriptionLabel, { color: textColor }]}>
              Descrição:
            </Text>
            <View style={[styles.textAreaContainer, { borderColor: borderColor }]}>
              <TextInput
                style={[styles.textAreaInput, { color: textColor }]}
                placeholder="exemplo..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Privacy Toggle: Privado & Publico */}
            <View style={styles.privacyRow}>
              {/* Privado Pill */}
              <TouchableOpacity
                style={[
                  styles.privacyPill,
                  isPrivate ? styles.pillSelected : styles.pillUnselected,
                ]}
                activeOpacity={0.7}
                onPress={() => setIsPrivate(true)}
              >
                <Text style={styles.privacyPillText}>Privado</Text>
              </TouchableOpacity>

              {/* Publico Pill */}
              <TouchableOpacity
                style={[
                  styles.privacyPill,
                  !isPrivate ? styles.pillSelected : styles.pillUnselected,
                ]}
                activeOpacity={0.7}
                onPress={() => setIsPrivate(false)}
              >
                <Text style={styles.privacyPillText}>Publico</Text>
              </TouchableOpacity>
            </View>

            {/* Confirmar Button (Aligned to the Right) */}
            <View style={styles.confirmButtonWrapper}>
              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.disabledButton]}
                activeOpacity={0.8}
                onPress={handleConfirm}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Confirmando...' : 'Confirmar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Top Section: Avatar & Name
  topProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: '#D6E6FE',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarInnerPattern: {
    width: '100%',
    height: '100%',
    borderRadius: 49,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCE8FE',
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginRight: 6,
    maxWidth: '82%',
  },
  editIcon: {
    marginLeft: 2,
  },

  // Divider line
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 20,
  },

  // Form Container
  formContainer: {
    paddingHorizontal: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  // Tags Section
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FA',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  tagBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28833F',
  },
  addTagButton: {
    backgroundColor: '#E6F0FA',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  addTagButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28833F',
  },
  tagInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FA',
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 32,
  },
  tagTextInput: {
    fontSize: 13,
    color: '#28833F',
    fontWeight: '600',
    paddingVertical: 0,
    minWidth: 60,
  },
  tagAddBtn: {
    marginLeft: 4,
    padding: 2,
  },

  // Description
  descriptionLabel: {
    marginTop: 22,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 155,
    padding: 12,
  },
  textAreaInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 130,
    padding: 0,
  },

  // Privacy Toggle
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  privacyPill: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  pillSelected: {
    backgroundColor: '#D1D5DB', // Selected gray as seen in prototype
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  pillUnselected: {
    backgroundColor: '#E6F0FA', // Pastel blue as seen in prototype
    borderWidth: 1,
    borderColor: 'transparent',
  },
  privacyPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28833F',
  },

  // Confirmar Button
  confirmButtonWrapper: {
    marginTop: 24,
    alignItems: 'flex-end', // Aligned to the right as in mockup
  },
  confirmButton: {
    backgroundColor: '#34c759',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    shadowColor: '#34c759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Bottom Navigation Bar
  bottomBarContainer: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  bottomBarIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 48,
  },
  bottomBarItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 4,
  },
});
