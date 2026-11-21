import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useProfile } from '@/src/context/ProfileContext';
import { SquareCheckbox } from '@/src/components/profile/SquareCheckbox';

const ACCENT_GREEN = '#34C759';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
];

const PERIOD_LABELS: Record<'day' | 'week' | 'month', string> = {
  day: 'dia',
  week: 'semana',
  month: 'mês',
};

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceVariant = useThemeColor({}, 'surfaceVariant');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const activeColor = useThemeColor({}, 'streakActive');

  const inputBg = isDark ? '#111827' : '#FFFFFF';
  const tagBg = isDark ? '#1E293B' : '#E8F2FF';
  const tagTextColor = isDark ? '#60A5FA' : '#2563EB';
  const modalBg = isDark ? '#1F2937' : '#FFFFFF';

  const {
    profile,
    availableDbTags,
    allCompletedAchievements,
    updateProfile,
  } = useProfile();

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [tags, setTags] = useState<string[]>([...profile.tags]);
  const [frequencyCount, setFrequencyCount] = useState(
    profile.streakFrequencyCount.toString()
  );
  const [frequencyPeriod, setFrequencyPeriod] = useState<'day' | 'week' | 'month'>(
    profile.streakFrequencyPeriod
  );
  const [publicStreak, setPublicStreak] = useState(profile.publicStreak);
  const [publicCurrentGoals, setPublicCurrentGoals] = useState(
    profile.publicCurrentGoals
  );
  const [visibleAchievementIds, setVisibleAchievementIds] = useState<number[]>(
    [...profile.visibleAchievementIds]
  );

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatarUrl || '');
      setName(profile.name || '');
      setDescription(profile.description || '');
      setTags([...(profile.tags || [])]);
      setFrequencyCount(
        profile.streakFrequencyCount ? profile.streakFrequencyCount.toString() : '2'
      );
      setFrequencyPeriod(profile.streakFrequencyPeriod || 'week');
      setPublicStreak(Boolean(profile.publicStreak));
      setPublicCurrentGoals(Boolean(profile.publicCurrentGoals));
      setVisibleAchievementIds([...(profile.visibleAchievementIds || [])]);
    }
  }, [profile]);

  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [addTagModalVisible, setAddTagModalVisible] = useState(false);
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setCustomTagInput('');
    setAddTagModalVisible(false);
  };

  const handleToggleAchievement = (id: number) => {
    setVisibleAchievementIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 5) {
        Alert.alert('Limite atingido', 'Você pode selecionar no máximo 5 conquistas.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);
      const parsedFrequency = parseInt(frequencyCount, 10);
      await updateProfile({
        avatarUrl,
        name: name.trim() || profile.name,
        description,
        tags,
        streakFrequencyCount:
          isNaN(parsedFrequency) || parsedFrequency <= 0 ? 1 : parsedFrequency,
        streakFrequencyPeriod: frequencyPeriod,
        publicStreak,
        publicCurrentGoals,
        visibleAchievementIds,
      });
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Top Header Bar */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCancel}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Editar Perfil</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Card de Identidade (Avatar + Nome + Descrição) */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.topProfileRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAvatarModalVisible(true)}
                style={styles.avatarWrapper}
              >
                <View style={[styles.avatarContainer, { borderColor }]}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <MaterialIcons name="person" size={44} color="#60A5FA" />
                    </View>
                  )}
                </View>
                <View style={styles.avatarBadge}>
                  <MaterialIcons name="edit" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.nameColumn}>
                <Text style={[styles.fieldLabel, { color: textMuted }]}>NOME</Text>
                <View
                  style={[
                    styles.inputBox,
                    { backgroundColor: inputBg, borderColor },
                  ]}
                >
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Seu nome"
                    placeholderTextColor={textMuted}
                    style={[styles.nameTextInput, { color: textColor }]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>DESCRIÇÃO</Text>
              <View
                style={[
                  styles.descriptionBox,
                  { backgroundColor: inputBg, borderColor },
                ]}
              >
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Fale um pouco sobre você..."
                  placeholderTextColor={textMuted}
                  multiline
                  textAlignVertical="top"
                  style={[styles.descriptionInput, { color: textColor }]}
                />
              </View>
            </View>
          </View>

          {/* 2. Card de Tags */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <View key={tag} style={[styles.tagPill, { backgroundColor: tagBg }]}>
                  <Text style={[styles.tagText, { color: tagTextColor }]}>
                    {tag.toLowerCase()}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleRemoveTag(tag)}
                    style={styles.tagRemoveBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="close" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setAddTagModalVisible(true)}
                style={[
                  styles.addTagPill,
                  {
                    backgroundColor: isDark ? '#143322' : '#ECFDF5',
                    borderColor: activeColor + '50',
                  },
                ]}
              >
                <MaterialIcons name="add" size={16} color={activeColor} />
                <Text style={[styles.addTagText, { color: activeColor }]}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Card de Frequência da Streak */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Frequência da Streak
            </Text>
            <View style={styles.frequencyRow}>
              <TextInput
                value={frequencyCount}
                onChangeText={setFrequencyCount}
                keyboardType="number-pad"
                maxLength={2}
                style={[
                  styles.frequencyCountInput,
                  { backgroundColor: inputBg, borderColor, color: textColor },
                ]}
              />
              <Text style={[styles.frequencyText, { color: textSecondary }]}>
                vezes por
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setFrequencyModalVisible(true)}
                style={[
                  styles.frequencyDropdown,
                  { backgroundColor: inputBg, borderColor },
                ]}
              >
                <Text style={[styles.frequencyDropdownText, { color: textColor }]}>
                  {PERIOD_LABELS[frequencyPeriod]}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Card de Privacidade */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Privacidade</Text>

            <SquareCheckbox
              checked={publicStreak}
              onPress={() => setPublicStreak(!publicStreak)}
              label="Exibir Streak publicamente"
              size={22}
              color={ACCENT_GREEN}
            />

            <SquareCheckbox
              checked={publicCurrentGoals}
              onPress={() => setPublicCurrentGoals(!publicCurrentGoals)}
              label="Exibir metas atuais publicamente"
              size={22}
              color={ACCENT_GREEN}
            />
          </View>

          {/* 5. Card de Conquistas Visíveis */}
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.achievementsHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
                Conquistas visíveis
              </Text>
              <View
                style={[
                  styles.limitPill,
                  { backgroundColor: isDark ? '#143322' : '#ECFDF5' },
                ]}
              >
                <Text style={[styles.limitPillText, { color: activeColor }]}>
                  {visibleAchievementIds.length}/5
                </Text>
              </View>
            </View>

            <View style={styles.achievementsList}>
              {allCompletedAchievements && allCompletedAchievements.length > 0 ? (
                allCompletedAchievements.map((item) => {
                  const isChecked = visibleAchievementIds.includes(item.id);
                  return (
                    <SquareCheckbox
                      key={item.id}
                      checked={isChecked}
                      onPress={() => handleToggleAchievement(item.id)}
                      label={item.title}
                      size={20}
                      color={ACCENT_GREEN}
                    />
                  );
                })
              ) : (
                <Text style={[styles.emptyNotice, { color: textMuted }]}>
                  Nenhuma conquista finalizada ainda.
                </Text>
              )}
            </View>
          </View>

          {/* 6. Botões de Ação */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleCancel}
              disabled={saving}
              style={[styles.cancelButton, { backgroundColor: surfaceVariant }]}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              disabled={saving}
              style={[styles.confirmButton, saving && styles.confirmButtonDisabled]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal para Trocar Foto de Perfil */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAvatarModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: modalBg, borderColor }]}>
                <Text style={[styles.modalHeading, { color: textColor }]}>
                  Escolher foto de perfil
                </Text>
                <View style={styles.avatarPresetsGrid}>
                  {AVATAR_PRESETS.map((url, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() => {
                        setAvatarUrl(url);
                        setAvatarModalVisible(false);
                      }}
                      style={[
                        styles.avatarPresetItem,
                        avatarUrl === url && styles.avatarPresetSelected,
                      ]}
                    >
                      <Image source={{ uri: url }} style={styles.presetImage} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => setAvatarModalVisible(false)}
                  style={[styles.modalCloseBtn, { backgroundColor: surfaceVariant }]}
                >
                  <Text style={[styles.modalCloseText, { color: textColor }]}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal para Adicionar Tag */}
      <Modal
        visible={addTagModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddTagModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAddTagModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: modalBg, borderColor }]}>
                <Text style={[styles.modalHeading, { color: textColor }]}>Adicionar Tag</Text>

                <View style={styles.newTagInputRow}>
                  <TextInput
                    value={customTagInput}
                    onChangeText={setCustomTagInput}
                    placeholder="Digite uma nova tag..."
                    placeholderTextColor={textMuted}
                    style={[
                      styles.newTagTextInput,
                      { backgroundColor: inputBg, borderColor, color: textColor },
                    ]}
                    returnKeyType="done"
                    onSubmitEditing={() => handleAddTag(customTagInput)}
                  />
                  <TouchableOpacity
                    onPress={() => handleAddTag(customTagInput)}
                    style={styles.newTagSubmitBtn}
                  >
                    <Text style={styles.newTagSubmitText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.suggestedTagsHeading, { color: textSecondary }]}>
                  Sugeridas:
                </Text>
                <View style={styles.suggestedTagsContainer}>
                  {availableDbTags.map((dbTag) => {
                    const alreadyAdded = tags.includes(dbTag);
                    return (
                      <TouchableOpacity
                        key={dbTag}
                        disabled={alreadyAdded}
                        onPress={() => handleAddTag(dbTag)}
                        style={[
                          styles.suggestedTagPill,
                          {
                            backgroundColor: alreadyAdded ? surfaceVariant : tagBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.suggestedTagText,
                            { color: alreadyAdded ? textMuted : tagTextColor },
                          ]}
                        >
                          {dbTag.toLowerCase()} {alreadyAdded ? '✓' : '+'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => setAddTagModalVisible(false)}
                  style={[styles.modalCloseBtn, { backgroundColor: surfaceVariant }]}
                >
                  <Text style={[styles.modalCloseText, { color: textColor }]}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal para Selecionar Frequência */}
      <Modal
        visible={frequencyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFrequencyModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFrequencyModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdownModalContent, { backgroundColor: modalBg, borderColor }]}>
                <Text style={[styles.modalHeading, { color: textColor }]}>
                  Período da Streak
                </Text>
                {(['day', 'week', 'month'] as const).map((period) => {
                  const selected = frequencyPeriod === period;
                  return (
                    <TouchableOpacity
                      key={period}
                      activeOpacity={0.7}
                      onPress={() => {
                        setFrequencyPeriod(period);
                        setFrequencyModalVisible(false);
                      }}
                      style={[
                        styles.frequencyOption,
                        {
                          backgroundColor: selected
                            ? isDark
                              ? '#143322'
                              : '#ECFDF5'
                            : surfaceVariant,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.frequencyOptionText,
                          { color: selected ? activeColor : textColor },
                          selected && { fontWeight: '800' },
                        ]}
                      >
                        {PERIOD_LABELS[period]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  topProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#DBEAFE',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameColumn: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  nameTextInput: {
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 0,
  },
  descriptionSection: {
    marginTop: 4,
  },
  descriptionBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
  },
  descriptionInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 78,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 13,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tagRemoveBtn: {
    marginLeft: 6,
    padding: 2,
  },
  addTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  addTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frequencyCountInput: {
    width: 52,
    height: 42,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },
  frequencyText: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  frequencyDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 42,
    gap: 6,
  },
  frequencyDropdownText: {
    fontSize: 15,
    fontWeight: '700',
  },
  achievementsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  limitPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  limitPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  achievementsList: {
    marginTop: 2,
  },
  emptyNotice: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownModalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 10,
  },
  avatarPresetItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarPresetSelected: {
    borderColor: ACCENT_GREEN,
    transform: [{ scale: 1.06 }],
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  newTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  newTagTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
  },
  newTagSubmitBtn: {
    backgroundColor: ACCENT_GREEN,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  newTagSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  suggestedTagsHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  suggestedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  suggestedTagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  suggestedTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalCloseBtn: {
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  frequencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  frequencyOptionText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
