import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Icon } from '@/ui/Icon';
import { DriverDetailSheet, DriverDetail } from '@/ui/DriverDetailSheet';
import { colors } from '@/theme/colors';

type VehicleFilter = 'all' | 'bike' | 'tricycle' | 'car';

// Mock driver data with extended details
const mockDrivers = [
  {
    id: '1',
    name: 'John Doe',
    vehicle: 'Bike' as const,
    distance: '0.5 km',
    lastSeen: '2 min ago',
    phone: '+2348000000001',
    rating: 4.8,
    totalReviews: 124,
    profileVisits: 342,
  },
  {
    id: '2',
    name: 'Jane Smith',
    vehicle: 'Car' as const,
    distance: '1.2 km',
    lastSeen: '5 min ago',
    phone: '+2348000000002',
    carColor: 'Black',
    carModel: 'Toyota Camry',
    rating: 4.9,
    totalReviews: 89,
    profileVisits: 256,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    vehicle: 'Tricycle' as const,
    distance: '0.8 km',
    lastSeen: '1 min ago',
    phone: '+2348000000003',
    rating: 4.7,
    totalReviews: 67,
    profileVisits: 189,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    vehicle: 'Bike' as const,
    distance: '2.1 km',
    lastSeen: '10 min ago',
    phone: '+2348000000004',
    rating: 4.6,
    totalReviews: 45,
    profileVisits: 123,
  },
  {
    id: '5',
    name: 'David Brown',
    vehicle: 'Car' as const,
    distance: '1.5 km',
    lastSeen: '3 min ago',
    phone: '+2348000000005',
    carColor: 'White',
    carModel: 'Honda Accord',
    rating: 4.5,
    totalReviews: 78,
    profileVisits: 201,
  },
  {
    id: '6',
    name: 'Emma Davis',
    vehicle: 'Bike' as const,
    distance: '0.3 km',
    lastSeen: 'Just now',
    phone: '+2348000000006',
    rating: 5.0,
    totalReviews: 34,
    profileVisits: 98,
  },
];

/**
 * Nearby screen - Passenger view
 * 
 * Shows list of nearby drivers with:
 * - Filter chips (All, Bike, Keke, Car)
 * - Driver cards with name, vehicle, distance, last seen
 * - Call and WhatsApp buttons
 */
const NearbyScreen = () => {
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('all');
  const [selectedDriver, setSelectedDriver] = useState<DriverDetail | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const filteredDrivers =
    vehicleFilter === 'all'
      ? mockDrivers
      : mockDrivers.filter((d) => d.vehicle.toLowerCase() === vehicleFilter);

  const handleDriverPress = (driver: typeof mockDrivers[0]) => {
    setSelectedDriver(driver as DriverDetail);
    setSheetVisible(true);
  };

  const handleCloseSheet = () => {
    setSheetVisible(false);
    setSelectedDriver(null);
  };

  const handleChat = () => {
    if (selectedDriver) {
      router.push({
        pathname: '/chat/[id]',
        params: {
          id: selectedDriver.id,
          name: selectedDriver.name,
        },
      });
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const message = 'Hello, I need a ride.';
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text variant="h2" weight="600" style={{ marginBottom: 24 }}>
          Nearby drivers
        </Text>

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            selected={vehicleFilter === 'all'}
            onPress={() => setVehicleFilter('all')}
          />
          <Chip
            label="Bike"
            selected={vehicleFilter === 'bike'}
            onPress={() => setVehicleFilter('bike')}
          />
          <Chip
            label="Keke"
            selected={vehicleFilter === 'tricycle'}
            onPress={() => setVehicleFilter('tricycle')}
          />
          <Chip
            label="Car"
            selected={vehicleFilter === 'car'}
            onPress={() => setVehicleFilter('car')}
          />
        </View>

        {/* Driver Cards */}
        <View style={{ gap: 16 }}>
          {filteredDrivers.map((driver) => (
            <TouchableOpacity
              key={driver.id}
              onPress={() => handleDriverPress(driver)}
              activeOpacity={0.7}
            >
              <Card>
                <View>
                  {/* Driver Info */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="h3" weight="600" style={{ marginBottom: 4 }}>
                        {driver.name}
                      </Text>
                      <Text variant="caption" color="muted" style={{ marginBottom: 8 }}>
                        {driver.vehicle}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Icon name="location" size={14} color={colors.textMuted} />
                          <Text variant="caption" color="muted">
                            {driver.distance}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Icon name="time-outline" size={14} color={colors.textMuted} />
                          <Text variant="caption" color="muted">
                            Last seen {driver.lastSeen}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCall(driver.phone);
                      }}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.accentPrimary,
                        paddingVertical: 12,
                        borderRadius: 12,
                        gap: 8,
                      }}
                    >
                      <Icon name="call" size={18} color={colors.background} />
                      <Text variant="body" weight="500" style={{ color: colors.background }}>
                        Call
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleWhatsApp(driver.phone);
                      }}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.surface,
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        paddingVertical: 12,
                        borderRadius: 12,
                        gap: 8,
                      }}
                    >
                      <Icon name="logo-whatsapp" size={18} color={colors.accentPrimary} />
                      <Text variant="body" weight="500">
                        WhatsApp
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Driver Detail Sheet */}
      <DriverDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        driver={selectedDriver}
        onChat={handleChat}
      />
    </SafeAreaView>
  );
};

export default NearbyScreen;
