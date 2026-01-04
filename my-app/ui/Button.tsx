import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { Text } from './Text';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const baseStyle: ViewStyle = {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: disabled || loading ? 0.5 : 1,
  };

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, minHeight: 40 },
    md: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 48 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, minHeight: 56 },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.accentPrimary,
    },
    secondary: {
      backgroundColor: colors.accentSecondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const textColor = variant === 'outline' || variant === 'ghost' ? colors.textPrimary : colors.background;

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      style={[baseStyle, sizeStyles[size], variantStyles[variant]]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text
          variant={size === 'sm' ? 'caption' : size === 'lg' ? 'body' : 'body'}
          weight="600"
          style={{ color: textColor, fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16 }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

