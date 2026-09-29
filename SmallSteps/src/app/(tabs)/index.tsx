import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StreakCard } from '@/src/components/dashboard/StreakCard';
import { GoalTimelineCard } from '@/src/components/dashboard/GoalTimelineCard';
import { Button } from '@/src/components/ui/Button';
import { goalService, streakService } from '@/src/services';
import { Goal, StreakData } from '@/src/types/goal';


export default function DashboardScreen() {
  const router = useRouter();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const activeColor = useThemeColor({}, 'streakActive');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [streakData, goalsData] = await Promise.all([
        streakService.getStreak(),
        goalService.getGoals(),
      ]);
      setStreak(streakData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = () => {
    Alert.alert('Criar Meta', 'A funcionalidade de adicionar metas será implementada posteriormente.');
  };

  const handleViewGoal = (goalId: string) => {
    router.push(`/goal/${goalId}`);
  };

  const handleEditGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    Alert.alert('Editar Meta', `Editando a meta: "${goal?.title}"`);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    Alert.alert(
      'Deletar Meta',
      `Tem certeza que deseja deletar a meta "${goal?.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            await goalService.deleteGoal(goalId);
            setGoals((prev) => prev.filter((g) => g.id !== goalId));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Your Dashboard
          </Text>
        </View>

        {/* Loading Indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={activeColor} />
          </View>
        ) : (
          <>
            {/* 1. Streak Card */}
            {streak && (
              <StreakCard
                days={streak.days}
                status={streak.status}
                statusText={streak.statusText}
              />
            )}

            {/* 2. Current Goals Section Header */}
            <View style={styles.goalsHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Current Goals
              </Text>
              <Button
                title="add goal"
                variant="pill"
                customColor={activeColor}
                size="small"
                onPress={handleAddGoal}
                style={styles.addGoalBtn}
              />
            </View>

            {/* 3. Goals List */}
            {goals.map((goal) => (
              <GoalTimelineCard
                key={goal.id}
                id={goal.id}
                title={goal.title}
                completed={goal.completed}
                subGoals={goal.subGoals}
                targetMilestone={goal.targetMilestone}
                onViewGoal={handleViewGoal}
                onEditGoal={handleEditGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  addGoalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
