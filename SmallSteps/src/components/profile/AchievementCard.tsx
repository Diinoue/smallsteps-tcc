import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProfileAchievement } from '@/src/context/ProfileContext';

interface AchievementCardProps {
  achievement: ProfileAchievement;
  layoutVariant?: 'left' | 'right';
  onViewPress?: (id: number) => void;
}

export function AchievementCard({
  achievement,
  layoutVariant = 'left',
  onViewPress,
}: AchievementCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceVariant = useThemeColor({}, 'surfaceVariant');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const activeColor = useThemeColor({}, 'streakActive');

  const isLeft = layoutVariant === 'left';

  const renderMedia = () => (
    <View
      style={[
        styles.thumbnailContainer,
        { backgroundColor: surfaceVariant, borderColor },
      ]}
    >
      {achievement.mediaUrl && achievement.mediaType !== 'video' ? (
        <Image
          source={{ uri: achievement.mediaUrl }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      ) : achievement.mediaType === 'video' ? (
        <View
          style={[
            styles.playIconContainer,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
          ]}
        >
          <MaterialIcons name="play-arrow" size={34} color={activeColor} />
        </View>
      ) : (
        <MaterialIcons name="emoji-events" size={38} color={activeColor} />
      )}
    </View>
  );

  const renderContent = () => (
    <View style={[styles.infoContainer, isLeft ? styles.infoLeft : styles.infoRight]}>
      <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
        {achievement.title}
      </Text>

      <View style={styles.metaRow}>
        <MaterialIcons name="schedule" size={14} color={textMuted} />
        <Text style={[styles.journeyText, { color: textSecondary }]} numberOfLines={1}>
          {achievement.journeyDuration}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <MaterialIcons name="check-circle-outline" size={14} color={activeColor} />
        <Text style={[styles.subGoalsText, { color: textSecondary }]}>
          {achievement.subGoalsCount} Sub-Goals
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onViewPress?.(achievement.id)}
        style={[
          styles.viewButton,
          { backgroundColor: isDark ? '#143322' : '#ECFDF5', borderColor: activeColor + '40' },
        ]}
      >
        <Text style={[styles.viewButtonText, { color: activeColor }]}>Ver detalhes</Text>
        <MaterialIcons name="arrow-forward" size={14} color={activeColor} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: surfaceColor, borderColor },
      ]}
    >
      {isLeft ? (
        <>
          {renderMedia()}
          {renderContent()}
        </>
      ) : (
        <>
          {renderContent()}
          {renderMedia()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  thumbnailContainer: {
    width: 96,
    height: 96,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLeft: {
    paddingLeft: 14,
  },
  infoRight: {
    paddingRight: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  journeyText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  subGoalsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  viewButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
