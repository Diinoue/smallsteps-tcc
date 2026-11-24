import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  CommunityItem,
  communityService,
  uploadMedia,
} from '@/src/services/communityService';
import { userService } from '@/src/services/userService';

const ACCENT_GREEN = '#34C759';
const DARK_GREEN = '#28833F';
const DANGER_RED = '#EF4444';

export interface CommunityEditScreenProps {
  communityId: number | string;
  initialCommunity?: Partial<CommunityItem>;
  onBackPress: () => void;
  onSaved: (updated: CommunityItem) => void;
  onDeleted: () => void;
}

export function CommunityEditScreen({
  communityId,
  initialCommunity,
  onBackPress,
  onSaved,
  onDeleted,
}: CommunityEditScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  // Form states
  const [name, setName] = useState(initialCommunity?.nome || '');
  const [description, setDescription] = useState(initialCommunity?.descricao || '');
  const [isPrivate, setIsPrivate] = useState(Boolean(initialCommunity?.privado));
  const [tags, setTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [foundTags, setFoundTags] = useState<string[]>([]);
  const [searchingTags, setSearchingTags] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(
    initialCommunity?.foto || null
  );
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    let active = true;
    async function loadDetails() {
      try {
        setInitialLoading(true);
        const details = await communityService.getCommunityDetails(communityId, 1);
        if (!active) return;
        setName(details.nome || '');
        setDescription(details.descricao || '');
        setIsPrivate(Boolean(details.privado));
        setTags(details.tags || []);
        setSelectedImageUri(details.foto || null);
        setImageChanged(false);
      } catch (err) {
        console.error('Erro ao carregar detalhes da comunidade:', err);
      } finally {
        if (active) setInitialLoading(false);
      }
    }
    loadDetails();
    return () => {
      active = false;
    };
  }, [communityId]);

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
        setImageChanged(true);
      }
    } catch (err) {
      console.error('Erro ao selecionar foto:', err);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageUri(null);
    setSelectedImageMime(null);
    setImageChanged(true);
  };

  const handleSearchTags = useCallback(async (query?: string) => {
    try {
      setSearchingTags(true);
      const result = await userService.buscarTags(query);
      setFoundTags(result);
    } finally {
      setSearchingTags(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchTags(tagSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [tagSearchQuery, handleSearchTags]);

  const handleSelectTag = (tagName: string) => {
    if (!tags.some((t) => t.toLowerCase() === tagName.toLowerCase())) {
      setTags((prev) => [...prev, tagName]);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleConfirm = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe o nome da comunidade.');
      nameInputRef.current?.focus();
      return;
    }

    try {
      setSaving(true);

      let fotoPayload: string | undefined;
      if (imageChanged) {
        if (selectedImageUri) {
          fotoPayload = await uploadMedia(
            selectedImageUri,
            selectedImageMime || 'image/jpeg'
          );
        } else {
          // String vazia indica ao backend para limpar a foto
          fotoPayload = '';
        }
      }

      const updated = await communityService.updateCommunity(communityId, {
        nome: trimmedName,
        descricao: description.trim(),
        privado: isPrivate,
        ...(fotoPayload !== undefined ? { foto: fotoPayload } : {}),
        tags,
      });

      if (Platform.OS === 'web') {
        alert('Comunidade atualizada com sucesso!');
        onSaved(updated);
      } else {
        Alert.alert('Sucesso', 'Comunidade atualizada com sucesso!', [
          {
            text: 'OK',
            onPress: () => onSaved(updated),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar comunidade:', error);
      const mensagemErro =
        error?.response?.data?.message ||
        'Não foi possível salvar as alterações. Tente novamente.';
      Alert.alert('Erro', mensagemErro);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCommunity = () => {
    Alert.alert(
      'Deletar Comunidade',
      `Tem certeza que deseja excluir permanentemente a comunidade "${name || initialCommunity?.nome || ''}"? Todos os posts, eventos e membros serão removidos e esta ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await communityService.deleteCommunity(communityId);
              if (Platform.OS === 'web') {
                alert('Comunidade deletada com sucesso.');
                onDeleted();
              } else {
                Alert.alert('Comunidade deletada', 'A comunidade foi removida com sucesso.', [
                  { text: 'OK', onPress: onDeleted },
                ]);
              }
            } catch (error: any) {
              console.error('Erro ao deletar comunidade:', error);
              const mensagemErro =
                error?.response?.data?.message ||
                'Não foi possível deletar a comunidade. Tente novamente.';
              Alert.alert('Erro', mensagemErro);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const isBusy = saving || deleting;

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
          onPress={onBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isBusy}
        >
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Editar Comunidade</Text>
        <View style={{ width: 40 }} />
      </View>

      {initialLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={ACCENT_GREEN} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 24 },
            ]}
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
                disabled={isBusy}
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
                  disabled={isBusy}
                >
                  <MaterialIcons name="delete-outline" size={16} color={DANGER_RED} />
                  <Text style={styles.removeImageText}>Remover foto</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Seção 2: Informações Básicas */}
            <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.fieldLabel, { color: textColor }]}>
                    Nome da Comunidade <Text style={{ color: DANGER_RED }}>*</Text>
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
                      borderColor,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Corredores de Fim de Semana"
                  placeholderTextColor={textMuted}
                  maxLength={40}
                />
              </View>

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
                      borderColor,
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
                  <MaterialIcons name="search" size={18} color={textMuted} style={{ marginRight: 6 }} />
                  <TextInput
                    style={[styles.tagInputText, { color: textColor }]}
                    placeholder="Buscar tag no banco..."
                    placeholderTextColor={textMuted}
                    value={tagSearchQuery}
                    onChangeText={setTagSearchQuery}
                    onSubmitEditing={() => handleSearchTags(tagSearchQuery)}
                    returnKeyType="search"
                  />
                  {tagSearchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setTagSearchQuery('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons name="close" size={16} color={textMuted} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={() => handleSearchTags(tagSearchQuery)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="search" size={18} color="#FFFFFF" />
                  <Text style={styles.addTagButtonText}>Buscar</Text>
                </TouchableOpacity>
              </View>

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

              <View style={styles.suggestionsSection}>
                <Text style={[styles.suggestionsLabel, { color: textMuted }]}>
                  Tags encontradas:
                </Text>
                {searchingTags ? (
                  <ActivityIndicator size="small" color={ACCENT_GREEN} style={{ alignSelf: 'flex-start', marginVertical: 6 }} />
                ) : foundTags.length > 0 ? (
                  <View style={styles.suggestionsRow}>
                    {foundTags.map((foundTag) => {
                      const isAlreadyAdded = tags.some(
                        (t) => t.toLowerCase() === foundTag.toLowerCase()
                      );
                      return (
                        <TouchableOpacity
                          key={foundTag}
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
                          onPress={() => handleSelectTag(foundTag)}
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
                            {foundTag} {isAlreadyAdded ? '✓' : '+'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={[styles.suggestionsLabel, { color: textMuted, fontStyle: 'italic' }]}>
                    Nenhuma tag encontrada para "{tagSearchQuery.trim()}".
                  </Text>
                )}
              </View>
            </View>

            {/* Botões de Ação */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { borderColor: isDark ? '#374151' : '#D1D5DB' },
                ]}
                onPress={onBackPress}
                disabled={isBusy}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isBusy && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={isBusy}
                activeOpacity={0.85}
              >
                {saving ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Salvando...</Text>
                  </View>
                ) : (
                  <View style={styles.loadingRow}>
                    <MaterialIcons name="check" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.confirmButtonText}>Salvar Alterações</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Botão Vermelho de Deletar Comunidade no fim da página */}
            <TouchableOpacity
              style={[styles.deleteButton, isBusy && styles.confirmButtonDisabled]}
              onPress={handleDeleteCommunity}
              disabled={isBusy}
              activeOpacity={0.85}
            >
              {deleting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Deletando...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <MaterialIcons name="delete-forever" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Deletar Comunidade</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: DANGER_RED,
    fontWeight: '600',
  },
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
    fontSize: 16,
    fontWeight: '700',
    color: ACCENT_GREEN,
    marginRight: 4,
  },
  tagInputText: {
    flex: 1,
    fontSize: 15,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_GREEN,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    gap: 4,
  },
  addTagButtonDisabled: {
    opacity: 0.45,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
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
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1.5,
    height: 50,
    borderRadius: 25,
    backgroundColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButton: {
    marginTop: 18,
    height: 50,
    borderRadius: 25,
    backgroundColor: DANGER_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
