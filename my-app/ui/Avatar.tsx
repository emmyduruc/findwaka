import React from 'react';
import { View, Text, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme/colors';

interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
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
      className={`rounded-full items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: source ? 'transparent' : colors.accentPrimary,
      }}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          contentFit="cover"
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

