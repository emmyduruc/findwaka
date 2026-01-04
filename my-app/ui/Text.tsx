import React, { ReactNode } from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface CustomTextProps extends TextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'muted' | 'accent' | 'success' | 'warning' | 'error';
  weight?: '400' | '500' | '600' | '700';
  className?: string;
}

export const Text: React.FC<CustomTextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  weight = '400',
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  };

  const colorMap = {
    primary: colors.textPrimary,
    muted: colors.textMuted,
    accent: colors.accentPrimary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  const fontFamilyMap = {
    '400': 'Montserrat_400Regular',
    '500': 'Montserrat_500Medium',
    '600': 'Montserrat_600SemiBold',
    '700': 'Montserrat_700Bold',
  };
  const fontFamily = fontFamilyMap[weight];

  return (
    <RNText
      className={className}
      style={[
        variantStyles[variant],
        { color: colorMap[color], fontFamily },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

