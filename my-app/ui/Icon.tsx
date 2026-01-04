import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = colors.textPrimary,
  className = '',
}) => {
  return <Ionicons name={name} size={size} color={color} className={className} />;
};

