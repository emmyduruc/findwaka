import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { BackButton } from '@/ui/BackButton';
import { colors } from '@/theme/colors';

/**
 * Driver onboarding step 3: Location permission
 * 
 * Requests location permission and completes driver onboarding.
 */
const DriverOnboardingStep3 = observer(() => {
  const store = useAppStore();
  const [locationGranted, setLocationGranted] = useState(false);

  const handleAllowLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to show nearby drivers.');
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  const handleFinishSetup = async () => {
    await store.setDriverOnboardingComplete(true);
    router.replace('/(tabs)/drivers');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <BackButton />

        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
          {/* Title */}
          <Text variant="h2" weight="600" style={{ marginBottom: 48 }}>
            Location
          </Text>

          {/* Info Card */}
          <Card style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
              <Icon name="location-outline" size={24} color={colors.accentPrimary} />
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="400" style={{ lineHeight: 24 }}>
                  To appear in Nearby drivers, we need your location while online.
                </Text>
              </View>
            </View>
          </Card>

          {/* Buttons */}
          <View style={{ gap: 16 }}>
            {!locationGranted && (
              <Button
                label="Allow location"
                onPress={handleAllowLocation}
                variant="primary"
                size="lg"
                fullWidth
              />
            )}
            <Button
              label="Finish setup"
              onPress={handleFinishSetup}
              variant={locationGranted ? 'primary' : 'outline'}
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default DriverOnboardingStep3;
