import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium mb-2" style={{ color: colors.textMuted }}>
          {label}
        </Text>
      )}
      <View
        className="flex-row items-center rounded-xl border"
        style={{
          backgroundColor: colors.surface,
          borderColor: error ? colors.error : isFocused ? colors.accentPrimary : colors.border,
          borderWidth: 1.5,
          paddingHorizontal: 16,
          minHeight: 52,
        }}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-base"
          style={{ color: colors.textPrimary }}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-sm mt-1" style={{ color: colors.error }}>
          {error}
        </Text>
      )}
    </View>
  );
};

