import React, { useState, useEffect } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { z } from 'zod';
import { colors } from '../theme/colors';

interface InputProps extends Omit<TextInputProps, 'onChangeText'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  schema?: z.ZodSchema<any>;
  onChangeText?: (text: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error: externalError,
  leftIcon,
  rightIcon,
  containerClassName = '',
  schema,
  onChangeText,
  onValidationChange,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>();
  const [internalValue, setInternalValue] = useState(value?.toString() || '');

  const inputValue = value !== undefined ? value.toString() : internalValue;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value.toString());
    }
  }, [value]);

  const validate = (text: string): boolean => {
    if (!schema) {
      setInternalError(undefined);
      onValidationChange?.(true);
      return true;
    }

    try {
      schema.parse(text);
      setInternalError(undefined);
      onValidationChange?.(true);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.issues[0]?.message || 'Invalid input';
        setInternalError(errorMessage);
        onValidationChange?.(false, errorMessage);
        return false;
      }
      setInternalError('Validation error');
      onValidationChange?.(false, 'Validation error');
      return false;
    }
  };

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
    
    // Validate on change (but don't show error until blur if field is empty)
    if (text.length > 0) {
      validate(text);
    } else {
      setInternalError(undefined);
      onValidationChange?.(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Validate on blur
    if (inputValue.length > 0) {
      validate(inputValue);
    }
  };

  const error = externalError || internalError;
  const hasError = !!error;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium mb-2" style={{ color: colors.textMuted }}>
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center gap-3 rounded-xl border px-4 ${hasError ? 'border-error' : isFocused ? 'border-accentPrimary' : 'border-border'}`}
      >
        {leftIcon && (
          <View 
          >
            {leftIcon}
          </View>
        )}
        <TextInput
          className="flex-1 text-base"
          style={{ 
            color: colors.textPrimary,
            paddingVertical: 16,
          }}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          value={inputValue}
          onChangeText={handleChangeText}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={() => {
            }}
            activeOpacity={0.7}
           
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-sm mt-2" style={{ color: colors.error }}>
          {error}
        </Text>
      )}
    </View>
  );
};