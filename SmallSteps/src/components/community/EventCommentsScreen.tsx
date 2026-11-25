import React, { useCallback, useEffect, useState, useRef, memo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  GestureResponderEvent,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useProfile } from '@/src/context/ProfileContext';
import { CommunityEvent } from '@/src/types/event';
import { PostComment } from '@/src/types/community';
import { commentService } from '@/src/services/commentService';
import { communityService, formatImageUrl } from '@/src/services/communityService';

export interface EventCommentsScreenProps {
  communityId?: number | string;
  communityName?: string;
  userRole?: string;
  isAdmin?: boolean;
  event: CommunityEvent;
  onBackPress?: () => void;
  onCommentCountChange?: (newCount: number) => void;
}

function formatSingleDate(isoDate?: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const year = parts[0].slice(-2);
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  return isoDate;
}

function getEventHeaderDateString(event: CommunityEvent): string {
  const d1 = formatSingleDate(event.diaInicio);
  const d2 = formatSingleDate(event.diaFim || event.diaInicio);

  const startTime = event.horarioInicio ? event.horarioInicio.slice(0, 5) : '';
  const endTime = event.horarioFim ? event.horarioFim.slice(0, 5) : '';
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : (startTime || endTime || '');
  const dateRange = d1 && d2 && d1 !== d2 ? `${d1} - ${d2}` : (d1 || d2 || event.formattedDate || '');

  return timeRange ? `${dateRange} ${timeRange}` : dateRange;
}

// Componente memoizado do Card do Evento no Topo para evitar que seja reconstruído ao digitar
interface EventHeaderProps {
  event: CommunityEvent;
  borderColor: string;
  textColor: string;
  textMuted: string;
  cardBoxBorder: string;
  imagePlaceholderBg: string;
  isDark: boolean;
}

