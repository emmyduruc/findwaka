import React from 'react';
import { Switch, View } from 'react-native';
import { colors } from '../theme/colors';
import { Text } from './Text';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ value, onValueChange, label, className = '' }) => {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      {label && (
        <Text variant="body" weight="500" className="flex-1 mr-4">
          {label}
        </Text>
      )}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accentPrimary }}
        thumbColor={colors.textPrimary}
      />
    </View>
  );
};

