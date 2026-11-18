import React, { useMemo, useState } from 'react';
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
import { GoalDTOResponse, SubGoalDTOResponse } from '@/src/dto/DashboardResponse';

export interface GoalTimelineCardProps {
  meta: GoalDTOResponse;
  onViewGoal?: (id: number) => void;
  onEditGoal?: (id: number) => void;
  onDeleteGoal?: (id: number) => void;
  onOptionsPress?: () => void;
}

// ---------- Helpers ----------

const formatDate = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
};

const formatTimeAgo = (iso: string): string => {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return formatDate(iso);

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;

  return formatDate(iso);
};

const getSubGoalTimeText = (sub: SubGoalDTOResponse): string => {
  if (sub.concluido) {
    return sub.dtFim ? `Concluída ${formatTimeAgo(sub.dtFim)}` : 'Concluída';
  }
  return sub.dtFim ? `Prazo: ${formatDate(sub.dtFim)}` : 'Status: Pendente';
};

// ---------- Componente ----------

export function GoalTimelineCard({
  meta,
  onViewGoal,
  onEditGoal,
  onDeleteGoal,
  onOptionsPress,
}: GoalTimelineCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const { id, title, concluido: completed } = meta;

  const subGoals = useMemo(
    () => [...(meta.subMetas ?? [])].sort((a, b) => a.pos - b.pos),
    [meta.subMetas]
  );

  const hasMilestone = !!meta.milestone?.trim();

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
    onEditGoal?.(id);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDeleteGoal?.(id);
  };

  const handleView = () => {
    onViewGoal?.(id);
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
        {subGoals.map((item, index) => {
          const isCompleted = item.concluido;
          const nodeColor = isCompleted ? activeColor : inactiveColor;
          const hasLineBelow = index < subGoals.length - 1 || hasMilestone;

          return (
            <View key={item.id} style={styles.timelineItemRow}>
              <View style={styles.timelineColumn}>
                <View
                  style={[
                    styles.nodeCircle,
                    {
                      borderColor: nodeColor,
                      backgroundColor: isCompleted ? activeColor : surfaceColor,
                    },
                  ]}
                >
                  {isCompleted ? (
                    <IconSymbol name="checkmark" size={9} color="#FFF" />
                  ) : (
                    <IconSymbol name="eye.fill" size={9} color={inactiveColor} />
                  )}
                </View>
                {hasLineBelow && (
                  <View style={[styles.verticalLine, { backgroundColor: nodeColor }]} />
                )}
              </View>

              <View style={styles.subGoalContent}>
                <Text style={[styles.subGoalTitle, { color: nodeColor }]}>
                  {item.titulo}
                </Text>
                <Text style={[styles.subGoalTime, { color: textMuted }]}>
                  {getSubGoalTimeText(item)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Milestone Target Row */}
        {hasMilestone && (
          <View style={styles.milestoneRow}>
            <View style={styles.timelineColumn}>
              <View
                style={[
                  styles.milestoneNode,
                  {
                    borderColor: completed ? activeColor : inactiveColor,
                    backgroundColor: completed ? activeColor : surfaceColor,
                  },
                ]}
              >
                <IconSymbol
                  name="star.fill"
                  size={12}
                  color={completed ? '#FFF' : inactiveColor}
                />
              </View>
            </View>

            <View style={styles.milestoneContentRow}>
              <View style={styles.milestoneTextContainer}>
                <Text style={[styles.milestoneLabel, { color: completed ? activeColor : inactiveColor }]}>
                  OBJETIVO FINAL
                </Text>
                <Text
                  style={[
                    styles.milestoneText,
                    { color: completed ? activeColor : inactiveColor },
                  ]}
                  numberOfLines={2}
                >
                  {meta.milestone}
                </Text>
              </View>

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

        {/* Fallback button if goal has no milestone */}
        {!hasMilestone && (
          <View style={styles.noMilestoneViewGoalRow}>
            <Button
              title="view goal"
              variant="pill"
              customColor="#6B7280"
              size="small"
              onPress={handleView}
              style={styles.editBtn}
            />
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
  },
  timelineColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
    alignSelf: 'stretch',
  },
  nodeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  milestoneNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
  },
  subGoalContent: {
    flex: 1,
    paddingBottom: 16,
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
    alignItems: 'flex-start',
    marginTop: 2,
  },
  milestoneContentRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  milestoneTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  milestoneLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  milestoneText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  noMilestoneViewGoalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
