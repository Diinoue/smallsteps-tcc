import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ProfileCurrentGoal } from '@/src/context/ProfileContext';

interface CurrentGoalCardProps {
  goal: ProfileCurrentGoal;
  onViewPress?: (id: number) => void;
}

export function CurrentGoalCard({ goal, onViewPress }: CurrentGoalCardProps) {
  const allNodesCompleted = goal.nodes.every((n) => n.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.goalTitle}>{goal.title}</Text>

      {/* Horizontal timeline container */}
      <View style={styles.timelineWrapper}>
        {/* Nodes and milestone */}
        <View style={styles.nodesRow}>
          {goal.nodes.map((node, index) => {
            const isCompleted = node.completed;
            const pinColor = isCompleted ? '#34c759' : '#6B7280';

            return (
              <View key={node.id} style={styles.nodeItem}>
                <Text style={styles.nodeLabel} numberOfLines={1}>
                  {node.label}
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
              color={allNodesCompleted ? '#34c759' : '#6B7280'}
            />
          </View>
        </View>

        {/* Continuous horizontal bar underneath the pins */}
        <View style={styles.lineContainer}>
          {goal.nodes.map((node, index) => {
            const nextNode = goal.nodes[index + 1];
            // Segment is green if this node is completed
            const segmentCompleted = node.completed && (nextNode ? nextNode.completed : allNodesCompleted);

            return (
              <View
                key={`line-${node.id}`}
                style={[
                  styles.lineSegment,
                  { backgroundColor: node.completed ? '#34c759' : '#9CA3AF' },
                ]}
              />
            );
          })}
          {/* Segment connecting to star */}
          <View
            style={[
              styles.lineSegment,
              { backgroundColor: allNodesCompleted ? '#34c759' : '#6B7280' },
            ]}
          />
        </View>
      </View>

      {/* View button aligned to right */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onViewPress?.(goal.id)}
          style={styles.viewButton}
        >
          <Text style={styles.viewButtonText}>view</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    paddingHorizontal: 4,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
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
    color: '#374151',
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
    flexDirection: 'row',
    zIndex: 1,
  },
  lineSegment: {
    flex: 1,
    height: 3,
  },
  footerRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  viewButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 22,
    paddingVertical: 5,
    borderRadius: 18,
  },
  viewButtonText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
});
