import React, { useCallback, useEffect, useState, useContext } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

export interface CommunityFeedScreenProps {
  communityId?: number | string;
  communityName?: string;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onLocationPress?: () => void;
  onEventsPress?: () => void;
  onMembersPress?: () => void;
  onSettingsPress?: () => void;
}

export function CommunityFeedScreen({
  communityId = 'default',
  communityName = 'Grupo #1 musica',
  onBackPress,
  onSearchPress,
  onLocationPress,
  onEventsPress,
  onMembersPress,
  onSettingsPress,
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

  const handlePostOptions = (post: Post) => {
    Alert.alert('Opções do Post', `Ações para o post de ${post.author.name}`, [
      { text: 'Denunciar', style: 'destructive' },
      { text: 'Fechar', style: 'cancel' },
    ]);
  };

  const handleComments = (post: Post) => {
    Alert.alert('Comentários', `Visualizando comentários do post #${post.id}`);
  };

  const handleMediaPress = (post: Post) => {
    if (post.mediaUrl && (post.mediaType === 'image' || post.mediaType === 'video')) {
      setViewerPost(post);
    }
  };

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
              onPress={onSettingsPress}
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
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
});
