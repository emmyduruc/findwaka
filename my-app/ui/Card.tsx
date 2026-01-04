import React, { ReactNode } from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface CardProps {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onPress, style }) => {
  const baseStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={className}
        style={[baseStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={className} style={[baseStyle, style]}>
      {children}
    </View>
  );
};

