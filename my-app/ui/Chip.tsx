import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress, className = '' }) => {
  const style: ViewStyle = {
    backgroundColor: selected ? colors.accentPrimary : colors.surface,
    borderWidth: 1.5,
    borderColor: selected ? colors.accentPrimary : colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={className}
      style={style}
    >
      <Text
        variant="caption"
        weight="500"
        color={selected ? 'primary' : 'primary'}
        style={{ color: selected ? colors.background : colors.textPrimary }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

