import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StreakCard, StreakStatus } from '@/components/dashboard/StreakCard';
import { GoalTimelineCard } from '@/components/dashboard/GoalTimelineCard';
import { Button } from '@/components/ui/Button';

export default function DashboardScreen() {
  //ALTERE AQUI PARA TESTE
  const [streakStatus, setStreakStatus] = useState<StreakStatus>('frozen');
  const [streakDays, setStreakDays] = useState(2);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const primaryColor = useThemeColor({}, 'primary');
  const activeColor = useThemeColor({}, 'streakActive');

  const mockGoals = [
    {
      id: 'g1',
      title: 'Die Mittsommernacht-Fantasie',
      completed: true,
      subGoals: [
        { id: 'sg1', title: 'Learn the structure', timeAgo: '2 Months ago', completed: true },
        { id: 'sg2', title: 'Hard section slow-speed', timeAgo: '2 Months ago', completed: true },
        { id: 'sg3', title: 'Finish a slow-speed full-track run', timeAgo: '1 Month ago', completed: true },
        { id: 'sg4', title: 'Clean Hard section normal-speed', timeAgo: '17 days ago', completed: true },
      ],
      targetMilestone: 'Clean full track run!!',
    },
    {
      id: 'g2',
      title: 'Tout est bien qui finit bien',
      completed: false,
      subGoals: [
        { id: 'sg21', title: 'Learn the structure', timeAgo: '2 Months ago', completed: true },
        { id: 'sg22', title: 'Hard section slow-speed', timeAgo: '2 Months ago', completed: false },
        { id: 'sg23', title: 'Finish a slow-speed full-track run', timeAgo: '1 Month ago', completed: false },
      ],
      targetMilestone: 'Complete final performance',
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
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

        {/* 1. Streak Card */}
        <StreakCard
          days={streakDays}
          status={streakStatus}
        />

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
            style={styles.addGoalBtn}
          />
        </View>

        {/* 3. Goals List (Streak -> Meta 1 -> Meta 2 ...) */}
        {mockGoals.map((goal) => (
          <GoalTimelineCard
            key={goal.id}
            id={goal.id}
            title={goal.title}
            completed={goal.completed}
            subGoals={goal.subGoals}
            targetMilestone={goal.targetMilestone}
          />
        ))}
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
  stateSelector: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  stateChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  stateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  stateChipTextActive: {
    color: '#FFFFFF',
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
