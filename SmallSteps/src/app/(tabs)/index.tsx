import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GoalTimelineCard } from '@/src/components/dashboard/GoalTimelineCard';
import { StreakCard } from '@/src/components/dashboard/StreakCard';
import { Button } from '@/src/components/ui/Button';
import { DashboardDTOResponse } from '@/src/dto/DashboardResponse';
import { screenService } from '@/src/services';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardDTOResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const activeColor = useThemeColor({}, 'streakActive');

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await screenService.consultarDashboard(2);
      setDashboardData(response);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = () => {
    router.push(`/goal/add/`);
  };

  const handleViewGoal = (goalId: number) => {
    router.push(`/goal/view/${goalId}`);
  };

  const handleEditGoal = (goalId: number) => {
    router.push(`/goal/edit/${goalId}`);
  };

  const handleDeleteGoal = async (goalId: number) => {
    // TODO: implementar exclusão via service e recarregar o dashboard
    // await goalService.deleteGoal(goalId);
    // await loadDashboardData();
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
            {dashboardData && (
              <StreakCard
                streakNum={dashboardData.streakNum}
                ultimaAtividade={dashboardData.ultimaAtividade}
                ultimoPrazo={dashboardData.ultimoPrazo}
                intervaloAtividade={dashboardData.intervaloAtividade}
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
            {dashboardData?.metas.map((meta) => (
              <GoalTimelineCard
                key={meta.id}
                meta={meta}
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