const EventHeader = memo(function EventHeader({
  event,
  borderColor,
  textColor,
  textMuted,
  cardBoxBorder,
  imagePlaceholderBg,
  isDark,
}: EventHeaderProps) {
  const dateString = getEventHeaderDateString(event);
  const bannerUri = formatImageUrl(event.foto || event.bannerUrl);

  return (
    <View style={[styles.eventContainer, { borderBottomColor: borderColor }]}>
      {/* 1. Período / Horário */}
      <Text style={[styles.eventDateHeader, { color: textColor }]}>
        {dateString}
      </Text>

      {/* 2. Banner / Imagem do Evento */}
      <View style={[styles.mediaContainer, { backgroundColor: imagePlaceholderBg }]}>
        {bannerUri ? (
          <Image
            source={{ uri: bannerUri }}
            style={styles.bannerImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons
              name="image"
              size={56}
              color={isDark ? '#4B5563' : '#CBD5E1'}
            />
          </View>
        )}
      </View>

      {/* 3. Título do Evento */}
      <Text style={[styles.eventTitle, { color: textColor }]}>
        {event.titulo}
      </Text>

      {/* 4. Localização / Endereço */}
      {event.local ? (
        <Text style={[styles.eventLocation, { color: textMuted }]}>
          {event.local}
        </Text>
      ) : null}

      {/* 5. Caixa de Descrição com borda fina */}
      {event.descricao ? (
        <View style={[styles.descriptionBox, { borderColor: cardBoxBorder }]}>
          <Text style={[styles.descriptionText, { color: textColor }]}>
            {event.descricao}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

// Barra de Input isolada em componente próprio para que digitação NÃO refresque a tela
interface CommentInputBarProps {
  onSend: (text: string) => Promise<void>;
  isSubmitting: boolean;
  backgroundColor: string;
  borderColor: string;
  inputBg: string;
  textColor: string;
  textMuted: string;
  primaryColor: string;
}

const CommentInputBar = memo(function CommentInputBar({
  onSend,
  isSubmitting,
  backgroundColor,
  borderColor,
  inputBg,
  textColor,
  textMuted,
  primaryColor,
}: CommentInputBarProps) {
  const [text, setText] = useState('');

  const handlePress = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;
    await onSend(trimmed);
    setText('');
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={[styles.inputContainer, { borderTopColor: borderColor, backgroundColor }]}>
      <TextInput
        style={[styles.inputPill, { backgroundColor: inputBg, color: textColor }]}
        placeholder="adicione um comentario..."
        placeholderTextColor={textMuted}
        value={text}
        onChangeText={setText}
        multiline={false}
        returnKeyType="send"
        onSubmitEditing={handlePress}
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: primaryColor, opacity: hasText && !isSubmitting ? 1 : 0.6 },
        ]}
        onPress={handlePress}
        disabled={!hasText || isSubmitting}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <MaterialIcons name="send" size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
});

export function EventCommentsScreen({
  communityId = 'default',
  communityName = 'Grupo #1 musica',
  userRole,
  isAdmin,
  event,
  onBackPress,
  onCommentCountChange,
}: EventCommentsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';
  const cardBoxBorder = isDark ? '#374151' : '#E5E7EB';
  const imagePlaceholderBg = isDark ? '#2D3748' : '#E2E8F0';
  const inputBg = isDark ? '#2D3748' : '#F1F3F5';
  const avatarBg = isDark ? '#4A5568' : '#718096';

  const { profile } = useProfile();

  const [activeRole, setActiveRole] = useState<string>(userRole || '');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do Dropdown de Opções (o mesmo estilo de Editar / Excluir Evento)
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 100, right: 20 });
  const [selectedCommentForOptions, setSelectedCommentForOptions] = useState<PostComment | null>(null);

  const flatListRef = useRef<FlatList<PostComment>>(null);

  // Carrega o cargo do usuário na tabela participam se ainda não foi fornecido
  useEffect(() => {
    async function loadRole() {
      if (userRole) {
        setActiveRole(userRole);
      } else if (communityId && communityId !== 'default') {
        const role = await communityService.getUserRole(communityId);
        if (role) {
          setActiveRole(role);
        }
      }
    }
    loadRole();
  }, [communityId, userRole]);

  // Apenas participantes que sejam administrador ou o dono na tabela participam podem excluir comentários
  const canDeleteComments = (() => {
    if (isAdmin) return true;
    const upper = (activeRole || userRole || '').trim().toUpperCase();
    return upper === 'DONO' || upper === 'OWNER' || upper === 'ADMINISTRADOR' || upper === 'ADMIN';
  })();

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await commentService.getEventComments(event.id);
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários do evento:', error);
    } finally {
      setIsLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSendComment = useCallback(
    async (text: string) => {
      try {
        setIsSubmitting(true);
        const newComment = await commentService.createEventComment(event.id, text, {
          id: profile.id,
          name: profile.name || 'Você',
          avatarUrl: profile.avatarUrl || null,
        });

        setComments((prev) => {
          const updated = [...prev, newComment];
          onCommentCountChange?.(updated.length);
          return updated;
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 150);
      } catch (error) {
        console.error('Erro ao enviar comentário do evento:', error);
        Alert.alert('Erro', 'Não foi possível enviar o comentário. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [event.id, profile.id, profile.name, profile.avatarUrl, onCommentCountChange]
  );

  const handleCommentOptions = useCallback(
    (comment: PostComment, gestureEvent?: GestureResponderEvent) => {
      const pageY = gestureEvent?.nativeEvent?.pageY;
      if (pageY !== undefined) {
        const windowHeight = Dimensions.get('window').height;
        const top = Math.max(60, Math.min(pageY - 10, windowHeight - 120));
        setMenuPosition({ top, right: 20 });
      } else {
        setMenuPosition({ top: 120, right: 20 });
      }
      setSelectedCommentForOptions(comment);
      setMenuVisible(true);
    },
    []
  );

  const handleDeleteCommentPress = useCallback(() => {
    setMenuVisible(false);
    if (!selectedCommentForOptions) return;
    const commentToDelete = selectedCommentForOptions;

    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este comentário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentService.deleteComment(commentToDelete.id);
              setComments((prev) => {
                const updated = prev.filter((c) => c.id !== commentToDelete.id);
                onCommentCountChange?.(updated.length);
                return updated;
              });
            } catch (error) {
              console.error('Erro ao remover comentário do evento:', error);
              Alert.alert('Erro', 'Não foi possível remover o comentário.');
            }
          },
        },
      ]
    );
  }, [selectedCommentForOptions, onCommentCountChange]);

  const renderCommentItem = useCallback(
    ({ item }: { item: PostComment }) => {
      const commentAvatarUri = formatImageUrl(item.author.avatarUrl);

      return (
        <View style={[styles.commentRow, { borderBottomColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
          {commentAvatarUri ? (
            <Image
              source={{ uri: commentAvatarUri }}
              style={styles.commentAvatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.commentAvatar, { backgroundColor: avatarBg }]}>
              <MaterialIcons name="person" size={20} color="#FFFFFF" />
            </View>
          )}

          <View style={styles.commentBody}>
            <Text style={[styles.commentAuthorName, { color: textColor }]}>
              {item.author.name}
            </Text>
            <Text style={[styles.commentText, { color: textColor }]}>
              {item.content}
            </Text>
          </View>

          {/* Somente administradores ou dono têm acesso à opção de excluir */}
          {canDeleteComments && (
            <TouchableOpacity
              onPress={(e) => handleCommentOptions(item, e)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.commentOptionsButton}
            >
              <Text style={[styles.commentOptionsText, { color: textMuted }]}>•••</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [isDark, avatarBg, textColor, textMuted, canDeleteComments, handleCommentOptions]
  );

  const renderEventHeader = useCallback(
    () => (
      <EventHeader
        event={event}
        borderColor={borderColor}
        textColor={textColor}
        textMuted={textMuted}
        cardBoxBorder={cardBoxBorder}
        imagePlaceholderBg={imagePlaceholderBg}
        isDark={isDark}
      />
    ),
    [event, borderColor, textColor, textMuted, cardBoxBorder, imagePlaceholderBg, isDark]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Header com botão Voltar e Título "Events" idêntico ao protótipo */}
      <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
        <View style={styles.titleSection}>
          {onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={26} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Eventos
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            keyExtractor={(item) => String(item.id)}
            ListHeaderComponent={renderEventHeader}
            renderItem={renderCommentItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: textMuted }]}>
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </Text>
              </View>
            }
          />
        )}

        {/* Barra de Adicionar Comentário isolada e memoizada */}
        <CommentInputBar
          onSend={handleSendComment}
          isSubmitting={isSubmitting}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          inputBg={inputBg}
          textColor={textColor}
          textMuted={textMuted}
          primaryColor={primaryColor}
        />
      </KeyboardAvoidingView>

      {/* 3-dots Dropdown Modal de Exclusão de Comentário (o mesmo estilo de Editar / Excluir Evento) */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdownModalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownCard,
                  {
                    top: menuPosition.top,
                    right: menuPosition.right,
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleDeleteCommentPress}
                  style={styles.dropdownItem}
                >
                  <Text style={[styles.dropdownItemText, { color: '#EF4444' }]}>
                    Excluir
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Card do Evento no Topo
  eventContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  eventDateHeader: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  mediaContainer: {
    width: '100%',
    height: 170,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    marginBottom: 12,
  },
  descriptionBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  // Comentários
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  commentBody: {
    flex: 1,
    paddingRight: 8,
  },
  commentAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentOptionsButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  commentOptionsText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Barra de Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  // 3-dots Dropdown Modal (idêntico ao de Editar / Excluir Evento)
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dropdownCard: {
    position: 'absolute',
    width: 130,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
