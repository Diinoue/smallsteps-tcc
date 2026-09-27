import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'pill';
  customColor?: string;
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'primary',
  customColor,
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const themePrimary = useThemeColor({}, 'primary');
  const primarySoft = useThemeColor({}, 'primarySoft');
  const textColor = useThemeColor({}, 'text');
  const textInverse = useThemeColor({}, 'textInverse');

  const activeColor = customColor || themePrimary;

  const getContainerStyles = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: variant === 'pill' ? 24 : 12,
      paddingHorizontal: size === 'small' ? 12 : size === 'large' ? 24 : 16,
      paddingVertical: size === 'small' ? 6 : size === 'large' ? 14 : 10,
    };

    switch (variant) {
      case 'primary':
        base.backgroundColor = activeColor;
        break;
      case 'pill':
        base.backgroundColor = activeColor;
        base.borderRadius = 20;
        break;
      case 'secondary':
        base.backgroundColor = primarySoft;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = activeColor;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
    }

    if (disabled || isLoading) {
      base.opacity = 0.6;
    }

    return base;
  };

  const getTextStyles = (): TextStyle => {
    let base: TextStyle = {
      fontWeight: '600',
      fontSize: size === 'small' ? 13 : size === 'large' ? 17 : 15,
    };

    switch (variant) {
      case 'primary':
      case 'pill':
        base.color = textInverse;
        break;
      case 'secondary':
      case 'outline':
        base.color = activeColor;
        break;
      case 'ghost':
        base.color = textColor;
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || isLoading}
      style={[getContainerStyles(), style]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'pill' ? textInverse : activeColor}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              getTextStyles(),
              leftIcon ? { marginLeft: 6 } : null,
              rightIcon ? { marginRight: 6 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}
