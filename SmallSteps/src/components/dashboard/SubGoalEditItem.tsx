import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { SubGoal } from '@/src/types/goal';

export interface SubGoalEditItemProps {
  subGoal: SubGoal;
  index: number;
  totalCount: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleCompleted: (index: number) => void;
  onTitleChange: (index: number, newTitle: string) => void;
  onDelete: (index: number) => void;
  isLast: boolean;
}

export function SubGoalEditItem({
  subGoal,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onToggleCompleted,
  onTitleChange,
  onDelete,
  isLast,
}: SubGoalEditItemProps) {
  const activeColor = useThemeColor({}, 'streakActive');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');

  const isCompleted = subGoal.completed ?? false;
  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;

  return (
    <View style={styles.container}>
      {/* Left Timeline Column (Connector Line) */}
      <View style={styles.timelineColumn}>
        {/* Circle Node */}
        <View
          style={[
            styles.timelineNode,
            { backgroundColor: isCompleted ? activeColor : '#9CA3AF' },
          ]}
        >
          <Text style={styles.nodeIndexText}>{index + 1}</Text>
        </View>

        {/* Connecting Vertical Line */}
        {!isLast && (
          <View
            style={[
              styles.verticalLine,
              { backgroundColor: isCompleted ? activeColor : '#D1D5DB' },
            ]}
          />
        )}
      </View>

      {/* Main Subgoal Card Container */}
      <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
        {/* Order Reorder Arrows (Up / Down) */}
        <View style={styles.arrowsColumn}>
          <TouchableOpacity
            style={[styles.arrowButton, !canMoveUp && styles.arrowDisabled]}
            onPress={() => canMoveUp && onMoveUp(index)}
            disabled={!canMoveUp}
            activeOpacity={0.6}
          >
            <IconSymbol
              name="chevron.up"
              size={18}
              color={canMoveUp ? textColor : textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.arrowButton, !canMoveDown && styles.arrowDisabled]}
            onPress={() => canMoveDown && onMoveDown(index)}
            disabled={!canMoveDown}
            activeOpacity={0.6}
          >
            <IconSymbol
              name="chevron.down"
              size={18}
              color={canMoveDown ? textColor : textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Subgoal Title Input */}
        <TextInput
          style={[styles.titleInput, { color: textColor }]}
          value={subGoal.title}
          onChangeText={(text) => onTitleChange(index, text)}
          placeholder="Nome da submeta..."
          placeholderTextColor={textMuted}
        />

        {/* Completion Toggle Button */}
        <TouchableOpacity
          style={[
            styles.checkButton,
            isCompleted
              ? { backgroundColor: activeColor, borderColor: activeColor }
              : { backgroundColor: 'transparent', borderColor: '#9CA3AF' },
          ]}
          onPress={() => onToggleCompleted(index)}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="checkmark"
            size={16}
            color={isCompleted ? '#FFFFFF' : 'transparent'}
          />
        </TouchableOpacity>

        {/* Delete Subgoal Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(index)}
          activeOpacity={0.6}
        >
          <IconSymbol name="trash.fill" size={18} color={errorColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  timelineColumn: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
    paddingTop: 12,
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeIndexText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  verticalLine: {
    width: 3,
    flex: 1,
    marginTop: 2,
    marginBottom: -16,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  arrowsColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  arrowButton: {
    padding: 2,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  titleInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 4,
  },
});
