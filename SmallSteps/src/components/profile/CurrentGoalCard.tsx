import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProfileCurrentGoal } from '@/src/context/ProfileContext';

interface CurrentGoalCardProps {
  goal: ProfileCurrentGoal;
  onViewPress?: (id: number) => void;
}

function formatNodeLabelPtBr(raw: string): string {
  if (!raw) return '';
  const monthMatch = raw.match(/^(\d+)\s+Months?$/i);
  if (monthMatch) {
    const n = Number(monthMatch[1]);
    return `${n} ${n === 1 ? 'mês' : 'meses'}`;
  }
  const dayMatch = raw.match(/^(\d+)\s+days?$/i);
  if (dayMatch) {
    const n = Number(dayMatch[1]);
    return `${n} ${n === 1 ? 'dia' : 'dias'}`;
  }
  return raw;
}

export function CurrentGoalCard({ goal, onViewPress }: CurrentGoalCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const activeColor = useThemeColor({}, 'streakActive');

  const allNodesCompleted = goal.nodes.length > 0 && goal.nodes.every((n) => n.completed);
  const completedCount = goal.nodes.filter((n) => n.completed).length;

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.goalTitle, { color: textColor }]} numberOfLines={2}>
          {goal.title}
        </Text>
        <View
          style={[
            styles.progressPill,
            { backgroundColor: isDark ? '#143322' : '#ECFDF5' },
          ]}
        >
          <Text style={[styles.progressText, { color: activeColor }]}>
            {completedCount}/{goal.nodes.length}
          </Text>
        </View>
      </View>

      {/* Horizontal timeline container */}
      <View style={styles.timelineWrapper}>
        <View style={styles.nodesRow}>
          {goal.nodes.map((node) => {
            const isCompleted = node.completed;
            const pinColor = isCompleted ? activeColor : textMuted;

            return (
              <View key={node.id} style={styles.nodeItem}>
                <Text style={[styles.nodeLabel, { color: textSecondary }]} numberOfLines={1}>
                  {formatNodeLabelPtBr(node.label)}
                </Text>
                <View style={styles.pinWrapper}>
                  <MaterialIcons name="place" size={20} color={pinColor} />
                </View>
              </View>
            );
          })}

          {/* End Milestone Star */}
          <View style={styles.starItem}>
            <View style={styles.starPlaceholder} />
            <MaterialIcons
              name="star"
              size={22}
              color={allNodesCompleted ? activeColor : textMuted}
            />
          </View>
        </View>

        {/* Continuous horizontal bar underneath the pins */}
        <View style={styles.lineContainer}>
          {goal.nodes.map((node) => (
            <View
              key={`line-${node.id}`}
              style={[
                styles.lineSegment,
                { backgroundColor: node.completed ? activeColor : borderColor },
              ]}
            />
          ))}
          <View
            style={[
              styles.lineSegment,
              { backgroundColor: allNodesCompleted ? activeColor : borderColor },
            ]}
          />
        </View>
      </View>

      {/* View button aligned to right */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onViewPress?.(goal.id)}
          style={[
            styles.viewButton,
            { backgroundColor: isDark ? '#143322' : '#ECFDF5', borderColor: activeColor + '40' },
          ]}
        >
          <Text style={[styles.viewButtonText, { color: activeColor }]}>Ver meta</Text>
          <MaterialIcons name="arrow-forward" size={14} color={activeColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  goalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timelineWrapper: {
    position: 'relative',
    marginVertical: 4,
    paddingBottom: 4,
  },
  nodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  nodeItem: {
    alignItems: 'center',
    flex: 1,
  },
  nodeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  pinWrapper: {
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 26,
  },
  starPlaceholder: {
    height: 14,
  },
  lineContainer: {
    position: 'absolute',
    bottom: 2,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    zIndex: 1,
  },
  lineSegment: {
    flex: 1,
    height: 3,
  },
  footerRow: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
