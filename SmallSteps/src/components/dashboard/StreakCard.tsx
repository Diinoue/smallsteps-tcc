import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type StreakStatus = 'active' | 'warning' | 'frozen';

export interface StreakCardProps {
  days: number;
  status: StreakStatus;
  statusText?: string;
}

export function StreakCard({
  days,
  status = 'active',
  statusText,
}: StreakCardProps) {
  const activeColor = useThemeColor({}, 'streakActive');
  const warningColor = useThemeColor({}, 'streakWarning');
  const frozenColor = useThemeColor({}, 'streakFrozen');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  // Determine state-specific color
  const getStatusColor = (): string => {
    switch (status) {
      case 'active':
        return activeColor;
      case 'warning':
        return warningColor;
      case 'frozen':
        return frozenColor;
      default:
        return activeColor;
    }
  };

  const statusColor = getStatusColor();

  // Default status messages if not provided
  const getSubtext = (): string => {
    if (statusText) return statusText;
    switch (status) {
      case 'active':
        return 'Step Taken!';
      case 'warning':
        return '23 hours until freeze';
      case 'frozen':
        return 'Frozen';
    }
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: surfaceColor }]}>
      {/* Top Header Section */}
      <View style={styles.topSection}>
        <View style={styles.daysRow}>
          <Text style={[styles.daysNumber, { color: statusColor }]}>{days}</Text>
          <View style={styles.daysLabelColumn}>
            <Text style={[styles.daysText, { color: statusColor }]}>DAYS</Text>
            <Text style={[styles.streakSublabel, { color: statusColor }]}>
              Current Streak
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: statusColor, opacity: 0.3 }]} />

      {/* Bottom Status Row */}
      <View style={styles.bottomSection}>
        <Text style={[styles.statusMessage, { color: statusColor }]}>
          {getSubtext()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  daysNumber: {
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 60,
    letterSpacing: -1,
  },
  daysLabelColumn: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  daysText: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  streakSublabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  practiceBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divider: {
    height: 1.5,
    marginVertical: 14,
    width: '100%',
  },
  bottomSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusMessage: {
    fontSize: 15,
    fontWeight: '700',
  },
});
