import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useProfile } from '@/src/context/ProfileContext';
import { CommunityMemberItem, communityService } from '@/src/services/communityService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT_GREEN = '#34C759';

export interface CommunityMembersScreenProps {
  communityId: number | string;
  communityName: string;
  isPrivate: boolean;
  userRole?: string;
  currentUserId?: number;
  onBackPress: () => void;
  onAddMembersPress?: () => void;
}

type NormalizedRole = 'DONO' | 'ADMINISTRADOR' | 'MEMBRO';

function normalizeRole(role?: string): NormalizedRole {
  const upper = (role || 'MEMBRO').trim().toUpperCase();
  if (upper === 'DONO' || upper === 'OWNER') return 'DONO';
  if (upper === 'ADMINISTRADOR' || upper === 'ADMIN') return 'ADMINISTRADOR';
  return 'MEMBRO';
}

export function CommunityMembersScreen({
  communityId,
  communityName,
  isPrivate,
  userRole,
  currentUserId: currentUserIdProp,
  onBackPress,
  onAddMembersPress,
}: CommunityMembersScreenProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const currentUserId = currentUserIdProp ?? profile.id;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';
  const modalBg = isDark ? '#1F2937' : '#FFFFFF';

  const [members, setMembers] = useState<CommunityMemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [selectedMember, setSelectedMember] = useState<CommunityMemberItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<NormalizedRole>(normalizeRole(userRole));

  useEffect(() => {
    setActiveRole(normalizeRole(userRole));
  }, [userRole]);

  const loadMembers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const data = await communityService.getCommunityMembers(communityId);
        setMembers(data);
        const me = data.find((m) => m.idUsuario === currentUserId);
        if (me) {
          setActiveRole(normalizeRole(me.cargo));
        }
      } catch (error) {
        console.error('Erro ao carregar membros:', error);
        Alert.alert('Erro', 'Não foi possível carregar os membros da comunidade.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [communityId, currentUserId]
  );

  useEffect(() => {
    loadMembers(false);
  }, [loadMembers]);

  const canManagePrivateRequests =
    isPrivate && (activeRole === 'DONO' || activeRole === 'ADMINISTRADOR');

  const handleViewProfile = (member: CommunityMemberItem) => {
    setSelectedMember(null);
    router.push(`/profile/${member.idUsuario}` as any);
  };

  const handleChangeRole = async (
    member: CommunityMemberItem,
    novoCargo: 'ADMINISTRADOR' | 'MEMBRO'
  ) => {
    const actionLabel =
      novoCargo === 'ADMINISTRADOR' ? 'promover a Administrador' : 'rebaixar para Membro';

    Alert.alert(
      'Alterar cargo',
      `Deseja ${actionLabel} "${member.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setIsActionLoading(true);
              await communityService.updateMemberRole(communityId, member.idUsuario, novoCargo);
              setSelectedMember(null);
              await loadMembers(true);
            } catch (error) {
              console.error('Erro ao alterar cargo:', error);
              Alert.alert('Erro', 'Não foi possível alterar o cargo do membro.');
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleKickMember = (member: CommunityMemberItem) => {
    Alert.alert(
      'Expulsar membro',
      `Tem certeza que deseja remover "${member.nome}" da comunidade "${communityName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Expulsar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsActionLoading(true);
              await communityService.kickMember(communityId, member.idUsuario);
              setSelectedMember(null);
              setMembers((prev) => prev.filter((m) => m.idUsuario !== member.idUsuario));
            } catch (error) {
              console.error('Erro ao expulsar membro:', error);
              Alert.alert('Erro', 'Não foi possível expulsar o membro.');
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleDisplay = (cargo: string): string | null => {
    const normalized = normalizeRole(cargo);
    if (normalized === 'DONO') return 'Dono';
    if (normalized === 'ADMINISTRADOR') return 'Administrador';
    return null;
  };

  const renderMemberItem = ({ item }: { item: CommunityMemberItem }) => {
    const roleLabel = getRoleDisplay(item.cargo);
    const isHighlighted = roleLabel !== null;
    const hasPhoto = Boolean(item.foto) && !failedImages[item.idUsuario];

    return (
      <View style={[styles.memberRow, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.memberMain}
          activeOpacity={0.7}
          onPress={() => handleViewProfile(item)}
        >
          <View style={[styles.avatarRing, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
            {hasPhoto ? (
              <Image
                source={{ uri: item.foto! }}
                style={styles.avatarImage}
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [item.idUsuario]: true }))
                }
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#4B5563' : '#737373' }]}>
                <MaterialIcons name="person" size={26} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, { color: textColor }]} numberOfLines={1}>
              {item.nome}
            </Text>
            <View style={styles.subtitleRow}>
              <Text
                style={[
                  styles.pointsText,
                  { color: isHighlighted ? ACCENT_GREEN : textMuted },
                ]}
              >
                {item.pontos} {item.pontos === 1 ? 'ponto' : 'pontos'}
              </Text>
              {roleLabel ? (
                <Text style={[styles.roleText, { color: textMuted }]}>
                  {roleLabel}
                </Text>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setSelectedMember(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.6}
        >
          <MaterialIcons name="more-horiz" size={26} color={textColor} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMemberOptionsModal = () => {
    if (!selectedMember) return null;

    const targetRole = normalizeRole(selectedMember.cargo);
    const isSelf = selectedMember.idUsuario === currentUserId;

    const canPromote = !isSelf && activeRole === 'DONO' && targetRole === 'MEMBRO';
    const canDemote = !isSelf && activeRole === 'DONO' && targetRole === 'ADMINISTRADOR';
    const canKick =
      !isSelf &&
      ((activeRole === 'DONO' && targetRole !== 'DONO') ||
        (activeRole === 'ADMINISTRADOR' && targetRole === 'MEMBRO'));

    return (
      <Modal
        visible={!!selectedMember}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMember(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedMember(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheetCard, { backgroundColor: modalBg, borderColor }]}>
                <Text style={[styles.sheetTitle, { color: textColor }]} numberOfLines={1}>
                  {selectedMember.nome}
                </Text>
                <Text style={[styles.sheetSubtitle, { color: textMuted }]}>
                  {getRoleDisplay(selectedMember.cargo) || 'Membro'} • {selectedMember.pontos}{' '}
                  {selectedMember.pontos === 1 ? 'ponto' : 'pontos'}
                </Text>

                <View style={[styles.sheetDivider, { backgroundColor: borderColor }]} />

                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => handleViewProfile(selectedMember)}
                  disabled={isActionLoading}
                >
                  <MaterialIcons name="person-outline" size={22} color={textColor} />
                  <Text style={[styles.sheetOptionText, { color: textColor }]}>
                    Ver perfil
                  </Text>
                </TouchableOpacity>

                {canPromote ? (
                  <TouchableOpacity
                    style={styles.sheetOption}
                    onPress={() => handleChangeRole(selectedMember, 'ADMINISTRADOR')}
                    disabled={isActionLoading}
                  >
                    <MaterialIcons name="arrow-upward" size={22} color={ACCENT_GREEN} />
                    <Text style={[styles.sheetOptionText, { color: ACCENT_GREEN }]}>
                      Promover a Administrador
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {canDemote ? (
                  <TouchableOpacity
                    style={styles.sheetOption}
                    onPress={() => handleChangeRole(selectedMember, 'MEMBRO')}
                    disabled={isActionLoading}
                  >
                    <MaterialIcons name="arrow-downward" size={22} color="#D97706" />
                    <Text style={[styles.sheetOptionText, { color: '#D97706' }]}>
                      Rebaixar para Membro
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {canKick ? (
                  <TouchableOpacity
                    style={styles.sheetOption}
                    onPress={() => handleKickMember(selectedMember)}
                    disabled={isActionLoading}
                  >
                    <MaterialIcons name="person-remove" size={22} color="#EF4444" />
                    <Text style={[styles.sheetOptionText, { color: '#EF4444' }]}>
                      Expulsar membro
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.sheetCancelBtn, { borderTopColor: borderColor }]}
                  onPress={() => setSelectedMember(null)}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color={ACCENT_GREEN} />
                  ) : (
                    <Text style={[styles.sheetCancelText, { color: textMuted }]}>Cancelar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Membros</Text>
        </View>

        <View style={styles.headerActions}>
          {canManagePrivateRequests && onAddMembersPress ? (
            <TouchableOpacity
              onPress={onAddMembersPress}
              style={styles.headerIconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person-add-alt-1" size={25} color={textColor} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Lista de Membros */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={ACCENT_GREEN} />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => String(item.idUsuario)}
          renderItem={renderMemberItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadMembers(true)}
              tintColor={ACCENT_GREEN}
              colors={[ACCENT_GREEN]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <MaterialIcons name="groups" size={56} color={textMuted} />
              <Text style={[styles.emptyText, { color: textMuted }]}>
                Nenhum membro encontrado nesta comunidade.
              </Text>
            </View>
          }
        />
      )}

      {renderMemberOptionsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconButton: {
    padding: 4,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  memberMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    padding: 2,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreButton: {
    padding: 6,
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheetCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    paddingTop: 18,
    overflow: 'hidden',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginTop: 2,
    marginBottom: 14,
  },
  sheetDivider: {
    height: 1,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetOptionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sheetCancelBtn: {
    borderTopWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
