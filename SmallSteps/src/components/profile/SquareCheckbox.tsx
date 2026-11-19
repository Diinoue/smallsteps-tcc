import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
  color = '#34c759',
}: SquareCheckboxProps) {
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
            borderColor: color,
            backgroundColor: checked ? color : 'transparent',
          },
        ]}
      >
        {checked && (
          <MaterialIcons name="check" size={size - 4} color="#FFFFFF" />
        )}
      </View>
      {label ? (
        <Text style={[styles.label, labelStyle]}>
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
    marginVertical: 6,
  },
  checkbox: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});
