import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { criarComunidade, uploadMedia } from '@/src/services/communityService';

const ACCENT_GREEN = '#34C759';
const DARK_GREEN = '#28833F';
const TAG_SUGGESTIONS = ['Saúde', 'Produtividade', 'Estudos', 'Esportes', 'Música', 'Leitura'];

export default function NewCommunity() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceVariant = isDark ? '#263238' : '#F4F6F8';

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false); // false = Pública, true = Privada
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameInputRef = useRef<TextInput>(null);

  // Selecionar imagem da galeria
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos da sua permissão para acessar a galeria de fotos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImageUri(asset.uri);
        setSelectedImageMime(asset.mimeType || 'image/jpeg');
      }
    } catch (err) {
      console.error('Erro ao selecionar foto:', err);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageUri(null);
    setSelectedImageMime(null);
  };

  // Tags handlers
  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed) {
      if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        setTags((prev) => [...prev, trimmed]);
      }
      setNewTagInput('');
    }
  };

  const handleAddSuggestedTag = (suggested: string) => {
    if (!tags.some((t) => t.toLowerCase() === suggested.toLowerCase())) {
      setTags((prev) => [...prev, suggested]);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Submissão do formulário
  const handleConfirm = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe o nome da comunidade.');
      nameInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);

      let fotoUrl: string | null = null;
      if (selectedImageUri) {
        try {
          fotoUrl = await uploadMedia(selectedImageUri, selectedImageMime || 'image/jpeg');
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          Alert.alert(
            'Aviso',
            'Não foi possível enviar a foto selecionada. Deseja continuar criando a comunidade sem a foto?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => setLoading(false) },
              {
                text: 'Continuar',
                onPress: async () => {
                  await sendCommunityData(trimmedName, null);
                },
              },
            ]
          );
          return;
        }
      }

      await sendCommunityData(trimmedName, fotoUrl);
    } catch (error: any) {
      console.error('Erro ao criar comunidade:', error);
      const mensagemErro =
        error?.response?.data?.message ||
        'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
      Alert.alert('Erro ao criar comunidade', mensagemErro);
      setLoading(false);
    }
  };

  const sendCommunityData = async (communityName: string, foto: string | null) => {
    try {
      await criarComunidade({
        nome: communityName,
        descricao: description.trim() || undefined,
        privado: isPrivate,
        foto: foto,
        tags: tags,
        idUsuario: 1, // Fallback para vincular o criador como DONO
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
    } catch (error: any) {
      console.error('Falha no salvamento:', error);
      const mensagemErro =
        error?.response?.data?.message ||
        'Ocorreu uma falha ao salvar a comunidade. Tente novamente.';
      Alert.alert('Erro', mensagemErro);
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

      {/* Header com Voltar e Título */}
      <View style={[styles.headerBar, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Nova Comunidade</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Seção 1: Foto da Comunidade */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={[
                styles.avatarContainer,
                {
                  borderColor: selectedImageUri ? ACCENT_GREEN : borderColor,
                  backgroundColor: isDark ? '#1E293B' : '#EBF5EE',
                },
              ]}
              activeOpacity={0.8}
              onPress={handlePickImage}
            >
              {selectedImageUri ? (
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="groups" size={44} color={ACCENT_GREEN} />
                  <Text style={[styles.avatarPlaceholderText, { color: DARK_GREEN }]}>
                    Adicionar foto
                  </Text>
                </View>
              )}

              {/* Botão de edição circular flutuante */}
              <View style={[styles.avatarEditBadge, { backgroundColor: ACCENT_GREEN }]}>
                <MaterialIcons
                  name={selectedImageUri ? 'edit' : 'add-a-photo'}
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>

            {selectedImageUri && (
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={handleRemoveImage}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
                <Text style={styles.removeImageText}>Remover foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Seção 2: Informações Básicas */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            {/* Nome da Comunidade */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.fieldLabel, { color: textColor }]}>
                  Nome da Comunidade <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <Text style={[styles.counterText, { color: textMuted }]}>
                  {name.length}/40
                </Text>
              </View>
              <TextInput
                ref={nameInputRef}
                style={[
                  styles.textInput,
                  {
                    color: textColor,
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: borderColor,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Corredores de Fim de Semana"
                placeholderTextColor={textMuted}
                maxLength={40}
                autoFocus
              />
            </View>

            {/* Descrição */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.fieldLabel, { color: textColor }]}>Descrição</Text>
                <Text style={[styles.counterText, { color: textMuted }]}>
                  {description.length}/300
                </Text>
              </View>
              <Text style={[styles.fieldSubLabel, { color: textMuted }]}>
                Apresente os objetivos, temas e como o grupo funciona
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: textColor,
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: borderColor,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Comunidade dedicada à prática esportiva, dicas de saúde e eventos semanais..."
                placeholderTextColor={textMuted}
                multiline
                numberOfLines={4}
                maxLength={300}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Seção 3: Privacidade */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={[styles.fieldLabel, { color: textColor, marginBottom: 4 }]}>
              Privacidade do Grupo
            </Text>
            <Text style={[styles.fieldSubLabel, { color: textMuted, marginBottom: 14 }]}>
              Defina quem pode encontrar e participar da comunidade
            </Text>

            <View style={styles.privacyOptions}>
              {/* Opção Pública */}
              <TouchableOpacity
                style={[
                  styles.privacyCard,
                  {
                    borderColor: !isPrivate ? ACCENT_GREEN : borderColor,
                    backgroundColor: !isPrivate
                      ? isDark
                        ? '#143822'
                        : '#EBF8EE'
                      : isDark
                      ? '#1F2937'
                      : '#FFFFFF',
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setIsPrivate(false)}
              >
                <View style={styles.privacyCardHeader}>
                  <View
                    style={[
                      styles.privacyIconBox,
                      {
                        backgroundColor: !isPrivate
                          ? ACCENT_GREEN
                          : isDark
                          ? '#374151'
                          : '#E5E7EB',
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="public"
                      size={20}
                      color={!isPrivate ? '#FFFFFF' : textMuted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        styles.privacyTitle,
                        { color: !isPrivate ? DARK_GREEN : textColor },
                      ]}
                    >
                      Pública
                    </Text>
                    <Text style={[styles.privacyDescription, { color: textSecondary }]}>
                      Qualquer pessoa pode encontrar e participar livremente
                    </Text>
                  </View>
                  <MaterialIcons
                    name={!isPrivate ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={22}
                    color={!isPrivate ? ACCENT_GREEN : textMuted}
                  />
                </View>
              </TouchableOpacity>

              {/* Opção Privada */}
              <TouchableOpacity
                style={[
                  styles.privacyCard,
                  {
                    borderColor: isPrivate ? ACCENT_GREEN : borderColor,
                    backgroundColor: isPrivate
                      ? isDark
                        ? '#143822'
                        : '#EBF8EE'
                      : isDark
                      ? '#1F2937'
                      : '#FFFFFF',
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setIsPrivate(true)}
              >
                <View style={styles.privacyCardHeader}>
                  <View
                    style={[
                      styles.privacyIconBox,
                      {
                        backgroundColor: isPrivate
                          ? ACCENT_GREEN
                          : isDark
                          ? '#374151'
                          : '#E5E7EB',
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="lock"
                      size={20}
                      color={isPrivate ? '#FFFFFF' : textMuted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        styles.privacyTitle,
                        { color: isPrivate ? DARK_GREEN : textColor },
                      ]}
                    >
                      Privada
                    </Text>
                    <Text style={[styles.privacyDescription, { color: textSecondary }]}>
                      Apenas membros convidados ou aprovados têm acesso
                    </Text>
                  </View>
                  <MaterialIcons
                    name={isPrivate ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={22}
                    color={isPrivate ? ACCENT_GREEN : textMuted}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seção 4: Tags e Categorias */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={[styles.fieldLabel, { color: textColor, marginBottom: 4 }]}>
              Tags e Temas
            </Text>
            <Text style={[styles.fieldSubLabel, { color: textMuted, marginBottom: 12 }]}>
              Ajude outros membros a encontrarem o grupo pelo assunto
            </Text>

            {/* Input para adicionar nova tag */}
            <View style={styles.tagInputContainer}>
              <View
                style={[
                  styles.tagInputWrapper,
                  {
                    borderColor,
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  },
                ]}
              >
                <Text style={styles.hashPrefix}>#</Text>
                <TextInput
                  style={[styles.tagInputText, { color: textColor }]}
                  placeholder="Adicionar tema..."
                  placeholderTextColor={textMuted}
                  value={newTagInput}
                  onChangeText={setNewTagInput}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addTagButton,
                  !newTagInput.trim() && styles.addTagButtonDisabled,
                ]}
                onPress={handleAddTag}
                disabled={!newTagInput.trim()}
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addTagButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            {/* Tags Atuais */}
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View
                    key={`${tag}-${index}`}
                    style={[
                      styles.tagBadge,
                      {
                        backgroundColor: isDark ? '#163824' : '#E8F8EE',
                        borderColor: isDark ? '#235839' : '#C7EED4',
                      },
                    ]}
                  >
                    <Text style={[styles.tagBadgeText, { color: DARK_GREEN }]}>#{tag}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveTag(index)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons name="close" size={14} color={DARK_GREEN} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Sugestões de Tags */}
            <View style={styles.suggestionsSection}>
              <Text style={[styles.suggestionsLabel, { color: textMuted }]}>
                Sugestões rápidas:
              </Text>
              <View style={styles.suggestionsRow}>
                {TAG_SUGGESTIONS.map((suggestion) => {
                  const isAlreadyAdded = tags.some(
                    (t) => t.toLowerCase() === suggestion.toLowerCase()
                  );
                  return (
                    <TouchableOpacity
                      key={suggestion}
                      style={[
                        styles.suggestionPill,
                        {
                          borderColor: isAlreadyAdded ? ACCENT_GREEN : borderColor,
                          backgroundColor: isAlreadyAdded
                            ? isDark
                              ? '#163824'
                              : '#E8F8EE'
                            : isDark
                            ? '#1F2937'
                            : '#FFFFFF',
                        },
                      ]}
                      onPress={() => handleAddSuggestedTag(suggestion)}
                      disabled={isAlreadyAdded}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.suggestionPillText,
                          {
                            color: isAlreadyAdded
                              ? DARK_GREEN
                              : isDark
                              ? '#CBD5E1'
                              : '#4B5563',
                          },
                        ]}
                      >
                        +{suggestion}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: isDark ? '#374151' : '#D1D5DB' },
              ]}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                loading && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>Criando...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <MaterialIcons name="check" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.confirmButtonText}>Criar Comunidade</Text>
                </View>
              )}
            </TouchableOpacity>
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
  headerBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Foto / Avatar da Comunidade
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  removeImageText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },

  // Cards de Seção
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  fieldSubLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  counterText: {
    fontSize: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
  },

  // Privacidade
  privacyOptions: {
    gap: 12,
  },
  privacyCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  privacyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Tags
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tagInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  hashPrefix: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  tagInputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
  },
  addTagButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addTagButtonDisabled: {
    opacity: 0.5,
  },
  addTagButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 6,
  },
  tagBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionsSection: {
    marginTop: 4,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionPill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  suggestionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Botões de Ação
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#34C759',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
