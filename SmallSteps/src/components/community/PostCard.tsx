import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Post } from '@/src/types/community';
import { PostMediaCard } from './PostMediaCard';

export interface PostCardProps {
  post: Post;
  onOptionsPress?: (post: Post) => void;
  onCommentsPress?: (post: Post) => void;
  onMediaPress?: (post: Post) => void;
}

export function PostCard({
  post,
  onOptionsPress,
  onCommentsPress,
  onMediaPress,
}: PostCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const activeStreakColor = useThemeColor({}, 'streakActive');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';

  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      {/* Header do Post: Avatar, Nome, Streak e 3 pontinhos */}
      <View style={styles.headerRow}>
        <View style={styles.authorInfo}>
          {post.author.avatarUrl ? (
            <Image
              source={{ uri: post.author.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: isDark ? '#4A5568' : '#718096' },
              ]}
            />
          )}

          <View style={styles.authorTextContainer}>
            <Text style={[styles.authorName, { color: textColor }]}>
              {post.author.name}
              {'  '}
              <Text style={[styles.streakText, { color: activeStreakColor }]}>
                {post.author.streakDays} days
              </Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onOptionsPress?.(post)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.optionsButton}
        >
          <Text style={[styles.optionsText, { color: textColor }]}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Mídia do Post (Vídeo ou Imagem) */}
      <PostMediaCard
        mediaType={post.mediaType}
        mediaUrl={post.mediaUrl}
        thumbnailUrl={post.thumbnailUrl}
        aspectRatio={post.aspectRatio}
        onPress={() => onMediaPress?.(post)}
      />

      {/* Conteúdo textual da publicação */}
      {post.content ? (
        <Text style={[styles.content, { color: textColor }]}>
          {post.content}
        </Text>
      ) : null}

      {/* Rodapé: Data e Comentários */}
      <View style={styles.footerRow}>
        <Text style={[styles.dateText, { color: textMuted }]}>
          {post.createdAt}
        </Text>

        <TouchableOpacity
          onPress={() => onCommentsPress?.(post)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.commentButton}
        >
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color={textColor}
          />
          {post.commentsCount > 0 && (
            <Text style={[styles.commentsCount, { color: textMuted }]}>
              {post.commentsCount}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  authorTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionsButton: {
    padding: 4,
  },
  optionsText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  content: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  commentsCount: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
