import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { colors } from '../theme/colors';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ source, name, size = 48, className = '' }) => {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      className={`rounded-full items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: source ? 'transparent' : colors.accentPrimary,
      }}
    >
      {source ? (
        <Image
          source={source}
          className="rounded-full"
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <Text
          className="font-semibold"
          style={{
            color: colors.background,
            fontSize: size * 0.4,
          }}
        >
          {initials || '?'}
        </Text>
      )}
    </View>
  );
};

