import React, { useRef, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MediaType } from '@/src/types/community';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface MediaViewerProps {
  visible: boolean;
  mediaType: MediaType;
  mediaUrl: string;
  onClose: () => void;
}

export function MediaViewer({ visible, mediaType, mediaUrl, onClose }: MediaViewerProps) {
  if (mediaType === 'image') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <StatusBar hidden />
        <View style={styles.overlay}>
          {/* Botão fechar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Imagem fullscreen */}
          <Image
            source={{ uri: mediaUrl }}
            style={styles.fullImage}
            contentFit="contain"
            transition={200}
          />
        </View>
      </Modal>
    );
  }

  if (mediaType === 'video') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <StatusBar hidden />
        <View style={styles.overlay}>
          {/* Botão fechar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <VideoPlayerWrapper mediaUrl={mediaUrl} visible={visible} />
        </View>
      </Modal>
    );
  }

  return null;
}

/** Wrapper separado para o player de vídeo (precisa do hook useVideoPlayer) */
function VideoPlayerWrapper({ mediaUrl, visible }: { mediaUrl: string; visible: boolean }) {
  const player = useVideoPlayer(mediaUrl, (p) => {
    p.loop = false;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.fullVideo}
      allowsFullscreen
      allowsPictureInPicture={false}
      nativeControls
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  fullVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16), // 16:9
  },
});
