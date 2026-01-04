import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Input } from '@/ui/Input';
import { Chip } from '@/ui/Chip';
import { BackButton } from '@/ui/BackButton';
import { colors } from '@/theme/colors';
import { nameSchema } from '@/utils/validation';

export type VehicleType = 'bike' | 'tricycle' | 'car';

/**
 * Driver onboarding step 1: Basic info
 * 
 * Collects:
 * - Display name
 * - Vehicle type (bike/tricycle/car)
 */
export default function DriverOnboardingStep1() {
  const [displayName, setDisplayName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [isNameValid, setIsNameValid] = useState(true);

  const handleContinue = () => {
    if (!isNameValid || !displayName.trim() || !vehicleType) {
      return;
    }
    // TODO: Save to store/database
    router.push('/(driver-onboarding)/step-2');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <BackButton />

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
            {/* Title */}
            <Text variant="h2" weight="600" style={{ marginBottom: 48 }}>
              Driver setup
            </Text>

            {/* Display Name Input */}
            <Input
              label="Display name"
              placeholder="Enter your name"
              value={displayName}
              onChangeText={setDisplayName}
              autoComplete="name"
              schema={nameSchema}
              onValidationChange={(isValid) => setIsNameValid(isValid)}
              containerClassName="mb-8"
            />

            {/* Vehicle Type */}
            <View style={{ marginBottom: 48 }}>
              <Text
                variant="label"
                weight="500"
                style={{ marginBottom: 16, color: colors.textMuted }}
              >
                Vehicle type
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                <Chip
                  label="Bike"
                  selected={vehicleType === 'bike'}
                  onPress={() => setVehicleType('bike')}
                />
                <Chip
                  label="Tricycle"
                  selected={vehicleType === 'tricycle'}
                  onPress={() => setVehicleType('tricycle')}
                />
                <Chip
                  label="Car"
                  selected={vehicleType === 'car'}
                  onPress={() => setVehicleType('car')}
                />
              </View>
            </View>

            {/* Button */}
            <Button
              label="Continue"
              onPress={handleContinue}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isNameValid || !displayName.trim() || !vehicleType}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
