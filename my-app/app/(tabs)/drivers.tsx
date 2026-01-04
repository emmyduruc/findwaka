import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import * as Location from 'expo-location';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { Toggle } from '@/ui/Toggle';
import { Icon } from '@/ui/Icon';
import { colors } from '@/theme/colors';

/**
 * Drivers screen - Driver dashboard
 * 
 * If not a driver: Shows "Drivers only" card with login button
 * If driver: Shows online toggle and location status
 */
const DriversScreen = observer(() => {
  const store = useAppStore();
  const [isOnline, setIsOnline] = useState(false);
  const isDriver = store.role === 'driver' && store.authStatus === 'loggedIn';

  const handleGoOnline = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setIsOnline(true);
        // TODO: Start location tracking and update driver status
      } else {
        Alert.alert('Permission Required', 'Location permission is required to go online.');
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  const handleToggleOnline = async (value: boolean) => {
    if (value) {
      await handleGoOnline();
    } else {
      setIsOnline(false);
      // TODO: Stop location tracking and update driver status
    }
  };

  if (!isDriver) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
            <Card>
              <View style={{ alignItems: 'center', gap: 24 }}>
                <Icon name="car-outline" size={64} color={colors.textMuted} />
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Text variant="h3" weight="600" style={{ textAlign: 'center' }}>
                    Drivers only
                  </Text>
                  <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
                    Sign in as a driver to access driver features.
                  </Text>
                </View>
                <Button
                  label="Sign in as driver"
                  onPress={() => router.push('/(auth)/driver-login')}
                  variant="primary"
                  size="lg"
                  fullWidth
                />
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text variant="h2" weight="600" style={{ marginBottom: 24 }}>
          Driver dashboard
        </Text>

        {/* Online Toggle Card */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{ gap: 24 }}>
            <Toggle
              label="Go online"
              value={isOnline}
              onValueChange={handleToggleOnline}
            />
            {isOnline && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="location" size={16} color={colors.success} />
                <Text variant="caption" color="muted">
                  Location updates active
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Info Card */}
        <Card>
          <View style={{ gap: 12 }}>
            <Text variant="body" weight="500" style={{ marginBottom: 8 }}>
              Driver status
            </Text>
            <Text variant="caption" color="muted">
              When online, you'll appear in the Nearby drivers list for passengers.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
});

export default DriversScreen;
