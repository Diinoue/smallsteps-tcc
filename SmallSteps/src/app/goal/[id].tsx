import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Card } from '@/src/components/ui/Card';
import { goalService } from '@/src/services';
import { Goal } from '@/src/types/goal';


export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const activeColor = useThemeColor({}, 'streakActive');
  const inactiveColor = '#9CA3AF';
  const surfaceColor = useThemeColor({}, 'surface');
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (id) {
      loadGoalDetail(id);
    }
  }, [id]);

  const loadGoalDetail = async (goalId: string) => {
    try {
      setIsLoading(true);
      const data = await goalService.getGoalById(goalId);
      setGoal(data);
    } catch (error) {
      console.error('Error fetching goal details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Top Navigation Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="chevron.right" size={24} color={textColor} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={[styles.topBarTitle, { color: textColor }]}>Detalhes da Meta</Text>
        <View style={styles.topBarPlaceholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeColor} />
        </View>
      ) : !goal ? (
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: textColor }]}>
            Meta não encontrada.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Goal Header Card */}
          <Card variant="elevated" style={styles.headerCard}>
            {/* Status Badge */}
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: goal.completed ? activeColor : primaryColor },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {goal.completed ? 'Concluída' : 'Em Andamento'}
                </Text>
              </View>
            </View>

            {/* Full Title */}
            <Text style={[styles.goalFullTitle, { color: textColor }]}>
              {goal.title}
            </Text>

            {/* Author */}
            <View style={styles.infoRow}>
              <IconSymbol name="person.fill" size={16} color={primaryColor} />
              <Text style={[styles.infoLabel, { color: textColor }]}>
                Autor: <Text style={styles.infoValue}>{goal.author}</Text>
              </Text>
            </View>

            {/* Dates Overview */}
            <View style={styles.datesContainer}>
              <View style={styles.dateBlock}>
                <Text style={[styles.dateBlockTitle, { color: textMuted }]}>INÍCIO DA META</Text>
                <Text style={[styles.dateBlockValue, { color: textColor }]}>
                  {goal.startDate}
                </Text>
              </View>

              {goal.completedDate && (
                <View style={styles.dateBlock}>
                  <Text style={[styles.dateBlockTitle, { color: activeColor }]}>CONCLUSÃO DA META</Text>
                  <Text style={[styles.dateBlockValue, { color: activeColor }]}>
                    {goal.completedDate}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Timeline Header */}
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Linha do Tempo
          </Text>

          {/* Detailed Timeline Card */}
          <View style={[styles.timelineCard, { backgroundColor: surfaceColor }]}>
            {goal.subGoals.map((sub) => {
              const isCompleted = sub.completed;
              const nodeColor = isCompleted ? activeColor : inactiveColor;

              return (
                <View key={sub.id} style={styles.timelineItemRow}>
                  {/* Timeline Node Column */}
                  <View style={styles.timelineColumn}>
                    <View style={[styles.nodeCircle, { backgroundColor: nodeColor }]}>
                      <IconSymbol name="eye.fill" size={10} color="#FFF" />
                    </View>

                    <View
                      style={[
                        styles.verticalLine,
                        { backgroundColor: nodeColor },
                      ]}
                    />
                  </View>

                  {/* Subgoal Details Content */}
                  <View style={styles.subGoalContent}>
                    <Text style={[styles.subGoalTitle, { color: nodeColor }]}>
                      {sub.title}
                    </Text>

                    <View style={styles.subGoalDatesRow}>
                      {sub.startDate && (
                        <Text style={[styles.dateText, { color: textMuted }]}>
                          Início: {sub.startDate}
                        </Text>
                      )}

                      {sub.completedDate ? (
                        <Text style={[styles.dateText, { color: activeColor }]}>
                          Conclusão: {sub.completedDate}
                        </Text>
                      ) : (
                        <Text style={[styles.dateText, { color: textMuted }]}>
                          Status: Pendente
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Final Milestone Row */}
            {goal.targetMilestone && (
              <View style={styles.milestoneRow}>
                <View style={styles.milestoneColumn}>
                  <Text
                    style={[
                      styles.starIcon,
                      { color: goal.completed ? activeColor : inactiveColor },
                    ]}
                  >
                    ★
                  </Text>
                </View>

                <View style={styles.milestoneContent}>
                  <Text
                    style={[
                      styles.milestoneTitle,
                      { color: goal.completed ? activeColor : textColor },
                    ]}
                  >
                    {goal.targetMilestone}
                  </Text>
                  <Text style={[styles.dateText, { color: goal.completed ? activeColor : textMuted }]}>
                    {goal.completed
                      ? `Concluído em: ${goal.completedDate}`
                      : 'Meta final em progresso'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  topBarPlaceholder: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  goalFullTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 15,
    marginLeft: 8,
  },
  infoValue: {
    fontWeight: '700',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  dateBlock: {
    flex: 1,
  },
  dateBlockTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateBlockValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  timelineCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 68,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 14,
  },
  nodeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verticalLine: {
    width: 3,
    flex: 1,
    marginTop: -2,
    marginBottom: -2,
  },
  subGoalContent: {
    flex: 1,
    paddingBottom: 16,
  },
  subGoalTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  subGoalDatesRow: {
    marginTop: 4,
    gap: 2,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  milestoneColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: 14,
  },
  starIcon: {
    fontSize: 20,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
});
