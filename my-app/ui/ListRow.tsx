import React, { ReactNode } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Text } from './Text';
import { Icon } from './Icon';

interface ListRowProps {
  title: string;
  subtitle?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  className?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  showChevron = false,
  className = '',
}) => {
  const content = (
    <View className={`flex-row items-center py-4 ${className}`}>
      {leftIcon && <View className="mr-4">{leftIcon}</View>}
      <View className="flex-1">
        <Text variant="body" weight="500">
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="muted" className="mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      {rightIcon && <View className="ml-4">{rightIcon}</View>}
      {showChevron && !rightIcon && (
        <Icon name="chevron-forward" size={20} color={colors.textMuted} className="ml-4" />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

