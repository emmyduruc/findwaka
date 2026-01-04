import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/colors';

interface DividerProps {
  className?: string;
  vertical?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ className = '', vertical = false }) => {
  return (
    <View
      className={className}
      style={{
        [vertical ? 'width' : 'height']: 1,
        backgroundColor: colors.border,
      }}
    />
  );
};

