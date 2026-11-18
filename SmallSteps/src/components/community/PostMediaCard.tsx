import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MediaType } from '@/src/types/community';

export interface PostMediaCardProps {
  mediaType: MediaType;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  aspectRatio?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function PostMediaCard({
  mediaType,
  mediaUrl,
  thumbnailUrl,
  aspectRatio = 16 / 9,
  onPress,
  style,
}: PostMediaCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (mediaType === 'text' || (!mediaUrl && !thumbnailUrl && mediaType !== 'video')) {
    return null;
  }

  const placeholderBg = isDark ? '#2D3748' : '#E8ECEF';
  const playButtonBg = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(74, 85, 104, 0.45)';

  if (mediaType === 'video') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.container,
          { aspectRatio, backgroundColor: placeholderBg },
          style,
        ]}
      >
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.mediaImage}
            contentFit="cover"
            transition={200}
          />
        ) : null}

        {/* Overlay central com o botão de Play do protótipo */}
        <View style={[styles.playOverlay, { backgroundColor: playButtonBg }]}>
          <MaterialIcons name="play-arrow" size={48} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  }

  if (mediaType === 'image') {
    return (
      <TouchableOpacity
        activeOpacity={onPress ? 0.85 : 1}
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.container,
          { aspectRatio, backgroundColor: placeholderBg },
          style,
        ]}
      >
        {mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.mediaImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.emptyPlaceholder}>
            <MaterialIcons name="image" size={40} color={isDark ? '#718096' : '#A0AEC0'} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
