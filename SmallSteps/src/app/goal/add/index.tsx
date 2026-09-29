import React, { useState } from 'react';
import {
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
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SubGoalEditItem } from '@/src/components/dashboard/SubGoalEditItem';
import { Button } from '@/src/components/ui/Button';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { goalService } from '@/src/services';
import { SubGoal } from '@/src/types/goal';

// TODO: substituir pelo usuário logado quando existir autenticação
const CURRENT_USER_NAME = 'Vitor Silva';

export default function CreateGoalScreen() {
  const router = useRouter();

  // Todos os campos começam em branco
  const [title, setTitle] = useState('');
  const [targetMilestone, setTargetMilestone] = useState('');
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const activeColor = useThemeColor({}, 'streakActive');
  const borderColor = useThemeColor({}, 'border');
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

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
        completedDate: !currentStatus ? new Date().toLocaleDateString('pt-BR') : null,
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

  // Delete subgoal (com confirmação)
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
      startDate: new Date().toLocaleDateString('pt-BR'),
      timeAgo: 'Recém criada',
    };
    setSubGoals((prev) => [...prev, newSubGoal]);
  };

  // Create goal
  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'O título da meta não pode estar vazio.');
      return;
    }

    try {
      setIsSaving(true);
      await goalService.createGoal({
        title: title.trim(),
        author: CURRENT_USER_NAME,
        targetMilestone: targetMilestone.trim(),
        startDate: new Date().toLocaleDateString('pt-BR'),
        completed: false,
        completedDate: null,
        subGoals: subGoals.map((sg) => ({
          ...sg,
          title: sg.title.trim() || 'Nova submeta',
        })),
      });
      Alert.alert('Sucesso', 'Meta criada com sucesso!');
      router.back();
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Erro', 'Não foi possível criar a meta.');
    } finally {
      setIsSaving(false);
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Criar Meta</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.flex1}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Goal Info Card ("informações") */}
          <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
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
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>
                Objetivo Final (Milestone)
              </Text>
              <TextInput
                style={[styles.textInput, { color: textColor, borderColor }]}
                value={targetMilestone}
                onChangeText={setTargetMilestone}
                placeholder="Ex: Passar na prova oficial do Goethe"
                placeholderTextColor={textMuted}
              />
            </View>
          </View>

          {/* 2. Subgoals Section ("submetas") */}
          <View style={styles.subGoalsSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Submetas</Text>

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
                />
              ))
            )}

            {/* Add Subgoal Button */}
            <TouchableOpacity
              style={[styles.addSubGoalBtn, { borderColor: activeColor }]}
              onPress={handleAddSubGoal}
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
        </ScrollView>

        {/* 3. Bottom Action Bar (Cancelar / Criar) */}
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
            title="Criar Meta"
            variant="primary"
            size="medium"
            customColor={activeColor}
            isLoading={isSaving}
            onPress={handleCreate}
            style={styles.actionBtn}
          />
        </View>
      </View>
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
});
