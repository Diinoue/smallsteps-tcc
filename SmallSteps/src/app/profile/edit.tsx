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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useProfile } from '@/src/context/ProfileContext';
import { SquareCheckbox } from '@/src/components/profile/SquareCheckbox';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const {
    profile,
    availableDbTags,
    allCompletedAchievements,
    updateProfile,
    carregarPerfil,
  } = useProfile();

  // Estados locais do formulário de edição
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

  // Sincroniza estados caso o perfil seja atualizado
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

  // Modais de suporte
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [addTagModalVisible, setAddTagModalVisible] = useState(false);
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  // Remover tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Adicionar tag
  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setCustomTagInput('');
    setAddTagModalVisible(false);
  };

  // Alternar seleção de conquistas visíveis (máx. 5)
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

  // Salvar alterações
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    try {
      setSaving(true);
      const parsedFrequency = parseInt(frequencyCount, 10);
      await updateProfile({
        avatarUrl,
        name: name.trim() || profile.name,
        description,
        tags,
        streakFrequencyCount: isNaN(parsedFrequency) || parsedFrequency <= 0 ? 1 : parsedFrequency,
        streakFrequencyPeriod: frequencyPeriod,
        publicStreak,
        publicCurrentGoals,
        visibleAchievementIds,
      });
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar alterações
  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Foto e Nome do Usuário */}
        <View style={styles.topProfileRow}>
          {/* Avatar com ícone de caneta */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAvatarModalVisible(true)}
            style={styles.avatarWrapper}
          >
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={54} color="#9CA3AF" />
                </View>
              )}
            </View>
            <View style={styles.avatarEditOverlay}>
              <MaterialIcons name="edit" size={20} color="#111827" />
            </View>
          </TouchableOpacity>

          {/* Nome editável */}
          <View style={styles.nameInputContainer}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor="#9CA3AF"
              style={styles.nameTextInput}
            />
            <MaterialIcons
              name="edit"
              size={20}
              color="#111827"
              style={styles.nameEditIcon}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* 2. Tags com botão X para remover e Add... + para adicionar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
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

            {/* Botão de Adicionar Tag */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setAddTagModalVisible(true)}
              style={styles.addTagPill}
            >
              <Text style={styles.addTagText}>Add... +</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição:</Text>
          <View style={styles.descriptionBox}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Fale um pouco sobre você..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              style={styles.descriptionInput}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* 4. Select Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select frequency</Text>
          <View style={styles.frequencyRow}>
            {/* Input de número */}
            <TextInput
              value={frequencyCount}
              onChangeText={setFrequencyCount}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.frequencyCountInput}
            />
            <Text style={styles.frequencyText}>times a</Text>

            {/* Dropdown de período (day / week / month) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setFrequencyModalVisible(true)}
              style={styles.frequencyDropdown}
            >
              <Text style={styles.frequencyDropdownText}>{frequencyPeriod}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 5. Checkboxes Públicos */}
        <View style={styles.section}>
          <SquareCheckbox
            checked={publicStreak}
            onPress={() => setPublicStreak(!publicStreak)}
            label="Public Streak"
            size={22}
            color="#34c759"
          />

          <SquareCheckbox
            checked={publicCurrentGoals}
            onPress={() => setPublicCurrentGoals(!publicCurrentGoals)}
            label="Public Current Goals"
            size={22}
            color="#34c759"
          />
        </View>

        {/* 6. Visible Achievements (1 of 5 max) */}
        <View style={styles.section}>
          <Text style={styles.visibleAchievementsTitle}>
            Visible Achievements: {visibleAchievementIds.length} of 5 (max)
          </Text>

          <View style={styles.achievementsBox}>
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
                    color="#34c759"
                    labelStyle={styles.achievementItemLabel}
                  />
                );
              })
            ) : (
              <Text style={styles.emptyNotice}>Nenhuma conquista finalizada ainda.</Text>
            )}
          </View>
        </View>

        {/* 7. Botões Cancelar e Confirmar */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCancel}
            disabled={saving}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleConfirm}
            disabled={saving}
            style={[styles.confirmButton, saving && styles.confirmButtonDisabled]}
          >
            <Text style={styles.confirmButtonText}>
              {saving ? 'Salvando...' : 'Confirm'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para Trocar Foto de Perfil */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAvatarModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>Escolher foto de perfil</Text>
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
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal para Adicionar Tag (tabela tag do BD ou nova) */}
      <Modal
        visible={addTagModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddTagModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAddTagModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>Adicionar Tag</Text>

                {/* Input para digitação de tag customizada */}
                <View style={styles.newTagInputRow}>
                  <TextInput
                    value={customTagInput}
                    onChangeText={setCustomTagInput}
                    placeholder="Digite uma nova tag..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.newTagTextInput}
                  />
                  <TouchableOpacity
                    onPress={() => handleAddTag(customTagInput)}
                    style={styles.newTagSubmitBtn}
                  >
                    <Text style={styles.newTagSubmitText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>

                {/* Tags sugeridas da tabela do banco de dados */}
                <Text style={styles.suggestedTagsHeading}>Sugeridas do Banco:</Text>
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
                          alreadyAdded && styles.suggestedTagDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.suggestedTagText,
                            alreadyAdded && styles.suggestedTagTextDisabled,
                          ]}
                        >
                          {dbTag} {alreadyAdded ? '✓' : '+'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => setAddTagModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>Fechar</Text>
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
              <View style={styles.dropdownModalContent}>
                <Text style={styles.modalHeading}>Frequência da Streak</Text>
                {(['day', 'week', 'month'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    activeOpacity={0.7}
                    onPress={() => {
                      setFrequencyPeriod(period);
                      setFrequencyModalVisible(false);
                    }}
                    style={[
                      styles.frequencyOption,
                      frequencyPeriod === period && styles.frequencyOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        frequencyPeriod === period && styles.frequencyOptionTextSelected,
                      ]}
                    >
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 50,
  },
  topProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#EBF3FE',
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
  avatarEditOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  nameInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  nameTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    paddingVertical: 4,
  },
  nameEditIcon: {
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
    width: '100%',
  },
  section: {
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  tagRemoveBtn: {
    marginLeft: 6,
    padding: 2,
  },
  addTagPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  descriptionBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
    backgroundColor: '#FFFFFF',
  },
  descriptionInput: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    minHeight: 90,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  frequencyCountInput: {
    width: 48,
    height: 38,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginHorizontal: 10,
  },
  frequencyDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 38,
    backgroundColor: '#FFFFFF',
  },
  frequencyDropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 6,
  },
  visibleAchievementsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  achievementsBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  achievementItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 30,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 25,
    minWidth: 130,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#34c759',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 25,
    minWidth: 130,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyNotice: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownModalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 12,
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
    borderColor: '#34c759',
    transform: [{ scale: 1.05 }],
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
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: '#111827',
  },
  newTagSubmitBtn: {
    backgroundColor: '#34c759',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  newTagSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  suggestedTagsHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 10,
  },
  suggestedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  suggestedTagPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestedTagDisabled: {
    backgroundColor: '#F3F4F6',
  },
  suggestedTagText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  suggestedTagTextDisabled: {
    color: '#9CA3AF',
  },
  modalCloseBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  frequencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 4,
    backgroundColor: '#F9FAFB',
  },
  frequencyOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  frequencyOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
  },
  frequencyOptionTextSelected: {
    color: '#34c759',
    fontWeight: '800',
  },
});
