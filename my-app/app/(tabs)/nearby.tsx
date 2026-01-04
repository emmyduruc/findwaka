import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Icon } from '@/ui/Icon';
import { colors } from '@/theme/colors';

type VehicleFilter = 'all' | 'bike' | 'tricycle' | 'car';

// Mock driver data
const mockDrivers = [
  { id: '1', name: 'John Doe', vehicle: 'Bike', distance: '0.5 km', lastSeen: '2 min ago', phone: '+2348000000001' },
  { id: '2', name: 'Jane Smith', vehicle: 'Car', distance: '1.2 km', lastSeen: '5 min ago', phone: '+2348000000002' },
  { id: '3', name: 'Mike Johnson', vehicle: 'Tricycle', distance: '0.8 km', lastSeen: '1 min ago', phone: '+2348000000003' },
  { id: '4', name: 'Sarah Williams', vehicle: 'Bike', distance: '2.1 km', lastSeen: '10 min ago', phone: '+2348000000004' },
  { id: '5', name: 'David Brown', vehicle: 'Car', distance: '1.5 km', lastSeen: '3 min ago', phone: '+2348000000005' },
  { id: '6', name: 'Emma Davis', vehicle: 'Bike', distance: '0.3 km', lastSeen: 'Just now', phone: '+2348000000006' },
];

/**
 * Nearby screen - Passenger view
 * 
 * Shows list of nearby drivers with:
 * - Filter chips (All, Bike, Keke, Car)
 * - Driver cards with name, vehicle, distance, last seen
 * - Call and WhatsApp buttons
 */
const NearbyScreen = observer(() => {
  const store = useAppStore();
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('all');

  const filteredDrivers =
    vehicleFilter === 'all'
      ? mockDrivers
      : mockDrivers.filter((d) => d.vehicle.toLowerCase() === vehicleFilter);

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
            <Card key={driver.id}>
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
                    onPress={() => handleCall(driver.phone)}
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
                    onPress={() => handleWhatsApp(driver.phone)}
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
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default NearbyScreen;
