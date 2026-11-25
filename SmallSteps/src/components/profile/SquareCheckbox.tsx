import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SquareCheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  labelStyle?: object;
  disabled?: boolean;
  size?: number;
  color?: string;
}

export function SquareCheckbox({
  checked,
  onPress,
  label,
  labelStyle,
  disabled = false,
  size = 22,
  color,
}: SquareCheckboxProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const defaultActiveColor = useThemeColor({}, 'streakActive');
  const activeColor = color || defaultActiveColor;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={styles.container}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderColor: checked ? activeColor : borderColor,
            backgroundColor: checked ? activeColor : 'transparent',
          },
        ]}
      >
        {checked && (
          <MaterialIcons name="check" size={size - 5} color="#FFFFFF" />
        )}
      </View>
      {label ? (
        <Text style={[styles.label, { color: textColor }, labelStyle]} numberOfLines={2}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
  },
});
