import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  style?: ViewStyle;
}

export function Card({ children, variant = 'flat', style, ...props }: CardProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceVariant = useThemeColor({}, 'surfaceVariant');
  const borderColor = useThemeColor({}, 'border');

  const getCardStyle = (): ViewStyle => {
    let base: ViewStyle = {
      borderRadius: 16,
      padding: 16,
      backgroundColor: surfaceColor,
    };

    switch (variant) {
      case 'elevated':
        base.shadowColor = '#000';
        base.shadowOffset = { width: 0, height: 2 };
        base.shadowOpacity = 0.06;
        base.shadowRadius = 8;
        base.elevation = 2;
        break;
      case 'outlined':
        base.borderWidth = 1;
        base.borderColor = borderColor;
        break;
      case 'flat':
        base.backgroundColor = surfaceVariant;
        break;
    }

    return base;
  };

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
}
