import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Icon } from './Icon';
import { colors } from '@/theme/colors';

interface BackButtonProps {
  onPress?: () => void;
  className?: string;
}

/**
 * Reusable back button component
 * 
 * Displays an arrow back icon that navigates to the previous screen.
 * Can accept custom onPress handler or defaults to router.back()
 */
export const BackButton: React.FC<BackButtonProps> = ({ 
  onPress, 
  className = '' 
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`w-10 h-10 justify-center items-center mb-6 ${className}`}
      activeOpacity={0.7}
    >
      <Icon name="arrow-back" size={24} color={colors.textPrimary} />
    </TouchableOpacity>
  );
};
