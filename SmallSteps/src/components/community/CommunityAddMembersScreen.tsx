import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { communityService, JoinRequestItem } from '@/src/services/communityService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT_GREEN = '#34C759';
const REJECT_RED = '#C04444';

export interface CommunityAddMembersScreenProps {
  communityId: number | string;
  communityName: string;
  initialInviteCode?: string;
  onBackPress: () => void;
  onInviteCodeUpdated?: (newCode: string) => void;
}

export function CommunityAddMembersScreen({
  communityId,
  communityName,
  initialInviteCode,
  onBackPress,
  onInviteCodeUpdated,
}: CommunityAddMembersScreenProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';
  const inputBg = isDark ? '#1F2937' : '#FFFFFF';
  const inputBorder = isDark ? '#374151' : '#D1D5DB';

  const [requests, setRequests] = useState<JoinRequestItem[]>([]);
  const [inviteCode, setInviteCode] = useState<string>(initialInviteCode || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<number | null>(null);
  const [isRerolling, setIsRerolling] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const [reqData, communityData] = await Promise.all([
          communityService.getJoinRequests(communityId),
          communityService.getCommunityById(communityId),
        ]);
        setRequests(reqData);
        if (communityData?.codigoConvite) {
          setInviteCode(communityData.codigoConvite);
        }
      } catch (error) {
        console.error('Erro ao carregar solicitações e convite:', error);
        Alert.alert('Erro', 'Não foi possível carregar as informações de convite.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [communityId]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleAccept = async (item: JoinRequestItem) => {
    try {
      setProcessingUserId(item.idUsuario);
      await communityService.acceptJoinRequest(communityId, item.idUsuario);
      setRequests((prev) => prev.filter((r) => r.idUsuario !== item.idUsuario));
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      Alert.alert('Erro', 'Não foi possível aceitar a solicitação.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleReject = async (item: JoinRequestItem) => {
    try {
      setProcessingUserId(item.idUsuario);
      await communityService.rejectJoinRequest(communityId, item.idUsuario);
      setRequests((prev) => prev.filter((r) => r.idUsuario !== item.idUsuario));
    } catch (error) {
      console.error('Erro ao negar solicitação:', error);
      Alert.alert('Erro', 'Não foi possível negar a solicitação.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await Clipboard.setStringAsync(inviteCode);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      Alert.alert('Erro', 'Não foi possível copiar o código.');
    }
  };

  const handleRerollCode = () => {
    Alert.alert(
      'Gerar novo código',
      'O código atual deixará de funcionar e um novo código único será criado. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Gerar novo',
          onPress: async () => {
            try {
              setIsRerolling(true);
              const newCode = await communityService.rerollInviteCode(communityId);
              if (newCode) {
                setInviteCode(newCode);
                onInviteCodeUpdated?.(newCode);
              }
            } catch (error) {
              console.error('Erro ao gerar novo código:', error);
              Alert.alert('Erro', 'Não foi possível gerar um novo código.');
            } finally {
              setIsRerolling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Header com nome da comunidade */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
          {communityName}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={ACCENT_GREEN} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(true)}
              tintColor={ACCENT_GREEN}
              colors={[ACCENT_GREEN]}
            />
          }
        >
          {/* Seção: Requests */}
          <View style={[styles.sectionHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Requests</Text>
            {requests.length > 0 ? (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{requests.length}</Text>
              </View>
            ) : null}
          </View>

          {requests.length === 0 ? (
            <View style={[styles.emptyRequestsBox, { borderBottomColor: borderColor }]}>
              <MaterialIcons name="inbox" size={32} color={textMuted} />
              <Text style={[styles.emptyRequestsText, { color: textMuted }]}>
                Nenhuma solicitação pendente no momento.
              </Text>
            </View>
          ) : (
            requests.map((item) => {
              const isBusy = processingUserId === item.idUsuario;
              const hasPhoto = Boolean(item.fotoUsuario) && !failedImages[item.idUsuario];

              return (
                <View
                  key={item.idUsuario}
                  style={[styles.requestRow, { borderBottomColor: borderColor }]}
                >
                  <TouchableOpacity
                    style={styles.requestUserInfo}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/profile/${item.idUsuario}` as any)}
                  >
                    <View
                      style={[
                        styles.avatarRing,
                        { borderColor: isDark ? '#374151' : '#E5E7EB' },
                      ]}
                    >
                      {hasPhoto ? (
                        <Image
                          source={{ uri: item.fotoUsuario! }}
                          style={styles.avatarImage}
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [item.idUsuario]: true }))
                          }
                        />
                      ) : (
                        <View
                          style={[
                            styles.avatarPlaceholder,
                            { backgroundColor: isDark ? '#4B5563' : '#737373' },
                          ]}
                        >
                          <MaterialIcons name="person" size={24} color="#FFFFFF" />
                        </View>
                      )}
                    </View>

                    <Text style={[styles.requestUserName, { color: textColor }]} numberOfLines={1}>
                      {item.nomeUsuario}
                    </Text>
                  </TouchableOpacity>

                  {isBusy ? (
                    <ActivityIndicator size="small" color={ACCENT_GREEN} style={{ marginHorizontal: 18 }} />
                  ) : (
                    <View style={styles.decisionButtons}>
                      <TouchableOpacity
                        style={styles.rejectPill}
                        onPress={() => handleReject(item)}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="close" size={20} color="#1F1F1F" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.acceptPill}
                        onPress={() => handleAccept(item)}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="check" size={20} color="#1F1F1F" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* Seção: Send Invite */}
          <View style={styles.inviteSection}>
            <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 14 }]}>
              Send Invite
            </Text>

            <TouchableOpacity
              style={[
                styles.codeBox,
                { backgroundColor: inputBg, borderColor: inputBorder },
              ]}
              onPress={handleCopyCode}
              activeOpacity={0.75}
            >
              <Text style={[styles.codePrefix, { color: textMuted }]}>
                smallsteps/invite/
              </Text>
              <Text style={[styles.codeValue, { color: textColor }]}>
                {inviteCode || '...'}
              </Text>
            </TouchableOpacity>

            <View style={styles.inviteActionsRow}>
              <TouchableOpacity
                style={[
                  styles.inviteActionButton,
                  {
                    backgroundColor: copiedFeedback
                      ? isDark
                        ? '#143322'
                        : '#DCFCE7'
                      : isDark
                      ? '#1F2937'
                      : '#F3F4F6',
                    borderColor: copiedFeedback ? ACCENT_GREEN : inputBorder,
                  },
                ]}
                onPress={handleCopyCode}
                activeOpacity={0.75}
                disabled={!inviteCode}
              >
                <MaterialIcons
                  name={copiedFeedback ? 'check' : 'content-copy'}
                  size={18}
                  color={copiedFeedback ? ACCENT_GREEN : textColor}
                />
                <Text
                  style={[
                    styles.inviteActionText,
                    { color: copiedFeedback ? ACCENT_GREEN : textColor },
                  ]}
                >
                  {copiedFeedback ? 'Copiado!' : 'Copiar código'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.inviteActionButton,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderColor: inputBorder,
                  },
                ]}
                onPress={handleRerollCode}
                activeOpacity={0.75}
                disabled={isRerolling}
              >
                {isRerolling ? (
                  <ActivityIndicator size="small" color={ACCENT_GREEN} />
                ) : (
                  <>
                    <MaterialIcons name="refresh" size={20} color={textColor} />
                    <Text style={[styles.inviteActionText, { color: textColor }]}>
                      Novo código
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  countPill: {
    backgroundColor: ACCENT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyRequestsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 8,
  },
  emptyRequestsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  requestUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    padding: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestUserName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  decisionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rejectPill: {
    width: 54,
    height: 30,
    borderRadius: 15,
    backgroundColor: REJECT_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptPill: {
    width: 54,
    height: 30,
    borderRadius: 15,
    backgroundColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteSection: {
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  codePrefix: {
    fontSize: 16,
    fontWeight: '600',
  },
  codeValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  inviteActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  inviteActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  inviteActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
