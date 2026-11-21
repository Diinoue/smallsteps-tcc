import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GoalDTOResponse } from '@/src/dto/DashboardResponse';
import { goalService } from '@/src/services/goalService';
import { useProfile } from '@/src/context/ProfileContext';
import { GoalTimelineCard } from '@/src/components/dashboard/GoalTimelineCard';

const ACCENT_GREEN = '#34C759';

export default function ProfileGoalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; userName?: string }>();
  const { profile } = useProfile();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const activeColor = useThemeColor({}, 'streakActive');

  const targetUserId = params.userId ? Number(params.userId) : profile.id || 1;
  const isOwnProfile = !params.userId || Number(params.userId) === (profile.id || 1);

  const [goals, setGoals] = useState<GoalDTOResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadGoals = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const data = await goalService.getGoalsByUser(targetUserId);
        setGoals(data);
      } catch (error) {
        console.error('Erro ao carregar metas do perfil:', error);
        Alert.alert('Erro', 'Não foi possível carregar as metas deste perfil.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [targetUserId]
  );

  useFocusEffect(
    useCallback(() => {
      loadGoals(false);
    }, [loadGoals])
  );

  const activeGoals = useMemo(
    () => goals.filter((g) => !g.concluido),
    [goals]
  );

  const completedGoals = useMemo(
    () => goals.filter((g) => g.concluido),
    [goals]
  );

  const handleViewGoal = (goalId: number) => {
    router.push(`/goal/view/${goalId}`);
  };

  const handleEditGoal = (goalId: number) => {
    router.push(`/goal/edit/${goalId}`);
  };

  const handleDeleteGoal = (goalId: number) => {
    Alert.alert(
      'Excluir Meta',
      'Tem certeza que deseja excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalService.deleteGoal(goalId);
              setGoals((prev) => prev.filter((g) => g.id !== goalId));
            } catch (error) {
              console.error('Erro ao excluir meta:', error);
              Alert.alert('Erro', 'Não foi possível excluir a meta.');
            }
          },
        },
      ]
    );
  };

  const headerTitle = isOwnProfile
    ? 'Todas as Metas'
    : params.userName
    ? `Metas de ${params.userName}`
    : 'Metas do Perfil';

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
          {headerTitle}
        </Text>

        {isOwnProfile ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/goal/add')}
            style={styles.addIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="add" size={26} color={ACCENT_GREEN} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 34 }} />
        )}
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={activeColor} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadGoals(true)}
              tintColor={activeColor}
              colors={[activeColor]}
            />
          }
        >
          {goals.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <MaterialIcons name="flag" size={44} color={textMuted} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                Nenhuma meta encontrada
              </Text>
              <Text style={[styles.emptySubtitle, { color: textMuted }]}>
                {isOwnProfile
                  ? 'Crie sua primeira meta para acompanhar seu progresso por aqui.'
                  : 'Este usuário ainda não possui metas cadastradas.'}
              </Text>
            </View>
          ) : (
            <>
              {/* Seção 1: Metas não concluídas (em cima) */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialIcons name="timelapse" size={20} color={activeColor} />
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Em andamento
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: isDark ? '#143322' : '#ECFDF5' },
                    ]}
                  >
                    <Text style={[styles.countBadgeText, { color: activeColor }]}>
                      {activeGoals.length}
                    </Text>
                  </View>
                </View>

                {activeGoals.length > 0 ? (
                  activeGoals.map((meta) => (
                    <GoalTimelineCard
                      key={meta.id}
                      meta={meta}
                      onViewGoal={handleViewGoal}
                      onEditGoal={isOwnProfile ? handleEditGoal : undefined}
                      onDeleteGoal={isOwnProfile ? handleDeleteGoal : undefined}
                    />
                  ))
                ) : (
                  <View
                    style={[
                      styles.sectionEmptyBox,
                      { backgroundColor: surfaceColor, borderColor },
                    ]}
                  >
                    <Text style={[styles.sectionEmptyText, { color: textMuted }]}>
                      Nenhuma meta em andamento no momento.
                    </Text>
                  </View>
                )}
              </View>

              {/* Seção 2: Metas concluídas (em baixo) */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <MaterialIcons name="check-circle" size={20} color={activeColor} />
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Concluídas
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: isDark ? '#143322' : '#ECFDF5' },
                    ]}
                  >
                    <Text style={[styles.countBadgeText, { color: activeColor }]}>
                      {completedGoals.length}
                    </Text>
                  </View>
                </View>

                {completedGoals.length > 0 ? (
                  completedGoals.map((meta) => (
                    <GoalTimelineCard
                      key={meta.id}
                      meta={meta}
                      onViewGoal={handleViewGoal}
                      onEditGoal={isOwnProfile ? handleEditGoal : undefined}
                      onDeleteGoal={isOwnProfile ? handleDeleteGoal : undefined}
                    />
                  ))
                ) : (
                  <View
                    style={[
                      styles.sectionEmptyBox,
                      { backgroundColor: surfaceColor, borderColor },
                    ]}
                  >
                    <Text style={[styles.sectionEmptyText, { color: textMuted }]}>
                      Nenhuma meta concluída ainda.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  addIconButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionEmptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sectionEmptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyCard: {
    marginTop: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
