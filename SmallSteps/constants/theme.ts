/**
 * Theme configuration for SmallSteps app.
 * Primary theme color can be changed centrally by altering `PRIMARY_COLOR`.
 */

import { Platform } from 'react-native';

// Central Primary Theme Color (Orange)
export const PRIMARY_COLOR = '#FF6B00';
export const PRIMARY_LIGHT = '#FF8533';
export const PRIMARY_DARK = '#D95B00';
export const PRIMARY_SOFT = '#FFF0E6';

export const Colors = {
  light: {
    primary: PRIMARY_COLOR,
    primaryLight: PRIMARY_LIGHT,
    primaryDark: PRIMARY_DARK,
    primarySoft: PRIMARY_SOFT,

    // Dynamic Streak status colors
    streakActive: '#10B981', // Green
    streakWarning: PRIMARY_COLOR, // Orange
    streakFrozen: '#6B7280', // Grey

    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceVariant: '#F3F4F6',

    border: '#E5E7EB',
    borderFocus: PRIMARY_COLOR,

    tint: PRIMARY_COLOR,
    icon: '#4B5563',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: PRIMARY_COLOR,

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    primary: PRIMARY_COLOR,
    primaryLight: PRIMARY_LIGHT,
    primaryDark: PRIMARY_DARK,
    primarySoft: '#3D1E0B',

    streakActive: '#34D399',
    streakWarning: PRIMARY_COLOR,
    streakFrozen: '#9CA3AF',

    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#6B7280',
    textInverse: '#111827',

    background: '#111827',
    surface: '#1F2937',
    surfaceVariant: '#374151',

    border: '#374151',
    borderFocus: PRIMARY_COLOR,

    tint: PRIMARY_COLOR,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: PRIMARY_COLOR,

    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
