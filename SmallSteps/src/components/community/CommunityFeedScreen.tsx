import React, { useCallback, useEffect, useState, useContext } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Post, MediaType } from '@/src/types/community';
import { communityService, uploadMedia } from '@/src/services/communityService';
import { PostCard } from './PostCard';
import { MediaViewer } from './MediaViewer';
import { PostCommentsScreen } from './PostCommentsScreen';

export type RoleType = 'DONO' | 'ADMIN' | 'MEMBRO';

export interface CommunityFeedScreenProps {
  communityId?: number | string;
  communityName?: string;
  userRole?: 'DONO' | 'ADMINISTRADOR' | 'MEMBRO' | 'ADMIN' | string;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onLocationPress?: () => void;
  onEventsPress?: () => void;
  onMembersPress?: () => void;
  onSettingsPress?: () => void;
  onEditCommunityPress?: () => void;
  onLeaveCommunity?: () => void;
  onCommentsPress?: (post: Post) => void;
}

export function CommunityFeedScreen({
  communityId = 'default',
  communityName = 'Grupo #1 musica',
  userRole = 'MEMBRO',
  onBackPress,
  onSearchPress,
  onLocationPress,
  onEventsPress,
  onMembersPress,
  onSettingsPress,
  onEditCommunityPress,
  onLeaveCommunity,
  onCommentsPress,
}: CommunityFeedScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const surfaceVariant = isDark ? '#2D3748' : '#F3F4F6';
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';

  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postText, setPostText] = useState('');
  const [pendingMediaType, setPendingMediaType] = useState<MediaType>('text');
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewerPost, setViewerPost] = useState<Post | null>(null);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<Post | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeRole, setActiveRole] = useState<string>(userRole || 'MEMBRO');

  useEffect(() => {
    setActiveRole(userRole || 'MEMBRO');
  }, [userRole]);

  useEffect(() => {
    async function fetchUserRole() {
      if (!communityId || communityId === 'default') return;
      const role = await communityService.getUserRole(communityId, 1);
      if (role) {
        setActiveRole(role);
      }
    }
    fetchUserRole();
  }, [communityId]);

  const normalizedRole: RoleType = (() => {
    if (!activeRole) return 'MEMBRO';
    const upper = activeRole.trim().toUpperCase();
    if (upper === 'DONO' || upper === 'OWNER') return 'DONO';
    if (upper === 'ADMINISTRADOR' || upper === 'ADMIN') return 'ADMIN';
    return 'MEMBRO';
  })();

  const getRoleLabel = (role: RoleType): string => {
    switch (role) {
      case 'DONO':
        return 'Dono';
      case 'ADMIN':
        return 'Administrador';
      case 'MEMBRO':
        return 'Membro';
    }
  };

  const handleOpenSettings = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      setIsSettingsModalVisible(true);
    }
  };

  const handleEditCommunity = () => {
    setIsSettingsModalVisible(false);
    if (onEditCommunityPress) {
      onEditCommunityPress();
    } else {
      Alert.alert(
        'Editar Comunidade',
        'A página de edição da comunidade será implementada em breve.'
      );
    }
  };

  const handleLeaveCommunity = () => {
    setIsSettingsModalVisible(false);
    Alert.alert(
      'Sair da Comunidade',
      `Tem certeza que deseja sair da comunidade "${communityName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLeaving(true);
              await communityService.leaveCommunity(communityId);
              Alert.alert('Sucesso', 'Você saiu da comunidade com sucesso.', [
                {
                  text: 'OK',
                  onPress: () => {
                    if (onLeaveCommunity) {
                      onLeaveCommunity();
                    } else if (onBackPress) {
                      onBackPress();
                    }
                  },
                },
              ]);
            } catch (error) {
              console.error('Erro ao sair da comunidade:', error);
              Alert.alert('Erro', 'Não foi possível sair da comunidade. Tente novamente.');
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  const loadPosts = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await communityService.getCommunityPosts(communityId);
      setPosts(data);
    } catch (error) {
      console.error('Erro ao carregar posts da comunidade:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPosts(false);
  };

  const handleAttachMedia = async () => {
    // Pedir permissão
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para anexar mídia.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const isVideo = asset.type === 'video';
      setPendingMediaType(isVideo ? 'video' : 'image');
      setSelectedFileUri(asset.uri);
      setSelectedMimeType(asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'));
    }
  };

  const handleRemoveMedia = () => {
    setPendingMediaType('text');
    setSelectedFileUri(null);
    setSelectedMimeType(null);
  };

  const handleSendPost = async () => {
    if (!postText.trim() && pendingMediaType === 'text') {
      return;
    }

    try {
      setIsSubmitting(true);

      let mediaUrl: string | null = null;

      // Se há mídia selecionada, faz upload primeiro
      if (selectedFileUri && selectedMimeType && pendingMediaType !== 'text') {
        try {
          mediaUrl = await uploadMedia(selectedFileUri, selectedMimeType);
        } catch (uploadError) {
          console.error('Erro no upload da mídia:', uploadError);
          Alert.alert('Erro no Upload', 'Não foi possível enviar a mídia. Tente novamente.');
          return;
        }
      }

      const newPost = await communityService.createPost(communityId, {
        content: postText.trim(),
        mediaType: pendingMediaType,
        mediaUrl,
      });

      setPosts((prev) => [newPost, ...prev]);
      setPostText('');
      handleRemoveMedia();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      Alert.alert('Erro', 'Não foi possível publicar seu post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletePost = (post: Post) => {
    Alert.alert(
      'Excluir Publicação',
      'Tem certeza de que deseja excluir esta publicação? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.deletePost(communityId, post.id);
              setPosts((prev) => prev.filter((p) => p.id !== post.id));
              Alert.alert('Sucesso', 'Publicação excluída com sucesso.');
            } catch (error) {
              console.error('Erro ao excluir post:', error);
              Alert.alert('Erro', 'Não foi possível excluir a publicação. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const handlePostOptions = (post: Post) => {
    setSelectedPostForOptions(post);
  };

  const handleComments = (post: Post) => {
    if (onCommentsPress) {
      onCommentsPress(post);
    } else {
      setSelectedPostForComments(post);
    }
  };

  const handleMediaPress = (post: Post) => {
    if (post.mediaUrl && (post.mediaType === 'image' || post.mediaType === 'video')) {
      setViewerPost(post);
    }
  };

  if (selectedPostForComments) {
    const isFeedAdminOrDono = normalizedRole === 'DONO' || normalizedRole === 'ADMIN';

    return (
      <PostCommentsScreen
        communityId={communityId}
        communityName={communityName}
        userRole={activeRole}
        isAdmin={isFeedAdminOrDono}
        post={selectedPostForComments}
        onBackPress={() => setSelectedPostForComments(null)}
        onEventsPress={onEventsPress}
        onMembersPress={onMembersPress}
        onSettingsPress={onSettingsPress}
        onCommentCountChange={(newCount) => {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === selectedPostForComments.id
                ? { ...p, commentsCount: newCount }
                : p
            )
          );
          setSelectedPostForComments((prev) =>
            prev ? { ...prev, commentsCount: newCount } : null
          );
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Cabeçalho do Grupo (Top Bar) */}
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

          {/* Ações da Direita: Busca, Localização, Membros, Configurações */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              onPress={onSearchPress}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionIcon}
            >
              <MaterialIcons name="search" size={26} color={textColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onEventsPress || onLocationPress}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionIcon}
            >
              <MaterialIcons name="event" size={26} color={textColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onMembersPress}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionIcon}
            >
              <MaterialIcons name="groups" size={26} color={textColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenSettings}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionIcon}
            >
              <MaterialIcons name="settings" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed de Publicações */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onOptionsPress={handlePostOptions}
                onCommentsPress={handleComments}
                onMediaPress={handleMediaPress}
              />
            )}
            contentContainerStyle={[
              styles.feedContent,
              posts.length === 0 && styles.emptyFeedContent,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyIconCircle,
                    { backgroundColor: isDark ? '#1F2937' : '#F0FDF4' },
                  ]}
                >
                  <MaterialIcons name="chat-bubble-outline" size={38} color={primaryColor} />
                </View>
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                  Nenhuma publicação ainda
                </Text>
                <Text style={[styles.emptySubtitle, { color: textMuted }]}>
                  Seja o primeiro a compartilhar algo com a comunidade! Digite uma mensagem abaixo para iniciar a conversa.
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={primaryColor}
                colors={[primaryColor]}
              />
            }
          />
        )}

        {/* Preview da mídia selecionada */}
        {selectedFileUri && pendingMediaType !== 'text' && (
          <View style={[styles.previewContainer, { borderTopColor: borderColor, backgroundColor }]}>
            <View style={styles.previewContent}>
              {pendingMediaType === 'image' ? (
                <Image
                  source={{ uri: selectedFileUri }}
                  style={styles.previewImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.previewVideoPlaceholder, { backgroundColor: surfaceVariant }]}>
                  <MaterialIcons name="videocam" size={28} color={primaryColor} />
                  <Text style={[styles.previewVideoText, { color: textMuted }]}>Vídeo selecionado</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.previewRemoveButton}
                onPress={handleRemoveMedia}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Barra de Criação de Post (Bottom Action Bar) */}
        <View style={[styles.bottomBarContainer, { borderTopColor: borderColor, backgroundColor }]}>
          {/* Botão de Anexo com '+' */}
          <TouchableOpacity
            style={[
              styles.attachButton,
              {
                borderColor: isDark ? '#4A5568' : '#CBD5E0',
                backgroundColor: pendingMediaType !== 'text' ? primaryColor + '20' : 'transparent',
              },
            ]}
            onPress={handleAttachMedia}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="post-add"
              size={24}
              color={pendingMediaType !== 'text' ? primaryColor : textColor}
            />
          </TouchableOpacity>

          {/* Campo de Entrada Pílula */}
          <View style={[styles.inputPill, { backgroundColor: surfaceVariant }]}>
            <TextInput
              style={[styles.textInput, { color: textColor }]}
              placeholder={
                pendingMediaType === 'video'
                  ? 'faça um post com vídeo...'
                  : pendingMediaType === 'image'
                  ? 'faça um post com imagem...'
                  : 'faça um post...'
              }
              placeholderTextColor={textMuted}
              value={postText}
              onChangeText={setPostText}
              multiline
              maxLength={500}
            />
          </View>

          {/* Botão de Envio Circular */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: primaryColor,
                opacity: postText.trim() || pendingMediaType !== 'text' ? 1 : 0.6,
              },
            ]}
            onPress={handleSendPost}
            disabled={(!postText.trim() && pendingMediaType === 'text') || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Visualizador de mídia fullscreen */}
        {viewerPost && viewerPost.mediaUrl && (
          <MediaViewer
            visible={!!viewerPost}
            mediaType={viewerPost.mediaType}
            mediaUrl={viewerPost.mediaUrl}
            onClose={() => setViewerPost(null)}
          />
        )}

        {/* Modal de Configurações da Comunidade por Cargo */}
        <Modal
          visible={isSettingsModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsSettingsModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsSettingsModalVisible(false)}>
            <View style={styles.settingsModalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.settingsModalContent,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor,
                    },
                  ]}
                >
                  {/* Handle bar */}
                  <View style={styles.settingsHandleBar} />

                  {/* Header com título */}
                  <View style={styles.settingsHeader}>
                    <Text style={[styles.settingsTitle, { color: textColor }]}>
                      Configurações da Comunidade
                    </Text>
                  </View>

                  <Text
                    style={[styles.settingsCommunityName, { color: textMuted }]}
                    numberOfLines={1}
                  >
                    {communityName}
                  </Text>

                  <View style={[styles.settingsDivider, { backgroundColor: borderColor }]} />

                  {/* Opções de Ação */}
                  <View style={styles.settingsActionsList}>
                    {/* Ação 1: Editar Comunidade (apenas para DONO e ADMIN) */}
                    {(normalizedRole === 'DONO' || normalizedRole === 'ADMIN') && (
                      <TouchableOpacity
                        style={[
                          styles.settingsActionItem,
                          { backgroundColor: isDark ? '#263238' : '#F9FAFB', borderColor },
                        ]}
                        onPress={handleEditCommunity}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.settingsActionIconBox,
                            { backgroundColor: isDark ? '#143822' : '#E8F8EE' },
                          ]}
                        >
                          <MaterialIcons name="edit" size={22} color={primaryColor} />
                        </View>
                        <View style={styles.settingsActionTextBox}>
                          <Text style={[styles.settingsActionTitle, { color: textColor }]}>
                            Editar Comunidade
                          </Text>
                          <Text style={[styles.settingsActionSubTitle, { color: textMuted }]}>
                            Alterar nome, fotos, descrição e configurações
                          </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={textMuted} />
                      </TouchableOpacity>
                    )}

                    {/* Ação 2: Sair da Comunidade (apenas para ADMIN e MEMBRO, NÃO para DONO) */}
                    {(normalizedRole === 'ADMIN' || normalizedRole === 'MEMBRO') && (
                      <TouchableOpacity
                        style={[
                          styles.settingsActionItem,
                          {
                            backgroundColor: isDark ? '#321C1C' : '#FEF2F2',
                            borderColor: isDark ? '#7F1D1D' : '#FEE2E2',
                          },
                        ]}
                        onPress={handleLeaveCommunity}
                        activeOpacity={0.7}
                        disabled={isLeaving}
                      >
                        <View
                          style={[
                            styles.settingsActionIconBox,
                            { backgroundColor: isDark ? '#4C1D1D' : '#FEE2E2' },
                          ]}
                        >
                          <MaterialIcons name="exit-to-app" size={22} color="#EF4444" />
                        </View>
                        <View style={styles.settingsActionTextBox}>
                          <Text style={[styles.settingsActionTitle, { color: '#EF4444' }]}>
                            Sair da Comunidade
                          </Text>
                          <Text
                            style={[
                              styles.settingsActionSubTitle,
                              { color: isDark ? '#FCA5A5' : '#991B1B' },
                            ]}
                          >
                            Deixar de participar deste grupo
                          </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Botão Cancelar */}
                  <TouchableOpacity
                    style={[
                      styles.settingsCancelButton,
                      { borderColor, backgroundColor: isDark ? '#374151' : '#F3F4F6' },
                    ]}
                    onPress={() => setIsSettingsModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.settingsCancelButtonText, { color: textColor }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal de Opções do Post (Custom Styled Bottom Sheet) */}
        <Modal
          visible={!!selectedPostForOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPostForOptions(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedPostForOptions(null)}>
            <View style={styles.settingsModalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.settingsModalContent,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor,
                    },
                  ]}
                >
                  {/* Handle bar */}
                  <View style={styles.settingsHandleBar} />

                  {/* Header */}
                  <View style={styles.settingsHeader}>
                    <Text style={[styles.settingsTitle, { color: textColor }]}>
                      Opções da Publicação
                    </Text>
                  </View>

                  {selectedPostForOptions && (
                    <Text
                      style={[styles.settingsCommunityName, { color: textMuted }]}
                      numberOfLines={1}
                    >
                      {String(selectedPostForOptions.author?.id) === '1' ||
                      selectedPostForOptions.author?.id === 1 ||
                      selectedPostForOptions.author?.id === 'me'
                        ? 'Sua publicação'
                        : `Publicado por ${selectedPostForOptions.author?.name || 'Membro'}`}
                    </Text>
                  )}

                  <View style={[styles.settingsDivider, { backgroundColor: borderColor }]} />

                  {/* Lista de Ações */}
                  <View style={styles.settingsActionsList}>
                    {selectedPostForOptions &&
                    (String(selectedPostForOptions.author?.id) === '1' ||
                      selectedPostForOptions.author?.id === 1 ||
                      selectedPostForOptions.author?.id === 'me' ||
                      normalizedRole === 'DONO' ||
                      normalizedRole === 'ADMIN') ? (
                      <TouchableOpacity
                        style={[
                          styles.settingsActionItem,
                          {
                            backgroundColor: isDark ? '#321C1C' : '#FEF2F2',
                            borderColor: isDark ? '#7F1D1D' : '#FEE2E2',
                          },
                        ]}
                        onPress={() => {
                          const postToDelete = selectedPostForOptions;
                          setSelectedPostForOptions(null);
                          if (postToDelete) {
                            confirmDeletePost(postToDelete);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.settingsActionIconBox,
                            { backgroundColor: isDark ? '#4C1D1D' : '#FEE2E2' },
                          ]}
                        >
                          <MaterialIcons name="delete-outline" size={22} color="#EF4444" />
                        </View>
                        <View style={styles.settingsActionTextBox}>
                          <Text style={[styles.settingsActionTitle, { color: '#EF4444' }]}>
                            Excluir Publicação
                          </Text>
                          <Text
                            style={[
                              styles.settingsActionSubTitle,
                              { color: isDark ? '#FCA5A5' : '#991B1B' },
                            ]}
                          >
                            Esta ação removerá a publicação permanentemente
                          </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={[
                          styles.noActionsBox,
                          { backgroundColor: isDark ? '#263238' : '#F3F4F6' },
                        ]}
                      >
                        <MaterialIcons name="info-outline" size={20} color={textMuted} />
                        <Text style={[styles.noActionsText, { color: textMuted }]}>
                          Você não tem permissão para gerenciar esta publicação.
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Botão Cancelar */}
                  <TouchableOpacity
                    style={[
                      styles.settingsCancelButton,
                      { borderColor, backgroundColor: isDark ? '#374151' : '#F3F4F6' },
                    ]}
                    onPress={() => setSelectedPostForOptions(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.settingsCancelButtonText, { color: textColor }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
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
    minWidth: 0,
    marginRight: 12,
  },
  backButton: {
    marginRight: 8,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  actionIcon: {
    padding: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContent: {
    paddingBottom: 24,
  },
  emptyFeedContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    maxWidth: 320,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPill: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 44,
    maxHeight: 100,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    padding: 0,
    margin: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  previewContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  previewContent: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  previewVideoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  previewVideoText: {
    fontSize: 10,
    textAlign: 'center',
  },
  previewRemoveButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal de Configurações
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  settingsModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  settingsHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    alignSelf: 'center',
    marginBottom: 14,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleBadgeDono: {
    backgroundColor: '#FEF3C7',
  },
  roleBadgeAdmin: {
    backgroundColor: '#EFF6FF',
  },
  roleBadgeMembro: {
    backgroundColor: '#F3F4F6',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  settingsCommunityName: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  settingsDivider: {
    height: 1,
    marginBottom: 16,
  },
  settingsActionsList: {
    gap: 12,
    marginBottom: 16,
  },
  settingsActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  settingsActionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsActionTextBox: {
    flex: 1,
  },
  settingsActionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingsActionSubTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingsCancelButton: {
    borderWidth: 1,
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  noActionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  noActionsText: {
    fontSize: 13,
    flex: 1,
  },
});
