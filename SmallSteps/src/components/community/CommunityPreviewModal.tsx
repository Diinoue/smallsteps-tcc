import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { communityService, PublicCommunityItem } from '@/src/services/communityService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const ACCENT_GREEN = '#34C759';

export interface CommunityPreviewModalProps {
  visible: boolean;
  community: PublicCommunityItem | null;
  userId?: number;
  onClose: () => void;
  onJoined?: (community: PublicCommunityItem) => void;
  onRequested?: (community: PublicCommunityItem) => void;
}

export function CommunityPreviewModal({
  visible,
  community,
  userId = 1,
  onClose,
  onJoined,
  onRequested,
}: CommunityPreviewModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');

  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const tagBg = isDark ? '#1E293B' : '#E8F2FF';
  const tagTextColor = isDark ? '#60A5FA' : '#2563EB';
  const cancelBg = isDark ? '#374151' : '#F3F4F6';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [localJoined, setLocalJoined] = useState(false);
  const [localRequested, setLocalRequested] = useState(false);

  useEffect(() => {
    setImageError(false);
    setLocalJoined(Boolean(community?.jaParticipa));
    setLocalRequested(Boolean(community?.jaSolicitou));
  }, [community]);

  if (!community) {
    return null;
  }

  const isPrivate = Boolean(community.privado);
  const memberCount = community.quantidadeMembros ?? 0;
  const hasPhoto = Boolean(community.foto) && !imageError;

  const handlePrimaryAction = async () => {
    if (localJoined || localRequested || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (isPrivate) {
        await communityService.requestJoinCommunity(community.id, userId);
        setLocalRequested(true);
        onRequested?.({ ...community, jaSolicitou: true });
        Alert.alert(
          'Solicitação enviada!',
          `Seu pedido para entrar em "${community.nome}" foi enviado aos administradores.`
        );
      } else {
        await communityService.joinCommunity(community.id, userId);
        setLocalJoined(true);
        onJoined?.({ ...community, jaParticipa: true });
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 409) {
        if (isPrivate) {
          setLocalRequested(true);
        } else {
          setLocalJoined(true);
        }
        Alert.alert(
          'Aviso',
          error?.response?.data?.message || 'Você já possui vínculo ou solicitação pendente nesta comunidade.'
        );
      } else {
        Alert.alert(
          'Erro',
          isPrivate
            ? 'Não foi possível enviar a solicitação. Tente novamente.'
            : 'Não foi possível entrar na comunidade. Tente novamente.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              {/* Header com Avatar + Nome + Badges */}
              <View style={styles.headerRow}>
                <View style={styles.avatarWrapper}>
                  {hasPhoto ? (
                    <Image
                      source={{ uri: community.foto! }}
                      style={styles.avatarImage}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <MaterialIcons name="groups" size={30} color="#60A5FA" />
                    </View>
                  )}
                </View>

                <View style={styles.headerInfo}>
                  <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
                    {community.nome}
                  </Text>

                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.privacyBadge,
                        {
                          backgroundColor: isPrivate
                            ? isDark
                              ? '#3B2F1E'
                              : '#FEF3C7'
                            : isDark
                            ? '#143322'
                            : '#DCFCE7',
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={isPrivate ? 'lock' : 'public'}
                        size={13}
                        color={isPrivate ? '#D97706' : '#16A34A'}
                      />
                      <Text
                        style={[
                          styles.privacyText,
                          { color: isPrivate ? '#D97706' : '#16A34A' },
                        ]}
                      >
                        {isPrivate ? 'Privada' : 'Pública'}
                      </Text>
                    </View>

                    <View style={styles.membersCountBadge}>
                      <MaterialIcons name="people-outline" size={15} color={textMuted} />
                      <Text style={[styles.membersCountText, { color: textMuted }]}>
                        {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Descrição */}
              {community.descricao && community.descricao.trim().length > 0 ? (
                <Text style={[styles.description, { color: textMuted }]} numberOfLines={4}>
                  {community.descricao}
                </Text>
              ) : null}

              {/* Tags */}
              {community.tags && community.tags.length > 0 ? (
                <View style={styles.tagsContainer}>
                  {community.tags.map((tag, idx) => (
                    <View key={`${tag}-${idx}`} style={[styles.tagBadge, { backgroundColor: tagBg }]}>
                      <Text style={[styles.tagText, { color: tagTextColor }]}>
                        {tag.toLowerCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Banner de status caso já participe ou tenha solicitação pendente */}
              {localJoined ? (
                <View
                  style={[
                    styles.statusBanner,
                    { backgroundColor: isDark ? '#143322' : '#ECFDF5' },
                  ]}
                >
                  <MaterialIcons name="check-circle" size={18} color="#16A34A" />
                  <Text style={[styles.statusBannerText, { color: '#16A34A' }]}>
                    Você já participa desta comunidade
                  </Text>
                </View>
              ) : localRequested ? (
                <View
                  style={[
                    styles.statusBanner,
                    { backgroundColor: isDark ? '#3B2F1E' : '#FFFBEB' },
                  ]}
                >
                  <MaterialIcons name="hourglass-top" size={18} color="#D97706" />
                  <Text style={[styles.statusBannerText, { color: '#D97706' }]}>
                    Solicitação pendente de aprovação
                  </Text>
                </View>
              ) : null}

              {/* Ações */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: cancelBg }]}
                  onPress={onClose}
                  activeOpacity={0.75}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.cancelButtonText, { color: textColor }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (localJoined || localRequested) && styles.primaryButtonDisabled,
                  ]}
                  onPress={handlePrimaryAction}
                  activeOpacity={0.8}
                  disabled={localJoined || localRequested || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {localJoined
                        ? 'Já participa'
                        : localRequested
                        ? 'Pendente'
                        : isPrivate
                        ? 'Solicitar'
                        : 'Entrar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 14,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  membersCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membersCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  tagBadge: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
