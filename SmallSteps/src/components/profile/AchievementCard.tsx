import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
  const isLeft = layoutVariant === 'left';

  const renderMedia = () => (
    <View style={styles.thumbnailContainer}>
      {achievement.mediaType === 'video' ? (
        <View style={styles.playIconContainer}>
          <MaterialIcons name="play-arrow" size={44} color="#6B7280" />
        </View>
      ) : (
        <MaterialIcons name="image" size={54} color="#D1D5DB" />
      )}
    </View>
  );

  const renderContent = () => (
    <View style={[styles.infoContainer, isLeft ? styles.infoLeft : styles.infoRight]}>
      <Text style={styles.title} numberOfLines={2}>
        {achievement.title.endsWith(':') ? achievement.title : `${achievement.title}:`}
      </Text>
      <Text style={styles.journeyText}>{achievement.journeyDuration}</Text>
      <Text style={styles.subGoalsText}>{achievement.subGoalsCount} Sub-Goals</Text>
      
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onViewPress?.(achievement.id)}
        style={styles.viewButton}
      >
        <Text style={styles.viewButtonText}>view</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.card}>
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
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  thumbnailContainer: {
    width: 125,
    height: 110,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLeft: {
    paddingLeft: 18,
  },
  infoRight: {
    paddingRight: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  journeyText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  subGoalsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 22,
    paddingVertical: 5,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
});
