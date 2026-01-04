import React from 'react';
import { View, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { BottomSheet } from './BottomSheet';
import { Text } from './Text';
import { Button } from './Button';
import { Icon } from './Icon';
import { colors } from '@/theme/colors';

export type DriverDetail = {
  id: string;
  name: string;
  vehicle: 'Bike' | 'Tricycle' | 'Car';
  distance: string;
  lastSeen: string;
  phone: string;
  avatar?: string | null;
  carColor?: string;
  carModel?: string;
  rating?: number;
  totalReviews?: number;
  profileVisits?: number;
};

interface DriverDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  driver: DriverDetail | null;
  onChat?: () => void;
}

/**
 * Driver detail bottom sheet
 * 
 * Shows detailed information about a driver:
 * - Avatar
 * - Name
 * - Vehicle type
 * - If car: color and model
 * - Reviews (rating/stars)
 * - Profile visits
 * - Distance away
 * - Chat button
 */
export const DriverDetailSheet: React.FC<DriverDetailSheetProps> = ({
  visible,
  onClose,
  driver,
  onChat,
}) => {
  if (!driver) return null;

  const handleCall = () => {
    Linking.openURL(`tel:${driver.phone}`);
    onClose();
  };

  const handleWhatsApp = () => {
    const message = 'Hello, I need a ride.';
    const url = `https://wa.me/${driver.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
    onClose();
  };

  const handleChat = () => {
    if (onChat) {
      onChat();
    }
    onClose();
    // TODO: Navigate to chat screen
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon key={i} name="star" size={16} color={colors.warning} />
        );
      } else if (i === fullStars && hasHalfStar) {
        // For half stars, just show a full star (Ionicons doesn't have star-half)
        stars.push(
          <Icon key={i} name="star" size={16} color={colors.warning} />
        );
      } else {
        stars.push(
          <Icon key={i} name="star-outline" size={16} color={colors.textMuted} />
        );
      }
    }
    return stars;
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ gap: 24, paddingBottom: 20 }}>
        {/* Avatar and Name */}
        <View className="items-center">
          {driver.avatar ? (
            <View
              className="rounded-full overflow-hidden"
              style={{
                width: 100,
                height: 100,
                borderWidth: 3,
                borderColor: colors.accentPrimary,
                marginBottom: 16,
              }}
            >
              <Image
                source={{ uri: driver.avatar }}
                style={{ width: 100, height: 100 }}
                contentFit="cover"
              />
            </View>
          ) : (
            <View
              className="rounded-full items-center justify-center"
              style={{
                width: 100,
                height: 100,
                backgroundColor: colors.accentPrimary,
                borderWidth: 3,
                borderColor: colors.accentPrimary,
                marginBottom: 16,
              }}
            >
              <Icon name="person" size={48} color={colors.background} />
            </View>
          )}
          <Text variant="h2" weight="600" className="text-center mb-2">
            {driver.name}
          </Text>
          <Text variant="body" color="muted" className="text-center mb-4">
            {driver.vehicle}
          </Text>
        </View>

        {/* Distance */}
        <View className="flex-row items-center justify-center gap-2">
          <Icon name="location" size={20} color={colors.accentPrimary} />
          <Text variant="body" weight="500">
            {driver.distance} away
          </Text>
        </View>

        {/* Car Details (if car) */}
        {driver.vehicle === 'Car' && (driver.carColor || driver.carModel) && (
          <View
            className="py-4 px-5 rounded-xl"
            style={{ backgroundColor: colors.background }}
          >
            <View style={{ gap: 12 }}>
              {driver.carModel && (
                <View className="flex-row items-center justify-between">
                  <Text variant="body" weight="400" color="muted">
                    Vehicle
                  </Text>
                  <Text variant="body" weight="600">
                    {driver.carModel}
                  </Text>
                </View>
              )}
              {driver.carColor && (
                <View className="flex-row items-center justify-between">
                  <Text variant="body" weight="400" color="muted">
                    Color
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: driver.carColor.toLowerCase() || colors.accentPrimary,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    />
                    <Text variant="body" weight="600">
                      {driver.carColor}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Stats */}
        <View
          className="py-4 px-5 rounded-xl"
          style={{ backgroundColor: colors.background }}
        >
          <View style={{ gap: 16 }}>
            {/* Rating */}
            {driver.rating !== undefined && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Icon name="star" size={20} color={colors.warning} />
                  <Text variant="body" weight="400">
                    Rating
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="flex-row items-center gap-1">
                    {renderStars(driver.rating)}
                  </View>
                  <Text variant="body" weight="600">
                    {driver.rating.toFixed(1)}
                  </Text>
                  {driver.totalReviews !== undefined && (
                    <Text variant="caption" color="muted">
                      ({driver.totalReviews})
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Profile Visits */}
            {driver.profileVisits !== undefined && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Icon name="eye-outline" size={20} color={colors.accentSecondary} />
                  <Text variant="body" weight="400">
                    Profile visits
                  </Text>
                </View>
                <Text variant="body" weight="600">
                  {driver.profileVisits}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <Button
            label="Chat"
            onPress={handleChat}
            variant="primary"
            size="lg"
            fullWidth
          />
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCall}
              className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
              style={{
                backgroundColor: colors.accentPrimary,
              }}
              activeOpacity={0.7}
            >
              <Icon name="call" size={20} color={colors.background} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleWhatsApp}
              className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1.5,
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
            >
              <Icon name="logo-whatsapp" size={20} color={colors.accentPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

