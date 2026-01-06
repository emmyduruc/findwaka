import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { Image } from 'expo-image';
import { useAppStore } from '@/stores/useAppStore';
import { useStorage } from '@/stores/root';
import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Icon } from '@/ui/Icon';
import { Avatar } from '@/ui/Avatar';
import { DriverDetailSheet, DriverDetail } from '@/ui/DriverDetailSheet';
import { colors } from '@/theme/colors';
import { VehicleType } from '@waka/shared';

const NearbyScreen = observer(() => {
  const store = useAppStore();
  const rootStore = useStorage();
  const isGuest = store.authStatus === 'guest';
  const [selectedDriver, setSelectedDriver] = useState<DriverDetail | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  useEffect(() => {
    rootStore.driver.fetchNearbyDrivers();
  }, [rootStore.driver]);

  const handleDriverPress = (driver: typeof rootStore.driver.filteredDrivers[0]) => {
    if (isGuest) {
      Alert.alert(
        'Sign in required',
        'Please sign in to view driver details and contact drivers.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign in',
            onPress: () => router.push('/(auth)/passenger-login'),
          },
        ]
      );
      return;
    }
    setSelectedDriver({
      id: driver.id,
      name: driver.name,
      vehicle: driver.vehicle as 'Bike' | 'Keke' | 'Car',
      distance: driver.distance,
      lastSeen: driver.lastSeen,
      rating: driver.rating,
      totalReviews: driver.totalReviews,
      phone: '',
      carColor: driver.vehicleColor || undefined,
      carModel: driver.vehicleBrand || undefined,
      profileVisits: 0,
    } as DriverDetail);
    setSheetVisible(true);
  };

  const handleCloseSheet = () => {
    setSheetVisible(false);
    setSelectedDriver(null);
  };

  const handleChat = async () => {
    if (selectedDriver && !isGuest) {
      try {
        const conversationId = await rootStore.chat.getOrCreateConversation(selectedDriver.id);
        router.push(`/chat/${conversationId}`);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    }
  };

  const handleCall = (driverId: string) => {
    if (isGuest) {
      Alert.alert(
        'Sign in required',
        'Please sign in to call drivers.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign in',
            onPress: () => router.push('/(auth)/passenger-login'),
          },
        ]
      );
      return;
    }
    Alert.alert('Call', 'Phone number not available in driver profile');
  };

  const handleWhatsApp = (driverId: string) => {
    if (isGuest) {
      Alert.alert(
        'Sign in required',
        'Please sign in to contact drivers.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign in',
            onPress: () => router.push('/(auth)/passenger-login'),
          },
        ]
      );
      return;
    }
    Alert.alert('WhatsApp', 'Phone number not available in driver profile');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text variant="h2" weight="600">
          Nearby drivers
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/chat-list')}
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={0.7}
        >
          <Icon name="notifications-outline" size={24} color={colors.textPrimary} />
          {rootStore.chat.unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.error,
                borderWidth: 2,
                borderColor: colors.surface,
              }}
            />
          )}
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            selected={rootStore.driver.vehicleFilter === 'all'}
            onPress={() => rootStore.driver.setVehicleFilter('all')}
          />
          <Chip
            label="Okada"
            selected={rootStore.driver.vehicleFilter === 'bike'}
            onPress={() => rootStore.driver.setVehicleFilter('bike')}
          />
          <Chip
            label="Keke"
            selected={rootStore.driver.vehicleFilter === 'tricycle'}
            onPress={() => rootStore.driver.setVehicleFilter('tricycle')}
          />
          <Chip
            label="Moto"
            selected={rootStore.driver.vehicleFilter === 'car'}
            onPress={() => rootStore.driver.setVehicleFilter('car')}
          />
        </View>

        {rootStore.driver.isLoading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text variant="body" color="muted">
              Loading drivers...
            </Text>
          </View>
        )}

        {rootStore.driver.error && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text variant="body" style={{ color: colors.error }}>
              {rootStore.driver.error}
            </Text>
          </View>
        )}

        {!rootStore.driver.isLoading && !rootStore.driver.error && rootStore.driver.filteredDrivers.length === 0 && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text variant="body" color="muted">
              No drivers found
            </Text>
          </View>
        )}

        {!rootStore.driver.isLoading && !rootStore.driver.error && (
          <View style={{ gap: 12 }}>
            {rootStore.driver.filteredDrivers.map((driver) => {
              const getVehicleImage = () => {
                switch (driver.vehicleType) {
                  case VehicleType.BIKE:
                    return require('@/assets/images/okada.png');
                  case VehicleType.TRICYCLE:
                    return require('@/assets/images/keke.png');
                  case VehicleType.CAR:
                    return require('@/assets/images/car.png');
                  default:
                    return require('@/assets/images/okada.png');
                }
              };

              const avatarSource = driver.photoUrl
                ? { uri: driver.photoUrl }
                : require('@/assets/images/avatar.png');

              return (
                <TouchableOpacity
                  key={driver.id}
                  onPress={() => handleDriverPress(driver)}
                  activeOpacity={0.7}
                >
                  <Card>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text variant="h3" weight="600" style={{ marginBottom: 4 }} numberOfLines={1}>
                          {driver.name}
                        </Text>
                        <Text variant="caption" color="muted" style={{ marginBottom: 8 }}>
                          {driver.vehicle}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Icon name="location" size={12} color={colors.textMuted} />
                            <Text variant="caption" color="muted">
                              {driver.distance}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Icon name="time-outline" size={12} color={colors.textMuted} />
                            <Text variant="caption" color="muted">
                              {driver.lastSeen}
                            </Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleCall(driver.id);
                            }}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: colors.accentPrimary,
                              paddingVertical: 11,
                              borderRadius: 10,
                              gap: 6,
                            }}
                            activeOpacity={0.8}
                          >
                            <Icon name="call" size={16} color={colors.background} />
                            <Text variant="body" weight="600" style={{ color: colors.background, fontSize: 14 }}>
                              Call
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(driver.id);
                            }}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: colors.surface,
                              borderWidth: 1.5,
                              borderColor: colors.border,
                              paddingVertical: 11,
                              borderRadius: 10,
                              gap: 6,
                            }}
                            activeOpacity={0.8}
                          >
                            <Icon name="logo-whatsapp" size={16} color={colors.accentPrimary} />
                            <Text variant="body" weight="600" style={{ fontSize: 14 }}>
                              WhatsApp
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View className='rounded-full overflow-hidden bg-white border border-border'>
                         <Image
                            source={getVehicleImage()}
                            style={{ width: 58, height: 58 }}
                            contentFit="cover"
                          />
                        {driver.isOnline && (
                          <View
                            style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              width: 14,
                              height: 14,
                              borderRadius: 7,
                              backgroundColor: '#10B981',
                              borderWidth: 2.5,
                              borderColor: colors.surface,
                            }}
                          />
                        )}
                        {/* <View
                          style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: colors.background,
                            borderWidth: 2,
                            borderColor: colors.surface,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Image
                            source={getVehicleImage()}
                            style={{ width: 24, height: 24 }}
                            contentFit="contain"
                          />
                        </View> */}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Driver Detail Sheet */}
      <DriverDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        driver={selectedDriver}
        onChat={handleChat}
        isGuest={isGuest}
        onSignInRequired={() => router.push('/(auth)/passenger-login')}
      />
    </SafeAreaView>
  );
});

export default NearbyScreen;
