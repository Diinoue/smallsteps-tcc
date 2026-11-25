import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SubGoalEditItem } from '@/src/components/dashboard/SubGoalEditItem';
import { Button } from '@/src/components/ui/Button';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { goalService } from '@/src/services';
import { uploadMedia } from '@/src/services/communityService';
import { SubGoal } from '@/src/types/goal';

function toBackendDateTime(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Se já for formato ISO (ano-mês-dia)
  if (trimmed.includes('-')) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
    return trimmed;
  }

  // Se for formato brasileiro dd/MM/yyyy
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) year = `20${year}`;
    const d = new Date(`${year}-${month}-${day}T12:00:00`);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }

  return trimmed;
}

export default function EditGoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;

  const [title, setTitle] = useState('');
  const [targetMilestone, setTargetMilestone] = useState('');
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGoalCompleted, setIsGoalCompleted] = useState(false);
  const [goalCompletedDate, setGoalCompletedDate] = useState<string | null>(null);
  // Estado original da meta ao carregar a página
  const [wasCompletedOnLoad, setWasCompletedOnLoad] = useState(false);
  const [initialCompletedDate, setInitialCompletedDate] = useState<string | null>(null);

  // Anexo de comprovação de conclusão (imagem ou vídeo)
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [proofMime, setProofMime] = useState<string | null>(null);
  const [proofType, setProofType] = useState<'IMAGE' | 'VIDEO' | null>(null);
  const [proofChanged, setProofChanged] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const activeColor = useThemeColor({}, 'streakActive');
  const borderColor = useThemeColor({}, 'border');
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id) {
      loadGoal();
    }
  }, [id]);

  const loadGoal = async () => {
    try {
      setIsLoading(true);
      const goal = await goalService.getGoalById(id);
      if (goal) {
        setTitle(goal.title);
        setTargetMilestone(goal.milestone ?? '');
        // Mapeia SubGoalDTOResponse → SubGoal (formato local da tela)
        setSubGoals(
          (goal.subMetas ?? [])
            .sort((a, b) => a.pos - b.pos)
            .map((s) => ({
              id: String(s.id),
              title: s.titulo,
              completed: s.concluido,
              startDate: s.dtInicio ?? undefined,
              completedDate: s.concluido && s.dtFim ? s.dtFim : null,
            }))
        );
        setIsGoalCompleted(goal.concluido ?? false);
        setGoalCompletedDate(goal.dtFim ?? null);
        setWasCompletedOnLoad(goal.concluido ?? false);
        setInitialCompletedDate(goal.dtFim ?? null);
        setProofUri(goal.urlMidia ?? null);
        setProofType(
          goal.tipoMidia?.toUpperCase() === 'VIDEO'
            ? 'VIDEO'
            : goal.urlMidia
            ? 'IMAGE'
            : null
        );
        setProofChanged(false);
      } else {
        Alert.alert('Erro', 'Meta não encontrada.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading goal for edit:', error);
      Alert.alert('Erro', 'Não foi possível carregar a meta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reordering subgoals
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setSubGoals((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= subGoals.length - 1) return;
    setSubGoals((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // Toggle subgoal completion status
  const handleToggleCompleted = (index: number) => {
    setSubGoals((prev) => {
      const updated = [...prev];
      const currentStatus = updated[index].completed ?? false;
      updated[index] = {
        ...updated[index],
        completed: !currentStatus,
        completedDate: !currentStatus ? new Date().toISOString() : null,
      };
      return updated;
    });
  };

  // Update subgoal title
  const handleTitleChange = (index: number, newTitle: string) => {
    setSubGoals((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        title: newTitle,
      };
      return updated;
    });
  };

  // Delete subgoal
  const handleDeleteSubGoal = (index: number) => {
    const subGoalTitle = subGoals[index]?.title?.trim();

    Alert.alert(
      'Excluir submeta',
      subGoalTitle
        ? `Deseja realmente excluir a submeta "${subGoalTitle}"?`
        : 'Deseja realmente excluir esta submeta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => setSubGoals((prev) => prev.filter((_, i) => i !== index)),
        },
      ]
    );
  };

  // Add new subgoal
  const handleAddSubGoal = () => {
    const newSubGoal: SubGoal = {
      id: `sg_${Date.now()}`,
      title: '',
      completed: false,
      startDate: new Date().toISOString(),
      timeAgo: 'Recém criada',
    };
    setSubGoals((prev) => [...prev, newSubGoal]);
  };

  // Selecionar imagem ou vídeo como comprovante de conclusão
  const handlePickProof = async (mediaKind: 'IMAGE' | 'VIDEO') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos da sua permissão para acessar a galeria.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          mediaKind === 'VIDEO'
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: mediaKind === 'IMAGE',
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProofUri(asset.uri);
        setProofMime(
          asset.mimeType || (mediaKind === 'VIDEO' ? 'video/mp4' : 'image/jpeg')
        );
        setProofType(mediaKind);
        setProofChanged(true);
      }
    } catch (error) {
      console.error('Erro ao selecionar mídia de comprovação:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleRemoveProof = () => {
    setProofUri(null);
    setProofMime(null);
    setProofType(null);
    setProofChanged(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'O título da meta não pode estar vazio.');
      return;
    }
    if (!targetMilestone.trim()) {
      Alert.alert('Atenção', 'O objetivo final (milestone) é obrigatório.');
      return;
    }

    try {
      setIsSaving(true);

      let uploadedUrl: string | undefined;
      let uploadedType: string | undefined;
      if (proofChanged) {
        if (proofUri && proofType) {
          uploadedUrl = await uploadMedia(
            proofUri,
            proofMime || (proofType === 'VIDEO' ? 'video/mp4' : 'image/jpeg')
          );
          uploadedType = proofType;
        } else {
          uploadedUrl = '';
          uploadedType = '';
        }
      }

      await goalService.updateGoal(id, {
        titulo: title.trim(),
        milestone: targetMilestone.trim(),
        concluido: isGoalCompleted,
        dtFim: isGoalCompleted ? (toBackendDateTime(goalCompletedDate) ?? new Date().toISOString()) : undefined,
        ...(uploadedUrl !== undefined ? { urlMidia: uploadedUrl, tipoMidia: uploadedType } : {}),
        subMetas: subGoals.map((sg) => ({
          titulo: sg.title.trim() || 'Nova submeta',
          concluido: sg.completed ?? false,
          dtInicio: toBackendDateTime(sg.startDate) ?? new Date().toISOString(),
          dtFim: sg.completed ? (toBackendDateTime(sg.completedDate) ?? new Date().toISOString()) : null,
        })),
      });
      Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
      router.back();
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Valores derivados do botão de conclusão
  const allSubGoalsCompleted =
    subGoals.length > 0 && subGoals.every((sg) => sg.completed === true);

  // Com a meta marcada como concluída, nada na página pode ser alterado
  const isLocked = isGoalCompleted;

  // Visível:
  // - meta que já vinha concluída: só enquanto estiver concluída (botão "Reabrir Meta");
  //   depois de reaberta o botão some da página
  // - meta que não vinha concluída: quando todas as submetas estão concluídas
  //   (botão "Concluir Meta" / "Concluída")
  const showCompleteButton = wasCompletedOnLoad
    ? isGoalCompleted
    : isGoalCompleted || allSubGoalsCompleted;

  const completeButtonLabel = wasCompletedOnLoad
    ? 'Reabrir Meta'
    : isGoalCompleted
      ? 'Concluída'
      : 'Concluir Meta';

  const completeButtonDisabled = isSaving || (!isGoalCompleted && !allSubGoalsCompleted);

  const reopenGoal = () => {
    setIsGoalCompleted(false);
    setGoalCompletedDate(null);
  };

  // Alterna a conclusão (só estado local; persiste ao salvar)
  const handleToggleGoalCompleted = () => {
    if (isGoalCompleted) {
      if (wasCompletedOnLoad) {
        // Reabrir uma meta que já estava concluída exige confirmação
        Alert.alert(
          'Reabrir meta',
          'Deseja reabrir esta meta? Você poderá editar os campos novamente.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Reabrir', onPress: reopenGoal },
          ]
        );
      } else {
        // Cancela a conclusão feita nesta sessão
        reopenGoal();
      }
    } else {
      if (!allSubGoalsCompleted) return;
      setIsGoalCompleted(true);
      setGoalCompletedDate(initialCompletedDate ?? new Date().toISOString());
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Top Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel} activeOpacity={0.7}>
          <IconSymbol name="arrow.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Editar Meta</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeColor} />
        </View>
      ) : (
        <View style={styles.flex1}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Goal Info Card ("informações")
                O card (com elevation) NÃO recebe opacity; só o conteúdo interno. */}
            <View
              pointerEvents={isLocked ? 'none' : 'auto'}
              style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}
            >
              <View style={isLocked ? styles.lockedContent : undefined}>
                <Text style={[styles.cardHeaderTitle, { color: textColor }]}>
                  Informações da Meta
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: textMuted }]}>Título</Text>
                  <TextInput
                    style={[styles.textInput, { color: textColor, borderColor }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Ex: Aprender Alemão B1"
                    placeholderTextColor={textMuted}
                    editable={!isLocked}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: textMuted }]}>
                    Objetivo Final *
                  </Text>
                  <TextInput
                    style={[styles.textInput, { color: textColor, borderColor }]}
                    value={targetMilestone}
                    onChangeText={setTargetMilestone}
                    placeholder="Ex: Passar na prova oficial do Goethe"
                    placeholderTextColor={textMuted}
                    editable={!isLocked}
                  />
                </View>
              </View>
            </View>

            {/* 2. Subgoals Section ("submetas") */}
            <View style={styles.subGoalsSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Submetas</Text>

              {/* Wrapper sem opacity: cada SubGoalEditItem esmaece apenas seus filhos */}
              <View pointerEvents={isLocked ? 'none' : 'auto'}>
                {subGoals.length === 0 ? (
                  <Text style={[styles.emptyText, { color: textMuted }]}>
                    Nenhuma submeta criada ainda. Clique abaixo para adicionar!
                  </Text>
                ) : (
                  subGoals.map((sg, index) => (
                    <SubGoalEditItem
                      key={sg.id}
                      subGoal={sg}
                      index={index}
                      totalCount={subGoals.length}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      onToggleCompleted={handleToggleCompleted}
                      onTitleChange={handleTitleChange}
                      onDelete={handleDeleteSubGoal}
                      isLast={index === subGoals.length - 1}
                      locked={isLocked}
                    />
                  ))
                )}

                {/* Add Subgoal Button (sem elevation, pode receber opacity) */}
                <TouchableOpacity
                  style={[
                    styles.addSubGoalBtn,
                    { borderColor: activeColor },
                    isLocked && styles.lockedContent,
                  ]}
                  onPress={handleAddSubGoal}
                  disabled={isLocked}
                  activeOpacity={0.7}
                >
                  <View style={[styles.plusIconBg, { backgroundColor: activeColor }]}>
                    <IconSymbol name="plus" size={18} color="#FFF" />
                  </View>
                  <Text style={[styles.addSubGoalText, { color: activeColor }]}>
                    (adicionar submeta)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Concluir / Reabrir Meta (efetivado ao salvar) */}
              {showCompleteButton && (
                <TouchableOpacity
                  style={[
                    styles.completeBtn,
                    { borderColor: activeColor },
                    completeButtonLabel === 'Concluir Meta' && { backgroundColor: activeColor },
                    completeButtonDisabled && styles.completeBtnDisabled,
                  ]}
                  onPress={handleToggleGoalCompleted}
                  disabled={completeButtonDisabled}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.completeBtnText,
                      {
                        color: completeButtonLabel === 'Concluir Meta' ? '#FFF' : activeColor,
                      },
                    ]}
                  >
                    {completeButtonLabel}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Anexo de comprovação ao concluir a meta */}
              {isGoalCompleted && (
                <View style={[styles.proofCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <Text style={[styles.proofTitle, { color: textColor }]}>
                    Comprovante de Conclusão
                  </Text>
                  <Text style={[styles.proofSubtitle, { color: textMuted }]}>
                    Opcional: anexe uma foto ou vídeo comprovando que você concluiu esta meta.
                  </Text>

                  {proofUri ? (
                    <View style={styles.proofPreviewContainer}>
                      {proofType === 'VIDEO' ? (
                        <View
                          style={[
                            styles.proofVideoBox,
                            { borderColor, backgroundColor: colorScheme === 'dark' ? '#111827' : '#F3F4F6' },
                          ]}
                        >
                          <MaterialIcons name="videocam" size={34} color={activeColor} />
                          <Text style={[styles.proofVideoLabel, { color: textColor }]}>
                            Vídeo anexado
                          </Text>
                        </View>
                      ) : (
                        <Image
                          source={{ uri: proofUri }}
                          style={styles.proofImagePreview}
                          contentFit="cover"
                        />
                      )}

                      <TouchableOpacity
                        style={styles.removeProofBtn}
                        onPress={handleRemoveProof}
                        activeOpacity={0.75}
                      >
                        <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                        <Text style={styles.removeProofText}>Remover anexo</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <View style={styles.proofButtonsRow}>
                    <TouchableOpacity
                      style={[styles.proofPickerBtn, { borderColor: activeColor }]}
                      onPress={() => handlePickProof('IMAGE')}
                      activeOpacity={0.75}
                      disabled={isSaving}
                    >
                      <MaterialIcons name="image" size={18} color={activeColor} />
                      <Text style={[styles.proofPickerText, { color: activeColor }]}>
                        {proofUri ? 'Trocar imagem' : 'Anexar imagem'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.proofPickerBtn, { borderColor: activeColor }]}
                      onPress={() => handlePickProof('VIDEO')}
                      activeOpacity={0.75}
                      disabled={isSaving}
                    >
                      <MaterialIcons name="videocam" size={18} color={activeColor} />
                      <Text style={[styles.proofPickerText, { color: activeColor }]}>
                        {proofUri ? 'Trocar vídeo' : 'Anexar vídeo'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* 3. Bottom Action Bar (Cancelar / Salvar) */}
          <View
            style={[
              styles.bottomActionBar,
              {
                backgroundColor: surfaceColor,
                borderTopColor: borderColor,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <Button
              title="Cancelar"
              variant="outline"
              size="medium"
              onPress={handleCancel}
              style={styles.actionBtn}
            />

            <Button
              title="Salvar Alterações"
              variant="primary"
              size="medium"
              customColor={activeColor}
              isLoading={isSaving}
              onPress={handleSave}
              style={styles.actionBtn}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex1: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  subGoalsSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  addSubGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  plusIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addSubGoalText: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 20,
  },
  completeBtnDisabled: {
    opacity: 0.5,
  },
  lockedContent: {
    opacity: 0.5,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  proofCard: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  proofSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  proofPreviewContainer: {
    marginBottom: 12,
  },
  proofImagePreview: {
    width: '100%',
    height: 190,
    borderRadius: 12,
  },
  proofVideoBox: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  proofVideoLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  removeProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: 8,
    paddingVertical: 4,
  },
  removeProofText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  proofButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  proofPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 11,
  },
  proofPickerText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
