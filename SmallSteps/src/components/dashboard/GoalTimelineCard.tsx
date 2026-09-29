import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button } from '../ui/Button';
import { IconSymbol } from '../ui/icon-symbol';


export interface SubGoal {
  id: string;
  title: string;
  timeAgo: string;
  completed?: boolean;
}

export interface GoalTimelineCardProps {
  id: string;
  title: string;
  subGoals: SubGoal[];
  completed?: boolean;
  targetMilestone?: string;
  onViewGoal?: (id: string) => void;
  onEditGoal?: (id: string) => void;
  onDeleteGoal?: (id: string) => void;
  onOptionsPress?: () => void;
}

export function GoalTimelineCard({
  id,
  title,
  subGoals,
  completed = false,
  targetMilestone = 'Clean full track run!!',
  onViewGoal,
  onEditGoal,
  onDeleteGoal,
  onOptionsPress,
}: GoalTimelineCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const activeColor = useThemeColor({}, 'streakActive');
  const inactiveColor = '#9CA3AF';
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');

  const handleOptionsPress = () => {
    if (onOptionsPress) {
      onOptionsPress();
    } else {
      setMenuVisible(true);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    if (onEditGoal) onEditGoal(id);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    if (onDeleteGoal) onDeleteGoal(id);
  };

  const handleView = () => {
    if (onViewGoal) onViewGoal(id);
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: surfaceColor }]}>
      {/* Options Dropdown Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.menuContainer, { backgroundColor: surfaceColor, borderColor }]}>
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <IconSymbol name="chevron.right" size={18} color={textColor} />
                <Text style={[styles.menuItemText, { color: textColor }]}>Editar Meta</Text>
              </TouchableOpacity>

              <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />

              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <IconSymbol name="chevron.right" size={18} color={errorColor} />
                <Text style={[styles.menuItemText, { color: errorColor }]}>Deletar Meta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Header Row: Title & Options */}
      <View style={styles.headerRow}>
        <Text style={[styles.goalTitle, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={handleOptionsPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.optionsButton}
        >
          <Text style={[styles.optionsText, { color: textColor }]}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline List */}
      <View style={styles.timelineContainer}>
        {subGoals.map((item) => {
          const isSubGoalCompleted = item.completed ?? true;
          const nodeColor = isSubGoalCompleted ? activeColor : inactiveColor;

          return (
            <View key={item.id} style={styles.timelineItemRow}>
              {/* Timeline Column (Line + Dot Node) */}
              <View style={styles.timelineColumn}>
                {/* Node Icon */}
                <View style={[styles.nodeCircle, { backgroundColor: nodeColor }]}>
                  <IconSymbol name="eye.fill" size={10} color="#FFF" />
                </View>

                {/* Vertical Line */}
                <View
                  style={[
                    styles.verticalLine,
                    {
                      backgroundColor: nodeColor,
                    },
                  ]}
                />
              </View>

              {/* Subgoal Info */}
              <View style={styles.subGoalContent}>
                <Text style={[styles.subGoalTitle, { color: nodeColor }]}>
                  {item.title}
                </Text>
                <Text style={[styles.subGoalTime, { color: textMuted }]}>
                  {item.timeAgo}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Milestone Target Row */}
        {targetMilestone && (
          <View style={styles.milestoneRow}>
            <View style={styles.milestoneColumn}>
              {/* Star Icon Node */}
              <Text style={[styles.starIcon, { color: completed ? activeColor : inactiveColor }]}>
                ★
              </Text>
            </View>

            <View style={styles.milestoneContentRow}>
              <Text
                style={[
                  styles.milestoneText,
                  { color: completed ? activeColor : textMuted },
                ]}
              >
                {targetMilestone}
              </Text>

              <Button
                title="view goal"
                variant="pill"
                customColor="#6B7280"
                size="small"
                onPress={handleView}
                style={styles.editBtn}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  optionsButton: {
    padding: 4,
  },
  optionsText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: 220,
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  menuDivider: {
    height: 1,
    width: '100%',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 56,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
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
    paddingBottom: 14,
  },
  subGoalTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  subGoalTime: {
    fontSize: 13,
    marginTop: 2,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  milestoneColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  starIcon: {
    fontSize: 20,
  },
  milestoneContentRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
