import React, { useState } from 'react';
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
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Card } from '@/src/components/ui/Card';
import { PostMediaCard } from '@/src/components/community/PostMediaCard';
import { MediaViewer } from '@/src/components/community/MediaViewer';
import { useProfile } from '@/src/context/ProfileContext';
import { goalService } from '@/src/services';
import { GoalDTOResponse, SubGoalDTOResponse } from '@/src/dto/DashboardResponse';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
};

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useProfile();

  const [goal, setGoal] = useState<GoalDTOResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const activeColor = useThemeColor({}, 'streakActive');
  const inactiveColor = '#9CA3AF';
  const surfaceColor = useThemeColor({}, 'surface');
  const colorScheme = useColorScheme();

  useFocusEffect(
    React.useCallback(() => {
      if (id) loadGoalDetail(id);
    }, [id])
  );

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

  // submetas ordenadas por posição
  const subMetas: SubGoalDTOResponse[] = goal
    ? [...(goal.subMetas ?? [])].sort((a, b) => a.pos - b.pos)
    : [];

  const hasMilestone = !!goal?.milestone?.trim();
  const isAuthor = goal != null && profile.id > 0 && goal.idUsuario === profile.id;

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
        {isAuthor && goal ? (
          <TouchableOpacity
            onPress={() => router.push(`/goal/edit/${goal.id}`)}
            style={styles.editButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="edit" size={22} color={textColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.topBarPlaceholder} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={activeColor} />
        </View>
      ) : !goal ? (
        <View style={styles.centered}>
          <Text style={[styles.notFoundText, { color: textColor }]}>Meta não encontrada.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header Card ── */}
          <Card variant="elevated" style={styles.headerCard}>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: goal.concluido ? activeColor : primaryColor }]}>
                <Text style={styles.statusBadgeText}>
                  {goal.concluido ? 'Concluída' : 'Em Andamento'}
                </Text>
              </View>
            </View>

            <Text style={[styles.goalTitle, { color: textColor }]}>{goal.title}</Text>

            <View style={styles.datesRow}>
              <View style={styles.dateBlock}>
                <Text style={[styles.dateLabel, { color: textMuted }]}>INÍCIO</Text>
                <Text style={[styles.dateValue, { color: textColor }]}>{formatDate(goal.dtInicio)}</Text>
              </View>
              {goal.dtFim && (
                <View style={styles.dateBlock}>
                  <Text style={[styles.dateLabel, { color: goal.concluido ? activeColor : textMuted }]}>
                    {goal.concluido ? 'CONCLUSÃO' : 'PRAZO'}
                  </Text>
                  <Text style={[styles.dateValue, { color: goal.concluido ? activeColor : textColor }]}>
                    {formatDate(goal.dtFim)}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* ── Linha do Tempo ── */}
          <Text style={[styles.sectionTitle, { color: textColor }]}>Linha do Tempo</Text>

          <View style={[styles.timelineCard, { backgroundColor: surfaceColor }]}>

            {subMetas.length === 0 && !hasMilestone ? (
              <Text style={[styles.emptyText, { color: textMuted }]}>
                Nenhuma submeta cadastrada.
              </Text>
            ) : (
              <>
                {subMetas.map((sub, index) => {
                  const isCompleted = sub.concluido;
                  const nodeColor = isCompleted ? activeColor : inactiveColor;
                  // Há linha abaixo se ainda houver mais submetas ou houver milestone
                  const hasLineBelow = index < subMetas.length - 1 || hasMilestone;

                  return (
                    <View key={sub.id} style={styles.timelineRow}>
                      {/* Coluna da timeline (nó + linha) */}
                      <View style={styles.timelineCol}>
                        {/* Nó circular */}
                        <View style={[styles.nodeDot, { borderColor: nodeColor, backgroundColor: isCompleted ? nodeColor : surfaceColor }]}>
                          {isCompleted && (
                            <IconSymbol name="checkmark" size={9} color="#FFF" />
                          )}
                        </View>
                        {/* Linha vertical abaixo do nó */}
                        {hasLineBelow && (
                          <View style={[styles.verticalLine, { backgroundColor: nodeColor }]} />
                        )}
                      </View>

                      {/* Conteúdo da submeta */}
                      <View style={styles.rowContent}>
                        <Text style={[styles.subTitle, { color: nodeColor }]}>{sub.titulo}</Text>
                        <View style={styles.datesSmall}>
                          {sub.concluido && sub.dtFim ? (
                            <Text style={[styles.dateSmall, { color: activeColor }]}>
                              Concluída: {formatDate(sub.dtFim)}
                            </Text>
                          ) : !sub.concluido ? (
                            <Text style={[styles.dateSmall, { color: textMuted }]}>Pendente</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })}

                {/* ── Nó final: Milestone ── */}
                {hasMilestone && (
                  <View style={styles.timelineRow}>
                    <View style={styles.timelineCol}>
                      {/* Nó estrela */}
                      <View style={[
                        styles.milestoneNode,
                        { borderColor: goal.concluido ? activeColor : inactiveColor,
                          backgroundColor: goal.concluido ? activeColor : surfaceColor },
                      ]}>
                        <IconSymbol
                          name="star.fill"
                          size={14}
                          color={goal.concluido ? '#FFF' : inactiveColor}
                        />
                      </View>
                      {/* Sem linha abaixo do milestone */}
                    </View>

                    <View style={styles.rowContent}>
                      <Text style={[styles.milestoneLabel, { color: goal.concluido ? activeColor : inactiveColor }]}>
                        OBJETIVO FINAL
                      </Text>
                      <Text style={[styles.milestoneText, { color: goal.concluido ? activeColor : inactiveColor }]}>
                        {goal.milestone}
                      </Text>
                      {goal.concluido && goal.dtFim && (
                        <Text style={[styles.dateSmall, { color: activeColor }]}>
                          Concluído em: {formatDate(goal.dtFim)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {/* ── Comprovante de Conclusão (Imagem ou Vídeo) ── */}
          {goal.concluido && goal.urlMidia ? (
            <View style={styles.proofSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Comprovante de Conclusão
              </Text>
              <PostMediaCard
                mediaType={goal.tipoMidia?.toUpperCase() === 'VIDEO' ? 'video' : 'image'}
                mediaUrl={goal.urlMidia}
                aspectRatio={16 / 9}
                onPress={() => setMediaViewerVisible(true)}
              />
            </View>
          ) : null}
        </ScrollView>
      )}

      {goal?.urlMidia ? (
        <MediaViewer
          visible={mediaViewerVisible}
          mediaType={goal.tipoMidia?.toUpperCase() === 'VIDEO' ? 'video' : 'image'}
          mediaUrl={goal.urlMidia}
          onClose={() => setMediaViewerVisible(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const NODE_SIZE = 22;
const MILESTONE_SIZE = 24;
const LINE_WIDTH = 2;
const COL_WIDTH = 30;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-start' },
  backIcon: { transform: [{ rotate: '180deg' }] },
  topBarTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  editButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-end' },
  topBarPlaceholder: { width: 36 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  notFoundText: { fontSize: 16, fontWeight: '600' },

  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48 },

  // ── Header Card ──
  headerCard: { borderRadius: 20, padding: 20, marginBottom: 24 },
  badgeRow: { flexDirection: 'row', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  goalTitle: { fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 14 },
  datesRow: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  dateBlock: {},
  dateLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  dateValue: { fontSize: 15, fontWeight: '700' },

  // ── Timeline ──
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  timelineCard: {
    borderRadius: 20,
    padding: 20,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyText: { fontSize: 14, fontStyle: 'italic', textAlign: 'center' },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },

  // ── Coluna esquerda (nó + linha) ──
  timelineCol: {
    width: COL_WIDTH,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  nodeDot: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  milestoneNode: {
    width: MILESTONE_SIZE,
    height: MILESTONE_SIZE,
    borderRadius: MILESTONE_SIZE / 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  verticalLine: {
    width: LINE_WIDTH,
    flex: 1,
    minHeight: 28,
  },

  // ── Conteúdo da linha ──
  rowContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 20,       // espaçamento entre linhas da timeline
    paddingTop: 1,
  },
  subTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  datesSmall: { marginTop: 3, gap: 1 },
  dateSmall: { fontSize: 12, fontWeight: '500' },

  milestoneLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  milestoneText: { fontSize: 16, fontWeight: '800', lineHeight: 22 },
  proofSection: { marginTop: 24 },
});
