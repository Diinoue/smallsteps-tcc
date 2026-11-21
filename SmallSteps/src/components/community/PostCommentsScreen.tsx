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
import { Post, PostComment } from '@/src/types/community';
import { commentService } from '@/src/services/commentService';
import { communityService, formatImageUrl } from '@/src/services/communityService';
import { PostMediaCard } from './PostMediaCard';

export interface PostCommentsScreenProps {
  communityId?: number | string;
  communityName?: string;
  userRole?: string;
  isAdmin?: boolean;
  post: Post;
  onBackPress?: () => void;
  onEventsPress?: () => void;
  onMembersPress?: () => void;
  onSettingsPress?: () => void;
  onCommentCountChange?: (newCount: number) => void;
}

// Componente memoizado do Header do Post para evitar que ele seja reconstruído ao digitar
interface PostHeaderProps {
  post: Post;
  borderColor: string;
  textColor: string;
  textMuted: string;
  avatarBg: string;
}

const PostHeader = memo(function PostHeader({
  post,
  borderColor,
  textColor,
  textMuted,
  avatarBg,
}: PostHeaderProps) {
  const authorAvatarUri = formatImageUrl(post.author.avatarUrl);

  return (
    <View style={[styles.postContainer, { borderBottomColor: borderColor }]}>
      {/* Autor do Post */}
      <View style={styles.postAuthorRow}>
        {authorAvatarUri ? (
          <Image
            source={{ uri: authorAvatarUri }}
            style={styles.authorAvatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.authorAvatar, { backgroundColor: avatarBg }]}>
            <MaterialIcons name="person" size={26} color="#FFFFFF" />
          </View>
        )}

        <View style={styles.authorDetails}>
          <Text style={[styles.authorName, { color: textColor }]}>
            {post.author.name}
          </Text>
          <Text style={[styles.postDate, { color: textMuted }]}>
            {post.createdAt}
          </Text>
        </View>
      </View>

      {/* Mídia do Post (Vídeo ou Imagem) */}
      <PostMediaCard
        mediaType={post.mediaType}
        mediaUrl={post.mediaUrl}
        thumbnailUrl={post.thumbnailUrl}
        aspectRatio={post.aspectRatio || 16 / 9}
      />

      {/* Conteúdo textual do post */}
      {post.content ? (
        <Text style={[styles.postContent, { color: textColor }]}>
          {post.content}
        </Text>
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

export function PostCommentsScreen({
  communityId = 'default',
  communityName = 'Grupo #1 musica',
  userRole,
  isAdmin,
  post,
  onBackPress,
  onEventsPress,
  onMembersPress,
  onSettingsPress,
  onCommentCountChange,
}: PostCommentsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';
  const inputBg = isDark ? '#2D3748' : '#F1F3F5';
  const avatarBg = isDark ? '#4A5568' : '#718096';

  const { profile } = useProfile();

  const [activeRole, setActiveRole] = useState<string>(userRole || '');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do Dropdown de Opções (estilo Perfil / Eventos)
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 100, right: 20 });
  const [selectedCommentForOptions, setSelectedCommentForOptions] = useState<PostComment | null>(null);

  const flatListRef = useRef<FlatList<PostComment>>(null);

  // Verifica na tabela participam se o usuário é Dono ou Administrador
  useEffect(() => {
    async function loadRole() {
      if (userRole) {
        setActiveRole(userRole);
      } else if (communityId && communityId !== 'default') {
        const role = await communityService.getUserRole(communityId, 1);
        if (role) {
          setActiveRole(role);
        }
      }
    }
    loadRole();
  }, [communityId, userRole]);

  // Apenas Dono ou Administrador na tabela participam podem excluir comentários
  const canDeleteComments = (() => {
    if (isAdmin) return true;
    const upper = (activeRole || userRole || '').trim().toUpperCase();
    return upper === 'DONO' || upper === 'OWNER' || upper === 'ADMINISTRADOR' || upper === 'ADMIN';
  })();

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await commentService.getPostComments(post.id);
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários do post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [post.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSendComment = useCallback(
    async (text: string) => {
      try {
        setIsSubmitting(true);
        const newComment = await commentService.createComment(post.id, text, {
          id: 1,
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
        console.error('Erro ao enviar comentário:', error);
        Alert.alert('Erro', 'Não foi possível enviar o comentário. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [post.id, profile.name, profile.avatarUrl, onCommentCountChange]
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
              console.error('Erro ao remover comentário:', error);
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

  const renderPostHeader = useCallback(
    () => (
      <PostHeader
        post={post}
        borderColor={borderColor}
        textColor={textColor}
        textMuted={textMuted}
        avatarBg={avatarBg}
      />
    ),
    [post, borderColor, textColor, textMuted, avatarBg]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Header do Grupo com botão Voltar e Ações */}
      <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
        <View style={styles.titleSection}>
          {onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {communityName}
          </Text>
        </View>

        <View style={styles.actionsSection}>
          {onEventsPress && (
            <TouchableOpacity
              onPress={onEventsPress}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionIcon}
            >
              <MaterialIcons name="event" size={24} color={textColor} />
            </TouchableOpacity>
          )}

          {onMembersPress && (
            <TouchableOpacity
              onPress={onMembersPress}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionIcon}
            >
              <MaterialIcons name="groups" size={24} color={textColor} />
            </TouchableOpacity>
          )}

          {onSettingsPress && (
            <TouchableOpacity
              onPress={onSettingsPress}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionIcon}
            >
              <MaterialIcons name="settings" size={24} color={textColor} />
            </TouchableOpacity>
          )}
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
            ListHeaderComponent={renderPostHeader}
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

      {/* 3-dots Dropdown Modal de Exclusão de Comentário (o mesmo estilo de Editar/Excluir Evento) */}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    padding: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header do Post
  postContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  authorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
  },
  postDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 12,
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
  // 3-dots Dropdown Modal
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
